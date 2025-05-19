import boto3
import json

def lambda_handler(event, context):
    # Initialize AWS clients
    ssm = boto3.client('ssm')
    dynamodb = boto3.resource('dynamodb')
    print(event)
    body = json.loads(event['body'])
    
    try:
        # Get command ID from event
        command_id = body['commandId']
        
        # Get command status from Systems Manager
        response = ssm.get_command_invocation(
            CommandId=command_id,
            InstanceId="i-0909bb5ffeda3d36e" # ec2-triposr
        )
        
        command_status = response['Status']
        print(command_status)
        
        # Check if status is Success
        if command_status == 'Success':
            # Get S3 URI from DynamoDB
            table = dynamodb.Table('run-command-output')
            ddb_response = table.get_item(
                Key={
                    'commandId': command_id
                }
            )
            # Return S3 URI if found
            if 'Item' in ddb_response:
                glb_s3_uri = ddb_response['Item']['generated-3d-assets-uri']
                # Generate presigned URL
                s3 = boto3.client('s3')
                bucket = 'sg-summit-generated-assets-853138055027'
                key = glb_s3_uri.replace(f's3://{bucket}/', '')
                presigned_url = s3.generate_presigned_url(
                    'get_object',
                    Params={'Bucket': bucket, 'Key': key},
                    ExpiresIn=3600
                )
                return {
                    'statusCode': 200,
                    'headers': {
                        'Access-Control-Allow-Origin': '*',
                        'Access-Control-Allow-Headers': '*',
                        'Access-Control-Allow-Methods': 'POST,OPTIONS'
                    },
                    'body': json.dumps({
                        'status': 'Success',
                        'glb_s3_uri': glb_s3_uri,
                        'glb_presigned_url': presigned_url
                    })
                }
            else:
                return {
                    'statusCode': 404,
                    'headers': {
                        'Access-Control-Allow-Origin': '*',
                        'Access-Control-Allow-Headers': '*',
                        'Access-Control-Allow-Methods': 'POST,OPTIONS'
                    },
                    'body': json.dumps({
                        'status': 'Success',
                        'message': 'S3 URI not found for command ID'
                    })
                }
        else:
            # Return command status for non-successful states
            return {
                'statusCode': 200,
                'headers': {
                    'Access-Control-Allow-Origin': '*',
                    'Access-Control-Allow-Headers': '*',
                    'Access-Control-Allow-Methods': 'POST,OPTIONS'
                },
                'body': json.dumps({
                    'status': command_status
                })
            }
            
    except Exception as e:
        return {
            'statusCode': 500,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Headers': '*',
                'Access-Control-Allow-Methods': 'POST,OPTIONS'
            },
            'body': json.dumps({
                'error': str(e)
            })
        }
