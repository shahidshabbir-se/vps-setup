# Stage 1: Install dependencies
FROM node:22-alpine AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app
COPY package.json pnpm-lock.yaml ./
RUN npx pnpm install --frozen-lockfile

# Stage 2: Build the app
FROM node:22-alpine AS builder
WORKDIR /app
COPY . .
COPY --from=deps /app/node_modules ./node_modules
RUN npx pnpm run build

# Stage 3: Serve the app
FROM node:22-alpine AS production
WORKDIR /app

ENV NODE_ENV=production

# Create 'appadmin' user if it doesn't exist
RUN getent passwd appadmin || (addgroup -S appadmin && adduser -S appadmin -G appadmin -u 10000 -s /bin/nologin)

# Copy build artifacts and dependencies
COPY --from=builder --chown=appadmin:appadmin /app/build ./build
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json

# Set 'appadmin' user for running the app
USER appadmin

EXPOSE 3000

CMD ["node", "./build"]
