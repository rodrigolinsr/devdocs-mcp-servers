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
- Servers support stdio MCP and native Streamable HTTP through the installed MCP SDK + NGINX.
- The repository is intentionally extensible so more libraries can be added over time.

## Current servers

| Library | Docs dataset | MCP server folder | Image |
|---|---|---|---|
| Filament PHP v5 | `filamentphp/docs/filamentphp/v5` | `filamentphp/mcp` | `ghcr.io/rodrigolinsr/filamentphp-mcp:latest` |
| Metronic v9.4.5 | `metronic/v9.4.5` | `metronic/mcp` | `ghcr.io/rodrigolinsr/metronic-mcp:latest` |

## Architecture

- MCP server runs in Node.js (TypeScript build output).
- One Node process serves **Streamable HTTP**, sharing the finite documentation cache.
- NGINX proxies inbound traffic to that process. Requests do not spawn subprocesses.
- Container exposes MCP endpoint at `/mcp` and health at `/healthz`.

## Failure recovery and logs

- Tini forwards shutdown signals and reaps orphaned processes. The entrypoint
  exits if NGINX or the Node HTTP server stops, allowing Docker's restart policy to recover.
- A watchdog calls `list_docs` through the public-facing NGINX port every 30 seconds
  (10-second timeout). Three consecutive failures restart the container, including
  when the server remains alive but stops answering. A restart interrupts active calls;
  clients must reconnect or retry. This is not a host-level or reverse-proxy repair.
- Docker's healthcheck uses the same functional MCP probe. `/healthz` remains a
  server liveness endpoint, not proof that the documentation tools work. Expected
  overload (503) is accepted only when `/healthz` still responds successfully.
- NGINX logs go to stdout/stderr. Both Compose files rotate Docker logs at 10 MB,
  keeping three files per container. Deployments using other Compose definitions
  must carry over these logging options.
- Supergateway is no longer installed. The HTTP handler admits four requests by
  default, rejects excess work with 503 / `Retry-After`, limits bodies to 256 KiB,
  and closes requests after 15 seconds or a disconnect. SDK transport closure aborts
  in-flight handlers. NGINX caps concurrent requests at eight and bodies at 256 KiB.
- Both Compose files default to **512 MiB memory (no swap), 1 CPU and 128 tasks**.
  Override using `MCP_MEMORY_LIMIT`, `MCP_CPUS`, `MCP_PIDS_LIMIT` in Compose's environment.
  Set `MCP_MAX_CONCURRENT` (1–16) and `MCP_REQUEST_TIMEOUT_MS` (1–60000) in the
  container environment to tune HTTP admission. NGINX's eight-request cap remains
  the outer ceiling. Node's old-space heap is capped at 192 MiB (not total RSS).
- HTTP remains stateless: no idle session workers or session map. stdio usage is
  unchanged. JSON responses are MCP-compatible; clients must accept both JSON and
  SSE as required by Streamable HTTP. Legacy JSON-RPC batches are rejected.

Build and test with isolated containers (profiling publishes a random localhost-only port):

```bash
docker build -f filamentphp/mcp/Dockerfile -t filamentphp-mcp:recovery-test filamentphp
docker build -f metronic/mcp/Dockerfile -t metronic-mcp:recovery-test metronic
node --test tests/container-recovery.test.mjs
node --test tests/healthcheck.test.mjs
docker run --rm --entrypoint node --mount type=bind,source="$PWD/tests",target=/tests,readonly filamentphp-mcp:recovery-test --test /tests/http-limits.test.mjs
node tests/resource-profile.mjs filamentphp-mcp:recovery-test 300
node tests/resource-profile.mjs metronic-mcp:recovery-test 60
```

The tests kill NGINX/the HTTP server, freeze the server, verify automatic restart and
working MCP calls, and check graceful shutdown. To apply the changes, build/publish
new images and redeploy/recreate the containers; restarting an old image is not enough.

See [the resource investigation](docs/mcp-resource-investigation.md) for evidence,
measured baselines, historical leak reproduction, limitations, and Coolify settings.

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
