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
const GOALSTORYING_API_BASE_URL = argv[0];
const GOALSTORYING_API_TOKEN = argv[1];

if (!GOALSTORYING_API_BASE_URL) {
  console.error(
    "Error: GOALSTORYING_API_BASE_URL environment variable is required"
  );
  process.exit(1);
}
if (!GOALSTORYING_API_TOKEN) {
  console.error(
    "Error: GOALSTORYING_API_TOKEN environment variable is required"
  );
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
        Authorization: `Bearer ${GOALSTORYING_API_TOKEN}`,
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
  name: "goalstorying_update_self_user",
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
  name: "goalstorying_read_one_user",
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
// -- GOALS --
//
const CREATE_GOAL_TOOL: Tool = {
  name: "goalstorying_create_goal",
  description: "Create a new goal",
  inputSchema: {
    type: "object",
    properties: {
      name: {
        type: "string",
        description: "The name/title for this new goal",
      },
      description: {
        type: "string",
        description: "Optional descriptive text for this goal",
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

const UPDATE_GOAL_TOOL: Tool = {
  name: "goalstorying_update_goal",
  description: "Update an existing goal by ID",
  inputSchema: {
    type: "object",
    properties: {
      id: {
        type: "string",
        description: "Which goal ID to update",
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
        description: "Updated evidence for this goal (optional)",
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

const DESTROY_GOAL_TOOL: Tool = {
  name: "goalstorying_destroy_goal",
  description:
    "Delete a goal by ID. The user must own this goal or be authorized to remove it. All steps for the goal will be deleted as well.",
  inputSchema: {
    type: "object",
    properties: {
      id: {
        type: "string",
        description: "Which goal ID to delete",
      },
    },
    required: ["id"],
  },
};

const READ_ONE_GOAL_TOOL: Tool = {
  name: "goalstorying_read_one_goal",
  description: "Get a single goal by ID for the authenticated user",
  inputSchema: {
    type: "object",
    properties: {
      id: {
        type: "string",
        description: "Which goal ID to retrieve",
      },
    },
    required: ["id"],
  },
};

const READ_GOALS_TOOL: Tool = {
  name: "goalstorying_read_goals",
  description: "Get all goals for the authenticated user, optionally paginated",
  inputSchema: {
    type: "object",
    properties: {
      page: {
        type: "number",
        description: "Page number (optional)",
      },
      limit: {
        type: "number",
        description: "Number of steps per page (optional)",
      },
    },
  },
};

//
// -- STEPS --
//
const CREATE_STEPS_TOOL: Tool = {
  name: "goalstorying_create_steps",
  description: "Create one or more new step(s) for a given goal",
  inputSchema: {
    type: "object",
    properties: {
      goal_id: {
        type: "string",
        description: "The goal ID in which to create the step",
      },
      steps: {
        type: "array",
        description: "An array of steps to create.",
        steps: {
          type: "string",
          description: "The name/title of the new step",
        },
      },
    },
    required: ["goal_id, steps"],
  },
};

const READ_STEPS_TOOL: Tool = {
  name: "goalstorying_read_steps",
  description:
    "Get steps for the authenticated user, optionally filtered by goal_id or paginated (goal_id is required).",
  inputSchema: {
    type: "object",
    properties: {
      page: {
        type: "number",
        description: "Page number (optional)",
      },
      limit: {
        type: "number",
        description: "Number of steps per page (optional)",
      },
      goal_id: {
        type: "string",
        description:
          "The goal ID filter: only steps from this goal are returned (required)",
      },
    },
    required: ["goal_id"],
  },
};

const READ_ONE_STEP_TOOL: Tool = {
  name: "goalstorying_read_one_step",
  description: "Get a single step by ID for the authenticated user",
  inputSchema: {
    type: "object",
    properties: {
      id: {
        type: "string",
        description: "Which step ID to retrieve",
      },
    },
    required: ["id"],
  },
};

const UPDATE_STEP_TOOL: Tool = {
  name: "goalstorying_update_step",
  description: "Update an existing step (name, status, outcome, etc.) by ID",
  inputSchema: {
    type: "object",
    properties: {
      id: {
        type: "string",
        description: "Which step ID to update",
      },
      name: {
        type: "string",
        description: "Updated name/title of the step (optional)",
      },
      status: {
        type: "number",
        description: "Updated status code (0=pending, 1=complete) (optional)",
      },
      outcome: {
        type: "string",
        description: "Updated outcome for this step (optional)",
      },
      evidence: {
        type: "string",
        description: "Updated evidence or progress details (optional)",
      },
      notes: {
        type: "string",
        description: "Markdown formatted notes for the step.",
      },
    },
    required: ["id"],
  },
};

const DESTROY_STEP_TOOL: Tool = {
  name: "goalstorying_destroy_step",
  description:
    "Delete an step by ID. The user must own this step or be authorized to remove it.",
  inputSchema: {
    type: "object",
    properties: {
      id: {
        type: "string",
        description: "Which step ID to delete",
      },
    },
    required: ["id"],
  },
};

//
// -- CONTEXT (GET /context) --
//
const GET_STORY_CONTEXT_TOOL: Tool = {
  name: "goalstorying_get_story_context",
  description:
    "Fetch story context for a given goal and step, optionally passing user feedback.",
  inputSchema: {
    type: "object",
    properties: {
      goalId: {
        type: "string",
        description: "The goal ID associated with the context",
      },
      stepId: {
        type: "string",
        description: "The step ID associated with the context",
      },
      feedback: {
        type: "string",
        description: "Optional user feedback that may affect the context",
      },
    },
    required: ["goalId", "stepId"],
  },
};

//
// -- STORIES --
//
const READ_STORIES_TOOL: Tool = {
  name: "goalstorying_read_stories",
  description:
    "Retrieve multiple stories, filtered by goal_id and step_id (both required). Supports pagination.",
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
      goal_id: {
        type: "string",
        description: "Only stories that belong to this goal",
      },
      step_id: {
        type: "string",
        description: "Only stories that belong to this step",
      },
    },
    required: ["goal_id", "step_id"],
  },
};

const CREATE_STORY_TOOL: Tool = {
  name: "goalstorying_create_story",
  description: "Create a new story for a given goal and step.",
  inputSchema: {
    type: "object",
    properties: {
      goal_id: {
        type: "string",
        description: "The goal ID for which this story is created",
      },
      step_id: {
        type: "string",
        description: "The step ID for which this story is created",
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
    required: ["goal_id", "step_id", "title", "story_text"],
  },
};

const READ_ONE_STORY_TOOL: Tool = {
  name: "goalstorying_read_one_story",
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
    name: "goalstorying-mcp-server",
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

    // GOALS
    CREATE_GOAL_TOOL,
    UPDATE_GOAL_TOOL,
    DESTROY_GOAL_TOOL,
    READ_GOALS_TOOL,
    READ_ONE_GOAL_TOOL,

    // STEPS
    CREATE_STEPS_TOOL,
    READ_STEPS_TOOL,
    READ_ONE_STEP_TOOL,
    UPDATE_STEP_TOOL,
    DESTROY_STEP_TOOL,

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
      case "goalstorying_update_self_user": {
        // PATCH /users
        // body => { name?, about?, visibility? }
        const url = `${GOALSTORYING_API_BASE_URL}/users`;
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

      case "goalstorying_read_one_user": {
        // GET /users/{id}
        // args: { id: string }
        const url = `${GOALSTORYING_API_BASE_URL}/users/${args.id}`;
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

      // ---------- GOALS ----------
      case "goalstorying_create_goal": {
        // POST /goals
        // body => { name, description?, story_mode?, belief_mode? }
        const url = `${GOALSTORYING_API_BASE_URL}/goals`;
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
              text: `Goal created:\n${JSON.stringify(result, null, 2)}`,
            },
          ],
          isError: false,
        };
      }

      case "goalstorying_update_goal": {
        // PATCH /goals/{id}
        // body => { name?, status?, description?, outcome?, evidence?, story_mode?, belief_mode? }
        const url = `${GOALSTORYING_API_BASE_URL}/goals/${args.id}`;
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
              text: `Goal updated:\n${JSON.stringify(result, null, 2)}`,
            },
          ],
          isError: false,
        };
      }

      case "goalstorying_destroy_goal": {
        // DELETE /goals/{id}
        // args: { id: string }
        const url = `${GOALSTORYING_API_BASE_URL}/goals/${args.id}`;
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

      case "goalstorying_read_goals": {
        // GET /goals
        // query => { page, limit }
        const params = new URLSearchParams();
        if (args.page) params.set("page", `${args.page}`);
        if (args.limit) params.set("limit", `${args.limit}`);
        const url = `${GOALSTORYING_API_BASE_URL}/goals?${params.toString()}`;
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

      case "goalstorying_read_one_goal": {
        // GET /goals/{id}
        // args: { id: string }
        const url = `${GOALSTORYING_API_BASE_URL}/goals/${args.id}`;
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

      // ---------- STEPS ----------
      case "goalstorying_create_steps": {
        // POST /steps
        // body => { steps: [ { goal_id, name, status? }, ... ] }
        const url = `${GOALSTORYING_API_BASE_URL}/steps`;
        const goalId = args.goal_id;
        let steps = args.steps;
        if (typeof steps === "string") {
          const stepsAreAString = steps as string;
          steps = stepsAreAString.split(",");
        }
        const result = await doRequest(url, "POST", {
          goal_id: goalId,
          steps,
        });

        return {
          content: [
            {
              type: "text",
              text: `Step(s) created:\n${JSON.stringify(result, null, 2)}`,
            },
          ],
          isError: false,
        };
      }

      case "goalstorying_read_steps": {
        // GET /steps
        // query => { page, limit, goal_id (required) }
        const params = new URLSearchParams();
        if (args.page) params.set("page", `${args.page}`);
        if (args.limit) params.set("limit", `${args.limit}`);
        params.set("goal_id", `${args.goal_id}`);
        const url = `${GOALSTORYING_API_BASE_URL}/steps?${params.toString()}`;
        const result = await doRequest(url, "GET");
        return {
          content: [
            {
              type: "text",
              text: `Steps retrieved:\n${JSON.stringify(result, null, 2)}`,
            },
          ],
          isError: false,
        };
      }

      case "goalstorying_read_one_step": {
        // GET /steps/{id}
        // args: { id: string }
        const url = `${GOALSTORYING_API_BASE_URL}/steps/${args.id}`;
        const result = await doRequest(url, "GET");
        return {
          content: [
            {
              type: "text",
              text: `Step data:\n${JSON.stringify(result, null, 2)}`,
            },
          ],
          isError: false,
        };
      }

      case "goalstorying_update_step": {
        // PATCH /steps/{id}
        // body => { name?, status?, outcome?, evidence? }
        const url = `${GOALSTORYING_API_BASE_URL}/steps/${args.id}`;
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
              text: `Step updated:\n${JSON.stringify(result, null, 2)}`,
            },
          ],
          isError: false,
        };
      }

      case "goalstorying_destroy_step": {
        // DELETE /steps/{id}
        // args: { id: string }
        const url = `${GOALSTORYING_API_BASE_URL}/steps/${args.id}`;
        const result = await doRequest(url, "DELETE");
        return {
          content: [
            {
              type: "text",
              text: `Step deleted:\n${JSON.stringify(result, null, 2)}`,
            },
          ],
          isError: false,
        };
      }

      // ---------- CONTEXT ----------
      case "goalstorying_get_story_context": {
        // GET /context
        // query => { goalId, stepId, feedback? }
        const params = new URLSearchParams();
        params.set("goalId", `${args.goalId}`);
        params.set("stepId", `${args.stepId}`);
        if (args.feedback) {
          params.set("feedback", `${args.feedback}`);
        }
        const url = `${GOALSTORYING_API_BASE_URL}/context?${params.toString()}`;
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
      case "goalstorying_read_stories": {
        // GET /stories
        // query => { page?, limit?, goal_id, step_id }
        const params = new URLSearchParams();
        if (args.page) params.set("page", `${args.page}`);
        if (args.limit) params.set("limit", `${args.limit}`);
        params.set("goal_id", `${args.goal_id}`);
        params.set("step_id", `${args.step_id}`);
        const url = `${GOALSTORYING_API_BASE_URL}/stories?${params.toString()}`;
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

      case "goalstorying_create_story": {
        // POST /stories
        // body => { goal_id, step_id, title, story_text }
        const url = `${GOALSTORYING_API_BASE_URL}/stories`;
        const body = {
          goal_id: args.goal_id,
          step_id: args.step_id,
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

      case "goalstorying_read_one_story": {
        // GET /stories/{id}
        // args: { id: string }
        const url = `${GOALSTORYING_API_BASE_URL}/stories/${args.id}`;
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
  console.error("Splash ToDo MCP Server running on stdio");
}

runServer().catch((error) => {
  console.error("Fatal error running server:", error);
  process.exit(1);
});
