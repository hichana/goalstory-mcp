#!/usr/bin/env node

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import axios from "axios";
import {
  CAPTURE_MESSAGES,
  CLARIFY_MESSAGES,
  CONTEXT_MESSAGES,
  DISCUSS_MESSAGES,
  FOMRULATE_MESSAGES,
  MANAGE_MESSAGES,
  PROMPTS,
  VISUALIZE_MESSAGES,
} from "./prompts.js";
import { ABOUT_GOAL_STORYING } from "./resources.js";
import {
  ABOUT_GOALSTORYING_TOOL,
  COUNT_GOALS_TOOL,
  CREATE_GOAL_TOOL,
  CREATE_SCHEDULED_STORY_TOOL,
  CREATE_STEPS_TOOL,
  CREATE_STORY_TOOL,
  DESTROY_GOAL_TOOL,
  DESTROY_SCHEDULED_STORY_TOOL,
  DESTROY_STEP_TOOL,
  GET_STORY_CONTEXT_TOOL,
  READ_CURRENT_FOCUS_TOOL,
  READ_GOALS_TOOL,
  READ_ONE_GOAL_TOOL,
  READ_ONE_STEP_TOOL,
  READ_ONE_STORY_TOOL,
  READ_SCHEDULED_STORIES_TOOL,
  READ_SELF_USER_TOOL,
  READ_STEPS_TOOL,
  READ_STORIES_TOOL,
  SET_STEPS_ORDER_TOOL,
  UPDATE_GOAL_TOOL,
  UPDATE_SCHEDULED_STORY_TOOL,
  UPDATE_SELF_USER_TOOL,
  UPDATE_STEP_NOTES_TOOL,
  UPDATE_STEP_TOOL,
} from "./tools.js";

// -----------------------------------------
// Environment variables & basic setup
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
  body?: unknown,
): Promise<T> {
  console.error("Making request to:", url);
  console.error("Method:", method);
  console.error("Body:", body ? JSON.stringify(body) : "none");

  try {
    const response = await axios({
      url,
      method,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${GOALSTORY_API_TOKEN}`,
      },
      data: body,
      timeout: 10000, // 10 second timeout
      validateStatus: function (status) {
        return status >= 200 && status < 500; // Accept all status codes less than 500
      },
    });
    console.error("Response received:", response.status);
    return response.data as T;
  } catch (err) {
    console.error("Request failed with error:", err);

    if (axios.isAxiosError(err)) {
      if (err.code === "ECONNABORTED") {
        throw new Error(
          `Request timed out after 10 seconds. URL: ${url}, Method: ${method}`,
        );
      }
      if (err.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        throw new Error(
          `HTTP Error ${
            err.response.status
          }. URL: ${url}, Method: ${method}, Body: ${JSON.stringify(
            body,
          )}. Error text: ${JSON.stringify(err.response.data)}`,
        );
      } else if (err.request) {
        // The request was made but no response was received
        throw new Error(
          `No response received from server. URL: ${url}, Method: ${method}`,
        );
      } else {
        // Something happened in setting up the request that triggered an Error
        throw new Error(`Request setup failed: ${err.message}`);
      }
    } else {
      // Something else happened
      throw new Error(
        `Unexpected error: ${err instanceof Error ? err.message : String(err)}`,
      );
    }
  }
}

// -----------------------------------------
// MCP server
// -----------------------------------------
const server = new McpServer(
  {
    name: "goalstory-mcp-server",
    version: "0.4.5",
  },
  {
    capabilities: {
      tools: {},
      resources: {},
      prompts: {},
    },
  },
);

// -----------------------------------------
// Define Tools as server.tool invocations
// -----------------------------------------
/**
 * About GoalStorying
 */
server.tool(
  ABOUT_GOALSTORYING_TOOL.name,
  ABOUT_GOALSTORYING_TOOL.description,
  ABOUT_GOALSTORYING_TOOL.inputSchema.shape,
  async (args) => {
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
  },
);

/**
 * Read Self User
 */
server.tool(
  READ_SELF_USER_TOOL.name,
  READ_SELF_USER_TOOL.description,
  READ_SELF_USER_TOOL.inputSchema.shape,
  async (args) => {
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
  },
);

/**
 * Update Self User
 */
server.tool(
  UPDATE_SELF_USER_TOOL.name,
  UPDATE_SELF_USER_TOOL.description,
  UPDATE_SELF_USER_TOOL.inputSchema.shape,
  async (args) => {
    const url = `${GOALSTORY_API_BASE_URL}/users`;
    const body = {
      ...(args.name ? { name: args.name } : {}),
      ...(args.about ? { about: args.about } : {}),
      ...(typeof args.visibility === "number"
        ? {
            visibility: args.visibility,
          }
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
  },
);

/**
 * Count Goals
 */
server.tool(
  COUNT_GOALS_TOOL.name,
  COUNT_GOALS_TOOL.description,
  COUNT_GOALS_TOOL.inputSchema.shape,
  async (args) => {
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
  },
);

/**
 * Create Goal
 */
server.tool(
  CREATE_GOAL_TOOL.name,
  CREATE_GOAL_TOOL.description,
  CREATE_GOAL_TOOL.inputSchema.shape,
  async (args) => {
    const url = `${GOALSTORY_API_BASE_URL}/goals`;
    const body = {
      name: args.name,
      ...(args.description
        ? {
            description: args.description,
          }
        : {}),
      ...(args.story_mode
        ? {
            story_mode: args.story_mode,
          }
        : {}),
      ...(args.belief_mode
        ? {
            belief_mode: args.belief_mode,
          }
        : {}),
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
  },
);

/**
 * Update Goal
 */
server.tool(
  UPDATE_GOAL_TOOL.name,
  UPDATE_GOAL_TOOL.description,
  UPDATE_GOAL_TOOL.inputSchema.shape,
  async (args) => {
    const url = `${GOALSTORY_API_BASE_URL}/goals/${args.id}`;
    const body = {
      id: args.id,
      ...(args.name ? { name: args.name } : {}),
      ...(typeof args.status === "number" ? { status: args.status } : {}),
      ...(args.description
        ? {
            description: args.description,
          }
        : {}),
      ...(args.outcome ? { outcome: args.outcome } : {}),
      ...(args.evidence ? { evidence: args.evidence } : {}),
      ...(args.story_mode
        ? {
            story_mode: args.story_mode,
          }
        : {}),
      ...(args.belief_mode
        ? {
            belief_mode: args.belief_mode,
          }
        : {}),
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
  },
);

/**
 * Destroy Goal
 */
server.tool(
  DESTROY_GOAL_TOOL.name,
  DESTROY_GOAL_TOOL.description,
  DESTROY_GOAL_TOOL.inputSchema.shape,
  async (args) => {
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
  },
);

/**
 * Read One Goal
 */
server.tool(
  READ_ONE_GOAL_TOOL.name,
  READ_ONE_GOAL_TOOL.description,
  READ_ONE_GOAL_TOOL.inputSchema.shape,
  async (args) => {
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
  },
);

/**
 * Read Goals
 */
server.tool(
  READ_GOALS_TOOL.name,
  READ_GOALS_TOOL.description,
  READ_GOALS_TOOL.inputSchema.shape,
  async (args) => {
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
  },
);

/**
 * Read Current Focus
 */
server.tool(
  READ_CURRENT_FOCUS_TOOL.name,
  READ_CURRENT_FOCUS_TOOL.description,
  READ_CURRENT_FOCUS_TOOL.inputSchema.shape,
  async (args) => {
    const url = `${GOALSTORY_API_BASE_URL}/current`;
    const result = await doRequest(url, "GET");
    return {
      content: [
        {
          type: "text",
          text: `Current goal/step focus:\n${JSON.stringify(result, null, 2)}`,
        },
      ],
      isError: false,
    };
  },
);

/**
 * Get Story Context
 */
server.tool(
  GET_STORY_CONTEXT_TOOL.name,
  GET_STORY_CONTEXT_TOOL.description,
  GET_STORY_CONTEXT_TOOL.inputSchema.shape,
  async (args) => {
    const params = new URLSearchParams();
    params.set("goalId", args.goalId);
    params.set("stepId", args.stepId);
    if (args.feedback) params.set("feedback", args.feedback);
    const url = `${GOALSTORY_API_BASE_URL}/context?${params.toString()}`;
    const result = await doRequest(url, "GET");
    return {
      content: [
        {
          type: "text",
          text: `Story context:\n${JSON.stringify(result, null, 2)}`,
        },
      ],
      isError: false,
    };
  },
);

/**
 * Create Steps
 */
server.tool(
  CREATE_STEPS_TOOL.name,
  CREATE_STEPS_TOOL.description,
  CREATE_STEPS_TOOL.inputSchema.shape,
  async (args) => {
    const url = `${GOALSTORY_API_BASE_URL}/steps`;

    // when developing locally, we can pass in a list of strings in the MCP
    // inspector like this: step1, step2
    let steps = args.steps;
    if (typeof steps === "string") {
      const itemsAreAString = steps as string;
      steps = itemsAreAString
        .split(",")
        .map((s) => s.trim())
        .filter((s) => s.length > 0);
    }

    const body = {
      goal_id: args.goal_id,
      steps,
    };

    const result = await doRequest(url, "POST", body);
    return {
      content: [
        {
          type: "text",
          text: `Steps created:\n${JSON.stringify(result, null, 2)}\n\nNOTE: Steps are ordered by their 'order_ts' timestamp in ascending order - the step with the smallest timestamp value (updated first) is step 1. The steps appear in order, with the first step having the smallest timestamp. Example: If step A has timestamp 12:00 and step B has timestamp 12:01, then step A is step 1 and step B is step 2.`,
        },
      ],
      isError: false,
    };
  },
);

/**
 * Read Steps
 */
server.tool(
  READ_STEPS_TOOL.name,
  READ_STEPS_TOOL.description,
  READ_STEPS_TOOL.inputSchema.shape,
  async (args) => {
    const params = new URLSearchParams();
    params.set("goal_id", args.goal_id);
    if (args.page) params.set("page", `${args.page}`);
    if (args.limit) params.set("limit", `${args.limit}`);
    const url = `${GOALSTORY_API_BASE_URL}/steps?${params.toString()}`;
    const result = await doRequest(url, "GET");
    return {
      content: [
        {
          type: "text",
          text: `Steps for goal '${args.goal_id}':\n${JSON.stringify(
            result,
            null,
            2,
          )}\n\nIMPORTANT: Steps are ordered by their 'order_ts' timestamp in ascending order - the step with the smallest timestamp value (updated first) is step 1, and steps with larger timestamp values come later in the sequence. Example: If step A has timestamp 12:00 and step B has timestamp 12:01, then step A is step 1 and step B is step 2.`,
        },
      ],
      isError: false,
    };
  },
);

/**
 * Read One Step
 */
server.tool(
  READ_ONE_STEP_TOOL.name,
  READ_ONE_STEP_TOOL.description,
  READ_ONE_STEP_TOOL.inputSchema.shape,
  async (args) => {
    const url = `${GOALSTORY_API_BASE_URL}/steps/${args.id}`;
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
  },
);

/**
 * Update Step
 */
server.tool(
  UPDATE_STEP_TOOL.name,
  UPDATE_STEP_TOOL.description,
  UPDATE_STEP_TOOL.inputSchema.shape,
  async (args) => {
    const url = `${GOALSTORY_API_BASE_URL}/steps/${args.id}`;
    const body = {
      id: args.id,
      ...(args.name ? { name: args.name } : {}),
      ...(typeof args.status === "number" ? { status: args.status } : {}),
      ...(args.outcome ? { outcome: args.outcome } : {}),
      ...(args.evidence ? { evidence: args.evidence } : {}),
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
  },
);

/**
 * Destroy Step
 */
server.tool(
  DESTROY_STEP_TOOL.name,
  DESTROY_STEP_TOOL.description,
  DESTROY_STEP_TOOL.inputSchema.shape,
  async (args) => {
    const url = `${GOALSTORY_API_BASE_URL}/steps/${args.id}`;
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
  },
);

/**
 * Update Step Notes
 */
server.tool(
  UPDATE_STEP_NOTES_TOOL.name,
  UPDATE_STEP_NOTES_TOOL.description,
  UPDATE_STEP_NOTES_TOOL.inputSchema.shape,
  async (args) => {
    const url = `${GOALSTORY_API_BASE_URL}/step/notes/${args.id}`;
    const body = {
      id: args.id,
      notes: args.notes,
    };
    const result = await doRequest(url, "PATCH", body);
    return {
      content: [
        {
          type: "text",
          text: `Step notes updated:\n${JSON.stringify(result, null, 2)}`,
        },
      ],
      isError: false,
    };
  },
);

/**
 * Set Steps Order
 */
server.tool(
  SET_STEPS_ORDER_TOOL.name,
  SET_STEPS_ORDER_TOOL.description,
  SET_STEPS_ORDER_TOOL.inputSchema.shape,
  async (args) => {
    const url = `${GOALSTORY_API_BASE_URL}/steps/order`;

    // If ordered_steps_ids comes in as a string (for local development), convert it to array
    let ordered_steps_ids = args.ordered_steps_ids;
    if (typeof ordered_steps_ids === "string") {
      const idsAsString = ordered_steps_ids as string;
      ordered_steps_ids = idsAsString
        .split(",")
        .map((s) => s.trim())
        .filter((s) => s.length > 0);
    }

    const body = {
      ordered_steps_ids,
    };

    const result = await doRequest(url, "POST", body);
    return {
      content: [
        {
          type: "text",
          text: `Steps order updated:\n${JSON.stringify(result, null, 2)}\n\nIMPORTANT: The first step in the array now has the smallest 'order_ts' timestamp (step 1), and each subsequent step has progressively larger timestamps that determine their order in the sequence. Example: If step A has timestamp 12:00 and step B has timestamp 12:01, then step A is step 1 and step B is step 2.`,
        },
      ],
      isError: false,
    };
  },
);

/**
 * Create Story
 */
server.tool(
  CREATE_STORY_TOOL.name,
  CREATE_STORY_TOOL.description,
  CREATE_STORY_TOOL.inputSchema.shape,
  async (args) => {
    const url = `${GOALSTORY_API_BASE_URL}/stories`;
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
  },
);

/**
 * Read Stories
 */
server.tool(
  READ_STORIES_TOOL.name,
  READ_STORIES_TOOL.description,
  READ_STORIES_TOOL.inputSchema.shape,
  async (args) => {
    const params = new URLSearchParams();
    params.set("goal_id", args.goal_id);
    params.set("step_id", args.step_id);
    if (args.page) params.set("page", `${args.page}`);
    if (args.limit) params.set("limit", `${args.limit}`);
    const url = `${GOALSTORY_API_BASE_URL}/stories?${params.toString()}`;
    const result = await doRequest(url, "GET");
    return {
      content: [
        {
          type: "text",
          text: `Stories:\n${JSON.stringify(result, null, 2)}`,
        },
      ],
      isError: false,
    };
  },
);

/**
 * Read One Story
 */
server.tool(
  READ_ONE_STORY_TOOL.name,
  READ_ONE_STORY_TOOL.description,
  READ_ONE_STORY_TOOL.inputSchema.shape,
  async (args) => {
    const url = `${GOALSTORY_API_BASE_URL}/stories/${args.id}`;
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
  },
);

/**
 * Read Scheduled Stories
 */
server.tool(
  READ_SCHEDULED_STORIES_TOOL.name,
  READ_SCHEDULED_STORIES_TOOL.description,
  READ_SCHEDULED_STORIES_TOOL.inputSchema.shape,
  async (args) => {
    const params = new URLSearchParams();
    if (args.page) params.set("page", `${args.page}`);
    if (args.limit) params.set("limit", `${args.limit}`);
    const url = `${GOALSTORY_API_BASE_URL}/schedules/stories?${params.toString()}`;
    const result = await doRequest(url, "GET");
    return {
      content: [
        {
          type: "text",
          text: `Scheduled stories retrieved:\n${JSON.stringify(result, null, 2)}`,
        },
      ],
      isError: false,
    };
  },
);

/**
 * Create Scheduled Story
 */
server.tool(
  CREATE_SCHEDULED_STORY_TOOL.name,
  CREATE_SCHEDULED_STORY_TOOL.description,
  CREATE_SCHEDULED_STORY_TOOL.inputSchema.shape,
  async (args) => {
    const url = `${GOALSTORY_API_BASE_URL}/schedules/stories`;
    const body = {
      goal_id: args.goal_id,
      timeSettings: args.timeSettings,
    };
    const result = await doRequest(url, "POST", body);
    return {
      content: [
        {
          type: "text",
          text: `Scheduled story created:\n${JSON.stringify(result, null, 2)}`,
        },
      ],
      isError: false,
    };
  },
);

/**
 * Update Scheduled Story
 */
server.tool(
  UPDATE_SCHEDULED_STORY_TOOL.name,
  UPDATE_SCHEDULED_STORY_TOOL.description,
  UPDATE_SCHEDULED_STORY_TOOL.inputSchema.shape,
  async (args) => {
    const url = `${GOALSTORY_API_BASE_URL}/schedules/stories/${args.id}`;
    const body = {
      id: args.id,
      ...(args.timeSettings ? { timeSettings: args.timeSettings } : {}),
      ...(typeof args.status === "number" ? { status: args.status } : {}),
    };
    const result = await doRequest(url, "PATCH", body);
    return {
      content: [
        {
          type: "text",
          text: `Scheduled story updated:\n${JSON.stringify(result, null, 2)}`,
        },
      ],
      isError: false,
    };
  },
);

/**
 * Destroy Scheduled Story
 */
server.tool(
  DESTROY_SCHEDULED_STORY_TOOL.name,
  DESTROY_SCHEDULED_STORY_TOOL.description,
  DESTROY_SCHEDULED_STORY_TOOL.inputSchema.shape,
  async (args) => {
    const url = `${GOALSTORY_API_BASE_URL}/schedules/stories/${args.id}`;
    const result = await doRequest(url, "DELETE");
    return {
      content: [
        {
          type: "text",
          text: `Scheduled story deleted:\n${JSON.stringify(result, null, 2)}`,
        },
      ],
      isError: false,
    };
  },
);

// -----------------------------------------
// RESOURCES
// -----------------------------------------
const ABOUT_GOALSTORY_RESOURCE_URI = `file:///docs/about-goalstory.md`;

// List available resources
server.resource(
  "About Goal Story",
  ABOUT_GOALSTORY_RESOURCE_URI,
  async (uri) => ({
    contents: [
      {
        uri: uri.href,
        text: ABOUT_GOAL_STORYING,
      },
    ],
  }),
);

// -----------------------------------------
// PROMPTS
// -----------------------------------------

server.prompt(PROMPTS.CLARIFY, {}, () => ({
  messages: CLARIFY_MESSAGES,
}));

server.prompt(PROMPTS.FORMULATE, {}, () => ({
  messages: FOMRULATE_MESSAGES,
}));

server.prompt(PROMPTS.CONTEXT, {}, () => ({
  messages: CONTEXT_MESSAGES,
}));

server.prompt(PROMPTS.DISCUSS, {}, () => ({
  messages: DISCUSS_MESSAGES,
}));

server.prompt(PROMPTS.CAPTURE, {}, () => ({
  messages: CAPTURE_MESSAGES,
}));

server.prompt(PROMPTS.VISUALIZE, {}, () => ({
  messages: VISUALIZE_MESSAGES,
}));

server.prompt(PROMPTS.MANAGE, {}, () => ({
  messages: MANAGE_MESSAGES,
}));

// -----------------------------------------
// Running the server
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
