import base64
import json
import os
import random
import uuid
import re
import string
import boto3
import sys

def lambda_handler(event, context):
    print("EVENT:", json.dumps(event), file=sys.stderr)
    cors_headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': '*',
        'Access-Control-Allow-Methods': 'POST,OPTIONS'
    }
    method = event.get('httpMethod') or event.get('requestContext', {}).get('http', {}).get('method')
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': cors_headers,
            'body': ''
        }
    try:
        body = event.get('body')
        if body:
            try:
                data = json.loads(body)
            except Exception:
                return {
                    'statusCode': 400,
                    'headers': cors_headers,
                    'body': json.dumps({'error': 'Invalid JSON in body', 'raw_body': body})
                }
            base_prompt = data.get('prompt')
            asset_name = data.get('assetName', '').strip()
        else:
            base_prompt = None
            asset_name = ''
        if not base_prompt:
            return {
                'statusCode': 400,
                'headers': cors_headers,
                'body': json.dumps({'error': 'Missing prompt'})
            }
        enhanced_prompt = (
            f"Focus on retail products, but generate the item described below even if it is not retail. "
            f"Create a high-quality image of the described item, isolated on a fully transparent background. "
            f"No background, no scene, no environment, no people, no text, no watermark. "
            f"Show the item in a top down manner from a 3/4 (three-quarter) perspective, clearly showing the front, side, and top. "
            f"Ensure the entire item is fully visible in the image, with no cropping or cut-off edges. "
            f"Generate only one image of the item. "
            f"Description: {base_prompt}"
        )
        client = boto3.client("bedrock-runtime", region_name="us-east-1")
        s3 = boto3.client('s3', region_name="us-west-2")
        model_id = "amazon.nova-canvas-v1:0"
        seed = random.randint(0, 858993460)
        native_request = {
            "taskType": "TEXT_IMAGE",
            "textToImageParams": {
                "text": enhanced_prompt,
                "negativeText": "background, scene, environment, people, text, watermark, logo, floor, table, surface, shadow, reflection"
            },
            "imageGenerationConfig": {
                "seed": seed,
                "quality": "standard",
                "height": 720,
                "width": 1280,
                "numberOfImages": 1,
            },
        }
        request = json.dumps(native_request)
        response = client.invoke_model(
            modelId=model_id, 
            body=request
        )
        model_response = json.loads(response["body"].read())
        base64_image_data = model_response["images"][0]
        binary_image_data = base64.b64decode(base64_image_data)
        def sanitize_filename(name):
            name = name.lower()
            name = re.sub(r'\s+', '-', name)
            name = re.sub(r'[^a-z0-9\-]', '', name)
            name = re.sub(r'-+', '-', name)
            name = name.strip('-')
            return name[:32]
        def short_uuid(n=8):
            return ''.join(random.choices(string.ascii_lowercase + string.digits, k=n))
        if asset_name:
            safe_name = sanitize_filename(asset_name)
            if not safe_name:
                filename = f"{short_uuid()}.png"
            else:
                filename = f"{safe_name}-{short_uuid()}.png"
        else:
            filename = f"{short_uuid()}.png"
        filepath = f"generated-images/{filename}"
        bucket_name = 'sg-summit-generated-assets-853138055027'
        background_removal_request = {
            "taskType": "BACKGROUND_REMOVAL",
            "backgroundRemovalParams": {
                "image": base64_image_data
            }
        }
        background_removed_response = client.invoke_model(
            modelId="amazon.nova-canvas-v1:0",
            body=json.dumps(background_removal_request)
        )
        background_removed_model_response = json.loads(background_removed_response["body"].read())
        processed_image_data = base64.b64decode(background_removed_model_response["images"][0])
        background_removed_filepath = f"processed-images/{filename}"
        s3.put_object(
            Bucket=bucket_name,
            Key=background_removed_filepath,
            Body=processed_image_data,
            ContentType='image/png'
        )
        s3.put_object(
            Bucket=bucket_name,
            Key=filepath,
            Body=binary_image_data,
            ContentType='image/png'
        )
        presigned_url = s3.generate_presigned_url(
            'get_object',
            Params={'Bucket': bucket_name, 'Key': filepath},
            ExpiresIn=3600
        )
        s3uri = f"s3://{bucket_name}/{filepath}"
        return {
            'statusCode': 200,
            'headers': cors_headers,
            'body': json.dumps({
                's3uri': s3uri,
                'imageUrl': presigned_url
            })
        }
    except Exception as e:
        import traceback
        print(traceback.format_exc())
        return {
            'statusCode': 500,
            'headers': cors_headers,
            'body': json.dumps({'error': str(e)})
        }