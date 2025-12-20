#!/bin/bash

set -e

# Get the directory where this script is located
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# Configuration
STACK_NAME="web-2026-cert"
REGION="us-west-1"
TEMPLATE_FILE="$SCRIPT_DIR/cloudformation-cert.yml"

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[0;33m'
NC='\033[0m' # No Color

echo -e "${BLUE}Checking certificate stack status...${NC}"

# Check if stack already exists
if aws cloudformation describe-stacks --stack-name $STACK_NAME --region $REGION &> /dev/null; then
    STACK_STATUS=$(aws cloudformation describe-stacks \
        --stack-name $STACK_NAME \
        --region $REGION \
        --query 'Stacks[0].StackStatus' \
        --output text)

    echo -e "${YELLOW}Certificate stack '$STACK_NAME' already exists (status: $STACK_STATUS).${NC}"

    # Show the certificate ARN
    CERT_ARN=$(aws cloudformation describe-stacks \
        --stack-name $STACK_NAME \
        --region $REGION \
        --query 'Stacks[0].Outputs[?OutputKey==`CertificateArn`].OutputValue' \
        --output text)

    if [ -n "$CERT_ARN" ] && [ "$CERT_ARN" != "None" ]; then
        echo -e "${GREEN}Certificate ARN: $CERT_ARN${NC}"
    fi

    exit 0
fi

echo -e "${BLUE}Creating certificate stack...${NC}"

aws cloudformation create-stack \
    --stack-name $STACK_NAME \
    --template-body file://$TEMPLATE_FILE \
    --region $REGION

echo -e "${BLUE}Waiting for certificate validation to complete...${NC}"
echo -e "${BLUE}This may take 5-30 minutes...${NC}"

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

echo -e "${GREEN}Certificate stack created successfully!${NC}"

# Show the certificate ARN
CERT_ARN=$(aws cloudformation describe-stacks \
    --stack-name $STACK_NAME \
    --region $REGION \
    --query 'Stacks[0].Outputs[?OutputKey==`CertificateArn`].OutputValue' \
    --output text)

echo -e "${GREEN}Certificate ARN: $CERT_ARN${NC}"
