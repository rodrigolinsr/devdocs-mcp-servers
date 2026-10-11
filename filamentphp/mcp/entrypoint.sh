#!/bin/bash
set -eu

cleanup() {
  kill "${server_pid:-}" "${nginx_pid:-}" "${watchdog_pid:-}" 2>/dev/null || true
}
trap cleanup EXIT
trap 'exit 143' TERM
trap 'exit 130' INT

node --max-old-space-size=192 /app/mcp/build/index.js --http &
server_pid=$!

nginx -g 'daemon off;' &
nginx_pid=$!

# Docker restart policies do not restart unhealthy containers, so exit on repeated probe failures.
(
  sleep 10
  failures=0
  while true; do
    if node /app/mcp/healthcheck.mjs; then
      failures=0
    else
      failures=$((failures + 1))
      if [ "$failures" -ge 3 ]; then
        echo 'MCP health check failed three times; restarting container.' >&2
        exit 1
      fi
    fi
    sleep 30
  done
) &
watchdog_pid=$!

wait -n "$server_pid" "$nginx_pid" "$watchdog_pid" || true
echo 'An essential MCP process stopped; restarting container.' >&2
exit 1
