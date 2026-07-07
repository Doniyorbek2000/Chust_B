# ADM Bozor — bitta konteynerda API + admin/sotuvchi panellari
# Build:  docker build -t admbozor .
# Run:    docker compose up -d   (docker-compose.yml ga qarang)

FROM node:22-alpine AS panels
WORKDIR /build

COPY admin-web/package*.json admin-web/
RUN cd admin-web && npm ci
COPY admin-web admin-web
RUN cd admin-web && npm run build

COPY seller-web/package*.json seller-web/
RUN cd seller-web && npm ci
COPY seller-web seller-web
RUN cd seller-web && npm run build

FROM node:22-alpine
WORKDIR /app
ENV NODE_ENV=production

COPY server/package*.json server/
RUN cd server && npm ci --omit=dev

COPY server server
COPY --from=panels /build/admin-web/dist admin-web/dist
COPY --from=panels /build/seller-web/dist seller-web/dist

# Ma'lumotlar (SQLite + rasmlar) volume orqali saqlanadi
VOLUME ["/app/server/data", "/app/server/uploads"]

EXPOSE 4000
WORKDIR /app/server
CMD ["node", "src/index.js"]
