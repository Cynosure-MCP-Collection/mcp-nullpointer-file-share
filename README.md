# @cynosure-mcp/nullpointer-file-share

MCP server for uploading files to [0x0.st](https://0x0.st) (nullpointer) for temporary file sharing.

## Installation

```bash
npx @cynosure-mcp/nullpointer-file-share
```

Or install globally:

```bash
npm install -g @cynosure-mcp/nullpointer-file-share
nullpointer-file-share
```

## Tools

| Tool         | Description                                                |
| ------------ | ---------------------------------------------------------- |
| `share_file` | Upload a file to 0x0.st and return a temporary sharing URL |

### Limits

- Max file size: 512 MiB
- Retention: 30–365 days depending on file size (smaller files are kept longer)

## Configuration

No configuration required.

## MCP Config

```json
{
  "mcpServers": {
    "nullpointer-file-share": {
      "command": "npx",
      "args": ["@cynosure-mcp/nullpointer-file-share"]
    }
  }
}
```

## License

MIT
