#!/usr/bin/env node

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  Tool,
} from "@modelcontextprotocol/sdk/types.js";
import axios from "axios";

import {
  GoalstoryAboutInput,
  GoalstoryReadSelfUserInput,
  GoalstoryUpdateSelfUserInput,
  GoalstoryCountGoalsInput,
  GoalstoryCreateGoalInput,
  GoalstoryUpdateGoalInput,
  GoalstoryDestroyGoalInput,
  GoalstoryReadOneGoalInput,
  GoalstoryReadGoalsInput,
  GoalstoryMarkGoalCompleteInput,
  GoalstorySearchGoalSpaceInput,
} from "./types";

// -----------------------------------------
// 1. Environment variables & basic setup
// -----------------------------------------
const argv = process.argv.slice(2);
const GOALSTORY_API_BASE_URL = argv[0];
const GOALSTORY_API_TOKEN = argv[1];

if (!GOALSTORY_API_BASE_URL) {
  console.error("Error: GOALSTORY_API_BASE_URL argument is required");
  process.exit(1);
}
if (!GOALSTORY_API_TOKEN) {
  console.error("Error: GOALSTORY_API_TOKEN argument is required");
  process.exit(1);
}

// Helper to make HTTP requests
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
        Authorization: `Bearer ${GOALSTORY_API_TOKEN}`,
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

/**
 * GET /about
 */
const ABOUT_GOALSTORYING_TOOL: Tool = {
  name: "goalstory_about",
  description:
    "Retrieve 'About' information about Goal Storying from the server (GET /about). No input needed.",
  inputSchema: {
    type: "object",
    properties: {},
  },
};

/**
 * GET /users
 */
const READ_SELF_USER_TOOL: Tool = {
  name: "goalstory_read_self_user",
  description: "Get data for the current user (GET /users). No input needed.",
  inputSchema: {
    type: "object",
    properties: {},
  },
};

/**
 * PATCH /users
 * Body => { name?: string; about?: string; visibility?: number }
 */
const UPDATE_SELF_USER_TOOL: Tool = {
  name: "goalstory_update_self_user",
  description:
    "Update the current user's profile data (PATCH /users). You can update name, about, or visibility. When updating 'about' data the user should be presented with a survey to learn more about them.",
  inputSchema: {
    type: "object",
    properties: {
      name: {
        type: "string",
        description: "Updated name of the user (optional).",
      },
      about: {
        type: "string",
        description:
          "Updated 'about' information describing the user (optional).",
      },
      visibility: {
        type: "number",
        description:
          "Updated visibility status (0 = public, 1 = private) (optional).",
      },
    },
  },
};

/**
 * GET /count/goals
 */
const COUNT_GOALS_TOOL: Tool = {
  name: "goalstory_count_goals",
  description:
    "Get the count of all goals for the current user (GET /count/goals). No input needed.",
  inputSchema: {
    type: "object",
    properties: {},
  },
};

/**
 * POST /goals
 * Body => {
 *   name: string;
 *   description: string;
 *   story: string;
 *   story_mode: string;
 *   belief_mode: string;
 *   notes?: string;
 *   evidence?: string;
 * }
 */
const CREATE_GOAL_TOOL: Tool = {
  name: "goalstory_create_goal",
  description:
    "Create a new Goal (POST /goals). 'name', 'description', 'story', 'story_mode', and 'belief_mode' are required. 'notes' and 'evidence' are optional. The 'goalstory_read_self_user' tool should always be utilized at least once in order to learn about the user in detail.",
  inputSchema: {
    type: "object",
    properties: {
      name: {
        type: "string",
        description: "Name/title of the new goal. (Required)",
      },
      description: {
        type: "string",
        description: "Description of the new goal. (Required)",
      },
      story: {
        type: "string",
        description:
          "Initial story or narrative context for the goal. (Required)",
      },
      story_mode: {
        type: "string",
        description:
          "A mode that shapes how future stories or narratives for this goal are generated. (Required)",
      },
      belief_mode: {
        type: "string",
        description:
          "A mode describing how the user's beliefs should shape this goal. (Required)",
      },
      notes: {
        type: "string",
        description: "Additional notes for the new goal. (Optional)",
      },
      evidence: {
        type: "string",
        description:
          "Any initial evidence or references for the new goal. (Optional)",
      },
    },
    required: ["name", "description", "story", "story_mode", "belief_mode"],
  },
};

/**
 * PATCH /goals
 * Body => {
 *   id: string;
 *   name?: string;
 *   status?: number; // 0=Pending, 1=Complete
 *   description?: string;
 *   story?: string;
 *   notes?: string;
 *   outcome?: string;
 *   evidence?: string;
 *   story_mode?: string;
 *   belief_mode?: string;
 * }
 */
const UPDATE_GOAL_TOOL: Tool = {
  name: "goalstory_update_goal",
  description:
    "All Goal data changes should be saved to Goal Story using this tool (PATCH /goals). The ID is required. Other fields are optional.",
  inputSchema: {
    type: "object",
    properties: {
      id: {
        type: "string",
        description: "The ID of the goal to update. (Required)",
      },
      name: {
        type: "string",
        description: "Updated name/title of the goal. (Optional)",
      },
      status: {
        type: "number",
        description:
          "Updated status of the goal (0 = active/pending, 1 = complete). (Optional)",
      },
      description: {
        type: "string",
        description: "Updated description of the goal. (Optional)",
      },
      story: {
        type: "string",
        description: "Updated story/narrative text for the goal. (Optional)",
      },
      notes: {
        type: "string",
        description: "Updated notes for the goal. (Optional)",
      },
      outcome: {
        type: "string",
        description:
          "Outcome the user experienced upon achieving or progressing in this goal. (Optional)",
      },
      evidence: {
        type: "string",
        description:
          "Evidence or proof of progress/achievement for this goal. (Optional)",
      },
      story_mode: {
        type: "string",
        description:
          "Updated mode that shapes how future stories for this goal are generated. (Optional)",
      },
      belief_mode: {
        type: "string",
        description:
          "Updated mode describing how the user's beliefs shape this goal. (Optional)",
      },
    },
    required: ["id"],
  },
};

/**
 * DELETE /goals/:id
 * Args => { id: string }
 */
const DESTROY_GOAL_TOOL: Tool = {
  name: "goalstory_destroy_goal",
  description:
    "Delete an existing goal by ID (DELETE /goals/:id). This also cascades deletion of any related items on the server side.",
  inputSchema: {
    type: "object",
    properties: {
      id: {
        type: "string",
        description: "The ID of the goal to delete. (Required)",
      },
    },
    required: ["id"],
  },
};

/**
 * GET /goals/:id
 * Args => { id: string }
 */
const READ_ONE_GOAL_TOOL: Tool = {
  name: "goalstory_read_one_goal",
  description: "Get a single goal by ID (GET /goals/:id).",
  inputSchema: {
    type: "object",
    properties: {
      id: {
        type: "string",
        description: "The ID of the goal to retrieve. (Required)",
      },
    },
    required: ["id"],
  },
};

/**
 * GET /goals
 * Query => { page?: number; limit?: number }
 */
const READ_GOALS_TOOL: Tool = {
  name: "goalstory_read_goals",
  description:
    "Get a list of all goals for the user (GET /goals), optionally paginated with 'page' and 'limit'.",
  inputSchema: {
    type: "object",
    properties: {
      page: {
        type: "number",
        description: "Page number for pagination (optional).",
      },
      limit: {
        type: "number",
        description:
          "Number of goals returned per page for pagination (optional).",
      },
    },
  },
};

/**
 * POST /goals/complete
 * Body => Same structure as UpdateGoal: { id: string; ... }
 */
const MARK_GOAL_COMPLETE_TOOL: Tool = {
  name: "goalstory_mark_goal_complete",
  description:
    "Mark a goal as complete (POST /goals/complete). The ID is required. Other update fields are optional, similar to update_goal.",
  inputSchema: {
    type: "object",
    properties: {
      id: {
        type: "string",
        description: "The ID of the goal to mark complete. (Required)",
      },
      name: {
        type: "string",
        description: "Updated name/title of the goal (Optional).",
      },
      status: {
        type: "number",
        description:
          "Updated status of the goal (0 = active, 1 = complete). (Optional)",
      },
      description: {
        type: "string",
        description: "Updated description of the goal (Optional).",
      },
      story: {
        type: "string",
        description: "Updated story/narrative for the goal (Optional).",
      },
      notes: {
        type: "string",
        description: "Updated notes for the goal (Optional).",
      },
      outcome: {
        type: "string",
        description:
          "Outcome the user experienced upon completing the goal (Optional).",
      },
      evidence: {
        type: "string",
        description: "Evidence or proof of completing the goal (Optional).",
      },
      story_mode: {
        type: "string",
        description:
          "Updated mode describing how future stories (if any) for this goal are generated (Optional).",
      },
      belief_mode: {
        type: "string",
        description:
          "Updated mode describing how the user's beliefs shape the goal (Optional).",
      },
    },
    required: ["id"],
  },
};

/**
 * POST /goals/search
 * Body => { query: string }
 */
const SEARCH_GOAL_SPACE_TOOL: Tool = {
  name: "goalstory_search_goal_space",
  description:
    "Search the goal space (POST /goals/search). Provide a query string, returns relevant textual chunks or matches.",
  inputSchema: {
    type: "object",
    properties: {
      query: {
        type: "string",
        description:
          "The search query string used to find related content in the goal space. (Required)",
      },
    },
    required: ["query"],
  },
};

// -----------------------------------------
// 3. Instantiate the MCP server
// -----------------------------------------
const server = new Server(
  {
    name: "goalstory-mcp-server",
    version: "0.2.0",
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

// -----------------------------------------
// 4. Tools listing handler
// -----------------------------------------
server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools: [
    // ABOUT
    ABOUT_GOALSTORYING_TOOL,

    // USERS
    READ_SELF_USER_TOOL,
    UPDATE_SELF_USER_TOOL,

    // GOALS
    COUNT_GOALS_TOOL,
    CREATE_GOAL_TOOL,
    UPDATE_GOAL_TOOL,
    DESTROY_GOAL_TOOL,
    READ_ONE_GOAL_TOOL,
    READ_GOALS_TOOL,
    MARK_GOAL_COMPLETE_TOOL,
    SEARCH_GOAL_SPACE_TOOL,
  ],
}));

// -----------------------------------------
// 5. Main handler for tool calls
// -----------------------------------------
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: rawArgs } = request.params;

  if (!rawArgs) {
    return {
      content: [{ type: "text", text: "No arguments provided" }],
      isError: true,
    };
  }

  try {
    switch (name) {
      // ---------- ABOUT ----------
      case "goalstory_about": {
        // Cast or treat rawArgs as needed
        const args = rawArgs as GoalstoryAboutInput;
        const url = `${GOALSTORY_API_BASE_URL}/about`;
        const result = await doRequest(url, "GET");
        return {
          content: [
            {
              type: "text",
              text: `About data:\n${JSON.stringify(result, null, 2)}`,
            },
          ],
          isError: false,
        };
      }

      // ---------- USERS ----------
      case "goalstory_read_self_user": {
        const args = rawArgs as GoalstoryReadSelfUserInput;
        const url = `${GOALSTORY_API_BASE_URL}/users`;
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

      case "goalstory_update_self_user": {
        const args = rawArgs as GoalstoryUpdateSelfUserInput;
        const url = `${GOALSTORY_API_BASE_URL}/users`;
        const body = {
          ...(args.name ? { name: args.name } : {}),
          ...(args.about ? { about: args.about } : {}),
          ...(typeof args.visibility === "number"
            ? { visibility: args.visibility }
            : {}),
        };
        const result = await doRequest(url, "PATCH", body);
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

      // ---------- GOALS ----------
      case "goalstory_count_goals": {
        const args = rawArgs as GoalstoryCountGoalsInput;
        const url = `${GOALSTORY_API_BASE_URL}/count/goals`;
        const result = await doRequest(url, "GET");
        return {
          content: [
            {
              type: "text",
              text: `Count of goals:\n${JSON.stringify(result, null, 2)}`,
            },
          ],
          isError: false,
        };
      }

      case "goalstory_create_goal": {
        const args = rawArgs as unknown as GoalstoryCreateGoalInput;
        const url = `${GOALSTORY_API_BASE_URL}/goals`;
        const body = {
          name: args.name,
          description: args.description,
          story: args.story,
          story_mode: args.story_mode,
          belief_mode: args.belief_mode,
          ...(args.notes ? { notes: args.notes } : {}),
          ...(args.evidence ? { evidence: args.evidence } : {}),
        };
        const result = await doRequest(url, "POST", body);
        return {
          content: [
            {
              type: "text",
              text: `Goal created:\n${JSON.stringify(result, null, 2)}`,
            },
          ],
          isError: false,
        };
      }

      case "goalstory_update_goal": {
        const args = rawArgs as unknown as GoalstoryUpdateGoalInput;
        const url = `${GOALSTORY_API_BASE_URL}/goals`;
        const body = {
          id: args.id,
          ...(args.name ? { name: args.name } : {}),
          ...(typeof args.status === "number" ? { status: args.status } : {}),
          ...(args.description ? { description: args.description } : {}),
          ...(args.story ? { story: args.story } : {}),
          ...(args.notes ? { notes: args.notes } : {}),
          ...(args.outcome ? { outcome: args.outcome } : {}),
          ...(args.evidence ? { evidence: args.evidence } : {}),
          ...(args.story_mode ? { story_mode: args.story_mode } : {}),
          ...(args.belief_mode ? { belief_mode: args.belief_mode } : {}),
        };
        const result = await doRequest(url, "PATCH", body);
        return {
          content: [
            {
              type: "text",
              text: `Goal updated:\n${JSON.stringify(result, null, 2)}`,
            },
          ],
          isError: false,
        };
      }

      case "goalstory_destroy_goal": {
        const args = rawArgs as unknown as GoalstoryDestroyGoalInput;
        const url = `${GOALSTORY_API_BASE_URL}/goals/${args.id}`;
        const result = await doRequest(url, "DELETE");
        return {
          content: [
            {
              type: "text",
              text: `Goal deleted:\n${JSON.stringify(result, null, 2)}`,
            },
          ],
          isError: false,
        };
      }

      case "goalstory_read_one_goal": {
        const args = rawArgs as unknown as GoalstoryReadOneGoalInput;
        const url = `${GOALSTORY_API_BASE_URL}/goals/${args.id}`;
        const result = await doRequest(url, "GET");
        return {
          content: [
            {
              type: "text",
              text: `Goal data:\n${JSON.stringify(result, null, 2)}`,
            },
          ],
          isError: false,
        };
      }

      case "goalstory_read_goals": {
        const args = rawArgs as GoalstoryReadGoalsInput;
        const params = new URLSearchParams();
        if (args.page) params.set("page", `${args.page}`);
        if (args.limit) params.set("limit", `${args.limit}`);
        const url = `${GOALSTORY_API_BASE_URL}/goals?${params.toString()}`;
        const result = await doRequest(url, "GET");
        return {
          content: [
            {
              type: "text",
              text: `Goals retrieved:\n${JSON.stringify(result, null, 2)}`,
            },
          ],
          isError: false,
        };
      }

      case "goalstory_mark_goal_complete": {
        const args = rawArgs as unknown as GoalstoryMarkGoalCompleteInput;
        const url = `${GOALSTORY_API_BASE_URL}/goals/complete`;
        const body = {
          id: args.id,
          ...(args.name ? { name: args.name } : {}),
          ...(typeof args.status === "number" ? { status: args.status } : {}),
          ...(args.description ? { description: args.description } : {}),
          ...(args.story ? { story: args.story } : {}),
          ...(args.notes ? { notes: args.notes } : {}),
          ...(args.outcome ? { outcome: args.outcome } : {}),
          ...(args.evidence ? { evidence: args.evidence } : {}),
          ...(args.story_mode ? { story_mode: args.story_mode } : {}),
          ...(args.belief_mode ? { belief_mode: args.belief_mode } : {}),
        };
        const result = await doRequest(url, "POST", body);
        return {
          content: [
            {
              type: "text",
              text: `Goal marked complete:\n${JSON.stringify(result, null, 2)}`,
            },
          ],
          isError: false,
        };
      }

      case "goalstory_search_goal_space": {
        const args = rawArgs as unknown as GoalstorySearchGoalSpaceInput;
        const url = `${GOALSTORY_API_BASE_URL}/goals/search`;
        const body = { query: args.query };
        const result = await doRequest(url, "POST", body);
        return {
          content: [
            {
              type: "text",
              text: `Search results:\n${JSON.stringify(result, null, 2)}`,
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
// 6. Run the server
// -----------------------------------------
async function runServer() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("GoalStory MCP Server running on stdio");
}

runServer().catch((error) => {
  console.error("Fatal error running server:", error);
  process.exit(1);
});
