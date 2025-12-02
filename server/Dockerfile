FROM node:20-alpine AS build
WORKDIR /app

# Install dependencies
COPY server/package*.json ./
RUN npm ci

# Copy source and generate Prisma client before building
COPY server ./
RUN npx prisma generate

# Build TypeScript
RUN npm run build

# Runtime image
FROM node:20-alpine
WORKDIR /app
ENV NODE_ENV=production

# Install OpenSSL for Prisma
RUN apk add --no-cache openssl

# Copy build artifacts and dependencies
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/package*.json ./
COPY --from=build /app/dist ./dist
COPY --from=build /app/prisma ./prisma

# Create uploads directory
RUN mkdir -p ./uploads

# Generate Prisma client in the runtime image
RUN npx prisma generate

EXPOSE 4000

# Sync schema then start
CMD ["sh", "-c", "npx prisma db push && node dist/index.js"]
