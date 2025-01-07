#!/usr/bin/env node

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  Tool,
} from "@modelcontextprotocol/sdk/types.js";
import axios from "axios";

// -----------------------------------------
// 1. Environment variables & basic setup with helper
// -----------------------------------------
const argv = process.argv.slice(2);
const ORCHESTRA8_API_BASE_URL = argv[0];
const ORCHESTRA8_API_TOKEN = argv[1];

if (!ORCHESTRA8_API_BASE_URL) {
  console.error(
    "Error: ORCHESTRA8_API_BASE_URL environment variable is required"
  );
  process.exit(1);
}
if (!ORCHESTRA8_API_TOKEN) {
  console.error("Error: ORCHESTRA8_API_TOKEN environment variable is required");
  process.exit(1);
}

// Helper to do fetch calls
async function doRequest<T = any>(
  url: string,
  method: string,
  body?: unknown
): Promise<T> {
  try {
    const response = await axios({
      url,
      method,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${ORCHESTRA8_API_TOKEN}`,
      },
      data: body,
    });

    return response.data as T;
  } catch (error: any) {
    const errorText = error.response?.data || error.message;
    throw new Error(
      `HTTP Error ${
        error.response?.status || "Unknown"
      }. URL: ${url}, Method: ${method}, Body: ${JSON.stringify(
        body
      )}. Error text: ${JSON.stringify(errorText)}`
    );
  }
}

// -----------------------------------------
// 2. Define Tools
// -----------------------------------------

//
// -- USERS TOOLS --
//
const READ_USERS_TOOL: Tool = {
  name: "orchestra_read_users",
  description: "Get all public user data, possibly paginated",
  inputSchema: {
    type: "object",
    properties: {
      page: {
        type: "number",
        description: "Page number (optional)",
      },
      limit: {
        type: "number",
        description: "Number of results per page (optional)",
      },
    },
  },
};

const READ_ONE_USER_TOOL: Tool = {
  name: "orchestra_read_one_user",
  description:
    "Get data for a single user by ID. If the ID matches the caller, returns additional fields.",
  inputSchema: {
    type: "object",
    properties: {
      id: {
        type: "string",
        description: "The user ID to retrieve",
      },
    },
    required: ["id"],
  },
};

//
// -- LISTS TOOLS --
//
const COUNT_LISTS_TOOL: Tool = {
  name: "orchestra_count_lists",
  description:
    "Count how many lists exist for the currently authenticated user",
  inputSchema: {
    type: "object",
    properties: {},
  },
};

const CREATE_LIST_TOOL: Tool = {
  name: "orchestra_create_list",
  description: "Create a new list",
  inputSchema: {
    type: "object",
    properties: {
      name: {
        type: "string",
        description: "The name/title for this new list",
      },
      description: {
        type: "string",
        description: "Optional descriptive text for this list",
      },
    },
    required: ["name"],
  },
};

const UPDATE_LIST_TOOL: Tool = {
  name: "orchestra_update_list",
  description: "Update an existing list by ID",
  inputSchema: {
    type: "object",
    properties: {
      id: {
        type: "string",
        description: "Which list ID to update",
      },
      name: {
        type: "string",
        description: "Update the list name (optional)",
      },
      status: {
        type: "number",
        description: "Update the list status (optional)",
      },
      description: {
        type: "string",
        description: "Update the list description (optional)",
      },
    },
    required: ["id"],
  },
};

const READ_LISTS_TOOL: Tool = {
  name: "orchestra_read_lists",
  description: "Get all lists for the authenticated user, optionally paginated",
  inputSchema: {
    type: "object",
    properties: {
      page: {
        type: "number",
        description: "Page number (optional)",
      },
      limit: {
        type: "number",
        description: "Number of items per page (optional)",
      },
    },
  },
};

const READ_ONE_LIST_TOOL: Tool = {
  name: "orchestra_read_one_list",
  description: "Get a single list by ID for the authenticated user",
  inputSchema: {
    type: "object",
    properties: {
      id: {
        type: "string",
        description: "Which list ID to retrieve",
      },
    },
    required: ["id"],
  },
};

//
// -- ITEMS TOOLS --
//
const COUNT_ITEMS_TOOL: Tool = {
  name: "orchestra_count_items",
  description:
    "Count how many items exist for the currently authenticated user",
  inputSchema: {
    type: "object",
    properties: {},
  },
};

const CREATE_ITEM_TOOL: Tool = {
  name: "orchestra_create_item",
  description: "Create a new item in a given list",
  inputSchema: {
    type: "object",
    properties: {
      list_id: {
        type: "string",
        description: "The list ID in which you want to create the item",
      },
      name: {
        type: "string",
        description: "The name/title of the new item",
      },
      status: {
        type: "number",
        description:
          "The status code, e.g. 0 = pending, 1 = complete, etc. (optional)",
      },
    },
    required: ["list_id", "name"],
  },
};

const READ_ITEMS_TOOL: Tool = {
  name: "orchestra_read_items",
  description:
    "Get items for the authenticated user, optionally filtered by list_id or paginated",
  inputSchema: {
    type: "object",
    properties: {
      page: {
        type: "number",
        description: "Page number (optional)",
      },
      limit: {
        type: "number",
        description: "Number of items per page (optional)",
      },
      list_id: {
        type: "string",
        description:
          "If provided, only items from this list are returned (optional)",
      },
    },
  },
};

const READ_ONE_ITEM_TOOL: Tool = {
  name: "orchestra_read_one_item",
  description: "Get a single item by ID for the authenticated user",
  inputSchema: {
    type: "object",
    properties: {
      id: {
        type: "string",
        description: "Which item ID to retrieve",
      },
    },
    required: ["id"],
  },
};

const UPDATE_ITEM_TOOL: Tool = {
  name: "orchestra_update_item",
  description: "Update an existing item (name, status, etc.) by ID",
  inputSchema: {
    type: "object",
    properties: {
      id: {
        type: "string",
        description: "Which item ID to update",
      },
      name: {
        type: "string",
        description: "New name/title of the item (optional)",
      },
      status: {
        type: "number",
        description: "New status code (optional)",
      },
    },
    required: ["id"],
  },
};

const DESTROY_ITEM_TOOL: Tool = {
  name: "orchestra_destroy_item",
  description:
    "Delete an item by ID. The user must own this item or be authorized to remove it.",
  inputSchema: {
    type: "object",
    properties: {
      id: {
        type: "string",
        description: "Which item ID to delete",
      },
    },
    required: ["id"],
  },
};

// -----------------------------------------
// 3. Instantiate the MCP server
// -----------------------------------------
const server = new Server(
  {
    name: "orchestra8-mcp-server",
    version: "0.1.0",
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

// Return all tools when asked
server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools: [
    READ_USERS_TOOL,
    READ_ONE_USER_TOOL,

    COUNT_LISTS_TOOL,
    CREATE_LIST_TOOL,
    UPDATE_LIST_TOOL,
    READ_LISTS_TOOL,
    READ_ONE_LIST_TOOL,

    COUNT_ITEMS_TOOL,
    CREATE_ITEM_TOOL,
    READ_ITEMS_TOOL,
    READ_ONE_ITEM_TOOL,
    UPDATE_ITEM_TOOL,
    DESTROY_ITEM_TOOL,
  ],
}));

// -----------------------------------------
// 4. Set the main handler for tool calls
// -----------------------------------------
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;
  if (!args) {
    return {
      content: [{ type: "text", text: "No arguments provided" }],
      isError: true,
    };
  }

  try {
    switch (name) {
      // ---------- USERS ----------
      case "orchestra_read_users": {
        // args: { page?: number; limit?: number }
        const params = new URLSearchParams();
        if (args.page) params.set("page", `${args.page}`);
        if (args.limit) params.set("limit", `${args.limit}`);
        const url = `${ORCHESTRA8_API_BASE_URL}/users?${params.toString()}`;
        const result = await doRequest(url, "GET");
        console.error("read users!!!!!!!!!");

        return {
          content: [
            {
              type: "text",
              text: `Users found:\n${JSON.stringify(result, null, 2)}`,
            },
          ],
          isError: false,
        };
      }

      case "orchestra_read_one_user": {
        // args: { id: string }
        const url = `${ORCHESTRA8_API_BASE_URL}/users/${args.id}`;
        const result = await doRequest(url, "GET");
        return {
          content: [
            {
              type: "text",
              text: `User data:\n${JSON.stringify(result, null, 2)}`,
            },
          ],
          isError: false,
        };
      }

      // ---------- LISTS ----------
      case "orchestra_count_lists": {
        const url = `${ORCHESTRA8_API_BASE_URL}/count/lists`;
        const result = await doRequest(url, "GET");
        return {
          content: [
            {
              type: "text",
              text: `Number of lists: ${JSON.stringify(result, null, 2)}`,
            },
          ],
          isError: false,
        };
      }

      case "orchestra_create_list": {
        // args: { name: string; description?: string }
        const url = `${ORCHESTRA8_API_BASE_URL}/lists`;
        const result = await doRequest(url, "POST", {
          name: args.name,
          description: args.description,
        });
        return {
          content: [
            {
              type: "text",
              text: `List created:\n${JSON.stringify(result, null, 2)}`,
            },
          ],
          isError: false,
        };
      }

      case "orchestra_update_list": {
        // args: { id: string; name?: string; status?: number; description?: string }
        const url = `${ORCHESTRA8_API_BASE_URL}/lists/${args.id}`;
        // TODO: consider how these types can be shared with api types
        const typedArgs = args as {
          id: string;
          name?: string;
          status?: number;
          description?: string;
        };
        const body = {
          ...(typedArgs.name && { name: typedArgs.name }),
          ...(typeof typedArgs.status !== "undefined" && {
            status: typedArgs.status,
          }),
          ...(typedArgs.description && { description: typedArgs.description }),
        };
        // const result = await doRequest(url, "PATCH", body);
        const result = await doRequest(url, "PATCH", { data: { ...body } });
        return {
          content: [
            {
              type: "text",
              text: `List updated:\n${JSON.stringify(result, null, 2)}`,
            },
          ],
          isError: false,
        };
      }

      case "orchestra_read_lists": {
        // args: { page?: number; limit?: number }
        const params = new URLSearchParams();
        if (args.page) params.set("page", `${args.page}`);
        if (args.limit) params.set("limit", `${args.limit}`);
        const url = `${ORCHESTRA8_API_BASE_URL}/lists?${params.toString()}`;
        const result = await doRequest(url, "GET");
        return {
          content: [
            {
              type: "text",
              text: `Lists retrieved:\n${JSON.stringify(result, null, 2)}`,
            },
          ],
          isError: false,
        };
      }

      case "orchestra_read_one_list": {
        // args: { id: string }
        const url = `${ORCHESTRA8_API_BASE_URL}/lists/${args.id}`;
        const result = await doRequest(url, "GET");
        return {
          content: [
            {
              type: "text",
              text: `List data:\n${JSON.stringify(result, null, 2)}`,
            },
          ],
          isError: false,
        };
      }

      // ---------- ITEMS ----------
      case "orchestra_count_items": {
        const url = `${ORCHESTRA8_API_BASE_URL}/count/items`;
        const result = await doRequest(url, "GET");
        return {
          content: [
            {
              type: "text",
              text: `Number of items: ${JSON.stringify(result, null, 2)}`,
            },
          ],
          isError: false,
        };
      }

      case "orchestra_create_item": {
        // args: { list_id: string; name: string; status?: number }
        const url = `${ORCHESTRA8_API_BASE_URL}/items`;
        const result = await doRequest(url, "POST", args);
        return {
          content: [
            {
              type: "text",
              text: `Item created:\n${JSON.stringify(result, null, 2)}`,
            },
          ],
          isError: false,
        };
      }

      case "orchestra_read_items": {
        // args: { page?: number; limit?: number; list_id?: string }
        const params = new URLSearchParams();
        if (args.page) params.set("page", `${args.page}`);
        if (args.limit) params.set("limit", `${args.limit}`);
        params.set("list_id", `${args.list_id}`);

        const url = `${ORCHESTRA8_API_BASE_URL}/items?${params.toString()}`;
        const result = await doRequest(url, "GET");
        return {
          content: [
            {
              type: "text",
              text: `Items retrieved:\n${JSON.stringify(result, null, 2)}`,
            },
          ],
          isError: false,
        };
      }

      case "orchestra_read_one_item": {
        // args: { id: string }
        const url = `${ORCHESTRA8_API_BASE_URL}/items/${args.id}`;
        const result = await doRequest(url, "GET");
        return {
          content: [
            {
              type: "text",
              text: `Item data:\n${JSON.stringify(result, null, 2)}`,
            },
          ],
          isError: false,
        };
      }

      case "orchestra_update_item": {
        // args: { id: string; name?: string; status?: number }
        const url = `${ORCHESTRA8_API_BASE_URL}/items/${args.id}`;
        const typedArgs = args as {
          id: string;
          name?: string;
          status?: number;
        };
        const body = {
          ...(typedArgs.name && { name: typedArgs.name }),
          ...(typeof typedArgs.status !== "undefined" && {
            status: typedArgs.status,
          }),
        };
        const result = await doRequest(url, "PATCH", { data: { ...body } });
        return {
          content: [
            {
              type: "text",
              text: `Item updated:\n${JSON.stringify(result, null, 2)}`,
            },
          ],
          isError: false,
        };
      }

      case "orchestra_destroy_item": {
        // args: { id: string }
        const url = `${ORCHESTRA8_API_BASE_URL}/items/${args.id}`;
        const result = await doRequest(url, "DELETE");
        return {
          content: [
            {
              type: "text",
              text: `Item deleted:\n${JSON.stringify(result, null, 2)}`,
            },
          ],
          isError: false,
        };
      }

      default:
        return {
          content: [{ type: "text", text: `Unknown tool: ${name}` }],
          isError: true,
        };
    }
  } catch (error: any) {
    return {
      content: [
        {
          type: "text",
          text: `Error: ${
            error instanceof Error ? error.message : String(error)
          }`,
        },
      ],
      isError: true,
    };
  }
});

// -----------------------------------------
// 5. Run the server
// -----------------------------------------
async function runServer() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("Orchestra8 MCP Server running on stdio");
}

runServer().catch((error) => {
  console.error("Fatal error running server:", error);
  process.exit(1);
});
