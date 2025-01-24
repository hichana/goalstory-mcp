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
  // ---------- Users ----------
  GoalstoryAboutInput,
  GoalstoryReadSelfUserInput,
  GoalstoryUpdateSelfUserInput,

  // ---------- Goals ----------
  GoalstoryCountGoalsInput,
  GoalstoryCreateGoalInput,
  GoalstoryUpdateGoalInput,
  GoalstoryDestroyGoalInput,
  GoalstoryReadOneGoalInput,
  GoalstoryReadGoalsInput,

  // ---------- Steps ----------
  GoalstoryCreateStepsInput,
  GoalstoryReadStepsInput,
  GoalstoryReadOneStepInput,
  GoalstoryUpdateStepInput,
  GoalstoryDestroyStepInput,

  // ---------- Stories ----------
  GoalstoryCreateStoryInput,
  GoalstoryReadStoriesInput,
  GoalstoryReadOneStoryInput,

  // ---------- Current/Context ----------
  GoalstoryReadCurrentFocusInput,
  GoalstoryGetStoryContextInput,
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
 * Body => { name: string; description?: string; story_mode?: string; belief_mode?: string; }
 */
const CREATE_GOAL_TOOL: Tool = {
  name: "goalstory_create_goal",
  description:
    "Create a new Goal (POST /goals). 'name' is required. 'description', 'story_mode', and 'belief_mode' are optional.",
  inputSchema: {
    type: "object",
    properties: {
      name: {
        type: "string",
        description: "Name/title of the new goal. (Required)",
      },
      description: {
        type: "string",
        description: "Optional descriptive text for the new goal.",
      },
      story_mode: {
        type: "string",
        description:
          "Mode that shapes how stories/narratives for this goal are generated (optional).",
      },
      belief_mode: {
        type: "string",
        description:
          "Mode describing how the user's beliefs shape this goal (optional).",
      },
    },
    required: ["name"],
  },
};

/**
 * PATCH /goals/:id
 * Body => {
 *   id: string;
 *   name?: string;
 *   status?: number; // 0=Pending, 1=Complete
 *   description?: string;
 *   outcome?: string;
 *   evidence?: string;
 *   story_mode?: string;
 *   belief_mode?: string;
 * }
 */
const UPDATE_GOAL_TOOL: Tool = {
  name: "goalstory_update_goal",
  description:
    "Update an existing goal (PATCH /goals/:id). The ID is required. Other fields are optional (e.g., name, status, description, outcome, evidence, story_mode, belief_mode).",
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
      outcome: {
        type: "string",
        description:
          "Outcome the user experienced upon completing or progressing. (Optional)",
      },
      evidence: {
        type: "string",
        description: "Evidence or proof of progress/achievement. (Optional)",
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
    "Get a list of all goals (GET /goals), optionally paginated with 'page' and 'limit'.",
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
 * GET /current
 * No args
 */
const READ_CURRENT_FOCUS_TOOL: Tool = {
  name: "goalstory_read_current_focus",
  description:
    "Retrieve the current goal-and-step focus (GET /current). No input needed.",
  inputSchema: {
    type: "object",
    properties: {},
  },
};

/**
 * GET /context
 * Query => { goalId: string; stepId: string; feedback?: string }
 */
const GET_STORY_CONTEXT_TOOL: Tool = {
  name: "goalstory_get_story_context",
  description:
    "Get story context for a specific goal and step (GET /context). 'goalId' and 'stepId' are required, 'feedback' is optional.",
  inputSchema: {
    type: "object",
    properties: {
      goalId: {
        type: "string",
        description: "The ID of the goal.",
      },
      stepId: {
        type: "string",
        description: "The ID of the step.",
      },
      feedback: {
        type: "string",
        description: "Optional user feedback for the context generation.",
      },
    },
    required: ["goalId", "stepId"],
  },
};

/**
 * POST /steps
 * Body => { goal_id: string; steps: string[] }
 */
const CREATE_STEPS_TOOL: Tool = {
  name: "goalstory_create_steps",
  description:
    "Create one or more steps for a specified goal (POST /steps). 'goal_id' and at least one step are required.",
  inputSchema: {
    type: "object",
    properties: {
      goal_id: {
        type: "string",
        description: "The ID of the goal to which these steps belong.",
      },
      steps: {
        type: "array",
        items: { type: "string" },
        description: "An array of step names to create.",
      },
    },
    required: ["goal_id", "steps"],
  },
};

/**
 * GET /steps
 * Query => { goal_id: string; page?: number; limit?: number }
 */
const READ_STEPS_TOOL: Tool = {
  name: "goalstory_read_steps",
  description:
    "Retrieve a paginated list of steps for a given goal (GET /steps). 'goal_id' is required.",
  inputSchema: {
    type: "object",
    properties: {
      goal_id: {
        type: "string",
        description: "The ID of the goal whose steps we want to read.",
      },
      page: {
        type: "number",
        description: "Page number for pagination (optional).",
      },
      limit: {
        type: "number",
        description: "Number of steps returned per page (optional).",
      },
    },
    required: ["goal_id"],
  },
};

/**
 * GET /steps/:id
 * Args => { id: string }
 */
const READ_ONE_STEP_TOOL: Tool = {
  name: "goalstory_read_one_step",
  description:
    "Retrieve data for a single step (GET /steps/:id). 'id' is required.",
  inputSchema: {
    type: "object",
    properties: {
      id: {
        type: "string",
        description: "The ID of the step to retrieve.",
      },
    },
    required: ["id"],
  },
};

/**
 * PATCH /steps/:id
 * Body => { id: string; name?: string; status?: number; outcome?: string; evidence?: string; notes?: string; }
 */
const UPDATE_STEP_TOOL: Tool = {
  name: "goalstory_update_step",
  description:
    "Update an existing step (PATCH /steps/:id). The 'id' is required. Other fields are optional.",
  inputSchema: {
    type: "object",
    properties: {
      id: {
        type: "string",
        description: "The ID of the step to update. (Required)",
      },
      name: {
        type: "string",
        description: "Updated name/title of the step. (Optional)",
      },
      status: {
        type: "number",
        description:
          "Updated status of the step (0 = pending, 1 = complete). (Optional)",
      },
      outcome: {
        type: "string",
        description: "Outcome for this step. (Optional)",
      },
      evidence: {
        type: "string",
        description: "Evidence or proof for this step. (Optional)",
      },
      notes: {
        type: "string",
        description: "Notes for the step. (Optional)",
      },
    },
    required: ["id"],
  },
};

/**
 * DELETE /steps/:id
 * Args => { id: string }
 */
const DESTROY_STEP_TOOL: Tool = {
  name: "goalstory_destroy_step",
  description:
    "Delete a single step (DELETE /steps/:id). The 'id' is required.",
  inputSchema: {
    type: "object",
    properties: {
      id: {
        type: "string",
        description: "The ID of the step to delete.",
      },
    },
    required: ["id"],
  },
};

/**
 * POST /stories
 * Body => { goal_id: string; step_id: string; title?: string; story_text: string; }
 */
const CREATE_STORY_TOOL: Tool = {
  name: "goalstory_create_story",
  description:
    "Create a new story (POST /stories). 'goal_id', 'step_id', and 'story_text' are required. 'title' is optional.",
  inputSchema: {
    type: "object",
    properties: {
      goal_id: {
        type: "string",
        description: "ID of the goal associated with this story. (Required)",
      },
      step_id: {
        type: "string",
        description: "ID of the step associated with this story. (Required)",
      },
      title: {
        type: "string",
        description: "Optional title for this story.",
      },
      story_text: {
        type: "string",
        description: "The actual text or content of the story. (Required)",
      },
    },
    required: ["goal_id", "step_id", "story_text"],
  },
};

/**
 * GET /stories
 * Query => { goal_id: string; step_id: string; page?: number; limit?: number }
 */
const READ_STORIES_TOOL: Tool = {
  name: "goalstory_read_stories",
  description:
    "Get a paginated list of stories for a given goal/step (GET /stories). 'goal_id' and 'step_id' are required, pagination is optional.",
  inputSchema: {
    type: "object",
    properties: {
      goal_id: {
        type: "string",
        description: "ID of the goal whose stories we want.",
      },
      step_id: {
        type: "string",
        description: "ID of the step whose stories we want.",
      },
      page: {
        type: "number",
        description: "Page number for pagination (optional).",
      },
      limit: {
        type: "number",
        description: "Number of stories per page (optional).",
      },
    },
    required: ["goal_id", "step_id"],
  },
};

/**
 * GET /stories/:id
 * Args => { id: string }
 */
const READ_ONE_STORY_TOOL: Tool = {
  name: "goalstory_read_one_story",
  description:
    "Retrieve data for a single story (GET /stories/:id). 'id' is required.",
  inputSchema: {
    type: "object",
    properties: {
      id: {
        type: "string",
        description: "The ID of the story to retrieve. (Required)",
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
    name: "goalstory-mcp-server",
    version: "1.0.0",
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

    // CURRENT/CONTEXT
    READ_CURRENT_FOCUS_TOOL,
    GET_STORY_CONTEXT_TOOL,

    // STEPS
    CREATE_STEPS_TOOL,
    READ_STEPS_TOOL,
    READ_ONE_STEP_TOOL,
    UPDATE_STEP_TOOL,
    DESTROY_STEP_TOOL,

    // STORIES
    CREATE_STORY_TOOL,
    READ_STORIES_TOOL,
    READ_ONE_STORY_TOOL,
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
          ...(args.description ? { description: args.description } : {}),
          ...(args.story_mode ? { story_mode: args.story_mode } : {}),
          ...(args.belief_mode ? { belief_mode: args.belief_mode } : {}),
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
        // PATCH /goals/:id
        const url = `${GOALSTORY_API_BASE_URL}/goals/${args.id}`;
        const body = {
          id: args.id,
          ...(args.name ? { name: args.name } : {}),
          ...(typeof args.status === "number" ? { status: args.status } : {}),
          ...(args.description ? { description: args.description } : {}),
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

      // ---------- CURRENT/CONTEXT ----------
      case "goalstory_read_current_focus": {
        const args = rawArgs as GoalstoryReadCurrentFocusInput;
        const url = `${GOALSTORY_API_BASE_URL}/current`;
        const result = await doRequest(url, "GET");
        return {
          content: [
            {
              type: "text",
              text: `Current goal/step focus:\n${JSON.stringify(
                result,
                null,
                2
              )}`,
            },
          ],
          isError: false,
        };
      }
      case "goalstory_get_story_context": {
        const args = rawArgs as unknown as GoalstoryGetStoryContextInput;
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
      }

      // ---------- STEPS ----------
      case "goalstory_create_steps": {
        const args = rawArgs as unknown as GoalstoryCreateStepsInput;
        const url = `${GOALSTORY_API_BASE_URL}/steps`;

        // when developing locally, we can pass in a list of strings in the MCP
        // inspector like this: step1, step2
        let steps = args.steps;
        if (typeof steps === "string") {
          const itemsAreAString = steps as string;
          steps = itemsAreAString.split(",");
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
              text: `Steps created:\n${JSON.stringify(result, null, 2)}`,
            },
          ],
          isError: false,
        };
      }
      case "goalstory_read_steps": {
        const args = rawArgs as unknown as GoalstoryReadStepsInput;
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
                2
              )}`,
            },
          ],
          isError: false,
        };
      }
      case "goalstory_read_one_step": {
        const args = rawArgs as unknown as GoalstoryReadOneStepInput;
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
      }
      case "goalstory_update_step": {
        const args = rawArgs as unknown as GoalstoryUpdateStepInput;
        const url = `${GOALSTORY_API_BASE_URL}/steps/${args.id}`;
        const body = {
          id: args.id,
          ...(args.name ? { name: args.name } : {}),
          ...(typeof args.status === "number" ? { status: args.status } : {}),
          ...(args.outcome ? { outcome: args.outcome } : {}),
          ...(args.evidence ? { evidence: args.evidence } : {}),
          ...(args.notes ? { notes: args.notes } : {}),
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
      case "goalstory_destroy_step": {
        const args = rawArgs as unknown as GoalstoryDestroyStepInput;
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
      }

      // ---------- STORIES ----------
      case "goalstory_create_story": {
        const args = rawArgs as unknown as GoalstoryCreateStoryInput;
        const url = `${GOALSTORY_API_BASE_URL}/stories`;
        const body = {
          goal_id: args.goal_id,
          step_id: args.step_id,
          ...(args.title ? { title: args.title } : {}),
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
      case "goalstory_read_stories": {
        const args = rawArgs as unknown as GoalstoryReadStoriesInput;
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
      }
      case "goalstory_read_one_story": {
        const args = rawArgs as unknown as GoalstoryReadOneStoryInput;
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
