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

### Pull code and install dependencies

> git clone git@github.com:dtonys/react-node-aws.git

> cd react-node-aws.git

> nvm use 24

> npm install

### Start Server

Start API and frontend server in separate terminal tabs.

> npm run dev

> npm run webpack:watch

Hit APIs on localhost:3000 on the web browser or postman client to test the APIs.

Nativate to localhost:8080 on the web browser to see the frontend webapp.

### Deploy Code (TODO)
