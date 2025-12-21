#!/bin/bash

set -e

# Get the directory where this script is located
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
TEMPLATE_FILE="$SCRIPT_DIR/cloudformation-cert.yml"

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[0;33m'
NC='\033[0m' # No Color

# Function to create or check a certificate stack
create_cert() {
    local STACK_NAME=$1
    local REGION=$2
    local LABEL=$3

    echo ""
    echo -e "${BLUE}${LABEL} Certificate (${REGION})${NC}"
    echo -e "${BLUE}$(printf '=%.0s' {1..40})${NC}"

    # Check if stack already exists
    if aws cloudformation describe-stacks --stack-name $STACK_NAME --region $REGION &> /dev/null; then
        STACK_STATUS=$(aws cloudformation describe-stacks \
            --stack-name $STACK_NAME \
            --region $REGION \
            --query 'Stacks[0].StackStatus' \
            --output text)

        echo -e "${YELLOW}Stack '$STACK_NAME' already exists (status: $STACK_STATUS).${NC}"

        CERT_ARN=$(aws cloudformation describe-stacks \
            --stack-name $STACK_NAME \
            --region $REGION \
            --query 'Stacks[0].Outputs[?OutputKey==`CertificateArn`].OutputValue' \
            --output text)

        if [ -n "$CERT_ARN" ] && [ "$CERT_ARN" != "None" ]; then
            echo -e "${GREEN}Certificate ARN: $CERT_ARN${NC}"
        fi

        return 0
    fi

    echo -e "${BLUE}Creating certificate stack...${NC}"

    aws cloudformation create-stack \
        --stack-name $STACK_NAME \
        --template-body file://$TEMPLATE_FILE \
        --region $REGION

    echo -e "${BLUE}Waiting for DNS validation (5-30 minutes)...${NC}"

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

    echo -e "${GREEN}Certificate created successfully!${NC}"

    CERT_ARN=$(aws cloudformation describe-stacks \
        --stack-name $STACK_NAME \
        --region $REGION \
        --query 'Stacks[0].Outputs[?OutputKey==`CertificateArn`].OutputValue' \
        --output text)

    echo -e "${GREEN}Certificate ARN: $CERT_ARN${NC}"
}

# Create both certificates
create_cert "web-2026-cert" "us-west-1" "ALB"
create_cert "web-2026-cert-cloudfront" "us-east-1" "CloudFront"

echo ""
echo -e "${GREEN}Done!${NC}"
