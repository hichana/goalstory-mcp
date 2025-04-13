import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";
import { afterAll, beforeAll } from "vitest";

beforeAll(async () => {
  await client.connect(transport);
});

afterAll(async () => {
  await client.close();
});

const GOALSTORY_API = "https://staging-goalstory-rqc2.encr.app";

const transport = new StdioClientTransport({
  command: "npx",
  args: [
    "-y",
    "goalstory-mcp",
    GOALSTORY_API,
    process.env.VITE_GOALSTORY_API_KEY ?? "",
  ],
});

export const client = new Client({
  name: "goalstory-client",
  version: "1.0.0",
});
