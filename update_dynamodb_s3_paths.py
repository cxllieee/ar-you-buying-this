import json
import subprocess

# CONFIGURE THESE:
BUCKET_URL = "https://aryoubuyingthis-demo-853138055027.s3.us-west-2.amazonaws.com"
DYNAMODB_TABLE = "RetailAssets"
REGION = "us-west-2"
PRODUCTS_JSON = "products.json"  # Path to your products.json

# Load products.json
with open(PRODUCTS_JSON, "r") as f:
    data = json.load(f)

products = data.get("RetailAssets", [])

for entry in products:
    item = entry["PutRequest"]["Item"]
    product_id = item["id"]["S"]

    # Compose new S3 URLs
    model_path = f"{BUCKET_URL}/public/models/{product_id.replace('-', '_')}.glb"
    poster_path = f"{BUCKET_URL}/public/{item['posterPath']['S'].lstrip('/')}"
    # Compose iosModelPath S3 URL (assume .usdz extension and models/ directory)
    ios_model_path = f"{BUCKET_URL}/public/models/{item['iosModelPath']['S'].split('/')[-1]}"

    # Prepare AWS CLI command
    cmd = [
        "aws", "dynamodb", "update-item",
        "--table-name", DYNAMODB_TABLE,
        "--key", json.dumps({"id": {"S": product_id}}),
        "--update-expression", "SET modelPath = :m, posterPath = :p, iosModelPath = :i",
        "--expression-attribute-values", json.dumps({
            ":m": {"S": model_path},
            ":p": {"S": poster_path},
            ":i": {"S": ios_model_path}
        }),
        "--region", REGION,
        "--profile", "webxr-admin"
    ]

    print(f"Updating {product_id}...")
    subprocess.run(cmd, check=True)

print("All products updated with S3 URLs.")