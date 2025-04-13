import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";
import { afterAll, beforeAll } from "vitest";

beforeAll(async () => {
  await client.connect(transport);
  console.log("env:", process.env.NODE_ENV);
});

afterAll(async () => {
  await client.close();
});

const GOALSTORY_API = "http://127.0.0.1:4000";
const API_KEY = "admin";

const transport = new StdioClientTransport({
  command: "npx",
  args: ["-y", "goalstory-mcp", GOALSTORY_API, API_KEY],
});

export const client = new Client({
  name: "goalstory-client",
  version: "1.0.0",
});
