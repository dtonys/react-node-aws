#!/bin/bash

set -e

# Get the directory where this script is located
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# Configuration
STACK_NAME="react-node-aws-bastion"
REGION="us-west-1"
TEMPLATE_FILE="$SCRIPT_DIR/cloudformation-bastion.yml"

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${BLUE}=== Bastion Host Deployment ===${NC}\n"

# Check for existing key pairs
echo -e "${BLUE}Available EC2 Key Pairs:${NC}"
aws ec2 describe-key-pairs --region $REGION --query 'KeyPairs[*].KeyName' --output table

echo ""
read -p "Enter the key pair name to use: " KEY_PAIR_NAME

if [ -z "$KEY_PAIR_NAME" ]; then
    echo -e "${RED}Error: Key pair name is required${NC}"
    exit 1
fi

# Verify key pair exists
if ! aws ec2 describe-key-pairs --key-names "$KEY_PAIR_NAME" --region $REGION &> /dev/null; then
    echo -e "${RED}Error: Key pair '$KEY_PAIR_NAME' not found${NC}"
    echo -e "${YELLOW}Create one with: aws ec2 create-key-pair --key-name $KEY_PAIR_NAME --region $REGION --query 'KeyMaterial' --output text > ~/.ssh/$KEY_PAIR_NAME.pem${NC}"
    exit 1
fi

# Get user's public IP for SSH restriction (optional)
echo ""
echo -e "${YELLOW}Restrict SSH access to your IP? (recommended for security)${NC}"
read -p "Enter your IP (leave blank for 0.0.0.0/0): " USER_IP

if [ -z "$USER_IP" ]; then
    ALLOWED_CIDR="0.0.0.0/0"
    echo -e "${YELLOW}Warning: SSH will be open to the internet. Consider restricting later.${NC}"
else
    ALLOWED_CIDR="${USER_IP}/32"
    echo -e "${GREEN}SSH will be restricted to: $ALLOWED_CIDR${NC}"
fi

# Deploy stack
echo -e "\n${BLUE}Deploying bastion host...${NC}"

if aws cloudformation describe-stacks --stack-name $STACK_NAME --region $REGION &> /dev/null; then
    echo -e "${GREEN}Stack exists. Updating...${NC}"
    
    aws cloudformation update-stack \
        --stack-name $STACK_NAME \
        --template-body file://$TEMPLATE_FILE \
        --parameters \
            ParameterKey=KeyPairName,ParameterValue=$KEY_PAIR_NAME \
            ParameterKey=AllowedSSHCidr,ParameterValue=$ALLOWED_CIDR \
        --region $REGION || true

    aws cloudformation wait stack-update-complete \
        --stack-name $STACK_NAME \
        --region $REGION 2>/dev/null || true

else
    echo -e "${GREEN}Creating stack...${NC}"
    
    aws cloudformation create-stack \
        --stack-name $STACK_NAME \
        --template-body file://$TEMPLATE_FILE \
        --parameters \
            ParameterKey=KeyPairName,ParameterValue=$KEY_PAIR_NAME \
            ParameterKey=AllowedSSHCidr,ParameterValue=$ALLOWED_CIDR \
        --region $REGION

    echo -e "${BLUE}Waiting for stack creation...${NC}"
    aws cloudformation wait stack-create-complete \
        --stack-name $STACK_NAME \
        --region $REGION

    echo -e "${GREEN}Stack created successfully!${NC}"
fi

# Get outputs
echo -e "\n${BLUE}=== Bastion Host Ready ===${NC}\n"

BASTION_IP=$(aws cloudformation describe-stacks \
    --stack-name $STACK_NAME \
    --region $REGION \
    --query 'Stacks[0].Outputs[?OutputKey==`BastionPublicIP`].OutputValue' \
    --output text)

echo -e "${GREEN}Bastion IP: $BASTION_IP${NC}\n"

echo -e "${YELLOW}SSH to bastion:${NC}"
echo -e "  ssh -i ~/.ssh/${KEY_PAIR_NAME}.pem ec2-user@${BASTION_IP}\n"

# Get OpenSearch endpoint
OPENSEARCH_ENDPOINT=$(aws cloudformation describe-stacks \
    --stack-name react-node-aws-search \
    --region $REGION \
    --query 'Stacks[0].Outputs[?OutputKey==`OpenSearchDomainEndpoint`].OutputValue' \
    --output text 2>/dev/null | sed 's|https://||')

if [ -n "$OPENSEARCH_ENDPOINT" ] && [ "$OPENSEARCH_ENDPOINT" != "None" ]; then
    echo -e "${YELLOW}SSH tunnel for OpenSearch:${NC}"
    echo -e "  ssh -i ~/.ssh/${KEY_PAIR_NAME}.pem -L 9243:${OPENSEARCH_ENDPOINT}:443 -N ec2-user@${BASTION_IP}\n"
    echo -e "${YELLOW}Then use in your local .env:${NC}"
    echo -e "  OPENSEARCH_ENDPOINT=https://localhost:9243\n"
fi

echo -e "${GREEN}Done!${NC}"

