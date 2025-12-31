<p align="center">
  <img src="./src/client/images/RNA-white-2.png" width="200" />
</p>

### The ultimate boilerplate for modern fullstack development.

# Tech Stack

<p align="center">
  <img src="./src/client/images/Tech Stack - Frontend.png" />
</p>

- **Frontend**: React 19, MUI (Material UI)
- **Build**: Webpack, TypeScript, Babel
- **Infrastructure**: AWS CloudFormation (S3, CloudFront, Route53, ACM)

## Overview

This branch (frontend-master) is a simplified version of the react-node-aws project. This branch focuses on static websites.

This is a great place to start for getting a personal website, or other frontend content deployed online.

Use [Getting Started](#getting-started) to get your app running locally.

When you are ready to deploy, move on to [AWS Infrastructure Setup](#aws-infrastructure-setup)

## Getting Started

### Prerequisites

- Node.js 24+
- AWS CLI configured with appropriate credentials

### Installation

```bash
git clone -b master-frontend --single-branch git@github.com:dtonys/react-node-aws.git
cd react-node-aws
nvm use 24
npm install
```

### Development

Start the development server with hot reloading:

```bash
npm run webpack:watch
```

Navigate to `http://localhost:8080` in your browser.

### Production Build

Build optimized assets for production:

```bash
npm run webpack:build
```

Built assets will be output to the `public/` directory.

## AWS Infrastructure Setup

### 1. AWS Authentication

Create a user in IAM (e.g., `web-admin`) and give it `AdministratorAccess`. This user will be used to develop locally.

Create an access and secret key for the AWS CLI. Install the CLI and use the keys to authenticate.

```bash
brew install awscli
aws configure
```

Update your `.zshrc` or equivalent.

```bash
export AWS_PROFILE=web-admin
```

### 2. Domain Name Purchase

1. Navigate to [Route 53](https://console.aws.amazon.com/route53/) in the AWS Console
2. Click "Registered domains" in the left sidebar
3. Click "Register domains"
4. Search for your desired domain name and select one
5. Complete the registration process

> **Tip**: If cost is a concern, look for cheaper TLDs like `.click`, `.link`, or `.site` which are often under $5/year.

After registration, Route 53 will automatically create a Hosted Zone for your domain. Note the **Hosted Zone ID** - you'll need it for the CloudFormation configuration.

### 3. Configure CloudFormation Parameters

Update the following files with your AWS account details:

**`infra/cloudformation-cert.yml`**

```yaml
DomainName: your-domain.com
HostedZoneId: ZXXXXXXXXXXXXX # Your Route53 Hosted Zone ID
```

**`infra/cloudformation.yml`**

```yaml
DomainName: your-domain.com
HostedZoneId: ZXXXXXXXXXXXXX # Your Route53 Hosted Zone ID
```

### 4. Create SSL Certificate

Create an ACM certificate for CloudFront (must be in us-east-1):

```bash
./infra/create-cert.sh
```

This will:

- Create a certificate with DNS validation
- Wait for the certificate to be validated (5-30 minutes)
- Output the Certificate ARN

### 5. Deploy Infrastructure

Deploy the S3 bucket, CloudFront distribution, and Route53 records:

```bash
./infra/deploy.sh
```

This creates:

- S3 bucket for static assets (private, accessed via CloudFront OAC)
- CloudFront distribution with HTTPS
- Route53 A records for apex and www domains
- SPA fallback (404/403 → index.html)

### 6. Deploy Assets

Build and deploy your static site:

```bash
npm run deploy
```

This will:

1. Run webpack production build
2. Sync assets to S3 with appropriate cache headers
3. Invalidate CloudFront cache

### 7. Deployment Complete

Your site is now live! From here, you can update the source code and run `npm run deploy` to publish subsequent updates.

## Project Structure

```
react-node-aws/
├── infra/
│   ├── cloudformation-cert.yml  # ACM certificate template
│   ├── cloudformation.yml       # Main infrastructure template
│   ├── create-cert.sh           # Certificate creation script
│   ├── deploy.sh                # Infrastructure deployment script
│   └── deploy-client.sh         # Asset deployment script
├── public/                      # Built assets (output)
├── src/
│   └── client/
│       ├── App.tsx              # Main React component
│       ├── index.tsx            # Entry point
│       ├── pages/               # Page components
│       │   └── home/
│       ├── styles/              # Global styles
│       └── theme.ts             # MUI theme configuration
├── package.json
├── webpack.config.js
├── webpack.dev.config.js
└── webpack.production.config.js
```

## Infrastructure Details

### CloudFront Configuration

- **HTTPS**: Redirect HTTP to HTTPS
- **HTTP/2 & HTTP/3**: Enabled for performance
- **Caching**:
  - Hashed assets: 1 year cache (immutable)
  - index.html: No cache (always revalidate)
- **SPA Support**: 403/404 errors return index.html with 200 status

### S3 Configuration

- **Private bucket**: No public access
- **CloudFront OAC**: Secure access from CloudFront only
- **CORS**: Configured for your domain

### Route53 Configuration

- **Apex domain**: Points to CloudFront
- **www subdomain**: Points to CloudFront

## Favicons

Use https://favicon.io/favicon-converter/ to generate favicons across platforms.

Place your favicons in `src/client/images/favicons`. The webpack build will automatically copy them into the `/public` folder.

## Deleting Infrastructure

To delete the CloudFormation stacks:

```bash
# First, empty the S3 bucket
aws s3 rm s3://static-site-assets --recursive

# Delete the main stack
aws cloudformation delete-stack --stack-name static-site --region us-west-1

# Delete the certificate stack
aws cloudformation delete-stack --stack-name static-site-cert --region us-east-1
```
