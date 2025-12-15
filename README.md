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

# Quick Start

### IAM Role

Make sure to have an AWS IAM role configured. Recommend "AdministratorAccess" to allow access to all resources, until further restrictions are required.

### Generate Encryption Secret

Use the AWS Secrets Manager to create a secret value called `web-secrets`.

It should include `SESSION_ENCRYPTION_KEY`={secret}.

Execute the following to generate a secret:

> node src/scripts/generateSecret.js

The web server will pull this secret from KMS on start. Secret is used to generate session and email tokens.

### Pull code and install dependencies

> git clone git@github.com:dtonys/react-node-aws.git

> cd react-node-aws.git

> nvm use 24

> npm install

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

Build Docker image, run on docker. Requires docker desktop.

> npm run docker:build

> npm run docker:run

# Setup

### Email Sending - Resend & SES

AWS SES will likely reject your request for production access, so use resend to handle email integration. https://resend.com/

Add RESEND_API_KEY to your .env once integrated.

Use route53 to add email DNS hooked up to your domain. You can configure both resend and SES without conflict.

After you have got resend integrated and your site deployed to production, you can provide AWS with the details to grant you production access on SES, and then migrate to SES.

### Email Templating - MJML

MJML engine makes designing emails simple. You can design email templates via their online tool: https://mjml.io/try-it-live

This app ships with "Verify Email" and "Reset Password" which are vital for the authentication workflow.

### Favicons

Use https://favicon.io/favicon-converter/ to generate favicons across platforms.

### Deploy Code (TODO)
