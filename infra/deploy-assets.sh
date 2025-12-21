#!/bin/bash

set -e

# Get the directory where this script is located
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# Configuration
ASSETS_STACK_NAME="web-2026-assets"
CERT_STACK_NAME="web-2026-cert-cloudfront"
MAIN_STACK_NAME="web-2026"
MAIN_REGION="us-west-1"
CERT_REGION="us-east-1"
TEMPLATE_FILE="$SCRIPT_DIR/cloudformation-assets.yml"

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[0;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${BLUE}Assets Stack Deployment${NC}"
echo -e "${BLUE}=======================${NC}"
echo ""

# Get the project root directory (parent of infra)
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"

#############################################
# Step 1: Run Webpack Build
#############################################
echo -e "${BLUE}Step 1: Running webpack build...${NC}"

cd "$PROJECT_ROOT"
npm run webpack:build

echo -e "${GREEN}Webpack build complete.${NC}"

#############################################
# Step 2: Get CloudFront Certificate ARN
#############################################
echo -e "${BLUE}Step 2: Retrieving CloudFront certificate ARN from us-east-1...${NC}"

CERT_ARN=$(aws cloudformation describe-stacks \
    --stack-name $CERT_STACK_NAME \
    --region $CERT_REGION \
    --query 'Stacks[0].Outputs[?OutputKey==`CloudFrontCertificateArn`].OutputValue' \
    --output text 2>/dev/null)

if [ -z "$CERT_ARN" ] || [ "$CERT_ARN" == "None" ]; then
    echo -e "${RED}Error: CloudFront certificate not found.${NC}"
    echo -e "${YELLOW}Please run ./create-cert-cloudfront.sh first.${NC}"
    exit 1
fi

echo -e "${GREEN}Certificate ARN: $CERT_ARN${NC}"

#############################################
# Step 3: Get ALB Domain Name
#############################################
echo -e "${BLUE}Step 3: Retrieving ALB domain name from main stack...${NC}"

ALB_DNS=$(aws cloudformation describe-stacks \
    --stack-name $MAIN_STACK_NAME \
    --region $MAIN_REGION \
    --query 'Stacks[0].Outputs[?OutputKey==`LoadBalancerDNS`].OutputValue' \
    --output text 2>/dev/null)

if [ -z "$ALB_DNS" ] || [ "$ALB_DNS" == "None" ]; then
    echo -e "${RED}Error: ALB domain name not found.${NC}"
    echo -e "${YELLOW}Please ensure the main stack '$MAIN_STACK_NAME' is deployed.${NC}"
    exit 1
fi

echo -e "${GREEN}ALB Domain: $ALB_DNS${NC}"

#############################################
# Step 4: Deploy or Update Assets Stack
#############################################
echo -e "${BLUE}Step 4: Deploying assets stack...${NC}"

# Check if stack already exists
if aws cloudformation describe-stacks --stack-name $ASSETS_STACK_NAME --region $MAIN_REGION &> /dev/null; then
    echo -e "${YELLOW}Stack exists, updating...${NC}"

    aws cloudformation update-stack \
        --stack-name $ASSETS_STACK_NAME \
        --template-body file://$TEMPLATE_FILE \
        --region $MAIN_REGION \
        --parameters \
            ParameterKey=CloudFrontCertificateArn,ParameterValue="$CERT_ARN" \
            ParameterKey=ALBDomainName,ParameterValue="$ALB_DNS" \
        2>/dev/null || {
            if [ $? -eq 255 ]; then
                echo -e "${YELLOW}No updates to perform.${NC}"
                exit 0
            fi
        }

    echo -e "${BLUE}Waiting for stack update to complete...${NC}"
    aws cloudformation wait stack-update-complete \
        --stack-name $ASSETS_STACK_NAME \
        --region $MAIN_REGION
else
    echo -e "${BLUE}Creating new stack...${NC}"

    aws cloudformation create-stack \
        --stack-name $ASSETS_STACK_NAME \
        --template-body file://$TEMPLATE_FILE \
        --region $MAIN_REGION \
        --parameters \
            ParameterKey=CloudFrontCertificateArn,ParameterValue="$CERT_ARN" \
            ParameterKey=ALBDomainName,ParameterValue="$ALB_DNS"

    echo -e "${BLUE}Waiting for stack creation to complete...${NC}"
    echo -e "${YELLOW}This may take 10-15 minutes for CloudFront distribution...${NC}"

    CONSOLE_URL="https://${MAIN_REGION}.console.aws.amazon.com/cloudformation/home?region=${MAIN_REGION}#/stacks/events?stackId=${ASSETS_STACK_NAME}"
    echo -e "${BLUE}View progress: ${CONSOLE_URL}${NC}"

    # Open URL in browser (cross-platform)
    if command -v open &> /dev/null; then
        open "$CONSOLE_URL"
    elif command -v xdg-open &> /dev/null; then
        xdg-open "$CONSOLE_URL"
    fi

    aws cloudformation wait stack-create-complete \
        --stack-name $ASSETS_STACK_NAME \
        --region $MAIN_REGION
fi

echo -e "${GREEN}Assets stack deployed successfully!${NC}"

#############################################
# Step 5: Get Stack Outputs
#############################################
echo ""
echo -e "${BLUE}Step 5: Getting stack outputs...${NC}"

BUCKET_NAME=$(aws cloudformation describe-stacks \
    --stack-name $ASSETS_STACK_NAME \
    --region $MAIN_REGION \
    --query 'Stacks[0].Outputs[?OutputKey==`AssetsBucketName`].OutputValue' \
    --output text)

CF_DISTRIBUTION_ID=$(aws cloudformation describe-stacks \
    --stack-name $ASSETS_STACK_NAME \
    --region $MAIN_REGION \
    --query 'Stacks[0].Outputs[?OutputKey==`CloudFrontDistributionId`].OutputValue' \
    --output text)

CF_DOMAIN=$(aws cloudformation describe-stacks \
    --stack-name $ASSETS_STACK_NAME \
    --region $MAIN_REGION \
    --query 'Stacks[0].Outputs[?OutputKey==`CloudFrontDistributionDomainName`].OutputValue' \
    --output text)

echo -e "${GREEN}S3 Bucket: $BUCKET_NAME${NC}"
echo -e "${GREEN}CloudFront Distribution ID: $CF_DISTRIBUTION_ID${NC}"
echo -e "${GREEN}CloudFront Domain: $CF_DOMAIN${NC}"

#############################################
# Step 6: Sync Assets to S3
#############################################
echo ""
echo -e "${BLUE}Step 6: Syncing assets from /public to S3...${NC}"

# Sync hashed assets with long-term caching (1 year)
aws s3 sync "$PROJECT_ROOT/public" "s3://$BUCKET_NAME" \
    --region $MAIN_REGION \
    --exclude "index.html" \
    --cache-control "public, max-age=31536000, immutable"

# Sync index.html with no-cache (must revalidate on each request)
aws s3 cp "$PROJECT_ROOT/public/index.html" "s3://$BUCKET_NAME/index.html" \
    --region $MAIN_REGION \
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
