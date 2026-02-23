# Filament PHP v5 MCP Server

MCP server that serves your local Filament PHP v5 documentation scraped under `docs/filamentphp/v5`.

## What this server exposes

- **Resources**
  - `filament://v5/index` (full docs index with metadata)
  - One resource per document at `filament://v5/<relative-doc-path>`
- **Tools**
  - `list_sections` - list all sections and doc counts
  - `list_docs` - list docs with optional section filter
  - `search_docs` - full-text-like search over title/path/url/content
  - `get_doc` - fetch a specific document by slug/path/url/title

## Install and build

```bash
cd mcp
npm install
npm run build
```

## Run

```bash
cd mcp
npm start
```

By default, docs are loaded from:

- `../docs/filamentphp/v5` (relative to this project)

You can override this with:

- `FILAMENT_DOCS_ROOT=/absolute/path/to/docs/filamentphp/v5`

## Claude Desktop config example

```json
{
  "mcpServers": {
    "filamentphp-v5-docs": {
      "command": "node",
      "args": [
        "/ABSOLUTE/PATH/TO/filamentphp/mcp/build/index.js"
      ]
    }
  }
}
```

## VS Code MCP config example

```json
{
  "servers": {
    "filamentphp-v5-docs": {
      "command": "node",
      "args": [
        "/ABSOLUTE/PATH/TO/filamentphp/mcp/build/index.js"
      ]
    }
  }
}
```
