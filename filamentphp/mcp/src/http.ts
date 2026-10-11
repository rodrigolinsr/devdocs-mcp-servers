import { createServer as createHttpServer } from "node:http";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";

function positiveInteger(
  name: string,
  fallback: number,
  maximum: number
): number {
  const value = Number(process.env[name] ?? fallback);
  if (!Number.isSafeInteger(value) || value < 1 || value > maximum) {
    throw new Error(`${name} must be an integer between 1 and ${maximum}`);
  }
  return value;
}

export async function serveHttp(
  factory: () => Promise<McpServer>
): Promise<void> {
  const concurrency = positiveInteger("MCP_MAX_CONCURRENT", 4, 16);
  const timeoutMs = positiveInteger("MCP_REQUEST_TIMEOUT_MS", 15000, 60000);
  const bodyLimit = 256 * 1024;
  const active = new Set<() => Promise<void>>();
  let closing = false;

  const http = createHttpServer(async (req, res) => {
    if (req.url === "/healthz" && req.method === "GET") {
      res.writeHead(closing ? 503 : 200).end("ok");
      return;
    }
    if (req.url !== "/mcp") {
      res.writeHead(404).end();
      return;
    }
    if (req.method !== "POST") {
      res.writeHead(405, { Allow: "POST" }).end();
      return;
    }
    if (closing || active.size >= concurrency) {
      console.error(JSON.stringify({ event: "overload", active: active.size }));
      res
        .writeHead(503, { "Retry-After": "1", Connection: "close" })
        .end("MCP busy");
      return;
    }

    let server: McpServer | undefined;
    let transport: StreamableHTTPServerTransport | undefined;
    let released = false;
    const release = async () => {
      if (released) return;
      released = true;
      clearTimeout(timer);
      try {
        await server?.close();
        await transport?.close();
      } finally {
        active.delete(release);
      }
    };
    active.add(release);
    const timer = setTimeout(() => {
      console.error(
        JSON.stringify({ event: "request_timeout", active: active.size })
      );
      if (!res.headersSent)
        res
          .writeHead(504, { Connection: "close" })
          .end("MCP request timed out");
      else res.destroy();
      req.destroy();
      void release().catch(console.error);
    }, timeoutMs);
    res.once("close", () => {
      void release().catch(console.error);
    });

    try {
      const chunks: Buffer[] = [];
      let bytes = 0;
      for await (const chunk of req) {
        bytes += chunk.length;
        if (bytes > bodyLimit) {
          res.writeHead(413, { Connection: "close" }).end("MCP body too large");
          return;
        }
        chunks.push(chunk);
      }
      const body = JSON.parse(Buffer.concat(chunks).toString("utf8"));
      // Batches are not part of current MCP; do not let one HTTP slot carry unlimited calls.
      if (!body || typeof body !== "object" || Array.isArray(body)) {
        res.writeHead(400).end("Expected one MCP message");
        return;
      }
      if (released) return;
      server = await factory();
      transport = new StreamableHTTPServerTransport({
        sessionIdGenerator: undefined,
        enableJsonResponse: true
      });
      await server.connect(transport);
      if (released) {
        await server.close();
        return;
      }
      await transport.handleRequest(req, res, body);
    } catch (error) {
      if (!released && !res.headersSent) {
        res
          .writeHead(error instanceof SyntaxError ? 400 : 500)
          .end("MCP request failed");
      }
      if (!(error instanceof SyntaxError) && !released) console.error(error);
    }
  });
  http.requestTimeout = timeoutMs;
  http.headersTimeout = Math.min(timeoutMs, 10000);
  http.keepAliveTimeout = 5000;
  http.maxConnections = 64;
  http.on("error", (error) => {
    console.error(error);
    process.exit(1);
  });
  http.listen(5000, "127.0.0.1");
  console.error(
    JSON.stringify({ event: "http_started", concurrency, timeoutMs, bodyLimit })
  );

  const shutdown = async () => {
    if (closing) return;
    closing = true;
    http.close();
    http.closeAllConnections();
    await Promise.all([...active].map((release) => release()));
  };
  process.once("SIGTERM", () => {
    void shutdown().catch(console.error);
  });
  process.once("SIGINT", () => {
    void shutdown().catch(console.error);
  });
}
