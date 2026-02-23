#!/bin/sh
set -eu

supergateway \
  --stdio "node /app/mcp/build/index.js" \
  --outputTransport streamableHttp \
  --port 5000 \
  --streamableHttpPath /mcp \
  --healthEndpoint /healthz \
  --logLevel info &

nginx -g 'daemon off;'
