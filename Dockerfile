# Use Node.js LTS version, slim is preferred as alpine can run into issues.
FROM node:24.11.1-slim

# Set working directory
WORKDIR /app

# Copy package files & install all
COPY package*.json ./
RUN npm ci

# Copy source - only what's needed for server build
COPY --chown=node src/server ./src/server
COPY --chown=node src/shared ./src/shared

# Build Server
RUN npm run server:build

# Set ownership to non-root user
USER node

# Expose port
EXPOSE 3000

# Start the application
CMD ["npm", "run", "server:start"]