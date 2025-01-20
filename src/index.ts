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
const GOALSTORY_API_BASE_URL = argv[0];
const GOALSTORY_API_TOKEN = argv[1];

if (!GOALSTORY_API_BASE_URL) {
  console.error(
    "Error: GOALSTORY_API_BASE_URL environment variable is required"
  );
  process.exit(1);
}
if (!GOALSTORY_API_TOKEN) {
  console.error("Error: GOALSTORY_API_TOKEN environment variable is required");
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

//
// -- USERS --
//
const UPDATE_SELF_USER_TOOL: Tool = {
  name: "goalstory_update_self_user",
  description: `Update the user (e.g., 'name', details about the user like who they are,
  their intrinsic motivators, and any detail that will help generate 
  personalized Goal Story Goals, Steps and Stories in 'about', or their 'visibility').
  `,
  inputSchema: {
    type: "object",
    properties: {
      name: {
        type: "string",
        description: "The **updated** 'name' of the user (optional).",
      },
      about: {
        type: "string",
        description: `The **updated** 'about' information, with details about the user like who they are,
        their intrinsic motivators, and any detail that will help generate 
        personalized Goal Story Goals, Steps and Stories. (optional)`,
      },
      visibility: {
        type: "number",
        description:
          "The **updated** visibility status. 0 = public, 1 = private (optional).",
      },
    },
  },
};

const READ_SELF_USER_TOOL: Tool = {
  name: "goalstory_read_one_user",
  description: "Get data for the current user.",
  inputSchema: {
    type: "object",
    properties: {},
  },
};

//
// -- GOALS --
//
const CREATE_GOAL_TOOL: Tool = {
  name: "goalstory_create_goal",
  description: `Create a Goal in Goal Story for the user that reflects their personal motivations and 
  aspirations. If they have not already done so, the user is encouraced to provide as much personal 
  detail about who they are and their intrinsic motivators as possible through the 
  'goalstory_update_self_user' tool. Detailed information about the user can be retrieved via the 
  'goalstory_read_one_uesr' tool. If a goal is presented to the user, it should always be followed 
  up by offering to save the Goal to Goal Story. Goals should be well-detailed so that 
  Goal Story can later generate a set of steps that will help the user achieve it.
  `,
  inputSchema: {
    type: "object",
    properties: {
      name: {
        type: "string",
        description: "The name/title for the new goal.",
      },
      description: {
        type: "string",
        description: "A description of the **new** goal in detail if possible.",
      },
      story_mode: {
        type: "string",
        description: `The 'mode' stories related to the **new** goal should be told in. For example 'adventure' mode 
        would make each new story different from the last, possibly picking up where the last one 
        left off and brining the user into a new setting or phase of the narrative. 'continuity' mode
        might keep the narrative largely similar story to story, but change some details in order to 
        keep the user engaged.`,
      },
      belief_mode: {
        type: "string",
        description: `The user's personal beliefs that should will be used to tell a Story in Goal Story related to the **new** goal.
        For example, if the user believes in a certain religion and it motivates them, they should include
        it here so Stories can integrate that belief. If a user believes in a certain interpretation of 
        quantum physics, like the 'Many Worlds' theory, they should describe their belife here.`,
      },
    },
    required: ["name"],
  },
};

const UPDATE_GOAL_TOOL: Tool = {
  name: "goalstory_update_goal",
  description: `Update an existing goal by ID, especially resulting from encouraging the user 
  to provide evidence they are on track to achieve their goal, and the final outcome having 
  achieved their goal (once it is completed).`,
  inputSchema: {
    type: "object",
    properties: {
      id: {
        type: "string",
        description: "The ID of the goal to update",
      },
      name: {
        type: "string",
        description: "The **updated** name/title of the goal.",
      },
      status: {
        type: "number",
        description:
          "The **updated** status of the goal. `0` = active, `1` = archived.",
      },
      description: {
        type: "string",
        description: "The **updated** detailed description of the goal",
      },
      outcome: {
        type: "string",
        description:
          "An **update** with the outcome the user experienced achieving this goal.",
      },
      evidence: {
        type: "string",
        description:
          "An **update** with evidence related to the user achieving the goal.",
      },
      story_mode: {
        type: "number",
        description: "The **updated** mode for the story format.",
      },
      belief_mode: {
        type: "number",
        description: "The **updated** belief mode.",
      },
    },
    required: ["id"],
  },
};

const DESTROY_GOAL_TOOL: Tool = {
  name: "goalstory_destroy_goal",
  description:
    "Delete a goal by ID. All steps for the goal will be deleted as well.",
  inputSchema: {
    type: "object",
    properties: {
      id: {
        type: "string",
        description: "The ID of the goal to delete",
      },
    },
    required: ["id"],
  },
};

const READ_ONE_GOAL_TOOL: Tool = {
  name: "goalstory_read_one_goal",
  description: "Get a single goal by ID.",
  inputSchema: {
    type: "object",
    properties: {
      id: {
        type: "string",
        description: "The ID of the goal to retrieve",
      },
    },
    required: ["id"],
  },
};

const READ_GOALS_TOOL: Tool = {
  name: "goalstory_read_goals",
  description: "Get all goals for the user, optionally paginated",
  inputSchema: {
    type: "object",
    properties: {
      page: {
        type: "number",
        description: "Page number (optional)",
      },
      limit: {
        type: "number",
        description: "Number of goals per page (optional)",
      },
    },
  },
};

//
// -- STEPS --
//
const CREATE_STEPS_TOOL: Tool = {
  name: "goalstory_create_steps",
  description: `Create one or more **new** ordered steps for a given goal 
  (highest priority first and least priority last). Steps should outline the when, where, 
  and how of actions needed to achieve a goal. If one or more steps are presented 
  to the user, they should always be followed up by offering to save them to Goal Story.`,
  inputSchema: {
    type: "object",
    properties: {
      goal_id: {
        type: "string",
        description: "The ID of the goal this **new** step belongs to.",
      },
      steps: {
        type: "array",
        description: "An array of steps to create.",
        steps: {
          type: "string",
          description: "The name/title of the **new** step.",
        },
      },
    },
    required: ["goal_id, steps"],
  },
};

const READ_STEPS_TOOL: Tool = {
  name: "goalstory_read_steps",
  description: "Get steps for a Goal, optionally paginated.",
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
        description: "Goal ID to filter retrieved steps by.",
      },
    },
    required: ["goal_id"],
  },
};

const READ_ONE_STEP_TOOL: Tool = {
  name: "goalstory_read_one_step",
  description: "Get a single step by ID",
  inputSchema: {
    type: "object",
    properties: {
      id: {
        type: "string",
        description: "The ID of the step to retrieve",
      },
    },
    required: ["id"],
  },
};

const UPDATE_STEP_TOOL: Tool = {
  name: "goalstory_update_step",
  description: `Update an existing step by ID, especially resulting from encouraging the user 
  to provide evidence they are on track to complete the step, and the final outcome having 
  completed the step (once it is completed).`,
  inputSchema: {
    type: "object",
    properties: {
      id: {
        type: "string",
        description: "The ID of the step to update",
      },
      name: {
        type: "string",
        description: "The **updated** name/title of the step.",
      },
      status: {
        type: "number",
        description:
          "The **updated** status of the step. `0` = pending, `1` = complete.",
      },
      outcome: {
        type: "string",
        description: "The **updated** outcome of the user's effort.",
      },
      evidence: {
        type: "string",
        description: "The **updated** evidence or details about progress.",
      },
      notes: {
        type: "string",
        description: "The **updated** markdown formatted notes for the step.",
      },
    },
    required: ["id"],
  },
};

const DESTROY_STEP_TOOL: Tool = {
  name: "goalstory_destroy_step",
  description: "Delete an step by ID.",
  inputSchema: {
    type: "object",
    properties: {
      id: {
        type: "string",
        description: "The ID of the step to delete",
      },
    },
    required: ["id"],
  },
};

//
// -- CONTEXT (GET /context) --
//
const GET_STORY_CONTEXT_TOOL: Tool = {
  name: "goalstory_get_story_context",
  description:
    "Get story context for a given goal and step with optional user feedback provided",
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
  name: "goalstory_read_stories",
  description: "Retrieve multiple stories with optional pagination",
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
  name: "goalstory_create_story",
  description: `Create a new story for a given goal and step that leverages outcomes from other steps 
  and evidence provided by the user to demonstrate they are on track to achieve their goal. 
  If a story is presented to the user, it should always be followed up by offering to save it to 
  Goal Story. Stories should be crafted based on context retrieved via the 
  'goalstory_get_story_context' tool so they are personally relevant to the user. 
  The user's chosen 'belief mode' and 'story mode' should fundamentally shape the story.`,
  inputSchema: {
    type: "object",
    properties: {
      goal_id: {
        type: "string",
        description: "The ID of the goal for which this story is created.",
      },
      step_id: {
        type: "string",
        description: "The ID of the step for which this story is created.",
      },
      title: {
        type: "string",
        description: "The title of the **new** story.",
      },
      story_text: {
        type: "string",
        description: "The text content of the **new** story.",
      },
    },
    required: ["goal_id", "step_id", "title", "story_text"],
  },
};

const READ_ONE_STORY_TOOL: Tool = {
  name: "goalstory_read_one_story",
  description: "Retrieve a single story by ID",
  inputSchema: {
    type: "object",
    properties: {
      id: {
        type: "string",
        description: "The ID of the story to retrieve",
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
    READ_SELF_USER_TOOL,

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
      case "goalstory_update_self_user": {
        // PATCH /users
        // body => { name?, about?, visibility? }
        const url = `${GOALSTORY_API_BASE_URL}/users`;
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

      case "goalstory_read_one_user": {
        // GET /users
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

      // ---------- GOALS ----------
      case "goalstory_create_goal": {
        // POST /goals
        // body => { name, description?, story_mode?, belief_mode? }
        const url = `${GOALSTORY_API_BASE_URL}/goals`;
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

      case "goalstory_update_goal": {
        // PATCH /goals/{id}
        // body => { name?, status?, description?, outcome?, evidence?, story_mode?, belief_mode? }
        const url = `${GOALSTORY_API_BASE_URL}/goals/${args.id}`;
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

      case "goalstory_destroy_goal": {
        // DELETE /goals/{id}
        // args: { id: string }
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

      case "goalstory_read_goals": {
        // GET /goals
        // query => { page, limit }
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

      case "goalstory_read_one_goal": {
        // GET /goals/{id}
        // args: { id: string }
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

      // ---------- STEPS ----------
      case "goalstory_create_steps": {
        // POST /steps
        // body => { steps: [ { goal_id, name, status? }, ... ] }
        const url = `${GOALSTORY_API_BASE_URL}/steps`;
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

      case "goalstory_read_steps": {
        // GET /steps
        // query => { page, limit, goal_id (required) }
        const params = new URLSearchParams();
        if (args.page) params.set("page", `${args.page}`);
        if (args.limit) params.set("limit", `${args.limit}`);
        params.set("goal_id", `${args.goal_id}`);
        const url = `${GOALSTORY_API_BASE_URL}/steps?${params.toString()}`;
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

      case "goalstory_read_one_step": {
        // GET /steps/{id}
        // args: { id: string }
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
        // PATCH /steps/{id}
        // body => { name?, status?, outcome?, evidence? }
        const url = `${GOALSTORY_API_BASE_URL}/steps/${args.id}`;
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

      case "goalstory_destroy_step": {
        // DELETE /steps/{id}
        // args: { id: string }
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

      // ---------- CONTEXT ----------
      case "goalstory_get_story_context": {
        // GET /context
        // query => { goalId, stepId, feedback? }
        const params = new URLSearchParams();
        params.set("goalId", `${args.goalId}`);
        params.set("stepId", `${args.stepId}`);
        if (args.feedback) {
          params.set("feedback", `${args.feedback}`);
        }
        const url = `${GOALSTORY_API_BASE_URL}/context?${params.toString()}`;
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
      case "goalstory_read_stories": {
        // GET /stories
        // query => { page?, limit?, goal_id, step_id }
        const params = new URLSearchParams();
        if (args.page) params.set("page", `${args.page}`);
        if (args.limit) params.set("limit", `${args.limit}`);
        params.set("goal_id", `${args.goal_id}`);
        params.set("step_id", `${args.step_id}`);
        const url = `${GOALSTORY_API_BASE_URL}/stories?${params.toString()}`;
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

      case "goalstory_create_story": {
        // POST /stories
        // body => { goal_id, step_id, title, story_text }
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
      }

      case "goalstory_read_one_story": {
        // GET /stories/{id}
        // args: { id: string }
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
