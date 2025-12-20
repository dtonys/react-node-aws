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

Create an access key, choose "Command Line Interface (CLI)", generate and save the "Access Key ID" and "Secret Access Key".

Install AWS cli and configure to generate your credentials on your user directory `~/.aws`. Use the credentials above to authenticate.

```
> brew install awscli
> aws configure
```

Add the IAM user to your envs, in your `.bashrc` or `.zshrc`

> export AWS_PROFILE=\<your-user\>

### Domain

Purchase a domain and setup the DNS records in Route 53.

### Email

AWS SES will likely reject your request for production access, so use resend to handle email integration. https://resend.com/

Once setup, add the email records to Route 53, pointing to your domain.

### Secrets

Setup a secret called `web-secrets` in AWS Secrets Manager:

```
SESSION_ENCRYPTION_KEY={secret}
RESEND_API_KEY={secret}
```

Execute the following to generate a secret:

> node src/scripts/generateSecret.js

Add your resend API key and the generated secret there.

# AWS Build and Deploy

AWS resources and deployment will be handled by CloudFormation. You'll need to do a few manual steps before deploying.

### Docker

Make sure you have docker desktop installed to be able to build docker image.

Run the npm script to test your docker build

> npm run docker:build

### ECR

Create a repo on ECR.

### Cloudformation & Script variables

We use some default resources that come with your account, along with some variables you need to configure such as your domain and ECR name.

CloudFormation:

- DomainName - Route53
- HostedZoneId - Route53
- VpcId - VPC
- PublicSubnet1 - VPC
- PublicSubnet2 - VPC
- ECRImageUri - matches ECR created above^

Script:

- ECR_REPO=

### Deploy

First generate the certificate for your domain, this only needs to be done once, but can take a few minutes.

> ./infra/create-cert.sh

Then deploy the stack:

> ./infra/deploy.sh

This will create all the resources you need, including the DynamoDB which the web app relies on.

On completion, your app should be deployed to production:
https://www.react-node-aws.com/

You can add more resources in your CloudFormation, and also update your local code.

When you want to deploy, run the `./infra/deploy.sh`, it will take care of updating your resources and deploying your latest code.

# Misc

### Email Templating - MJML

MJML engine makes designing emails simple. You can design email templates via their online tool: https://mjml.io/try-it-live

This app ships with "Verify Email" and "Reset Password" which are vital for the authentication workflow.

### Favicons

Use https://favicon.io/favicon-converter/ to generate favicons across platforms.

# Quickstart

### Env variables

Your local env variables will be stored in a .env and loaded on server start.

The .env will not be used in production, make sure to add those variables to the `Environment` section in your `TaskDefinition`, inside the cloudformation.yml.

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
