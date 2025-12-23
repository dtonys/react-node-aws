# Use Node.js LTS version, slim is preferred as alpine can run into issues.
FROM node:24.11.1-slim

# Set working directory
WORKDIR /app

# Copy package files & install all
COPY package*.json ./
RUN npm ci

# Copy source
COPY --chown=node . .

# Build Server
RUN npm run server:build
RUN npm run webpack:build
RUN npm prune --production

# Switch to non-root user for security
RUN chown -R node:node /app
USER node

# Expose port
EXPOSE 3000

# Start the application
CMD ["npm", "run", "server:start"]