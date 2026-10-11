// Probe the actual MCP tool through NGINX, not just the static /healthz response.
try {
  const response = await fetch('http://127.0.0.1:8000/mcp', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json, text/event-stream',
    },
    body: JSON.stringify({
      jsonrpc: '2.0',
      id: 1,
      method: 'tools/call',
      params: { name: 'list_docs', arguments: { limit: 1 } },
    }),
    signal: AbortSignal.timeout(10000),
  });
  // Backpressure is expected under load; do not restart a responsive, busy server.
  if (response.status === 503) {
    const health = await fetch('http://127.0.0.1:8000/healthz', {
      signal: AbortSignal.timeout(10000),
    });
    if (!health.ok) throw new Error(`Health HTTP ${health.status}`);
  } else {
    if (!response.ok) throw new Error(`HTTP ${response.status}`);

    const body = await response.text();
    const messages = response.headers
      .get('content-type')
      ?.includes('text/event-stream')
      ? body
          .split(/\r?\n/)
          .filter((line) => line.startsWith('data:'))
          .map((line) => JSON.parse(line.slice(5)))
      : [JSON.parse(body)];
    if (
      !messages.some(
        (message) =>
          message.id === 1 &&
          !message.error &&
          !message.result?.isError &&
          message.result?.content?.some(
            (item) => item.type === 'resource_link',
          ),
      )
    ) {
      throw new Error('MCP did not return a documentation page');
    }
  }
} catch (error) {
  console.error('MCP health check failed:', error.message);
  process.exitCode = 1;
}
