# ==========================================
# STAGE 1: Build Stage
# ==========================================
FROM node:20-alpine AS builder

# Set working directory
WORKDIR /app

# Copy package management files to leverage Docker caching layers
COPY package*.json ./

# Install dependecies
RUN npm ci

# Copy all source assets
COPY . .

# Build the production React applet (outputs static assets to /dist)
RUN npm run build


# ==========================================
# STAGE 2: Production Nginx Server Stage
# ==========================================
FROM nginx:1.25-alpine

# Set secure permissions
WORKDIR /usr/share/nginx/html

# Delete default static index files
RUN rm -rf ./*

# Copy built frontend assets from the builder stage
COPY --from=builder /app/dist .

# Copy custom Nginx configuration for correct SPA client-side routing fallback
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Inform container to process ingress requests on port 8080 (GCP Cloud Run standard)
EXPOSE 8080

# Start server
CMD ["nginx", "-g", "daemon off;"]
