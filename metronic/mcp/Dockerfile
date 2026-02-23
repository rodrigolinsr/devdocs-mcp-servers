FROM node:20-bookworm-slim

RUN apt-get update && apt-get install -y --no-install-recommends \
    nginx \
    ca-certificates \
    && rm -rf /var/lib/apt/lists/*

RUN npm install -g supergateway

WORKDIR /app/mcp

COPY mcp/package.json mcp/package-lock.json ./
RUN npm ci

COPY mcp/tsconfig.json ./tsconfig.json
COPY mcp/src ./src
RUN npm run build

WORKDIR /app

COPY v9.4.5 /app/v9.4.5
COPY mcp/nginx.conf /etc/nginx/nginx.conf
COPY mcp/entrypoint.sh /entrypoint.sh

RUN chmod +x /entrypoint.sh && mkdir -p /var/log/nginx

ENV METRONIC_DOCS_ROOT=/app/v9.4.5

EXPOSE 8000

CMD ["/entrypoint.sh"]
