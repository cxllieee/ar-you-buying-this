import boto3
import json
import time
import os
import uuid
from datetime import datetime

def lambda_handler(event, context):
    dynamodb = boto3.resource('dynamodb')

    ssm = boto3.client('ssm')
    body = json.loads(event["body"])
    s3uri = body["s3uri"]
    # Extract the key from the s3uri eg. s3://sg-summit-generated-assets-853138055027/input.png
    s3key = s3uri.split('/')[-1]
    print(s3uri)
    print(s3key)
    
    # Specific commands to run
    # Generate model id uuid without hyphens
    modelId = uuid.uuid4().hex
    commands = [
        'cd /home/ssm-user/TripoSR',
        '. myenv/bin/activate',
        f'aws s3 cp {s3uri} examples/{s3key}.png',
        f'python3 run.py examples/{s3key}.png --output-dir output/ --model-save-format glb',
        f'aws s3 cp output/0/mesh.glb s3://sg-summit-generated-assets-853138055027/generated-3d-assets/{modelId}.glb --region us-west-2',
        'deactivate'
    ]
    
    # Get instance ID from environment variable or event
    instance_id = "i-0909bb5ffeda3d36e"
    
    try:
        # Send commands to instance
        response = ssm.send_command(
            InstanceIds=[instance_id],
            DocumentName='AWS-RunShellScript',
            Parameters={
                'commands': commands
            }
        )
        
        commandId = response['Command']['CommandId']
        print("Successfully triggerd")
        print(commandId)

        # Write to DynamoDB table
        output_s3uri = f's3://sg-summit-generated-assets-853138055027/generated-3d-assets/{modelId}.glb'
        table = dynamodb.Table('run-command-output')
        table.put_item(
            Item={
                'commandId': commandId,
                'generated-3d-assets-uri': output_s3uri,
                'timestamp': datetime.now().isoformat()
            }
        )

        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Headers': 'Content-Type',
                'Access-Control-Allow-Methods': 'OPTIONS,POST,GET'
            },
            'body': json.dumps({ 'commandId': commandId })
        }
            
    except Exception as e:
        return {
            'statusCode': 500,
            'body': json.dumps(f'Error: {str(e)}')
        }