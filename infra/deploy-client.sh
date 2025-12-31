#!/bin/bash

set -e

# Get the directory where this script is located
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"

# Configuration
STACK_NAME="static-site"
REGION="us-west-1"

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${BLUE}Deploying static-site${NC}"
echo -e "${BLUE}=====================${NC}"
echo ""

#############################################
# Step 1: Get Stack Outputs
#############################################
echo -e "${BLUE}Step 1: Getting stack outputs...${NC}"

BUCKET_NAME=$(aws cloudformation describe-stacks \
    --stack-name $STACK_NAME \
    --region $REGION \
    --query 'Stacks[0].Outputs[?OutputKey==`AssetsBucketName`].OutputValue' \
    --output text 2>/dev/null || echo "")

if [ -z "$BUCKET_NAME" ] || [ "$BUCKET_NAME" == "None" ]; then
    echo -e "${RED}Error: S3 bucket not found in stack outputs.${NC}"
    echo -e "${RED}Please deploy the infrastructure first: ./infra/deploy.sh${NC}"
    exit 1
fi

CF_DISTRIBUTION_ID=$(aws cloudformation describe-stacks \
    --stack-name $STACK_NAME \
    --region $REGION \
    --query 'Stacks[0].Outputs[?OutputKey==`CloudFrontDistributionId`].OutputValue' \
    --output text)

echo -e "${GREEN}S3 Bucket: $BUCKET_NAME${NC}"
echo -e "${GREEN}CloudFront Distribution ID: $CF_DISTRIBUTION_ID${NC}"

#############################################
# Step 2: Run Webpack Build
#############################################
echo ""
echo -e "${BLUE}Step 2: Running webpack build...${NC}"

cd "$PROJECT_ROOT"
npm run webpack:build

echo -e "${GREEN}Webpack build complete.${NC}"

#############################################
# Step 3: Sync Assets to S3
#############################################
echo ""
echo -e "${BLUE}Step 3: Syncing assets to S3...${NC}"

# Sync hashed assets with long-term caching (1 year)
aws s3 sync "$PROJECT_ROOT/public" "s3://$BUCKET_NAME" \
    --region $REGION \
    --exclude "index.html" \
    --cache-control "public, max-age=31536000, immutable"

# Sync index.html with no-cache (must revalidate on each request)
aws s3 cp "$PROJECT_ROOT/public/index.html" "s3://$BUCKET_NAME/index.html" \
    --region $REGION \
    --cache-control "no-cache"

echo -e "${GREEN}Assets synced to s3://$BUCKET_NAME${NC}"

#############################################
# Step 4: Invalidate CloudFront Cache
#############################################
echo ""
echo -e "${BLUE}Step 4: Invalidating CloudFront cache...${NC}"

aws cloudfront create-invalidation \
    --distribution-id $CF_DISTRIBUTION_ID \
    --paths "/*" \
    --query 'Invalidation.Id' \
    --output text

echo -e "${GREEN}CloudFront cache invalidation started.${NC}"

#############################################
# Done
#############################################
echo ""
echo -e "${GREEN}Deployment complete!${NC}"
