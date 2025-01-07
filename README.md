# Orchestra8 MCP Server

## MCP Notes

The last two args are picked up in the MCP server and utilized like env vars. They are also used with the MCP inspector in the npm script that runs it and the MCP server locally, so no need to manually add in the inspector UI if you're developing your own MCP server.

```
"orchestra8": {
    "command": "npx",
    "args": ["-y", "@orchestra8/orchestra8-mcp", "https://prod-orchestra8-xtqi.encr.app", "your-api-key"]
}
```
