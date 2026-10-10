# ==========================================
# Stage 1: Dependencies Cache
# ==========================================
FROM node:18-slim AS deps
WORKDIR /app

RUN apt-get update -y && apt-get install -y openssl ca-certificates && rm -rf /var/lib/apt/lists/*

COPY package*.json ./
COPY prisma ./prisma/

RUN npm install --omit=dev --ignore-scripts --no-audit

# ==========================================
# Stage 2: Application Builder
# ==========================================
FROM node:18-slim AS builder
WORKDIR /app

RUN apt-get update -y && apt-get install -y openssl ca-certificates && rm -rf /var/lib/apt/lists/*

COPY --from=deps /app/node_modules ./node_modules
COPY . .

RUN npx prisma generate
RUN npm install -D typescript @types/react @types/node --no-audit
RUN npm run build

# ==========================================
# Stage 3: Lightweight Production Runner
# ==========================================
FROM node:18-slim AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000

RUN apt-get update -y && apt-get install -y openssl ca-certificates && rm -rf /var/lib/apt/lists/*

COPY --from=deps /app/node_modules ./node_modules
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/prisma ./prisma
COPY package*.json ./
COPY server.js ./
COPY repflow_db.json ./

EXPOSE 3000

CMD ["node", "server.js"]