# Orchestra8 MCP Server

## MCP Notes

The last two args are picked up in the MCP server and utilized like env vars. They are also used with the MCP inspector in the npm script that runs it and the MCP server locally, so no need to manually add in the inspector UI.

```
"orchestra8": {
    "command": "npx",
    "args": ["-y", "@orchestra8/orchestra8-mcp", "https://prod-orchestra8-xtqi.encr.app", "some-api-key"]
}
```

Run locally against Claude (config):

```
"orchestra8": {
    "command": "node",
    "args": ["/Users/matthewchana/Documents/orchestra8/mcp/dist/index.js", "http://127.0.0.1:4000", "some-api-key"]
}
```
