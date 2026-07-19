# ==============================================================================
# Multi-stage Production Dockerfile for StadiumMind AI Cloud Run Backend
# ==============================================================================

# Stage 1: Dependencies & Compilation Check
FROM node:20-alpine AS builder
WORKDIR /app

# Copy dependency definitions
COPY package*.json ./
RUN npm ci

# Copy application source code
COPY tsconfig*.json ./
COPY backend/ ./backend/
COPY src/ ./src/

# Verify zero TypeScript compilation errors before producing release image
RUN npx tsc --noEmit

# ==============================================================================
# Stage 2: Minimal Production Runtime Image
# ==============================================================================
FROM node:20-alpine AS production
WORKDIR /app

# Set strict production environment
ENV NODE_ENV=production
ENV PORT=3001

# Copy package definitions & installed modules from builder stage
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/tsconfig*.json ./
COPY --from=builder /app/backend ./backend
COPY --from=builder /app/src ./src

# Create non-root user for security (Cloud Run best practice)
RUN addgroup -g 1001 -S nodejs && \
    adduser -S stadiummind -u 1001 -G nodejs
USER stadiummind

# Expose container port
EXPOSE 3001

# Health check probe against root /health endpoint
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:${PORT}/health || exit 1

# Start production server using fast ES module runner
CMD ["npm", "start"]
