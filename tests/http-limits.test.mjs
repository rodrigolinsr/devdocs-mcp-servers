import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { request } from 'node:http';
import { setTimeout as sleep } from 'node:timers/promises';
import test from 'node:test';

for (const [name, value] of [
  ['MCP_MAX_CONCURRENT', '0'],
  ['MCP_MAX_CONCURRENT', '17'],
  ['MCP_REQUEST_TIMEOUT_MS', 'NaN'],
  ['MCP_REQUEST_TIMEOUT_MS', '60001'],
]) {
  test(`invalid configuration: ${name}=${value}`, async () => {
    const child = spawn(
      'node',
      [
        '--input-type=module',
        '-e',
        `import { serveHttp } from '/app/mcp/build/http.js'; await serveHttp(async () => null);`,
      ],
      { env: { ...process.env, [name]: value } },
    );
    let logs = '';
    child.stderr.on('data', (chunk) => {
      logs += chunk;
    });
    const code = await new Promise((resolve) => child.on('exit', resolve));
    assert.equal(code, 1);
    assert.ok(logs.includes(`${name} must be an integer`));
  });
}

// Run inside either image with --entrypoint node and this directory mounted at /tests.
test(
  'HTTP bounds concurrency, input, timeout, disconnect and shutdown',
  { timeout: 20000 },
  async () => {
    const child = spawn(
      'node',
      [
        '--input-type=module',
        '-e',
        `
    import { serveHttp } from '/app/mcp/build/http.js';
    import { McpServer } from '/app/mcp/node_modules/@modelcontextprotocol/sdk/dist/esm/server/mcp.js';
    await serveHttp(async () => {
      const server = new McpServer({ name: 'test', version: '1' });
      server.registerTool('slow', {}, (_extra) => new Promise((resolve) => {
        const signal = _extra.signal;
        signal.addEventListener('abort', () => {
          console.error('tool_aborted');
          resolve({ content: [] });
        }, { once: true });
      }));
      return server;
    });
  `,
      ],
      {
        env: {
          ...process.env,
          MCP_MAX_CONCURRENT: '2',
          MCP_REQUEST_TIMEOUT_MS: '500',
        },
      },
    );
    let logs = '';
    child.stderr.on('data', (chunk) => {
      logs += chunk;
    });
    const exited = new Promise((resolve) =>
      child.on('exit', (code, signal) => resolve({ code, signal })),
    );
    const url = 'http://127.0.0.1:5000/mcp';
    const post = (body) =>
      fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json, text/event-stream',
        },
        body,
      });
    const holds = [];
    try {
      for (let i = 0; i < 100 && !logs.includes('http_started'); i++)
        await sleep(20);
      assert.ok(logs.includes('http_started'), logs);
      assert.equal((await post('bad json')).status, 400);
      assert.equal((await post('[]')).status, 400);
      assert.equal((await post('x'.repeat(262145))).status, 413);
      assert.equal((await fetch(url)).status, 405);

      const slow = JSON.stringify({
        jsonrpc: '2.0',
        id: 1,
        method: 'tools/call',
        params: { name: 'slow' },
      });
      const pending = [post(slow), post(slow)];
      await sleep(100);
      assert.equal((await post(slow)).status, 503);
      for (const response of await Promise.all(pending))
        assert.equal(response.status, 504);
      await sleep(50);
      assert.equal((logs.match(/tool_aborted/g) ?? []).length, 2);

      const disconnected = request(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json, text/event-stream',
        },
      });
      disconnected.on('error', () => {});
      disconnected.end(slow);
      await sleep(100);
      disconnected.destroy();
      await sleep(100);
      assert.equal((logs.match(/tool_aborted/g) ?? []).length, 3);

      // Partial bodies occupy only two slots, then expire instead of accumulating work.
      for (let i = 0; i < 2; i++) {
        const req = request(url, {
          method: 'POST',
          headers: { 'Content-Length': 1000 },
        });
        req.on('error', () => {});
        req.on('response', (res) => res.resume());
        req.write('{');
        holds.push(req);
      }
      await sleep(100);
      assert.equal((await post(slow)).status, 503);
      await sleep(600);
      assert.equal((await post('{}')).status, 400);
      const stopping = post(slow).catch(() => {});
      await sleep(100);
      child.kill('SIGTERM');
      assert.deepEqual(await exited, { code: 0, signal: null });
      await stopping;
      assert.equal((logs.match(/tool_aborted/g) ?? []).length, 4);
    } finally {
      for (const req of holds) req.destroy();
      child.kill('SIGKILL');
    }
  },
);
