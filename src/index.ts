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
// -- USERS --
//
const UPDATE_SELF_USER_TOOL: Tool = {
  name: "orchestra_update_self_user",
  description:
    "Update the authenticated user's data (e.g., name, about, visibility).",
  inputSchema: {
    type: "object",
    properties: {
      name: {
        type: "string",
        description: "The updated name for the user (optional).",
      },
      about: {
        type: "string",
        description: "Updated 'about' information (optional).",
      },
      visibility: {
        type: "number",
        description:
          "Updated visibility status: 0 = public, 1 = private (optional).",
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
// -- LISTS --
//
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
      story_mode: {
        type: "number",
        description:
          "Optional story mode (0=adventure, 1=continuity). Omit if not updating.",
      },
      belief_mode: {
        type: "number",
        description:
          "Optional belief mode (0=Christianity, 1=Many Worlds). Omit if not updating.",
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
        description: "Updated name (optional)",
      },
      status: {
        type: "number",
        description: "Updated status: 0=active, 1=archived (optional)",
      },
      description: {
        type: "string",
        description: "Updated description (optional)",
      },
      outcome: {
        type: "string",
        description: "Updated user's desired outcome in life (optional)",
      },
      evidence: {
        type: "string",
        description: "Updated evidence for this list (optional)",
      },
      story_mode: {
        type: "number",
        description: "Updated story mode: 0=adventure, 1=continuity (optional)",
      },
      belief_mode: {
        type: "number",
        description:
          "Updated belief mode: 0=Christianity, 1=Many Worlds (optional)",
      },
    },
    required: ["id"],
  },
};

const DESTROY_LIST_TOOL: Tool = {
  name: "orchestra_destroy_list",
  description:
    "Delete a list by ID. The user must own this list or be authorized to remove it. All items for the list will be deleted as well.",
  inputSchema: {
    type: "object",
    properties: {
      id: {
        type: "string",
        description: "Which list ID to delete",
      },
    },
    required: ["id"],
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

//
// -- ITEMS --
//
const CREATE_ITEMS_TOOL: Tool = {
  name: "orchestra_create_items",
  description: "Create one or more new item(s) for a given list",
  inputSchema: {
    type: "object",
    properties: {
      list_id: {
        type: "string",
        description: "The list ID in which to create the item",
      },
      items: {
        type: "array",
        description: "An array of items to create.",
        items: {
          type: "string",
          description: "The name/title of the new item",
        },
      },
    },
    required: ["list_id, items"],
  },
};

const READ_ITEMS_TOOL: Tool = {
  name: "orchestra_read_items",
  description:
    "Get items for the authenticated user, optionally filtered by list_id or paginated (list_id is required).",
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
          "The list ID filter: only items from this list are returned (required)",
      },
    },
    required: ["list_id"],
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
  description: "Update an existing item (name, status, outcome, etc.) by ID",
  inputSchema: {
    type: "object",
    properties: {
      id: {
        type: "string",
        description: "Which item ID to update",
      },
      name: {
        type: "string",
        description: "Updated name/title of the item (optional)",
      },
      status: {
        type: "number",
        description: "Updated status code (0=pending, 1=complete) (optional)",
      },
      outcome: {
        type: "string",
        description: "Updated outcome for this item (optional)",
      },
      evidence: {
        type: "string",
        description: "Updated evidence or progress details (optional)",
      },
      notes: {
        type: "string",
        description: "The notes for the item.",
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

//
// -- CONTEXT (GET /context) --
//
const GET_STORY_CONTEXT_TOOL: Tool = {
  name: "orchestra_get_story_context",
  description:
    "Fetch story context for a given list and item, optionally passing user feedback.",
  inputSchema: {
    type: "object",
    properties: {
      listId: {
        type: "string",
        description: "The list ID associated with the context",
      },
      itemId: {
        type: "string",
        description: "The item ID associated with the context",
      },
      feedback: {
        type: "string",
        description: "Optional user feedback that may affect the context",
      },
    },
    required: ["listId", "itemId"],
  },
};

//
// -- STORIES --
//
const READ_STORIES_TOOL: Tool = {
  name: "orchestra_read_stories",
  description:
    "Retrieve multiple stories, filtered by list_id and item_id (both required). Supports pagination.",
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
      list_id: {
        type: "string",
        description: "Only stories that belong to this list",
      },
      item_id: {
        type: "string",
        description: "Only stories that belong to this item",
      },
    },
    required: ["list_id", "item_id"],
  },
};

const CREATE_STORY_TOOL: Tool = {
  name: "orchestra_create_story",
  description: "Create a new story for a given list and item.",
  inputSchema: {
    type: "object",
    properties: {
      list_id: {
        type: "string",
        description: "The list ID for which this story is created",
      },
      item_id: {
        type: "string",
        description: "The item ID for which this story is created",
      },
      title: {
        type: "string",
        description: "The title of the new story",
      },
      story_text: {
        type: "string",
        description: "The text content of the new story",
      },
    },
    required: ["list_id", "item_id", "title", "story_text"],
  },
};

const READ_ONE_STORY_TOOL: Tool = {
  name: "orchestra_read_one_story",
  description: "Retrieve a single story by ID",
  inputSchema: {
    type: "object",
    properties: {
      id: {
        type: "string",
        description: "The story ID to retrieve",
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
    // USER
    UPDATE_SELF_USER_TOOL,
    READ_ONE_USER_TOOL,

    // LISTS
    CREATE_LIST_TOOL,
    UPDATE_LIST_TOOL,
    DESTROY_LIST_TOOL,
    READ_LISTS_TOOL,
    READ_ONE_LIST_TOOL,

    // ITEMS
    CREATE_ITEMS_TOOL,
    READ_ITEMS_TOOL,
    READ_ONE_ITEM_TOOL,
    UPDATE_ITEM_TOOL,
    DESTROY_ITEM_TOOL,

    // CONTEXT
    GET_STORY_CONTEXT_TOOL,

    // STORIES
    READ_STORIES_TOOL,
    CREATE_STORY_TOOL,
    READ_ONE_STORY_TOOL,
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
      case "orchestra_update_self_user": {
        // PATCH /users
        // body => { name?, about?, visibility? }
        const url = `${ORCHESTRA8_API_BASE_URL}/users`;
        const result = await doRequest(url, "PATCH", {
          name: args.name,
          about: args.about,
          visibility: args.visibility,
        });
        return {
          content: [
            {
              type: "text",
              text: `Updated user:\n${JSON.stringify(result, null, 2)}`,
            },
          ],
          isError: false,
        };
      }

      case "orchestra_read_one_user": {
        // GET /users/{id}
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
      case "orchestra_create_list": {
        // POST /lists
        // body => { name, description?, story_mode?, belief_mode? }
        const url = `${ORCHESTRA8_API_BASE_URL}/lists`;
        const result = await doRequest(url, "POST", {
          name: args.name,
          description: args.description,
          story_mode: args.story_mode,
          belief_mode: args.belief_mode,
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
        // PATCH /lists/{id}
        // body => { name?, status?, description?, outcome?, evidence?, story_mode?, belief_mode? }
        const url = `${ORCHESTRA8_API_BASE_URL}/lists/${args.id}`;
        const typedArgs = args as {
          id: string;
          name?: string;
          status?: number;
          description?: string;
          outcome?: string;
          evidence?: string;
          story_mode?: string;
          belief_mode?: string;
        };

        const body = {
          ...(typedArgs.name && { name: typedArgs.name }),
          ...(typeof typedArgs.status !== "undefined" && {
            status: typedArgs.status,
          }),
          ...(typedArgs.description && { description: typedArgs.description }),
          ...(typedArgs.outcome && { outcome: typedArgs.outcome }),
          ...(typedArgs.evidence && { evidence: typedArgs.evidence }),
          ...(typeof typedArgs.story_mode !== "undefined" && {
            story_mode: typedArgs.story_mode,
          }),
          ...(typeof typedArgs.belief_mode !== "undefined" && {
            belief_mode: typedArgs.belief_mode,
          }),
        };
        const result = await doRequest(url, "PATCH", body);
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

      case "orchestra_destroy_list": {
        // DELETE /lists/{id}
        // args: { id: string }
        const url = `${ORCHESTRA8_API_BASE_URL}/lists/${args.id}`;
        const result = await doRequest(url, "DELETE");
        return {
          content: [
            {
              type: "text",
              text: `List deleted:\n${JSON.stringify(result, null, 2)}`,
            },
          ],
          isError: false,
        };
      }

      case "orchestra_read_lists": {
        // GET /lists
        // query => { page, limit }
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
        // GET /lists/{id}
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
      case "orchestra_create_items": {
        // POST /items
        // body => { items: [ { list_id, name, status? }, ... ] }
        const url = `${ORCHESTRA8_API_BASE_URL}/items`;
        const listId = args.list_id;
        let items = args.items;
        if (typeof items === "string") {
          const itemsAreAString = items as string;
          items = itemsAreAString.split(",");
        }
        const result = await doRequest(url, "POST", {
          list_id: listId,
          items,
        });

        return {
          content: [
            {
              type: "text",
              text: `Item(s) created:\n${JSON.stringify(result, null, 2)}`,
            },
          ],
          isError: false,
        };
      }

      case "orchestra_read_items": {
        // GET /items
        // query => { page, limit, list_id (required) }
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
        // GET /items/{id}
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
        // PATCH /items/{id}
        // body => { name?, status?, outcome?, evidence? }
        const url = `${ORCHESTRA8_API_BASE_URL}/items/${args.id}`;
        const typedArgs = args as {
          id: string;
          name?: string;
          status?: number;
          description?: string;
          outcome?: string;
          evidence?: string;
          notes?: string;
        };
        const body = {
          ...(typedArgs.name && { name: typedArgs.name }),
          ...(typeof typedArgs.status !== "undefined" && {
            status: typedArgs.status,
          }),
          ...(typedArgs.outcome && { outcome: typedArgs.outcome }),
          ...(typedArgs.evidence && { evidence: typedArgs.evidence }),
          ...(typedArgs.notes && { notes: typedArgs.notes }),
        };
        const result = await doRequest(url, "PATCH", body);
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
        // DELETE /items/{id}
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

      // ---------- CONTEXT ----------
      case "orchestra_get_story_context": {
        // GET /context
        // query => { listId, itemId, feedback? }
        const params = new URLSearchParams();
        params.set("listId", `${args.listId}`);
        params.set("itemId", `${args.itemId}`);
        if (args.feedback) {
          params.set("feedback", `${args.feedback}`);
        }
        const url = `${ORCHESTRA8_API_BASE_URL}/context?${params.toString()}`;
        const result = await doRequest(url, "GET");
        return {
          content: [
            {
              type: "text",
              text: `Context retrieved:\n${JSON.stringify(result, null, 2)}`,
            },
          ],
          isError: false,
        };
      }

      // ---------- STORIES ----------
      case "orchestra_read_stories": {
        // GET /stories
        // query => { page?, limit?, list_id, item_id }
        const params = new URLSearchParams();
        if (args.page) params.set("page", `${args.page}`);
        if (args.limit) params.set("limit", `${args.limit}`);
        params.set("list_id", `${args.list_id}`);
        params.set("item_id", `${args.item_id}`);
        const url = `${ORCHESTRA8_API_BASE_URL}/stories?${params.toString()}`;
        const result = await doRequest(url, "GET");
        return {
          content: [
            {
              type: "text",
              text: `Stories retrieved:\n${JSON.stringify(result, null, 2)}`,
            },
          ],
          isError: false,
        };
      }

      case "orchestra_create_story": {
        // POST /stories
        // body => { list_id, item_id, title, story_text }
        const url = `${ORCHESTRA8_API_BASE_URL}/stories`;
        const body = {
          list_id: args.list_id,
          item_id: args.item_id,
          title: args.title,
          story_text: args.story_text,
        };
        const result = await doRequest(url, "POST", body);
        return {
          content: [
            {
              type: "text",
              text: `Story created:\n${JSON.stringify(result, null, 2)}`,
            },
          ],
          isError: false,
        };
      }

      case "orchestra_read_one_story": {
        // GET /stories/{id}
        // args: { id: string }
        const url = `${ORCHESTRA8_API_BASE_URL}/stories/${args.id}`;
        const result = await doRequest(url, "GET");
        return {
          content: [
            {
              type: "text",
              text: `Story data:\n${JSON.stringify(result, null, 2)}`,
            },
          ],
          isError: false,
        };
      }

      // ---------- UNKNOWN ----------
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
