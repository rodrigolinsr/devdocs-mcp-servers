# MCP resource exhaustion: evidence and correction

## Conclusion

The previous container architecture multiplied processes: Supergateway stateless HTTP
spawned a shell and a Node MCP server for each POST. Each server indexed the same docs.
There was no admission limit and Compose imposed no memory, CPU or task limit.

A historical version, **Supergateway 3.4.3**, reproducibly retained the Node workers
after successful calls. **The production gateway version is not available**, so this
is a confirmed reproducible defect, not proof of the exact production failure.
The production incident's 2.733 GiB / 1,562 tasks cannot be retrospectively decomposed
without its process listing and `memory.stat`. CPU steal remains a separate hypervisor issue.

The first recovery fix (`37215a9`) supervised NGINX/the gateway and pinned 4.1.0,
which cleaned up completed workers in our tests. It did not bound concurrent spawning.
This correction removes the gateway entirely, using the already-installed MCP SDK's
native HTTP transport in one Node process, retaining the existing tools and stdio mode.

## Confirmed mechanisms

### Historical process retention

Published `supergateway@3.4.3`, `dist/gateways/stdioToStatelessStreamableHttp.js`:

- `spawn(stdioCmd, { shell: true })` creates a shell plus Node for each POST.
- The only child termination hooks are `transport.onclose` and `transport.onerror`.
- There is no response-completion hook disposing the server/transport/worker.
- `child.kill()` targets the shell, not necessarily its Node descendants.
- There is no per-request deadline or concurrency ceiling.

An isolated experiment made **12 completed sequential `list_docs` calls**, waited six
seconds, then sampled cgroup v2 and processes. Both cases used the same docs, updated
application SDK, 512 MiB / 1 CPU / 256-task container envelope and no Docker healthcheck.
The watchdog remains present but the short experiment finishes before its first probe.

| Measurement | Historical 3.4.3 before → after | Native HTTP before → after |
|---|---:|---:|
| Memory, MiB | 40.2 → 327.3 | 32.5 → 34.8 |
| Anonymous memory, MiB | 35.3 → 304.1 | 27.5 → 30.1 |
| File memory, MiB | 0 → 0 | 0 → 0 |
| Tasks (including sample command) | 18 → 162 | 18 → 18 |
| Node processes | 1 → 13 | 1 → 1 |

The retained memory in this reproduction is overwhelmingly anonymous application
memory, not filesystem cache. Each call leaves a Node process and about 12 tasks;
hundreds of completed calls can therefore exhaust a small VPS even when CPU is idle.
The production figures are consistent with this mechanism, but **do not establish
that production ran 3.4.3**. Preserve/check the incident image digest and installed
gateway package version before attributing it definitively.

### Concurrent spawning even with cleanup

The pinned 4.1.0 build returned to its original task count after load, but eight
concurrent clients exceeded a 128-task envelope (`Cannot fork`). Increasing only
the isolated benchmark's task ceiling to 256 allowed profiling. Thus pinning 4.1.0
alone is not an adequate shared-host safety barrier.

### Application cache and tools

Both `mcp/src/index.ts` implementations have a finite documentation array and
per-document content cache. Resources and tool output derive only from that dataset.
The Filament corpus has 157 Markdown pages (about 1.7 MB). No application code spawns
workers, invokes PHP/Artisan, performs runtime framework discovery, retries recursively,
or retains a session history. The gateway was the runtime process-creation path.
Previously every worker rebuilt those objects. HTTP now preloads the docs once;
per-request SDK servers share that cache and are disposed when responses close.

## Measured load comparison

Local Docker/cgroup v2, eight closed-loop clients alternating `list_docs` and
`search_docs`, one minute, same 512 MiB / 1 CPU envelope. Task limit: 256 for 4.1.0
(128 failed); 128 for native HTTP. These are throughput-saturating runs, not fixed-rate
latency comparisons. Periodic shell/cat sampling and health probes contribute briefly
to task/process peaks. Measurements are sampled, not exact instantaneous maxima.

| Metric | Gateway 4.1.0 | Native Filament | Native Metronic |
|---|---:|---:|---:|
| Idle memory, MiB | 56.9 | 32.1 | 29.1 |
| Sampled peak memory, MiB | 283.9 | 57.7 | 65.9 |
| Post-load memory, MiB | 65.9 | 47.8 | 46.3 |
| Peak anonymous memory, MiB | 261.8 | 51.8 | 60.0 |
| Idle → peak → final tasks | 19 → 138 → 19 | 19 → 29 → 19 | 19 → 30 → 19 |
| Node + NGINX processes, idle → peak → final | 3 → 13 → 3 | 3 → 4 → 3 | 3 → 4 → 3 |
| File descriptors, idle → peak → final | 37 → 499 → 36 | 37 → 68 → 36 | 37 → 72 → 36 |
| Completed successful POSTs | 168 | 16,110 | 22,199 |
| Rejected with 503 | 0 | 2 | 1 |
| CPU seconds used | 61.19 | 58.53 | 57.68 |

Native CPU remains busy under deliberately unlimited offered load, but is constrained
to one CPU. Ordinary idle does not perform searches or indexing repeatedly. The extra
Node at peak is the short-lived functional health probe, not a request worker.
Post-load heap may stay above startup due to V8 allocation/GC; stable process count,
bounded memory and descriptor return matter more than byte-identical startup memory.

The final Filament soak ran **five minutes / 80,904 POSTs**: 80,900 successful,
four predictable 503 rejections, no OOM. Sampled memory: 31.8 MiB startup,
84.4 MiB peak, 48.9 MiB after load; anonymous peak 76.1 MiB. Tasks returned
19 → 30 peak → 19; Node+NGINX processes 3 → 4 → 3; descriptors 37 → 72 → 36.
Regular memory samples settled around 47–51 MiB rather than increasing per request.
Neither a one-minute nor a five-minute test proves indefinite production stability.

## Boundaries, cleanup and compatibility

- `mcp/src/http.ts`: four admitted HTTP requests by default, no work queue; excess
  returns 503 and `Retry-After: 1`. Bodies are at most 256 KiB, one JSON-RPC message,
  with a 15-second total deadline including body upload.
- Each request owns its SDK `McpServer` and stateless `StreamableHTTPServerTransport`.
  Response close/disconnect, timeout and shutdown close the transport; SDK closure
  aborts in-flight request signals. No shell/Node worker is created for a request.
- Actual tools only scan the finite dataset/read local files. Strings now have
  bounds: query 256, section 128, identifier 2048 characters; pagination and content
  bounds are retained. Synchronous scans cannot be preempted mid-JavaScript operation;
  input/dataset bounds and the CPU cgroup bound this work. Future external/long-running
  tools must explicitly honor the SDK abort signal rather than rely on HTTP closure.
- NGINX: at most eight concurrent requests, 256 KiB body, ten-second input timeouts;
  ordinary proxy deadline remains 60 seconds. Node connections are capped at 64.
- stdio remains the default CLI mode. `--http` opts into native HTTP. Tools,
  resources, URIs and normal arguments remain unchanged. Responses use JSON, which
  compliant Streamable HTTP clients accept. GET/DELETE `/mcp` still return 405.
  Legacy JSON-RPC batches and overlong strings are intentionally rejected.
- Tini, process supervision, functional healthcheck, restart watchdog and rotated
  logs remain. A responsive 503 overload does not trigger a watchdog restart if
  `/healthz` still works. Logs contain lifecycle/overload/timeout events, not full
  request payloads or documentation responses.

## Deployment: Docker and Coolify

Both Compose definitions default to 512 MiB memory, equal memory+swap limit (no swap),
1 CPU and 128 tasks **per container**. This has substantial headroom over measured
native peaks while isolating a failure from MySQL and other shared-host applications.
Compose accepts `MCP_MEMORY_LIMIT`, `MCP_CPUS`, `MCP_PIDS_LIMIT` overrides. HTTP settings
are container environment variables `MCP_MAX_CONCURRENT` and `MCP_REQUEST_TIMEOUT_MS`.
Do not increase concurrency without repeating the profiles; NGINX still caps at eight.

Coolify must deploy the updated Compose definition, or explicitly apply equivalent
limits in its service configuration. Dockerfiles **cannot** impose host resource
limits. A healthcheck or a new image does not retroactively add cgroups to old containers.
Build/publish new images, update the service definition, then recreate the containers.
Do not merely restart the existing `latest` image. Verify the effective settings:

```bash
docker inspect <container> --format '{{json .HostConfig}}'
# Memory=536870912, MemorySwap=536870912, NanoCpus=1000000000, PidsLimit=128
docker stats --no-stream <container>
docker top <container> -eo pid,ppid,comm
docker exec <container> cat /sys/fs/cgroup/memory.stat /sys/fs/cgroup/pids.current
docker logs --tail 100 <container>
```

Also retain Docker log rotation (10 MiB × three files) when Coolify supplies its own
Compose. Monitor memory/tasks after deploy and observe a real extended workload.
No host swap/provider changes, production deployment or resource settings were made
by this investigation. High CPU steal needs separate Leaseweb/provider investigation.

## Reproduction and regression checks

Normal image builds and commands are in the README. CI gates publication on real
MCP calls, process-death/freeze recovery, HTTP bounds/cancellation tests, and a
one-minute sustained resource profile for each server. `resource-profile.mjs`
accepts 10–3600 seconds (default 60); run 300 or 3600 for a longer local soak.

Final validation: **33 automated checks passed** (21 health/source checks, two
real-container recovery scenarios, and five HTTP/configuration checks per image).
Both images build, both stdio clients still list/call tools, Compose resolves the
intended cgroup limits, and `git diff --check` passes. The local profiles and
historical reproduction above also passed their assertions. No production or
GitHub-hosted CI run was performed. The optional HTML review surface was not
screenshot-verified because the local Chrome/CDP bridge was unavailable.

The historical reproduction is diagnostic, deliberately excluded from normal CI.
To reconstruct the exact comparison base without changing your checkout:

```bash
before=$(mktemp -d /tmp/opencode/devdocs-before.XXXXXX)
git archive 37215a9 | tar -x -C "$before"
docker build -f "$before/filamentphp/mcp/Dockerfile" -t filamentphp-mcp:resource-before "$before/filamentphp"
docker build -t filamentphp-mcp:legacy-leak-test - <<'DOCKERFILE'
FROM filamentphp-mcp:resource-before
RUN npm install -g supergateway@3.4.3
DOCKERFILE
node tests/legacy-leak-repro.mjs
node tests/legacy-leak-repro.mjs filamentphp-mcp:recovery-test
node tests/resource-profile.mjs filamentphp-mcp:resource-before 60 256
```

All diagnostic containers are named uniquely, capped and removed on normal completion
or a handled error. They do not expose public ports or touch persistent volumes.
The benchmarks require Docker and a cgroup v2 Linux host. Source file equality is
tested because the two images have independent build contexts and carry identical
HTTP implementations.
