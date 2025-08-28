# Use Node.js 20 with Debian as base image (has OpenSSL libraries)
FROM node:20-slim

# Set working directory
WORKDIR /app

# Install OpenSSL and other required packages
RUN apt-get update && apt-get install -y \
    openssl \
    ca-certificates \
    && rm -rf /var/lib/apt/lists/*

# Copy package files
COPY package*.json ./

# Install dependencies (including dev dependencies for build)
RUN npm ci --include=dev

# Copy source code
COPY . .

# Generate Prisma client
RUN npx prisma generate

# Build the application
RUN npm run build

# Remove dev dependencies
RUN npm prune --production

# Expose port
EXPOSE 3001

# Start the application
CMD ["npm", "run", "start:prod"]