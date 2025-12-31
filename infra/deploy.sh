#!/bin/bash

set -e

# Get the directory where this script is located
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
TEMPLATE_FILE="$SCRIPT_DIR/cloudformation.yml"

# Configuration
STACK_NAME="static-site"
REGION="us-west-1"

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[0;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${BLUE}Static Site Infrastructure Deployment${NC}"
echo -e "${BLUE}======================================${NC}"
echo ""

#############################################
# Step 1: Get CloudFront Certificate ARN
#############################################
echo -e "${BLUE}Step 1: Getting CloudFront certificate...${NC}"

CF_CERT_ARN=$(aws cloudformation describe-stacks \
    --stack-name static-site-cert \
    --region us-east-1 \
    --query 'Stacks[0].Outputs[?OutputKey==`CertificateArn`].OutputValue' \
    --output text 2>/dev/null || echo "")

if [ -z "$CF_CERT_ARN" ] || [ "$CF_CERT_ARN" == "None" ]; then
    echo -e "${RED}Error: CloudFront certificate not found.${NC}"
    echo -e "${RED}Please run ./create-cert.sh first.${NC}"
    exit 1
fi

echo -e "${GREEN}CloudFront Certificate: $CF_CERT_ARN${NC}"

#############################################
# Step 2: Deploy CloudFormation Stack
#############################################
echo ""
echo -e "${BLUE}Step 2: Deploying CloudFormation stack...${NC}"

# Check if stack exists
if aws cloudformation describe-stacks --stack-name $STACK_NAME --region $REGION &> /dev/null; then
    echo -e "${YELLOW}Stack exists, updating...${NC}"
    
    aws cloudformation update-stack \
        --stack-name $STACK_NAME \
        --template-body file://$TEMPLATE_FILE \
        --parameters \
            ParameterKey=CloudFrontCertificateArn,ParameterValue=$CF_CERT_ARN \
        --region $REGION \
        --capabilities CAPABILITY_NAMED_IAM 2>/dev/null || {
            # Check if it's a "no updates" error
            if aws cloudformation describe-stacks --stack-name $STACK_NAME --region $REGION &> /dev/null; then
                echo -e "${YELLOW}No updates to perform.${NC}"
            else
                exit 1
            fi
        }
    
    echo -e "${BLUE}Waiting for stack update...${NC}"
    aws cloudformation wait stack-update-complete \
        --stack-name $STACK_NAME \
        --region $REGION 2>/dev/null || true
else
    echo -e "${BLUE}Creating new stack...${NC}"
    
    aws cloudformation create-stack \
        --stack-name $STACK_NAME \
        --template-body file://$TEMPLATE_FILE \
        --parameters \
            ParameterKey=CloudFrontCertificateArn,ParameterValue=$CF_CERT_ARN \
        --region $REGION \
        --capabilities CAPABILITY_NAMED_IAM
    
    echo -e "${BLUE}Waiting for stack creation (this may take 10-15 minutes)...${NC}"
    
    CONSOLE_URL="https://${REGION}.console.aws.amazon.com/cloudformation/home?region=${REGION}#/stacks/events?stackId=${STACK_NAME}"
    echo -e "${BLUE}View progress: ${CONSOLE_URL}${NC}"
    
    # Open URL in browser (cross-platform)
    if command -v open &> /dev/null; then
        open "$CONSOLE_URL"
    elif command -v xdg-open &> /dev/null; then
        xdg-open "$CONSOLE_URL"
    fi
    
    aws cloudformation wait stack-create-complete \
        --stack-name $STACK_NAME \
        --region $REGION
fi

#############################################
# Step 3: Show Outputs
#############################################
echo ""
echo -e "${GREEN}Deployment complete!${NC}"
echo ""
echo -e "${BLUE}Stack Outputs:${NC}"

aws cloudformation describe-stacks \
    --stack-name $STACK_NAME \
    --region $REGION \
    --query 'Stacks[0].Outputs[*].[OutputKey,OutputValue]' \
    --output table

echo ""
echo -e "${BLUE}Next steps:${NC}"
echo -e "  Run: npm run deploy"

