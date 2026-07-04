# ====================================
# MULTI-STAGE BUILD - Backend Node.js
# ====================================

# Stage 1: Builder
FROM node:20-alpine AS builder

WORKDIR /app

# Instalar dependências de build
RUN apk add --no-cache libc6-compat python3 make g++

# Copiar package files
COPY package*.json ./
COPY apps/backend/package*.json ./apps/backend/

# Instalar dependências
RUN npm ci

# Copiar código fonte
COPY apps/backend/ ./apps/backend/
COPY turbo.json ./

# Gerar Prisma Client
WORKDIR /app/apps/backend
RUN npx prisma generate

# Build da aplicação
RUN npm run build

# ====================================
# Stage 2: Production
# ====================================
FROM node:20-alpine AS production

WORKDIR /app

# Criar usuário não-root
RUN addgroup -g 1001 -S nodejs && adduser -S nestjs -u 1001

# Instalar apenas dependências de produção
COPY package*.json ./
COPY apps/backend/package*.json ./apps/backend/
RUN npm ci --only=production && npm cache clean --force

# Copiar build e Prisma schema
COPY --from=builder --chown=nestjs:nodejs /app/apps/backend/dist ./apps/backend/dist
COPY --from=builder --chown=nestjs:nodejs /app/apps/backend/node_modules/.prisma ./apps/backend/node_modules/.prisma
COPY --from=builder --chown=nestjs:nodejs /app/apps/backend/prisma ./apps/backend/prisma

USER nestjs

WORKDIR /app/apps/backend

EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=40s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000/api/v1/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

CMD ["node", "dist/main.js"]
