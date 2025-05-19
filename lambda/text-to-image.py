import base64
import json
import os
import random
import uuid
import re
import string

import boto3

def lambda_handler(event, context):
    # Get the event data from the request body.
    event_body = event['body']
    event_body = json.loads(event_body)

    # Get prompt from input
    base_prompt = event_body['prompt']
    asset_name = event_body.get('assetName', '').strip()
    # Finetuned prompt for retail asset generation
    enhanced_prompt = (
        f"Focus on retail products, but generate the item described below even if it is not retail. "
        f"Create a high-quality image of the described item, isolated on a fully transparent background. "
        f"No background, no scene, no environment, no people, no text, no watermark. "
        f"Show the item from a 3/4 (three-quarter) perspective, clearly showing the front, side, and top. "
        f"Ensure the entire item is fully visible in the image, with no cropping or cut-off edges. "
        f"Description: {base_prompt}"
    )

    # Create a Bedrock Runtime client in the AWS Region of your choice.
    client = boto3.client("bedrock-runtime", region_name="us-east-1") # Nova Canvas only available in us-east-1
    s3 = boto3.client('s3', region_name="us-west-2")

    # Set the model ID.
    model_id = "amazon.nova-canvas-v1:0"

    # Define the image generation prompt for the model.
    # prompt = "A stylized picture of a cute old steampunk robot."

    # Generate a random seed between 0 and 858,993,459
    seed = random.randint(0, 858993460)

    # Format the request payload using the model's native structure.
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

    # Convert the native request to JSON.
    request = json.dumps(native_request)

    # Invoke the model with the request.
    response = client.invoke_model(modelId=model_id, body=request)

    # Decode the response body.
    model_response = json.loads(response["body"].read())

    # Extract the image data.
    base64_image_data = model_response["images"][0]
    binary_image_data = base64.b64decode(base64_image_data)

    # Generate friendly filename from asset name
    def sanitize_filename(name):
        name = name.lower()
        name = re.sub(r'\s+', '-', name)  # replace all whitespace with dash
        name = re.sub(r'[^a-z0-9\-]', '', name)  # remove non-alphanumeric/dash
        name = re.sub(r'-+', '-', name)  # collapse multiple dashes
        name = name.strip('-')  # remove leading/trailing dashes
        return name[:32]  # shorter for S3

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
    bucket_name = 'sg-summit-generated-assets-853138055027'  # Replace with your S3 bucket name
    
    # Upload to S3
    s3.put_object(
        Bucket=bucket_name,
        Key=filepath,
        Body=binary_image_data,
        ContentType='image/png'
    )
    
    # Generate a presigned URL for the image (valid for 1 hour)
    presigned_url = s3.generate_presigned_url(
        'get_object',
        Params={'Bucket': bucket_name, 'Key': filepath},
        ExpiresIn=3600  # 1 hour
    )
    
    return {
        'statusCode': 200,
        'headers': {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Headers': '*',
            'Access-Control-Allow-Methods': 'POST,OPTIONS'
        },
        'body': json.dumps({
            'imageUrl': presigned_url
        })
    }