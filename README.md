<p align="center">
  <img src="./src/client/images/RNA-white-2.png" width="200" />
</p>

### The ultimate boilerplate for modern fullstack development.

# Tech Stack

<p align="center">
  <img src="./src/client/images/Tech Stack.png" />
</p>

# Overview

Simple and clean foundation for production quality web applications.

Minimal dependencies, with usage of web standard apis.

Featuring modern frontend, and connection to AWS cloud ecosystem, covering core components.

# Setup

### Pull code and install dependencies

```
> git clone git@github.com:dtonys/react-node-aws.git
> cd react-node-aws.git
> nvm use 24
> npm install
```

### AWS authentication

Create a user in IAM and give it `AdministratorAccess`, this user will be used to develop locally.

Create an access and secret key for the AWS CLI. Install the CLI and use the keys to authenticate.

```
> brew install awscli
> aws configure
```

Update your `.zshrc` or equivalent.

> export AWS_PROFILE=\<your-user\>

### Domain

Purchase a domain and setup the DNS records in Route 53.

### Email

Signup for resent to integrate your email - https://resend.com/

Setup your domain name with resend, update your route 53 with email records.

### Secrets

In AWS Secrets Manager, add a secret named `web-secrets` with your session and resend key.

```
SESSION_ENCRYPTION_KEY={secret}
RESEND_API_KEY={secret}
```

Use the following script to generate SESSION_ENCRYPTION_KEY:

> node src/scripts/generateSecret.js

# AWS Build and Deploy

AWS resources and deployment will be handled by CloudFormation. You'll need to do a few manual steps before deploying.

### Docker

Make sure you have docker desktop installed to be able to build docker image.

Run the npm script to test your docker build

> npm run docker:build

### ECR

Create a repo on ECR. The deploy scripts will connect to ECR, tag your local docker image with the ECR repo and commit hash, and then push it up to the ECR.

### Update Cloudformation and Scripts

Visit route53 and VPC via the AWS console to plug in the variables.  We will be using the default VPC and Route53 variables.

The snippet below shows the minimum configs you need to update.

```
// infra/deploy-server.sh
ECR_REPO=<account>.dkr.ecr.us-west-1.amazonaws.com/<repo-name>

// infra/cloudformation.yml, update the `DEFAULT` value for each,
DomainName
HostedZoneId
VpcId
PublicSubnet1
PublicSubnet2
```

### Build Cloudformation stacks and deploy code

Run the scripts in order

Create certs for ECS and Cloudfront assets. This only needs to be done once.

> ./infra/create-cert.sh

Create ECS Stack, build & deploy latest docker image.

> ./infra/deploy-server.sh

Create Cloudfront assets stack, build assets and copy to S3.

> ./infra/deploy-client.sh

On completion, your app should be deployed to production:
https://www.react-node-aws.com/

You can also run the app locally now that your dynamoDB has been created.

From here, run the client or server deploy script to deploy new code.

If deploying both server and client, run the server deploy first and wait for it to finish before deploying client.

# Local Development

### Env variables

Create and populate a `.env` file.  See `.env.sample` has been provided.

The .env will not be used in production, make sure to add new variables to the `Environment` section in your `TaskDefinition`, inside the cloudformation.yml.

### Start Server in dev mode

Start API and frontend server in separate terminal tabs.

> npm run dev

> npm run webpack:watch

Hit APIs on localhost:3000 on the web browser or postman client to test the APIs.

Nativate to localhost:8080 on the web browser to see the frontend webapp.

### Build and Start Server in prod

Build server and client, run locally

> npm run build

> npm run webpack:build

> npm run start

Build Docker image, run on docker.

> npm run docker:build

> npm run docker:run

When building prod version, your app be will availble on localhost:3000

# Misc

### Email Templating - MJML

MJML engine makes designing emails simple. You can design email templates via their online tool: https://mjml.io/try-it-live

This app ships with "Verify Email" and "Reset Password" which are vital for the authentication workflow.

### Favicons

Use https://favicon.io/favicon-converter/ to generate favicons across platforms.

Place your favicons in `src/client/images/favicons`. The webpack build will automatically copy them into the `/public` folder where they can be consumed by the browser.