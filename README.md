# Static Site

A clean boilerplate for building and deploying static websites using React, MUI, and AWS (S3, CloudFront, Route53).

## Tech Stack

- **Frontend**: React 19, MUI (Material UI)
- **Build**: Webpack, TypeScript, Babel
- **Infrastructure**: AWS CloudFormation (S3, CloudFront, Route53, ACM)

## Getting Started

### Prerequisites

- Node.js 24+
- AWS CLI configured with appropriate credentials

### Installation

```bash
git clone <your-repo-url>
cd static-site
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

### 1. Configure CloudFormation Parameters

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

### 2. Create SSL Certificate

Create an ACM certificate for CloudFront (must be in us-east-1):

```bash
./infra/create-cert.sh
```

This will:

- Create a certificate with DNS validation
- Wait for the certificate to be validated (5-30 minutes)
- Output the Certificate ARN

### 3. Deploy Infrastructure

Deploy the S3 bucket, CloudFront distribution, and Route53 records:

```bash
./infra/deploy.sh
```

This creates:

- S3 bucket for static assets (private, accessed via CloudFront OAC)
- CloudFront distribution with HTTPS
- Route53 A records for apex and www domains
- SPA fallback (404/403 → index.html)

### 4. Deploy Assets

Build and deploy your static site:

```bash
npm run deploy
```

This will:

1. Run webpack production build
2. Sync assets to S3 with appropriate cache headers
3. Invalidate CloudFront cache

## Project Structure

```
static-site/
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
