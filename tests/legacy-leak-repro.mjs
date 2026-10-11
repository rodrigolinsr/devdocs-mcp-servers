import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { randomUUID } from 'node:crypto';
import { setTimeout as sleep } from 'node:timers/promises';

// Diagnostic only: an isolated historical gateway, never a production container.
const name = `mcp-legacy-${randomUUID()}`;
const image = process.argv[2] ?? 'filamentphp-mcp:legacy-leak-test';
const docker = (...args) =>
  execFileSync('docker', args, { encoding: 'utf8', timeout: 20000 }).trim();
const sample = () => {
  const lines = docker(
    'exec',
    name,
    'cat',
    '/sys/fs/cgroup/memory.current',
    '/sys/fs/cgroup/memory.stat',
    '/sys/fs/cgroup/pids.current',
  ).split('\n');
  const [memory, tasks] = lines
    .filter((line) => /^\d+$/.test(line))
    .map(Number);
  const fields = Object.fromEntries(
    lines.filter((line) => line.includes(' ')).map((line) => line.split(' ')),
  );
  const processes = docker('top', name, '-eo', 'pid,comm')
    .split('\n')
    .filter((line) => /node$/.test(line)).length;
  return {
    memoryMiB: +(memory / 1048576).toFixed(1),
    anonMiB: +(Number(fields.anon) / 1048576).toFixed(1),
    fileMiB: +(Number(fields.file) / 1048576).toFixed(1),
    tasks,
    nodeProcesses: processes,
  };
};
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
  '256',
  '--cpus',
  '1',
  '--no-healthcheck',
  '-p',
  '127.0.0.1::8000',
  image,
);
try {
  const url = `http://${docker('port', name, '8000/tcp')}`;
  for (let i = 0; i < 60; i++) {
    try {
      if ((await fetch(`${url}/healthz`)).ok) break;
    } catch {}
    await sleep(100);
  }
  const before = sample();
  for (let i = 0; i < 12; i++) {
    const response = await fetch(`${url}/mcp`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json, text/event-stream',
      },
      body: JSON.stringify({
        jsonrpc: '2.0',
        id: i + 1,
        method: 'tools/call',
        params: { name: 'list_docs', arguments: { limit: 1 } },
      }),
      signal: AbortSignal.timeout(10000),
    });
    assert.equal(response.status, 200);
    await response.text();
  }
  await sleep(6000);
  const after = sample();
  console.log(
    JSON.stringify(
      { image, completedSequentialCalls: 12, before, after },
      null,
      2,
    ),
  );
  if (image === 'filamentphp-mcp:legacy-leak-test') {
    assert.ok(
      after.nodeProcesses >= before.nodeProcesses + 12,
      'Historical gateway should reproduce retained child processes',
    );
  } else {
    assert.ok(
      after.nodeProcesses <= before.nodeProcesses + 1,
      'No retained request workers',
    );
    assert.ok(
      after.tasks <= before.tasks + 12,
      'Tasks return to baseline including periodic probes',
    );
  }
} finally {
  docker('rm', '-f', name);
}
