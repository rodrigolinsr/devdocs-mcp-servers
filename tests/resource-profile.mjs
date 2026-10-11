import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { randomUUID } from 'node:crypto';
import { setTimeout as sleep } from 'node:timers/promises';

const image = process.argv[2] ?? 'filamentphp-mcp:recovery-test';
const seconds = Number(process.argv[3] ?? 60);
const pidsLimit = Number(process.argv[4] ?? 128);
assert.ok(Number.isInteger(seconds) && seconds >= 10 && seconds <= 3600);
assert.ok([128, 256].includes(pidsLimit));
const name = `mcp-profile-${randomUUID()}`;
const docker = (...args) =>
  execFileSync('docker', args, { encoding: 'utf8', timeout: 20000 }).trim();
function sample() {
  const lines = docker(
    'exec',
    name,
    'sh',
    '-c',
    `
    cat /sys/fs/cgroup/memory.current /sys/fs/cgroup/memory.stat /sys/fs/cgroup/pids.current /sys/fs/cgroup/cpu.stat
    processes=0; fds=0
    for dir in /proc/[0-9]*; do
      [ -r "$dir/comm" ] || continue
      read -r comm < "$dir/comm"
      [ "$comm" = node ] || [ "$comm" = nginx ] || continue
      processes=$((processes + 1))
      set -- "$dir"/fd/*
      fds=$((fds + $#))
    done
    printf 'processes %s\nfds %s\n' "$processes" "$fds"
  `,
  ).split('\n');
  const numbers = lines.filter((line) => /^\d+$/.test(line));
  const fields = Object.fromEntries(
    lines.filter((line) => line.includes(' ')).map((line) => line.split(' ')),
  );
  return {
    memoryMiB: +(Number(numbers[0]) / 1048576).toFixed(1),
    anonMiB: +(Number(fields.anon) / 1048576).toFixed(1),
    fileMiB: +(Number(fields.file) / 1048576).toFixed(1),
    tasks: Number(numbers[1]),
    processes: Number(fields.processes),
    fds: Number(fields.fds),
    cpuUsec: Number(fields.usage_usec),
  };
}

docker(
  'run',
  '-d',
  '--name',
  name,
  '--memory',
  '512m',
  '--memory-swap',
  '512m',
  '--pids-limit',
  String(pidsLimit),
  '--cpus',
  '1',
  '-p',
  '127.0.0.1::8000',
  image,
);
try {
  const address = docker('port', name, '8000/tcp');
  const url = `http://${address}/mcp`;
  for (let attempt = 0; attempt < 60; attempt++) {
    try {
      if ((await fetch(`http://${address}/healthz`)).ok) break;
    } catch {}
    await sleep(500);
  }
  await sleep(1000);
  const idle = sample();
  let peak = { ...idle };
  const windows = [];
  const statuses = {};
  const started = Date.now();
  let count = 0;
  let done = false;
  let samplingError;
  const monitor = (async () => {
    while (!done) {
      const current = sample();
      windows.push(current);
      for (const key of [
        'memoryMiB',
        'anonMiB',
        'fileMiB',
        'tasks',
        'processes',
        'fds',
      ]) {
        peak[key] = Math.max(peak[key], current[key]);
      }
      await sleep(500);
    }
  })().catch((error) => {
    samplingError = error;
    done = true;
  });
  while (!done && Date.now() - started < seconds * 1000) {
    await Promise.all(
      Array.from({ length: 8 }, async (_, index) => {
        try {
          const response = await fetch(url, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Accept: 'application/json, text/event-stream',
            },
            body: JSON.stringify({
              jsonrpc: '2.0',
              id: ++count,
              method: 'tools/call',
              params: {
                name: index % 2 ? 'search_docs' : 'list_docs',
                arguments:
                  index % 2 ? { query: 'table', limit: 1 } : { limit: 1 },
              },
            }),
            signal: AbortSignal.timeout(20000),
          });
          await response.text();
          statuses[response.status] = (statuses[response.status] ?? 0) + 1;
        } catch {
          statuses.network_error = (statuses.network_error ?? 0) + 1;
        }
      }),
    );
  }
  done = true;
  await monitor;
  if (samplingError) throw samplingError;
  await sleep(6000);
  const after = sample();
  const inspect = JSON.parse(docker('inspect', name))[0];
  assert.equal(inspect.State.OOMKilled, false);
  assert.equal(inspect.State.Running, true);
  assert.ok(statuses[200] > 0);
  assert.ok(
    after.tasks <= idle.tasks + 12,
    'Tasks must return to baseline (allowing the health probe)',
  );
  assert.ok(
    after.memoryMiB < 300,
    'Post-workload memory must stay below 300 MiB',
  );
  assert.ok(
    after.processes <= idle.processes + 1,
    'No accumulated worker processes',
  );
  assert.ok(
    after.fds <= idle.fds + 16,
    'File descriptors return toward baseline',
  );
  console.log(
    JSON.stringify(
      {
        image,
        seconds,
        pidsLimit,
        requests: count,
        statuses,
        idle,
        peak,
        after,
        cpuSeconds: +((after.cpuUsec - idle.cpuUsec) / 1e6).toFixed(2),
        sampledMemoryMiB: windows
          .filter((_, i) => i % 20 === 0)
          .map((s) => s.memoryMiB),
        note: 'cgroup v2 measurements include a brief shell/cat sampling process and periodic health probes',
      },
      null,
      2,
    ),
  );
} finally {
  docker('rm', '-f', name);
}
