<p align="center">
  <img src="./src/client/images/RNA-white-2.png" width="200" />
</p>

### The ultimate boilerplate for modern fullstack development.

# Tech Stack

<p align="center">
  <img src="./src/client/images/Tech Stack.png" />
</p>

# Principles

RNA is your low-abstraction, anti-framework boilerplate for production grade projects.

From frontend to backend, leverage the most robust set of technologies for your next web application.

RNA is a "batteries included" foundation, including deep backend and devops integration with Amazon Web Services.

### Modern

Latest and greatest web technologies are utilized, while not leaning into the bleeding edge of unstable tech.

### Minimal

Embrace web standards, simple solutions, and procedural programming.

Reject OOP, layers of abstraction, and "black box" frameworks and libraries that trap you in unmaintainable, tightly coupled ecosystems.

Every effort is made to reduce external dependencies to the bare minimum, while offering enough of a foundation to cover the rough edges.

### Mainstream

Only the most robust, stable, and upward trending libraries are included.

NPM Trends is consulted for user traction and longevity before a new library is integrated.

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
