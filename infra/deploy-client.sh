#!/bin/bash

set -e

# Get the directory where this script is located
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"

# Configuration
STACK_NAME="react-node-aws"
REGION="us-west-1"

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${BLUE}Assets Deployment${NC}"
echo -e "${BLUE}=================${NC}"
echo ""

#############################################
# Step 1: Run Webpack Build
#############################################
echo -e "${BLUE}Step 1: Running webpack build...${NC}"

cd "$PROJECT_ROOT"
npm run webpack:build

echo -e "${GREEN}Webpack build complete.${NC}"

#############################################
# Step 2: Get Stack Outputs
#############################################
echo ""
echo -e "${BLUE}Step 2: Getting stack outputs...${NC}"

BUCKET_NAME=$(aws cloudformation describe-stacks \
    --stack-name $STACK_NAME \
    --region $REGION \
    --query 'Stacks[0].Outputs[?OutputKey==`AssetsBucketName`].OutputValue' \
    --output text)

if [ -z "$BUCKET_NAME" ] || [ "$BUCKET_NAME" == "None" ]; then
    echo -e "${RED}Error: S3 bucket not found in stack outputs.${NC}"
    echo -e "${RED}Please deploy the main stack first: ./deploy-server.sh${NC}"
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
# Step 3: Sync Assets to S3
#############################################
echo ""
echo -e "${BLUE}Step 3: Syncing assets from /public to S3...${NC}"

# Sync hashed assets with long-term caching (1 year)
aws s3 sync "$PROJECT_ROOT/public" "s3://$BUCKET_NAME" \
    --region $REGION \
    --exclude "index.html" \
    --cache-control "public, max-age=31536000, immutable"

# Sync index.html with no-cache (must revalidate on each request)
aws s3 cp "$PROJECT_ROOT/public/index.html" "s3://$BUCKET_NAME/index.html" \
    --region $REGION \
    --cache-control "no-cache"

echo -e "${GREEN}Assets synced successfully.${NC}"

#############################################
# Done
#############################################
echo ""
echo -e "${GREEN}Deployment complete!${NC}"
echo ""
echo -e "${BLUE}Architecture:${NC}"
echo -e "  /api/*        → ALB (dynamic)"
echo -e "  /* (default)  → S3 (static, index.html fallback for SPA)"
echo ""
echo -e "${GREEN}Application URL: https://www.react-node-aws.com${NC}"
