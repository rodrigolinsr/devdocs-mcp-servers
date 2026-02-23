#!/usr/bin/env node

import { createReadStream } from "node:fs";
import { access, readFile } from "node:fs/promises";
import path from "node:path";
import readline from "node:readline";
import { fileURLToPath } from "node:url";

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";

type IndexEntry = {
  title: string;
  url: string;
  section: string;
  path: string;
};

type LoadedDoc = IndexEntry & {
  absolutePath: string;
  relativePath: string;
  slug: string;
  resourceUri: string;
  content?: string;
};

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DEFAULT_DOCS_ROOT = path.resolve(__dirname, "../../docs/filamentphp/v5");
const DOCS_ROOT = path.resolve(process.env.FILAMENT_DOCS_ROOT ?? DEFAULT_DOCS_ROOT);
const DOCS_VERSION_PATH = "docs/filamentphp/v5/";

const server = new McpServer({
  name: "filamentphp-v5-docs",
  version: "1.0.0"
});

let docsCache: LoadedDoc[] | null = null;

function normalizePathForUri(value: string): string {
  return value.replaceAll(path.sep, "/").replace(/^\/+/, "");
}

function normalizeString(value: string): string {
  return value.trim().toLowerCase();
}

function stripMarkdownExtension(value: string): string {
  return value.endsWith(".md") ? value.slice(0, -3) : value;
}

function slugFromUrl(urlString: string): string {
  try {
    const parsed = new URL(urlString);
    const prefix = "/docs/5.x/";
    const pathname = parsed.pathname;
    if (pathname.startsWith(prefix)) {
      return pathname.slice(prefix.length).replace(/^\/+/, "");
    }

    return pathname.replace(/^\/+/, "");
  } catch {
    return urlString;
  }
}

function entryAbsolutePath(entryPath: string): string {
  if (path.isAbsolute(entryPath)) {
    return entryPath;
  }

  if (entryPath.startsWith(DOCS_VERSION_PATH)) {
    return path.resolve(DOCS_ROOT, entryPath.slice(DOCS_VERSION_PATH.length));
  }

  return path.resolve(DOCS_ROOT, entryPath);
}

function clipText(text: string, maxChars: number): string {
  if (text.length <= maxChars) {
    return text;
  }

  return `${text.slice(0, maxChars)}\n\n[truncated to ${maxChars} chars]`;
}

function removeFrontmatter(content: string): string {
  if (!content.startsWith("---\n")) {
    return content;
  }

  const marker = "\n---\n";
  const firstEnd = content.indexOf(marker, 4);
  if (firstEnd === -1) {
    return content;
  }

  return content.slice(firstEnd + marker.length);
}

function collapseWhitespace(content: string): string {
  return content.replace(/\s+/g, " ").trim();
}

function makeExcerpt(content: string, query: string, maxChars = 320): string {
  const cleaned = collapseWhitespace(removeFrontmatter(content));
  if (!cleaned) {
    return "";
  }

  if (cleaned.length <= maxChars) {
    return cleaned;
  }

  const q = normalizeString(query);
  const hit = cleaned.toLowerCase().indexOf(q);
  if (hit === -1) {
    return `${cleaned.slice(0, maxChars)}...`;
  }

  const half = Math.floor(maxChars / 2);
  const start = Math.max(0, hit - half);
  const end = Math.min(cleaned.length, start + maxChars);
  const prefix = start > 0 ? "..." : "";
  const suffix = end < cleaned.length ? "..." : "";

  return `${prefix}${cleaned.slice(start, end)}${suffix}`;
}

function tokenize(value: string): string[] {
  return Array.from(
    new Set(
      normalizeString(value)
        .split(/[^a-z0-9]+/)
        .filter((token) => token.length >= 2)
    )
  );
}

function scoreDoc(doc: LoadedDoc, query: string, tokens: string[]): number {
  const q = normalizeString(query);
  const title = doc.title.toLowerCase();
  const url = doc.url.toLowerCase();
  const rel = doc.relativePath.toLowerCase();
  const slug = doc.slug.toLowerCase();
  const content = (doc.content ?? "").toLowerCase();

  let score = 0;

  if (title === q || slug === q || rel === q || url === q) {
    score += 250;
  }

  if (title.includes(q)) {
    score += 120;
  }
  if (slug.includes(q) || rel.includes(q) || url.includes(q)) {
    score += 70;
  }
  if (content.includes(q)) {
    score += 20;
  }

  for (const token of tokens) {
    if (title.includes(token)) {
      score += 25;
      continue;
    }

    if (slug.includes(token) || rel.includes(token) || url.includes(token)) {
      score += 10;
      continue;
    }

    if (content.includes(token)) {
      score += 4;
    }
  }

  return score;
}

function sliceLines(content: string, startLine: number, lineCount: number): string {
  const all = content.split(/\r?\n/);
  const start = Math.max(1, startLine);
  const end = Math.min(all.length, start + lineCount - 1);

  return all
    .slice(start - 1, end)
    .map((line, index) => `${start + index}: ${line}`)
    .join("\n");
}

async function readJsonlContentMap(jsonlPath: string): Promise<Map<string, string>> {
  const map = new Map<string, string>();

  try {
    await access(jsonlPath);
  } catch {
    return map;
  }

  const stream = createReadStream(jsonlPath, { encoding: "utf8" });
  const lineReader = readline.createInterface({ input: stream, crlfDelay: Infinity });

  for await (const line of lineReader) {
    const trimmed = line.trim();
    if (!trimmed) {
      continue;
    }

    try {
      const parsed = JSON.parse(trimmed) as Partial<IndexEntry> & { content?: string };
      if (typeof parsed.path === "string" && typeof parsed.content === "string") {
        map.set(parsed.path, parsed.content);
      }
    } catch {
      // Ignore malformed lines.
    }
  }

  return map;
}

async function loadDocs(): Promise<LoadedDoc[]> {
  if (docsCache) {
    return docsCache;
  }

  const indexPath = path.join(DOCS_ROOT, "index.json");
  const jsonlPath = path.join(DOCS_ROOT, "index.jsonl");

  const [indexRaw, contentMap] = await Promise.all([
    readFile(indexPath, "utf8"),
    readJsonlContentMap(jsonlPath)
  ]);

  const entries = JSON.parse(indexRaw) as IndexEntry[];

  docsCache = entries.map((entry) => {
    const absolutePath = entryAbsolutePath(entry.path);
    const relativePath = normalizePathForUri(path.relative(DOCS_ROOT, absolutePath));
    const slug = slugFromUrl(entry.url);

    return {
      ...entry,
      absolutePath,
      relativePath,
      slug,
      resourceUri: `filament://v5/${encodeURI(relativePath)}`,
      content: contentMap.get(entry.path)
    };
  });

  return docsCache;
}

async function getDocContent(doc: LoadedDoc): Promise<string> {
  if (typeof doc.content === "string") {
    return doc.content;
  }

  const content = await readFile(doc.absolutePath, "utf8");
  doc.content = content;
  return content;
}

function findDoc(docs: LoadedDoc[], identifier: string): LoadedDoc | undefined {
  const query = normalizeString(identifier);
  const queryWithoutExt = stripMarkdownExtension(query);

  for (const doc of docs) {
    const keys = [
      normalizeString(doc.url),
      normalizeString(doc.path),
      normalizeString(doc.relativePath),
      normalizeString(doc.resourceUri),
      normalizeString(doc.slug),
      normalizeString(stripMarkdownExtension(doc.slug)),
      normalizeString(stripMarkdownExtension(doc.relativePath)),
      normalizeString(doc.title)
    ];

    if (keys.includes(query) || keys.includes(queryWithoutExt)) {
      return doc;
    }
  }

  return undefined;
}

async function registerResources(): Promise<void> {
  const docs = await loadDocs();

  server.registerResource(
    "filament-v5-index",
    "filament://v5/index",
    {
      title: "Filament v5 documentation index",
      description: "Index of all scraped Filament v5 docs pages",
      mimeType: "application/json"
    },
    async () => {
      const payload = docs.map((doc) => ({
        title: doc.title,
        section: doc.section,
        slug: doc.slug,
        path: doc.relativePath,
        url: doc.url,
        resourceUri: doc.resourceUri
      }));

      return {
        contents: [
          {
            uri: "filament://v5/index",
            mimeType: "application/json",
            text: JSON.stringify(payload, null, 2)
          }
        ]
      };
    }
  );

  for (const doc of docs) {
    server.registerResource(
      `filament-v5-doc-${doc.slug.replace(/[^a-z0-9-]+/gi, "-")}`,
      doc.resourceUri,
      {
        title: doc.title,
        description: `${doc.section} documentation page`,
        mimeType: "text/markdown"
      },
      async () => {
        const content = await getDocContent(doc);
        return {
          contents: [
            {
              uri: doc.resourceUri,
              mimeType: "text/markdown",
              text: content
            }
          ]
        };
      }
    );
  }
}

server.registerTool(
  "list_sections",
  {
    description: "List all Filament v5 documentation sections and document counts"
  },
  async () => {
    const docs = await loadDocs();

    const sectionMap = new Map<string, number>();
    for (const doc of docs) {
      sectionMap.set(doc.section, (sectionMap.get(doc.section) ?? 0) + 1);
    }

    const rows = Array.from(sectionMap.entries()).sort(([a], [b]) => a.localeCompare(b));
    const lines = rows.map(([section, count]) => `- ${section}: ${count}`);

    return {
      content: [
        {
          type: "text",
          text: `Filament v5 sections (${rows.length}):\n${lines.join("\n")}`
        }
      ]
    };
  }
);

server.registerTool(
  "list_docs",
  {
    description: "List documentation pages, optionally filtered by section",
    inputSchema: {
      section: z.string().optional().describe("Optional section filter, e.g. forms, tables, resources"),
      limit: z.number().int().min(1).max(200).default(50).describe("Maximum number of docs to return"),
      offset: z.number().int().min(0).default(0).describe("Pagination offset")
    }
  },
  async ({ section, limit, offset }) => {
    const docs = await loadDocs();
    const normalizedSection = section ? normalizeString(section) : undefined;

    const filtered = normalizedSection
      ? docs.filter((doc) => normalizeString(doc.section) === normalizedSection)
      : docs;

    const page = filtered.slice(offset, offset + limit);
    const lines = page.map(
      (doc, index) =>
        `${offset + index + 1}. [${doc.section}] ${doc.title} | slug=${doc.slug} | path=${doc.relativePath}`
    );

    return {
      content: [
        {
          type: "text",
          text:
            `Showing ${page.length} of ${filtered.length} docs` +
            (normalizedSection ? ` in section "${normalizedSection}"` : "") +
            ` (offset=${offset}, limit=${limit}).\n\n${lines.join("\n")}`
        },
        ...page.map((doc) => ({
          type: "resource_link" as const,
          uri: doc.resourceUri,
          name: doc.title,
          description: `${doc.section} | ${doc.url}`,
          mimeType: "text/markdown"
        }))
      ]
    };
  }
);

server.registerTool(
  "search_docs",
  {
    description: "Search Filament v5 docs by title, slug, path, URL and markdown content",
    inputSchema: {
      query: z.string().min(2).describe("Search text, e.g. table filters, resource widgets, panel auth"),
      section: z.string().optional().describe("Optional section filter"),
      limit: z.number().int().min(1).max(50).default(10).describe("Maximum number of search results"),
      includeExcerpts: z.boolean().default(true).describe("Include a short text excerpt in each result")
    }
  },
  async ({ query, section, limit, includeExcerpts }) => {
    const docs = await loadDocs();
    const normalizedSection = section ? normalizeString(section) : undefined;
    const tokens = tokenize(query);

    const scored = docs
      .filter((doc) =>
        normalizedSection ? normalizeString(doc.section) === normalizedSection : true
      )
      .map((doc) => ({ doc, score: scoreDoc(doc, query, tokens) }))
      .filter((item) => item.score > 0)
      .sort((a, b) => {
        if (b.score !== a.score) {
          return b.score - a.score;
        }

        return a.doc.title.localeCompare(b.doc.title);
      })
      .slice(0, limit);

    if (scored.length === 0) {
      return {
        content: [
          {
            type: "text",
            text: "No matching docs found. Try broader terms or remove the section filter."
          }
        ]
      };
    }

    const textLines: string[] = [];
    const resourceLinks: Array<{
      type: "resource_link";
      uri: string;
      name: string;
      description: string;
      mimeType: string;
    }> = [];

    textLines.push(`Found ${scored.length} matching docs for query: \"${query}\"`);
    if (normalizedSection) {
      textLines.push(`Section filter: ${normalizedSection}`);
    }
    textLines.push("");

    for (let index = 0; index < scored.length; index += 1) {
      const { doc, score } = scored[index];
      textLines.push(
        `${index + 1}. [score=${score}] [${doc.section}] ${doc.title}`
      );
      textLines.push(`   slug: ${doc.slug}`);
      textLines.push(`   url: ${doc.url}`);

      if (includeExcerpts) {
        const fullContent = await getDocContent(doc);
        const excerpt = makeExcerpt(fullContent, query);
        if (excerpt) {
          textLines.push(`   excerpt: ${excerpt}`);
        }
      }

      textLines.push("");

      resourceLinks.push({
        type: "resource_link",
        uri: doc.resourceUri,
        name: doc.title,
        description: `${doc.section} | ${doc.url}`,
        mimeType: "text/markdown"
      });
    }

    return {
      content: [
        {
          type: "text",
          text: textLines.join("\n").trim()
        },
        ...resourceLinks
      ]
    };
  }
);

server.registerTool(
  "get_doc",
  {
    description:
      "Fetch a Filament v5 markdown page by identifier (slug, title, URL, relative path or resource URI)",
    inputSchema: {
      identifier: z
        .string()
        .min(2)
        .describe(
          "Doc identifier. Examples: tables/filters/overview, actions/overview.md, full URL, page title"
        ),
      startLine: z.number().int().min(1).default(1).describe("First line number to return"),
      lineCount: z.number().int().min(1).max(2000).default(400).describe("How many lines to return"),
      maxChars: z.number().int().min(500).max(200000).default(50000).describe("Safety character limit")
    }
  },
  async ({ identifier, startLine, lineCount, maxChars }) => {
    const docs = await loadDocs();
    const doc = findDoc(docs, identifier);

    if (!doc) {
      const tokens = tokenize(identifier);
      const suggestions = docs
        .map((item) => ({ item, score: scoreDoc(item, identifier, tokens) }))
        .filter((item) => item.score > 0)
        .sort((a, b) => b.score - a.score)
        .slice(0, 5)
        .map((item) => `- ${item.item.title} (slug=${item.item.slug})`)
        .join("\n");

      return {
        content: [
          {
            type: "text",
            text:
              `Document not found for identifier: \"${identifier}\".` +
              (suggestions ? `\n\nDid you mean:\n${suggestions}` : "")
          }
        ],
        isError: true
      };
    }

    const fullContent = await getDocContent(doc);
    const body = sliceLines(fullContent, startLine, lineCount);
    const responseText = [
      `title: ${doc.title}`,
      `section: ${doc.section}`,
      `slug: ${doc.slug}`,
      `source_url: ${doc.url}`,
      `resource_uri: ${doc.resourceUri}`,
      `lines: ${startLine}-${startLine + lineCount - 1}`,
      "",
      clipText(body, maxChars)
    ].join("\n");

    return {
      content: [
        {
          type: "text",
          text: responseText
        },
        {
          type: "resource_link",
          uri: doc.resourceUri,
          name: doc.title,
          description: `${doc.section} | ${doc.url}`,
          mimeType: "text/markdown"
        }
      ]
    };
  }
);

async function main(): Promise<void> {
  await registerResources();

  const transport = new StdioServerTransport();
  await server.connect(transport);

  console.error(`Filament v5 MCP server running (docs root: ${DOCS_ROOT})`);
}

main().catch((error: unknown) => {
  console.error("Fatal error while starting Filament v5 MCP server:", error);
  process.exit(1);
});
