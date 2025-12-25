#!/bin/bash

set -e

# Get the directory where this script is located
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# Configuration
STACK_NAME="react-node-aws-cache"
MAIN_STACK_NAME="react-node-aws"
REGION="us-west-1"
TEMPLATE_FILE="$SCRIPT_DIR/cloudformation-elasticache.yml"

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

echo -e "${BLUE}=== ElastiCache Redis Deployment ===${NC}"
echo -e "${YELLOW}Note: ElastiCache cluster creation takes 5-10 minutes${NC}\n"

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

# Check for bastion security group (optional)
BASTION_SG_ID=""
if aws cloudformation describe-stacks --stack-name react-node-aws-bastion --region $REGION &> /dev/null; then
    BASTION_SG_ID=$(aws cloudformation describe-stack-resources \
        --stack-name react-node-aws-bastion \
        --region $REGION \
        --query "StackResources[?LogicalResourceId=='BastionSecurityGroup'].PhysicalResourceId" \
        --output text)
    if [ -n "$BASTION_SG_ID" ] && [ "$BASTION_SG_ID" != "None" ]; then
        echo -e "${GREEN}Bastion Security Group ID: $BASTION_SG_ID (will enable SSH tunneling)${NC}"
    else
        BASTION_SG_ID=""
    fi
fi

# Step 2: Deploy ElastiCache stack
echo -e "\n${BLUE}Step 2: Deploying ElastiCache stack...${NC}"

if aws cloudformation describe-stacks --stack-name $STACK_NAME --region $REGION &> /dev/null; then
    echo -e "${GREEN}Stack exists. Updating...${NC}"

    # Try to update, but handle "no updates" gracefully
    set +e
    UPDATE_OUTPUT=$(aws cloudformation update-stack \
        --stack-name $STACK_NAME \
        --template-body file://$TEMPLATE_FILE \
        --parameters \
            ParameterKey=ECSSecurityGroupId,ParameterValue=$ECS_SG_ID \
            ParameterKey=BastionSecurityGroupId,ParameterValue=$BASTION_SG_ID \
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
        --parameters \
            ParameterKey=ECSSecurityGroupId,ParameterValue=$ECS_SG_ID \
            ParameterKey=BastionSecurityGroupId,ParameterValue=$BASTION_SG_ID \
        --region $REGION

    echo -e "${BLUE}Waiting for stack creation to complete (this takes 5-10 minutes)...${NC}"
    open_url "https://${REGION}.console.aws.amazon.com/cloudformation/home?region=${REGION}#/stacks/events?stackId=${STACK_NAME}"

    aws cloudformation wait stack-create-complete \
        --stack-name $STACK_NAME \
        --region $REGION

    echo -e "${GREEN}Stack created successfully!${NC}"
fi

# Step 3: Display outputs
echo -e "\n${BLUE}=== Deployment Complete ===${NC}"
echo -e "\n${GREEN}ElastiCache Outputs:${NC}"
aws cloudformation describe-stacks \
    --stack-name $STACK_NAME \
    --region $REGION \
    --query 'Stacks[0].Outputs[].[OutputKey,OutputValue]' \
    --output table

# Get Redis URL for convenience
REDIS_URL=$(aws cloudformation describe-stacks \
    --stack-name $STACK_NAME \
    --region $REGION \
    --query 'Stacks[0].Outputs[?OutputKey==`RedisURL`].OutputValue' \
    --output text)

echo -e "\n${YELLOW}Next steps:${NC}"
echo -e "1. Add REDIS_URL to your ECS task environment variables in cloudformation.yml:"
echo -e "   ${BLUE}- Name: REDIS_URL${NC}"
echo -e "   ${BLUE}  Value: $REDIS_URL${NC}"
echo -e ""
echo -e "2. Re-deploy the main stack to apply the environment variable:"
echo -e "   ${BLUE}./infra/deploy-server.sh${NC}"

# Show SSH tunnel instructions if bastion exists
if [ -n "$BASTION_SG_ID" ]; then
    BASTION_IP=$(aws cloudformation describe-stacks \
        --stack-name react-node-aws-bastion \
        --region $REGION \
        --query 'Stacks[0].Outputs[?OutputKey==`BastionPublicIP`].OutputValue' \
        --output text 2>/dev/null)
    
    REDIS_HOST=$(aws cloudformation describe-stacks \
        --stack-name $STACK_NAME \
        --region $REGION \
        --query 'Stacks[0].Outputs[?OutputKey==`RedisEndpoint`].OutputValue' \
        --output text)
    
    if [ -n "$BASTION_IP" ] && [ "$BASTION_IP" != "None" ]; then
        echo -e ""
        echo -e "${YELLOW}To connect locally via SSH tunnel:${NC}"
        echo -e "  ${BLUE}ssh -i ~/.ssh/YOUR_KEY.pem -L 6379:${REDIS_HOST}:6379 -N ec2-user@${BASTION_IP}${NC}"
        echo -e ""
        echo -e "${YELLOW}Then use in your local .env:${NC}"
        echo -e "  ${BLUE}REDIS_URL=redis://localhost:6379${NC}"
    fi
fi

