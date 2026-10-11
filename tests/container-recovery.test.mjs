import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { setTimeout as sleep } from 'node:timers/promises';
import test from 'node:test';

function docker(...args) {
  return execFileSync('docker', args, { encoding: 'utf8', timeout: 20000 }).trim();
}

function state(name) {
  return JSON.parse(docker('inspect', name))[0];
}

async function eventually(check, timeout = 60000) {
  const deadline = Date.now() + timeout;
  while (Date.now() < deadline) {
    if (check()) return;
    await sleep(1000);
  }
  assert.fail('Container did not recover before the deadline');
}

for (const service of ['filamentphp', 'metronic']) {
  test(`${service}: recovers from gateway/NGINX death and a hung gateway`, { timeout: 300000, concurrency: true }, async () => {
    const name = `mcp-recovery-test-${randomUUID()}`;
    docker('run', '-d', '--name', name, '--restart', 'always', `${service}-mcp:recovery-test`);
    try {
      await eventually(() => state(name).State.Health?.Status === 'healthy');
      docker('exec', name, 'node', '/app/mcp/healthcheck.mjs');
      docker('exec', name, 'node', '--input-type=module', '-e', `
        import assert from 'node:assert/strict';
        import { Client } from '/app/mcp/node_modules/@modelcontextprotocol/sdk/dist/esm/client/index.js';
        import { StreamableHTTPClientTransport } from '/app/mcp/node_modules/@modelcontextprotocol/sdk/dist/esm/client/streamableHttp.js';
        const client = new Client({ name: 'recovery-test', version: '1.0.0' });
        await client.connect(new StreamableHTTPClientTransport(new URL('http://127.0.0.1:8000/mcp')));
        assert.equal((await client.listTools()).tools.length, 4);
        const listed = await client.callTool({ name: 'list_docs', arguments: { limit: 1 } });
        const page = listed.content.find((item) => item.type === 'resource_link');
        assert.ok(page);
        const doc = await client.callTool({ name: 'get_doc', arguments: { identifier: page.uri } });
        assert.ok(!doc.isError && doc.content.length);
        const search = await client.callTool({ name: 'search_docs', arguments: { query: 'table', limit: 1 } });
        assert.ok(!search.isError && search.content.length);
        assert.ok((await client.readResource({ uri: page.uri })).contents.length);
        await client.close();
      `);

      for (const failure of ['gateway death', 'NGINX death', 'hung gateway']) {
        const restarts = state(name).RestartCount;
        const code = failure === 'NGINX death'
          ? `process.kill(Number(require('fs').readFileSync('/run/nginx.pid', 'utf8')), 'SIGKILL')`
          : `
            const fs = require('fs');
            const pid = fs.readdirSync('/proc').find((entry) => {
              if (!/^\\d+$/.test(entry) || Number(entry) === process.pid) return false;
              try { return fs.readFileSync('/proc/' + entry + '/cmdline', 'utf8').includes('/supergateway'); }
              catch { return false; }
            });
            if (!pid) throw new Error('Gateway process not found');
            process.kill(Number(pid), '${failure === 'hung gateway' ? 'SIGSTOP' : 'SIGKILL'}');
          `;
        try {
          docker('exec', name, 'node', '-e', code);
        } catch (error) {
          // Recovery can stop the container before the fault-injection exec returns.
          if (failure === 'hung gateway' || error.status !== 137) throw error;
        }
        await eventually(() => {
          const container = state(name);
          return container.RestartCount > restarts && container.State.Health?.Status === 'healthy';
        }, failure === 'hung gateway' ? 180000 : 60000);
        docker('exec', name, 'node', '/app/mcp/healthcheck.mjs');
      }

      docker('stop', '--time', '10', name);
      assert.equal(state(name).State.Status, 'exited');
      assert.notEqual(state(name).State.ExitCode, 137, 'Shutdown must not require Docker SIGKILL');
    } catch (error) {
      console.error(docker('logs', '--tail', '100', name));
      throw error;
    } finally {
      docker('rm', '-f', name);
    }
  });
}
