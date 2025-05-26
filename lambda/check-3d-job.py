import boto3
import json
import time

def lambda_handler(event, context):
    # Initialize AWS clients
    ssm = boto3.client('ssm')
    dynamodb = boto3.resource('dynamodb')
    body = json.loads(event['body'])
    
    try:
        # Get command ID from event
        commandId = body['commandId']
        modelName = body['modelName']
        
        # Get command status from Systems Manager
        response = ssm.get_command_invocation(
            CommandId=commandId,
            InstanceId="i-0909bb5ffeda3d36e" # ec2-triposr
            # if modelName=tripo
                # instanceId = 
        )
        
        command_status = response['Status']
        print(command_status)
        
        # Check if status is Success
        if command_status == 'Success':
            # Get S3 URI from DynamoDB
            table = dynamodb.Table('run-command-output')
            ddb_response = table.get_item(
                Key={
                    'commandId': commandId
                }
            )
            # Return S3 URI if found
            if 'Item' in ddb_response:
                glb_s3_uri = ddb_response['Item']['glb_s3_uri']
                modelId = ddb_response['Item']['modelId']
                print(modelId)
                usdz_s3_uri = glb_s3_uri.replace('.glb', '.usdz')
                print(glb_s3_uri)
                print(usdz_s3_uri)

                # Trigger SSM Run Command to convert GLB to USDZ
                ssm_client = boto3.client('ssm')
                ssm_response = ssm_client.send_command(
                    InstanceIds=['i-0768ea74afcec9d0a'],  #ec2-convert-glb-to-usdz
                    DocumentName='AWS-RunShellScript',
                    Parameters={
                        'commands': [
                            'cd /home/ssm-user',
                            f'sudo su - ssm-user -c "\
                            . /home/ssm-user/.bash_profile && \
                            cd ConvertGLB && \
                            pyenv local myenv && \
                            aws s3 cp {glb_s3_uri} glb_assets/{modelId}.glb && \
                            export DOTNET_SYSTEM_GLOBALIZATION_INVARIANT=1 && \
                            python3 run.py --modelId {modelId} && \
                            aws s3 cp usdz_assets/{modelId}.usdz {usdz_s3_uri}"'
                        ]
                    }
                )
                time.sleep(3) # Wait 3s to ensure upload to S3 is complete

                # Add usdz_s3_uri to DynamoDB
                response = table.update_item(
                    Key={
                        'commandId': commandId
                    },
                    UpdateExpression='SET usdz_s3_uri = :usdz',
                    ExpressionAttributeValues={
                        ':usdz': usdz_s3_uri
                    },
                    ReturnValues="UPDATED_NEW"
                )

                # Generate presigned URL
                s3 = boto3.client('s3')
                bucket = 'sg-summit-generated-assets-853138055027'
                glb_s3_key = glb_s3_uri.replace(f's3://{bucket}/', '')
                glb_presigned_url = s3.generate_presigned_url(
                    'get_object',
                    Params={'Bucket': bucket, 'Key': glb_s3_key},
                    ExpiresIn=3600
                )

                usdz_s3_key = usdz_s3_uri.replace(f's3://{bucket}/', '')
                usdz_presigned_url = s3.generate_presigned_url(
                    'get_object',
                    Params={'Bucket': bucket, 'Key': usdz_s3_key},
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
                        'glb_presigned_url': glb_presigned_url,
                        'usdz_s3_uri': usdz_s3_uri,
                        'usdz_presigned_url': usdz_presigned_url
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
                        'status': 'Error',
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
                    'status': command_status,
                    'message': "Run Command ID found. But returns job status other than Success"
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

