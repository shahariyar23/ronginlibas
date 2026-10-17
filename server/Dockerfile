# ==============================================================================
# Multi-stage production Dockerfile for Rongin Libas NestJS Backend
# Compatible with linux/amd64 and linux/arm64 (Oracle Cloud ARM64 / aarch64)
# ==============================================================================

# ------------------------------------------------------------------------------
# Stage 1: Build & Dependencies
# ------------------------------------------------------------------------------
FROM node:24-bookworm-slim AS builder

WORKDIR /app

# Install native compilation toolchain and SSL certificates
RUN apt-get update && apt-get install -y --no-install-recommends \
    openssl \
    ca-certificates \
    python3 \
    make \
    g++ \
    && rm -rf /var/lib/apt/lists/*

# Install all dependencies (including devDependencies required for compilation)
COPY package*.json ./
COPY prisma ./prisma/

RUN npm ci

# Copy application configuration and source code
COPY tsconfig*.json nest-cli.json ./
COPY src ./src/

# Generate Prisma Client engines (native + debian + arm64) and compile NestJS
RUN npx prisma generate
RUN npm run build

# Remove development dependencies to keep final layer lean
RUN npm prune --omit=dev

# ------------------------------------------------------------------------------
# Stage 2: Production Runtime
# ------------------------------------------------------------------------------
FROM node:24-bookworm-slim AS runner

WORKDIR /app

# Production environment variables
ENV NODE_ENV=production \
    PORT=4000 \
    HOST=0.0.0.0

# Install runtime OpenSSL, CA certificates, and curl for health check
RUN apt-get update && apt-get install -y --no-install-recommends \
    openssl \
    ca-certificates \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Non-root user setup
RUN chown -R node:node /app
USER node

# Copy production assets, compiled dist, and pruned node_modules
COPY --chown=node:node package*.json ./
COPY --chown=node:node prisma ./prisma/
COPY --chown=node:node --from=builder /app/node_modules ./node_modules
COPY --chown=node:node --from=builder /app/dist ./dist
COPY --chown=node:node src/assets ./src/assets
COPY --chown=node:node src/assets ./dist/assets
COPY --chown=node:node scripts ./scripts

# Expose backend application port
EXPOSE 4000

# Health check using the existing NestJS system health check endpoint
HEALTHCHECK --interval=30s --timeout=5s --start-period=15s --retries=3 \
  CMD curl -f http://localhost:${PORT:-4000}/api/v1/health || exit 1

# Production start command (does not run destructive database migrations automatically)
CMD ["node", "dist/main"]
