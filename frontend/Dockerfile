# --- deps ---
FROM node:20-alpine AS deps
WORKDIR /app
COPY package*.json ./
ENV npm_config_legacy_peer_deps=true
RUN npm install --no-audit --no-fund

# --- build ---
FROM node:20-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
# продовый URL API для фронта
ENV NEXT_PUBLIC_API_URL=http://51.250.32.83:8080/api
# чтобы next собрал standalone-бандл
RUN npm run build

# --- runner ---
FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production

ENV NEXT_PUBLIC_API_URL=http://51.250.32.83:8080/api

COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/package*.json ./
COPY --from=deps /app/node_modules ./node_modules
EXPOSE 3000
CMD ["npm", "run", "start"]
