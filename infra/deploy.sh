#!/bin/bash

set -e

# Get the directory where this script is located
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"

# Configuration
STACK_NAME="web-2026"
REGION="us-west-1"
ECR_REPO="964744224338.dkr.ecr.us-west-1.amazonaws.com/web-2026"
TEMPLATE_FILE="$SCRIPT_DIR/cloudformation.yml"

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${BLUE}Starting deployment process...${NC}"

# Step 1: Build Docker image
echo -e "\n${BLUE}Step 1: Building Docker image...${NC}"
cd "$PROJECT_ROOT" && npm run docker:build:linux

# Step 2: Authenticate to ECR
echo -e "\n${BLUE}Step 2: Authenticating to ECR...${NC}"
aws ecr get-login-password --region $REGION | docker login --username AWS --password-stdin $ECR_REPO

# Step 3: Tag image
echo -e "\n${BLUE}Step 3: Tagging image...${NC}"
docker tag web-2026:latest $ECR_REPO:latest

# Step 4: Push to ECR
echo -e "\n${BLUE}Step 4: Pushing image to ECR...${NC}"
docker push $ECR_REPO:latest

# Step 5: Check if stack exists
echo -e "\n${BLUE}Step 5: Checking if CloudFormation stack exists...${NC}"
if aws cloudformation describe-stacks --stack-name $STACK_NAME --region $REGION &> /dev/null; then
    echo -e "${GREEN}Stack exists. Updating...${NC}"

    # Update stack
    aws cloudformation update-stack \
        --stack-name $STACK_NAME \
        --template-body file://$TEMPLATE_FILE \
        --capabilities CAPABILITY_NAMED_IAM \
        --region $REGION

    echo -e "${BLUE}Waiting for stack update to complete...${NC}"
    aws cloudformation wait stack-update-complete \
        --stack-name $STACK_NAME \
        --region $REGION

    echo -e "${GREEN}Stack updated successfully!${NC}"
else
    echo -e "${GREEN}Stack does not exist. Creating...${NC}"

    # Create stack
    aws cloudformation create-stack \
        --stack-name $STACK_NAME \
        --template-body file://$TEMPLATE_FILE \
        --capabilities CAPABILITY_NAMED_IAM \
        --region $REGION

    echo -e "${BLUE}Waiting for stack creation to complete...${NC}"
    echo -e "${BLUE}This may take 5-10 minutes for certificate validation...${NC}"
    aws cloudformation wait stack-create-complete \
        --stack-name $STACK_NAME \
        --region $REGION

    echo -e "${GREEN}Stack created successfully!${NC}"
fi

# Step 6: Force new ECS deployment
echo -e "\n${BLUE}Step 6: Forcing new ECS deployment...${NC}"
CLUSTER_NAME=$(aws cloudformation describe-stacks \
    --stack-name $STACK_NAME \
    --region $REGION \
    --query 'Stacks[0].Outputs[?OutputKey==`ECSClusterName`].OutputValue' \
    --output text)

SERVICE_NAME=$(aws cloudformation describe-stacks \
    --stack-name $STACK_NAME \
    --region $REGION \
    --query 'Stacks[0].Outputs[?OutputKey==`ECSServiceName`].OutputValue' \
    --output text)

aws ecs update-service \
    --cluster $CLUSTER_NAME \
    --service $SERVICE_NAME \
    --force-new-deployment \
    --region $REGION > /dev/null

echo -e "${GREEN}ECS service deployment triggered!${NC}"

# Step 7: Get outputs
echo -e "\n${BLUE}Deployment complete!${NC}"
echo -e "\n${GREEN}Application URLs:${NC}"
aws cloudformation describe-stacks \
    --stack-name $STACK_NAME \
    --region $REGION \
    --query 'Stacks[0].Outputs[?OutputKey==`DomainURL`].[OutputKey,OutputValue]' \
    --output table

echo -e "\n${GREEN}View logs with:${NC}"
echo "aws logs tail /ecs/$STACK_NAME --follow --region $REGION"
