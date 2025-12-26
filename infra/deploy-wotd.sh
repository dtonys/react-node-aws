#!/bin/bash

set -e

# Get the directory where this script is located
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"

# Configuration
STACK_NAME="react-node-aws-wotd"
REGION="us-west-1"
TEMPLATE_FILE="$SCRIPT_DIR/cloudformation-wotd.yml"
LAMBDA_DIR="$PROJECT_ROOT/src/lambda/wordOfDay"

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Function to open URL in browser (cross-platform)
open_url() {
    local url=$1
    echo -e "${BLUE}View progress: ${url}${NC}"
    if command -v open &> /dev/null; then
        open "$url"
    elif command -v xdg-open &> /dev/null; then
        xdg-open "$url"
    fi
}

echo -e "${BLUE}=== Word of the Day Lambda Deployment ===${NC}\n"

# Step 1: Deploy CloudFormation stack
echo -e "${BLUE}Step 1: Deploying CloudFormation stack...${NC}"

if aws cloudformation describe-stacks --stack-name $STACK_NAME --region $REGION &> /dev/null; then
    echo -e "${GREEN}Stack exists. Updating...${NC}"

    # Try to update, but handle "no updates" gracefully
    set +e
    UPDATE_OUTPUT=$(aws cloudformation update-stack \
        --stack-name $STACK_NAME \
        --template-body file://$TEMPLATE_FILE \
        --capabilities CAPABILITY_NAMED_IAM \
        --region $REGION 2>&1)
    UPDATE_EXIT_CODE=$?
    set -e

    if [ $UPDATE_EXIT_CODE -ne 0 ]; then
        if echo "$UPDATE_OUTPUT" | grep -q "No updates are to be performed"; then
            echo -e "${YELLOW}No updates to be performed. Stack is up to date.${NC}"
        else
            echo -e "${RED}Error updating stack: $UPDATE_OUTPUT${NC}"
            exit 1
        fi
    else
        echo -e "${BLUE}Waiting for stack update to complete...${NC}"
        open_url "https://${REGION}.console.aws.amazon.com/cloudformation/home?region=${REGION}#/stacks/events?stackId=${STACK_NAME}"

        aws cloudformation wait stack-update-complete \
            --stack-name $STACK_NAME \
            --region $REGION

        echo -e "${GREEN}Stack updated successfully!${NC}"
    fi
else
    echo -e "${GREEN}Stack does not exist. Creating...${NC}"

    aws cloudformation create-stack \
        --stack-name $STACK_NAME \
        --template-body file://$TEMPLATE_FILE \
        --capabilities CAPABILITY_NAMED_IAM \
        --region $REGION

    echo -e "${BLUE}Waiting for stack creation to complete...${NC}"
    open_url "https://${REGION}.console.aws.amazon.com/cloudformation/home?region=${REGION}#/stacks/events?stackId=${STACK_NAME}"

    aws cloudformation wait stack-create-complete \
        --stack-name $STACK_NAME \
        --region $REGION

    echo -e "${GREEN}Stack created successfully!${NC}"
fi

# Step 2: Build and deploy Lambda code
echo -e "\n${BLUE}Step 2: Building and deploying Lambda code...${NC}"

FUNCTION_NAME=$(aws cloudformation describe-stacks \
    --stack-name $STACK_NAME \
    --region $REGION \
    --query 'Stacks[0].Outputs[?OutputKey==`LambdaName`].OutputValue' \
    --output text)

echo -e "${GREEN}Lambda function name: $FUNCTION_NAME${NC}"

# Navigate to lambda directory
cd "$LAMBDA_DIR"

# Install dependencies
echo -e "${BLUE}Installing dependencies...${NC}"
npm install

# Build with esbuild (bundles most dependencies, mjml is external)
echo -e "${BLUE}Building with esbuild...${NC}"
npm run build

# Create deployment package (bundled file + external node_modules)
echo -e "${BLUE}Creating deployment package...${NC}"
# Copy external dependencies to dist
cp -r node_modules dist/
# Create zip from dist folder
cd dist
zip -r ../function.zip .
cd ..

# Deploy to Lambda
echo -e "${BLUE}Uploading to Lambda...${NC}"
aws lambda update-function-code \
    --function-name "$FUNCTION_NAME" \
    --zip-file fileb://function.zip \
    --region $REGION \
    --no-cli-pager > /dev/null

# Cleanup
echo -e "${BLUE}Cleaning up...${NC}"
rm -rf dist function.zip node_modules

# Step 3: Display outputs
echo -e "\n${BLUE}=== Deployment Complete ===${NC}"
echo -e "\n${GREEN}Stack Outputs:${NC}"
aws cloudformation describe-stacks \
    --stack-name $STACK_NAME \
    --region $REGION \
    --query 'Stacks[0].Outputs[].[OutputKey,OutputValue]' \
    --output table

echo -e "\n${YELLOW}Next steps:${NC}"
echo -e "1. Test the Lambda manually:"
echo -e "   ${BLUE}aws lambda invoke --function-name $FUNCTION_NAME --region $REGION output.json && cat output.json${NC}"
echo -e ""
echo -e "2. Check CloudWatch logs for any errors"
