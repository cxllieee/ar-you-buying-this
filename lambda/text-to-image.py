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
        # Compose the prompt for the new model
        enhanced_prompt = (
            f"{base_prompt}. "
            "Show the item on a plain white background, from a 3/4 top corner perspective, fully visible, no cropping, no people, no text, no watermark, no shadows, high quality, product photography style."
        )
        client = boto3.client("bedrock-runtime", region_name="us-west-2")
        s3 = boto3.client('s3', region_name="us-west-2")
        model_id = "stability.sd3-5-large-v1:0"
        # Compose the request body as required by the new model
        native_request = {
            "prompt": enhanced_prompt,
            "mode": "text-to-image",
            "aspect_ratio": "1:1",
            "output_format": "jpeg"
        }
        request = json.dumps(native_request)
        response = client.invoke_model(
            modelId=model_id,
            contentType="application/json",
            accept="application/json",
            body=request
        )
        model_response = json.loads(response["body"].read())
        # The response is expected to contain a base64-encoded JPEG image
        base64_image_data = model_response["images"][0] if "images" in model_response and model_response["images"] else None
        if not base64_image_data:
            return {
                'statusCode': 500,
                'headers': cors_headers,
                'body': json.dumps({'error': 'No image returned from model'})
            }
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
                filename = f"{short_uuid()}.jpg"
            else:
                filename = f"{safe_name}-{short_uuid()}.jpg"
        else:
            filename = f"{short_uuid()}.jpg"
        filepath = f"generated-images/{filename}"
        bucket_name = 'sg-summit-generated-assets-853138055027'
        s3.put_object(
            Bucket=bucket_name,
            Key=filepath,
            Body=binary_image_data,
            ContentType='image/jpeg'
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