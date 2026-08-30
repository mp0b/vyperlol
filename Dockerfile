# Multi-stage Dockerfile for Next.js application with Prisma

# Stage 1: Base
FROM node:22-alpine AS base

# Stage 2: Dependencies
FROM base AS deps
# Check https://github.com/nodejs/docker-node/tree/main#nodealpine to understand why libc6-compat might be needed.
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Install pnpm
RUN npm install -g pnpm@11.24.0

# Copy package files
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./

# Install dependencies
RUN pnpm install --frozen-lockfile

# Stage 2: Builder
FROM base AS builder
WORKDIR /app

# Install pnpm
RUN npm install -g pnpm@11.24.0

# Copy dependencies from deps stage
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Generate Prisma client
RUN pnpm db:generate

# Build Next.js application
RUN pnpm build

# Stage 3: Runner
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production

# Create non-root user
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Set correct permissions for Next.js cache
RUN mkdir .next
RUN chown nextjs:nodejs .next

# Copy necessary files with optimal chown directly (fast)
COPY --from=builder --chown=nextjs:nodejs /app/public ./public
# Next.js standalone includes its own minimal node_modules, no need to copy the giant root one
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --from=builder --chown=nextjs:nodejs /app/prisma ./prisma

USER nextjs

EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# Start the application
CMD ["node", "server.js"]
