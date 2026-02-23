# Free MCP Docs Servers

![MCP](https://img.shields.io/badge/MCP-Servers-0ea5e9)
![Transport](https://img.shields.io/badge/Transport-Streamable_HTTP-22c55e)
![Docker](https://img.shields.io/badge/Docker-Ready-2496ED?logo=docker&logoColor=white)
![NGINX](https://img.shields.io/badge/Reverse_Proxy-NGINX-009639?logo=nginx&logoColor=white)
![TypeScript](https://img.shields.io/badge/Code-TypeScript-3178c6?logo=typescript&logoColor=white)

> A growing repository of **free MCP servers** for software documentation libraries and frameworks.

This repo hosts MCP servers that expose local documentation datasets (index + content) through tools/resources that clients like VS Code, Claude, Codex, and OpenCode can consume.

## What is this repository?

- A collection of MCP servers focused on developer documentation.
- Each docs package can have its own server implementation under `<library>/mcp`.
- Servers are designed for stdio MCP and also containerized for HTTP usage via `supergateway` + NGINX.
- The repository is intentionally extensible so more libraries can be added over time.

## Current servers

| Library | Docs dataset | MCP server folder | Image |
|---|---|---|---|
| Filament PHP v5 | `filamentphp/docs/filamentphp/v5` | `filamentphp/mcp` | `ghcr.io/rodrigolinsr/filamentphp-mcp:latest` |
| Metronic v9.4.5 | `metronic/v9.4.5` | `metronic/mcp` | `ghcr.io/rodrigolinsr/metronic-mcp:latest` |

## Architecture

- MCP server runs in Node.js (TypeScript build output).
- `supergateway` bridges stdio MCP to **Streamable HTTP**.
- NGINX proxies inbound traffic to supergateway.
- Container exposes MCP endpoint at `/mcp` and health at `/healthz`.

## Run locally (without Docker)

### Filament

```bash
cd filamentphp/mcp
npm install
npm run build
npm start
```

### Metronic

```bash
cd metronic/mcp
npm install
npm run build
npm start
```

## Build Docker images locally

```bash
docker build -f filamentphp/mcp/Dockerfile -t filamentphp-mcp:local filamentphp
docker build -f metronic/mcp/Dockerfile -t metronic-mcp:local metronic
```

## Production compose (GHCR images)

This repository includes `docker-compose.prod.yml` with GHCR images:

- `ghcr.io/rodrigolinsr/filamentphp-mcp:latest`
- `ghcr.io/rodrigolinsr/metronic-mcp:latest`

Run:

```bash
docker compose -f docker-compose.prod.yml up -d
```

Important:

- The compose file uses `expose`, not `ports`.
- Services are reachable from other containers in the same Docker network.
- To expose publicly, place a reverse proxy/load balancer in front.

## CI: Docker image builds

Workflow:

- `.github/workflows/build-mcp-images.yml`

Behavior:

- Pull requests: build validation only (no push).
- Push to `main`/`master`: build and push to GHCR.
- Manual runs: supported via `workflow_dispatch`.

## MCP endpoints (inside container network)

- `http://<service>:8000/mcp`
- `http://<service>:8000/healthz`

## Add a new docs MCP server

Suggested pattern:

1. Add docs dataset under a new folder (for example `mydocs/v1`).
2. Add MCP server code under `mydocs/mcp`.
3. Include `index.json` and `index.jsonl` in docs root.
4. Add Docker files (`Dockerfile`, `nginx.conf`, `entrypoint.sh`).
5. Extend `.github/workflows/build-mcp-images.yml` matrix with the new image.
6. Update this README current servers table.

## License

Use and adapt freely for your own MCP-compatible documentation servers.
