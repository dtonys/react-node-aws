# Use Node.js LTS version, slim is preferred as alpine can run into issues.
FROM node:24.11.1-slim

# Set working directory
WORKDIR /app

# Copy package files & install all
COPY package*.json ./
RUN npm ci

# Copy source
COPY . .

# Build Server
RUN npm run build
# Build Client
RUN npm run webpack:build

# Remove devDependencies to keep the image slim
# RUN npm prune --production

# Set ownership to non-root user
RUN chown -R node:node /app
USER node

# Expose port
EXPOSE 3000

# Start the application
CMD ["npm", "run", "start"]