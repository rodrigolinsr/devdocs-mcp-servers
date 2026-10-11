import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const AsyncFunction = Object.getPrototypeOf(async function () {}).constructor;
const result = { jsonrpc: '2.0', id: 1, result: { content: [{ type: 'resource_link', uri: 'docs://page' }] } };

for (const service of ['filamentphp', 'metronic']) {
  const source = readFileSync(new URL(`../${service}/mcp/healthcheck.mjs`, import.meta.url), 'utf8');
  const probe = new AsyncFunction('fetch', 'AbortSignal', 'console', 'process', source);

  for (const [name, status, body, contentType, expected] of [
    ['JSON result', 200, JSON.stringify(result), 'application/json', undefined],
    ['SSE result', 200, `event: message\r\ndata: ${JSON.stringify(result)}\r\n\r\n`, 'text/event-stream', undefined],
    ['bad gateway', 502, 'Bad Gateway', 'text/html', 1],
    ['invalid JSON', 200, 'not JSON', 'application/json', 1],
    ['JSON-RPC error', 200, '{"id":1,"error":{"message":"failed"}}', 'application/json', 1],
    ['tool error', 200, JSON.stringify({ ...result, result: { ...result.result, isError: true } }), 'application/json', 1],
    ['no documentation', 200, '{"id":1,"result":{"content":[]}}', 'application/json', 1],
  ]) {
    test(`${service} probe: ${name}`, async () => {
      const process = {};
      const fetch = async (_url, options) => {
        assert.equal(JSON.parse(options.body).method, 'tools/call');
        assert.ok(options.signal);
        return new Response(body, { status, headers: { 'Content-Type': contentType } });
      };
      await probe(fetch, AbortSignal, { error() {} }, process);
      assert.equal(process.exitCode, expected);
    });
  }

  test(`${service} probe: network failure`, async () => {
    const process = {};
    await probe(async () => { throw new Error('Connection refused'); }, AbortSignal, { error() {} }, process);
    assert.equal(process.exitCode, 1);
  });
}
