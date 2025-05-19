import json
import boto3
import decimal
import os
import time

class DecimalEncoder(json.JSONEncoder):
    def default(self, obj):
        if isinstance(obj, decimal.Decimal):
            return float(obj)
        return super(DecimalEncoder, self).default(obj)

dynamodb = boto3.resource('dynamodb', region_name='us-west-2')
table = dynamodb.Table('RetailAssets')
s3_client = boto3.client('s3', region_name='us-west-2')
BUCKET_NAME = 'aryoubuyingthis-demo-853138055027'

# Simple in-memory cache for presigned URLs (lives for the Lambda container lifetime)
presigned_url_cache = {}
CACHE_TTL = 300  # seconds (5 minutes)

def get_cached_presigned_url(key):
    now = time.time()
    cache_entry = presigned_url_cache.get(key)
    if cache_entry and now - cache_entry['timestamp'] < CACHE_TTL:
        return cache_entry['url']
    url = s3_client.generate_presigned_url(
        'get_object',
        Params={'Bucket': BUCKET_NAME, 'Key': key},
        ExpiresIn=3600  # 1 hour
    )
    presigned_url_cache[key] = {'url': url, 'timestamp': now}
    return url

def lambda_handler(event, context):
    try:
        # Get pagination params from query string
        params = event.get('queryStringParameters') or {}
        limit = int(params.get('limit', 10))
        last_evaluated_key = params.get('lastKey')
        scan_kwargs = {'Limit': limit}
        if last_evaluated_key:
            scan_kwargs['ExclusiveStartKey'] = json.loads(last_evaluated_key)

        response = table.scan(**scan_kwargs)
        items = response.get('Items', [])
        for item in items:
            # Extract the S3 key from the stored URL or path
            # Example: "public/models/office_chair.glb"
            model_key = item['modelPath'].split('.com/')[1]
            poster_key = item['posterPath'].split('.com/')[1]
            ios_key = item['iosModelPath'].split('.com/')[1]
            item['modelPath'] = get_cached_presigned_url(model_key)
            item['posterPath'] = get_cached_presigned_url(poster_key)
            item['iosModelPath'] = get_cached_presigned_url(ios_key)

        result = {
            'items': items,
            'lastKey': response.get('LastEvaluatedKey')
        }

        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Headers': 'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token',
                'Access-Control-Allow-Methods': 'OPTIONS,POST,GET',
                'Content-Type': 'application/json'
            },
            'body': json.dumps(result, cls=DecimalEncoder)
        }
    except Exception as e:
        return {
            'statusCode': 500,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Content-Type': 'application/json'
            },
            'body': json.dumps({'error': str(e)})
        }