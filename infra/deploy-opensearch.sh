#!/bin/bash

set -e

# Get the directory where this script is located
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# Configuration
STACK_NAME="react-node-aws-search"
MAIN_STACK_NAME="react-node-aws"
REGION="us-west-1"
TEMPLATE_FILE="$SCRIPT_DIR/cloudformation-opensearch.yml"

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

echo -e "${BLUE}=== OpenSearch Deployment ===${NC}"
echo -e "${YELLOW}Note: OpenSearch domain creation takes 15-30 minutes${NC}\n"

# Step 0: Ensure OpenSearch service-linked role exists (required for VPC access)
echo -e "${BLUE}Step 0: Ensuring OpenSearch service-linked role exists...${NC}"
if aws iam get-role --role-name AWSServiceRoleForAmazonOpenSearchService &> /dev/null; then
    echo -e "${GREEN}Service-linked role already exists${NC}"
else
    echo -e "${YELLOW}Creating service-linked role for OpenSearch...${NC}"
    aws iam create-service-linked-role --aws-service-name opensearchservice.amazonaws.com
    echo -e "${GREEN}Service-linked role created${NC}"
fi

# Step 1: Get ECS Security Group ID from main stack
echo -e "${BLUE}Step 1: Retrieving ECS Security Group ID from main stack...${NC}"

# Check if main stack exists
if ! aws cloudformation describe-stacks --stack-name $MAIN_STACK_NAME --region $REGION &> /dev/null; then
    echo -e "${RED}Error: Main stack '$MAIN_STACK_NAME' not found.${NC}"
    echo -e "${RED}Please deploy the main stack first.${NC}"
    exit 1
fi

# Get ECS Security Group ID from stack resources
ECS_SG_ID=$(aws cloudformation describe-stack-resources \
    --stack-name $MAIN_STACK_NAME \
    --region $REGION \
    --query "StackResources[?LogicalResourceId=='ECSSecurityGroup'].PhysicalResourceId" \
    --output text)

if [ -z "$ECS_SG_ID" ] || [ "$ECS_SG_ID" == "None" ]; then
    echo -e "${RED}Error: Could not find ECS Security Group in main stack.${NC}"
    exit 1
fi
echo -e "${GREEN}ECS Security Group ID: $ECS_SG_ID${NC}"

# Step 2: Deploy OpenSearch stack
echo -e "\n${BLUE}Step 2: Deploying OpenSearch stack...${NC}"

if aws cloudformation describe-stacks --stack-name $STACK_NAME --region $REGION &> /dev/null; then
    echo -e "${GREEN}Stack exists. Updating...${NC}"

    aws cloudformation update-stack \
        --stack-name $STACK_NAME \
        --template-body file://$TEMPLATE_FILE \
        --parameters \
            ParameterKey=ECSSecurityGroupId,ParameterValue=$ECS_SG_ID \
        --capabilities CAPABILITY_NAMED_IAM \
        --region $REGION

    echo -e "${BLUE}Waiting for stack update to complete...${NC}"
    open_url "https://${REGION}.console.aws.amazon.com/cloudformation/home?region=${REGION}#/stacks/events?stackId=${STACK_NAME}"

    aws cloudformation wait stack-update-complete \
        --stack-name $STACK_NAME \
        --region $REGION

    echo -e "${GREEN}Stack updated successfully!${NC}"
else
    echo -e "${GREEN}Stack does not exist. Creating...${NC}"

    aws cloudformation create-stack \
        --stack-name $STACK_NAME \
        --template-body file://$TEMPLATE_FILE \
        --parameters \
            ParameterKey=ECSSecurityGroupId,ParameterValue=$ECS_SG_ID \
        --capabilities CAPABILITY_NAMED_IAM \
        --region $REGION

    echo -e "${BLUE}Waiting for stack creation to complete (this takes 15-30 minutes)...${NC}"
    open_url "https://${REGION}.console.aws.amazon.com/cloudformation/home?region=${REGION}#/stacks/events?stackId=${STACK_NAME}"

    aws cloudformation wait stack-create-complete \
        --stack-name $STACK_NAME \
        --region $REGION

    echo -e "${GREEN}Stack created successfully!${NC}"
fi

# Step 3: Display outputs
echo -e "\n${BLUE}=== Deployment Complete ===${NC}"
echo -e "\n${GREEN}OpenSearch Outputs:${NC}"
aws cloudformation describe-stacks \
    --stack-name $STACK_NAME \
    --region $REGION \
    --query 'Stacks[0].Outputs[].[OutputKey,OutputValue]' \
    --output table

echo -e "\n${YELLOW}Next steps:${NC}"
echo -e "1. Attach the OpenSearch policy to your ECS Task Role:"
POLICY_ARN=$(aws cloudformation describe-stacks \
    --stack-name $STACK_NAME \
    --region $REGION \
    --query 'Stacks[0].Outputs[?OutputKey==`OpenSearchAccessPolicyArn`].OutputValue' \
    --output text)
echo -e "   ${BLUE}aws iam attach-role-policy --role-name ${MAIN_STACK_NAME}-task-role --policy-arn $POLICY_ARN${NC}"
echo -e ""
echo -e "2. Add OPENSEARCH_ENDPOINT to your ECS task environment variables"

