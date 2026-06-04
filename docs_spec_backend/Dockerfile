# ==========================================
# STAGE 1: Build Stage
# ==========================================
FROM node:20-alpine AS builder

# Set working directory inside the container
WORKDIR /app

# Copy package management files
COPY package*.json ./

# Install ALL dependencies (including devDependencies needed for build)
RUN npm ci

# Copy the entire backend source code
COPY . .

# Compile TypeScript code to production JavaScript (typically dist/)
RUN npm run build

# Prune devDependencies to keep production image light
RUN npm prune --production


# ==========================================
# STAGE 2: Runner Stage (Ultra-lightweight)
# ==========================================
FROM node:20-alpine AS runner

# Set secure environment variables
ENV NODE_ENV=production
ENV PORT=8080

# Create application directory
WORKDIR /app

# Run as non-privileged system user for container security hardening
USER node

# Copy raw package.json for runtime scripts
COPY --chown=node:node package*.json ./

# Copy pre-installed production dependencies from builder stage
COPY --chown=node:node --from=builder /app/node_modules ./node_modules

# Copy compiled build output files from builder stage
COPY --chown=node:node --from=builder /app/dist ./dist

# Document the network port expected by GCP Cloud Run / Local Port
EXPOSE 8080

# Define high-performance startup command
CMD ["node", "dist/server.js"]
