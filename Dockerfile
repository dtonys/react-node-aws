# Stage 1: Build
FROM node:24.11.1-slim AS builder

WORKDIR /app

# Copy package files & install all dependencies (including devDependencies for build)
COPY package*.json ./
RUN npm ci

# Copy source and build
COPY . .
RUN npm run server:build
RUN npm run webpack:build

# Stage 2: Production
FROM node:24.11.1-slim

WORKDIR /app

# Set ownership of workdir to node user
RUN chown node:node /app

# Switch to node user before installing dependencies
USER node

# Copy package files & install production dependencies only (as node user)
COPY --chown=node:node package*.json ./
RUN npm ci --omit=dev

# Copy built artifacts from builder stage
COPY --from=builder --chown=node:node /app/dist ./dist
COPY --from=builder --chown=node:node /app/public ./public

# Expose port
EXPOSE 3000

# Start the application
CMD ["npm", "run", "server:start"]
