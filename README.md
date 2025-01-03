# Orchestra8 MCP Server

### Claude Desktop config file server entry

Note:

- the last two args are picked up in the MCP server and utilized like env vars. They are also used with the MCP inspector in the npm script that runs it and the MCP server locally.

Local:

- note, somehow Claude seems to use node previous to when 'fetch' was included with node, so the below command forces node 18. The actual command should be `"command": "node",`.

```
"orchestra8": {
    "command": "/Users/matthewchana/.nvm/versions/node/v18.19.0/bin/node",
    "args": ["/Users/matthewchana/Documents/orchestra8/mcp/dist/index.js", "http://127.0.0.1:4000", "some-api-key"]
}
```

Staging:

- this assumes there is an NPM package in the NPM registry

```
"orchestra8": {
    "command": "npx",
    "args": ["-y", "@hichana/orchestra8-mcp-server", "http://127.0.0.1:4000", "some-api-key"]
}
```
