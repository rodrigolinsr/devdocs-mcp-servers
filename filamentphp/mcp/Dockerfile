FROM node:20-bookworm-slim

RUN apt-get update && apt-get install -y --no-install-recommends \
    nginx \
    tini \
    ca-certificates \
    && rm -rf /var/lib/apt/lists/*

RUN npm install -g supergateway@4.1.0

WORKDIR /app/mcp

COPY mcp/package.json mcp/package-lock.json ./
RUN npm ci

COPY mcp/tsconfig.json ./tsconfig.json
COPY mcp/src ./src
RUN npm run build

WORKDIR /app

COPY docs/filamentphp/v5 /app/docs/filamentphp/v5
COPY mcp/nginx.conf /etc/nginx/nginx.conf
COPY mcp/entrypoint.sh /entrypoint.sh
COPY mcp/healthcheck.mjs /app/mcp/healthcheck.mjs

RUN chmod +x /entrypoint.sh && mkdir -p /var/log/nginx

ENV FILAMENT_DOCS_ROOT=/app/docs/filamentphp/v5

EXPOSE 8000

HEALTHCHECK --interval=30s --timeout=15s --start-period=30s --retries=3 \
    CMD ["node", "/app/mcp/healthcheck.mjs"]

ENTRYPOINT ["/usr/bin/tini", "-g", "--"]
CMD ["/entrypoint.sh"]
