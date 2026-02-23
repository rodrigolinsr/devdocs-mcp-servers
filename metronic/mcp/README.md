# Metronic v9.4.5 MCP Server

MCP server that serves local Metronic docs from `metronic/v9.4.5`.

## Capabilities

- **Resources**
  - `metronic://v9.4.5/index` (full docs index)
  - one resource per page at `metronic://v9.4.5/<relative-doc-path>`
- **Tools**
  - `list_sections`
  - `list_docs`
  - `search_docs`
  - `get_doc`

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

By default, docs are loaded from `../v9.4.5` relative to this project.

Override with:

- `METRONIC_DOCS_ROOT=/absolute/path/to/metronic/v9.4.5`

## Claude Desktop config example

```json
{
  "mcpServers": {
    "metronic-v9-docs": {
      "command": "node",
      "args": [
        "/ABSOLUTE/PATH/TO/metronic/mcp/build/index.js"
      ]
    }
  }
}
```
