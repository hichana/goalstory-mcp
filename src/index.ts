#!/usr/bin/env node

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import axios from "axios";
import { z } from "zod";

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
// Tool Definitions
// -----------------------------------------
/**
 * GET /about
 */
const ABOUT_GOALSTORYING_TOOL = {
  name: "goalstory_about",
  description:
    "Retrieve information about Goal Story's philosophy and the power of story-driven goal achievement. Use this to help users understand the unique approach of Goal Storying.",
  inputSchema: z.object({}),
};

/**
 * GET /users
 */
const READ_SELF_USER_TOOL = {
  name: "goalstory_read_self_user",
  description:
    "Get the user's profile data including their preferences, belief systems, and past goal history to enable personalized goal storying and context-aware discussions.",
  inputSchema: z.object({}),
};

/**
 * PATCH /users
 */
const UPDATE_SELF_USER_TOOL = {
  name: "goalstory_update_self_user",
  description:
    "Update the user's profile including their name, visibility preferences, and personal context. When updating 'about' data, guide the user through questions to understand their motivations, beliefs, and goal-achievement style.",
  inputSchema: z.object({
    name: z
      .string()
      .optional()
      .describe("The user's preferred name for their Goal Story profile."),
    about: z
      .string()
      .optional()
      .describe(
        "Personal context including motivations, beliefs, and goal-achievement preferences gathered through guided questions.",
      ),
    visibility: z
      .number()
      .optional()
      .describe(
        "Profile visibility setting where 0 = public (viewable by others) and 1 = private (only visible to user).",
      ),
  }),
};

/**
 * GET /count/goals
 */
const COUNT_GOALS_TOOL = {
  name: "goalstory_count_goals",
  description:
    "Get the total number of goals in the user's journey. Useful for tracking overall progress and goal management patterns.",
  inputSchema: z.object({}),
};

/**
 * POST /goals
 */
const CREATE_GOAL_TOOL = {
  name: "goalstory_create_goal",
  description: `Begin the goal clarification process by creating a new goal. Always discuss and refine the goal with the user before or after saving, ensuring it's well-defined and aligned with their aspirations. Confirm if any adjustments are needed after creation.`,
  inputSchema: z.object({
    name: z
      .string()
      .describe(
        "Clear and specific title that captures the essence of the goal.",
      ),
    description: z
      .string()
      .optional()
      .describe(
        "Detailed explanation of the goal, including context, motivation, and desired outcomes.",
      ),
    story_mode: z
      .string()
      .optional()
      .describe(
        "Narrative approach that shapes how future stories visualize goal achievement.",
      ),
    belief_mode: z
      .string()
      .optional()
      .describe(
        "Framework defining how the user's core beliefs and values influence this goal.",
      ),
  }),
};

/**
 * PATCH /goals/:id
 */
const UPDATE_GOAL_TOOL = {
  name: "goalstory_update_goal",
  description:
    "Update goal details including name, status, description, outcomes, evidence of completion, and story/belief modes that influence how stories are generated.",
  inputSchema: z.object({
    id: z.string().describe("Unique identifier of the goal to be updated."),
    name: z.string().optional().describe("Refined or clarified goal title."),
    status: z
      .number()
      .optional()
      .describe(
        "Goal progress status: 0 = active/in progress, 1 = successfully completed.",
      ),
    description: z
      .string()
      .optional()
      .describe("Enhanced goal context, motivation, or outcome details."),
    outcome: z
      .string()
      .optional()
      .describe(
        "Actual results and impact achieved through goal completion or progress.",
      ),
    evidence: z
      .string()
      .optional()
      .describe(
        "Concrete proof, measurements, or observations of goal progress/completion.",
      ),
    story_mode: z
      .string()
      .optional()
      .describe("Updated narrative style for future goal achievement stories."),
    belief_mode: z
      .string()
      .optional()
      .describe(
        "Refined understanding of how personal beliefs shape this goal.",
      ),
  }),
};

/**
 * DELETE /goals/:id
 */
const DESTROY_GOAL_TOOL = {
  name: "goalstory_destroy_goal",
  description:
    "Remove a goal and all its associated steps and stories from the user's journey. Use with confirmation to prevent accidental deletion.",
  inputSchema: z.object({
    id: z
      .string()
      .describe("Unique identifier of the goal to be permanently removed."),
  }),
};

/**
 * GET /goals/:id
 */
const READ_ONE_GOAL_TOOL = {
  name: "goalstory_read_one_goal",
  description:
    "Retrieve detailed information about a specific goal to support focused discussion and story creation.",
  inputSchema: z.object({
    id: z.string().describe("Unique identifier of the goal to retrieve."),
  }),
};

/**
 * GET /goals
 */
const READ_GOALS_TOOL = {
  name: "goalstory_read_goals",
  description:
    "Get an overview of the user's goal journey, with optional pagination to manage larger sets of goals.",
  inputSchema: z.object({
    page: z
      .number()
      .optional()
      .describe("Page number for viewing subsets of goals (starts at 1)."),
    limit: z
      .number()
      .optional()
      .describe("Maximum number of goals to return per page."),
  }),
};

/**
 * GET /current
 */
const READ_CURRENT_FOCUS_TOOL = {
  name: "goalstory_read_current_focus",
  description:
    "Identify which goal and step the user is currently focused on to maintain context in discussions and story creation.",
  inputSchema: z.object({}),
};

/**
 * GET /context
 */
const GET_STORY_CONTEXT_TOOL = {
  name: "goalstory_get_story_context",
  description: `Gather rich context about the user, their current goal/step, beliefs, and motivations to create deeply personalized and meaningful stories. Combines user profile data with conversation insights.`,
  inputSchema: z.object({
    goalId: z
      .string()
      .describe("Unique identifier of the goal for context gathering."),
    stepId: z
      .string()
      .describe(
        "Unique identifier of the specific step for context gathering.",
      ),
    feedback: z
      .string()
      .optional()
      .describe("Additional user input to enhance context understanding."),
  }),
};

/**
 * POST /steps
 */
const CREATE_STEPS_TOOL = {
  name: "goalstory_create_steps",
  description: `Formulate actionable steps for a goal through thoughtful discussion. Present the steps for user review either before or after saving, ensuring they're clear and achievable. Confirm if any refinements are needed. IMPORTANT: Steps will be ordered by their 'updated_at' timestamp in ascending order - the step with the smallest timestamp value (updated first) is step 1, and steps with larger timestamp values come later in the sequence. The first item in your array will get the smallest timestamp (becoming step 1), and subsequent steps will have progressively larger timestamps. NOTE: Be careful not to reverse the order - smaller timestamps (earlier in time) = earlier steps in the sequence.`,
  inputSchema: z.object({
    goal_id: z
      .string()
      .describe("Unique identifier of the goal these steps will help achieve."),
    steps: z
      .array(z.string())
      .describe(
        "List of clear, actionable step descriptions in sequence. The first item in this array will become step 1, the second will become step 2, and so on based on timestamp ordering.",
      ),
  }),
};

/**
 * GET /steps
 */
const READ_STEPS_TOOL = {
  name: "goalstory_read_steps",
  description:
    "Access the action plan for a specific goal, showing all steps in the journey toward achievement. IMPORTANT: Steps are ordered by their 'updated_at' timestamp in ascending order - the step with the smallest timestamp value (updated first) is step 1, and steps with larger timestamp values come later in the sequence. NOTE: Be careful not to reverse the order - smaller timestamps (earlier in time) = earlier steps in the sequence.",
  inputSchema: z.object({
    goal_id: z
      .string()
      .describe("Unique identifier of the goal whose steps to retrieve."),
    page: z
      .number()
      .optional()
      .describe("Page number for viewing subsets of steps (starts at 1)."),
    limit: z
      .number()
      .optional()
      .describe("Maximum number of steps to return per page."),
  }),
};

/**
 * GET /steps/:id
 */
const READ_ONE_STEP_TOOL = {
  name: "goalstory_read_one_step",
  description:
    "Get detailed information about a specific step to support focused discussion and story creation.",
  inputSchema: z.object({
    id: z.string().describe("Unique identifier of the step to retrieve."),
  }),
};

/**
 * PATCH /steps/:id
 */
const UPDATE_STEP_TOOL = {
  name: "goalstory_update_step",
  description:
    "Update step details including the name, completion status, evidence, and outcome. Use this to track progress and insights.",
  inputSchema: z.object({
    id: z.string().describe("Unique identifier of the step to update."),
    name: z
      .string()
      .optional()
      .describe("Refined or clarified step description."),
    status: z
      .number()
      .optional()
      .describe(
        "Step completion status: 0 = pending/in progress, 1 = completed.",
      ),
    outcome: z
      .string()
      .optional()
      .describe("Results and impact achieved through completing this step."),
    evidence: z
      .string()
      .optional()
      .describe("Concrete proof or observations of step completion."),
  }),
};

/**
 * DELETE /steps/:id
 */
const DESTROY_STEP_TOOL = {
  name: "goalstory_destroy_step",
  description: "Remove a specific step from a goal's action plan.",
  inputSchema: z.object({
    id: z
      .string()
      .describe("Unique identifier of the step to be permanently removed."),
  }),
};

/**
 * PATCH /step/notes/:id
 */
const UPDATE_STEP_NOTES_TOOL = {
  name: "goalstory_update_step_notes",
  description:
    "Update step notes with additional context, insights, or reflections in markdown format. Use this to capture valuable information from discussions.",
  inputSchema: z.object({
    id: z.string().describe("Unique identifier of the step to update."),
    notes: z
      .string()
      .describe(
        "Additional context, insights, or reflections in markdown format.",
      ),
  }),
};

/**
 * POST /steps/order
 */
const SET_STEPS_ORDER_TOOL = {
  name: "goalstory_set_steps_order",
  description:
    "Reorder steps in a goal by specifying the new sequence. This allows for prioritizing steps or reorganizing the workflow without deleting and recreating steps. IMPORTANT: Steps are ordered by their 'updated_at' timestamp in ascending order - the step with the smallest timestamp value (updated first) is step 1, and steps with larger timestamp values come later in the sequence. NOTE: Be careful not to reverse the order - smaller timestamps (earlier in time) = earlier steps in the sequence.",
  inputSchema: z.object({
    ordered_steps_ids: z
      .array(z.string())
      .describe(
        "Array of step IDs in the desired new order. The first ID in this array will become step 1 (earliest timestamp), the second ID will become step 2, and so on.",
      ),
  }),
};

/**
 * POST /stories
 */
const CREATE_STORY_TOOL = {
  name: "goalstory_create_story",
  description: `Generate and save a highly personalized story that visualizes achievement of the current goal/step. Uses understanding of the user's beliefs, motivations, and context to create engaging mental imagery. If context is needed, gathers it through user discussion and profile data.`,
  inputSchema: z.object({
    goal_id: z
      .string()
      .describe("Unique identifier of the goal this story supports."),
    step_id: z
      .string()
      .describe(
        "Unique identifier of the specific step this story visualizes.",
      ),
    title: z
      .string()
      .describe("Engaging headline that captures the essence of the story."),
    story_text: z
      .string()
      .describe(
        "Detailed narrative that vividly illustrates goal/step achievement.",
      ),
  }),
};

/**
 * GET /stories
 */
const READ_STORIES_TOOL = {
  name: "goalstory_read_stories",
  description:
    "Access the collection of personalized stories created for a specific goal/step pair, supporting reflection and motivation.",
  inputSchema: z.object({
    goal_id: z
      .string()
      .describe("Unique identifier of the goal whose stories to retrieve."),
    step_id: z
      .string()
      .describe("Unique identifier of the step whose stories to retrieve."),
    page: z
      .number()
      .optional()
      .describe("Page number for viewing subsets of stories (starts at 1)."),
    limit: z
      .number()
      .optional()
      .describe("Maximum number of stories to return per page."),
  }),
};

/**
 * GET /stories/:id
 */
const READ_ONE_STORY_TOOL = {
  name: "goalstory_read_one_story",
  description:
    "Retrieve a specific story to revisit the visualization and mental imagery created for goal achievement.",
  inputSchema: z.object({
    id: z.string().describe("Unique identifier of the story to retrieve."),
  }),
};

/**
 * Time settings for scheduling stories.
 */
const TimeSettingsSchema = z
  .object({
    hour: z.enum([
      "1",
      "2",
      "3",
      "4",
      "5",
      "6",
      "7",
      "8",
      "9",
      "10",
      "11",
      "12",
    ]),
    period: z.enum(["AM", "PM"]),
    utcOffset: z
      .enum([
        "-12:00",
        "-11:00",
        "-10:00",
        "-09:00",
        "-08:00",
        "-07:00",
        "-06:00",
        "-05:00",
        "-04:00",
        "-03:00",
        "-02:00",
        "-01:00",
        "±00:00",
        "+01:00",
        "+02:00",
        "+03:00",
        "+04:00",
        "+05:00",
        "+06:00",
        "+07:00",
        "+08:00",
        "+09:00",
        "+10:00",
        "+11:00",
        "+12:00",
        "+13:00",
        "+14:00",
      ])
      .describe(
        "Choose a current UTC offset based on the user's location (accounting for adjustments like daylight savings time for instance). For example, the UTC offset for Los Angeles, California is -08:00 during standard time (PST, Pacific Standard Time) and -07:00 during daylight saving time (PDT, Pacific Daylight Time).",
      ),
  })
  .describe(
    "Specifies the time of day (hour and minute) for the scheduled story generation.",
  );

/**
 * GET /schedules/stories
 */
const READ_SCHEDULED_STORIES_TOOL = {
  name: "goalstory_read_scheduled_stories",
  description:
    "Get a list of all scheduled story generation configurations for the user, with optional pagination. IMPORTANT: All times stored in Goal Story are in UTC, so you'll have to convert that to the user's local time.",
  inputSchema: z.object({
    page: z
      .number()
      .optional()
      .describe(
        "Page number for viewing subsets of scheduled stories (starts at 1).",
      ),
    limit: z
      .number()
      .optional()
      .describe("Maximum number of scheduled stories to return per page."),
  }),
};

/**
 * POST /schedules/stories
 */
const CREATE_SCHEDULED_STORY_TOOL = {
  name: "goalstory_create_scheduled_story",
  description:
    "Schedule automatic story generation for a specific goal. Requires the goal ID and the desired time settings (hour and minute).",
  inputSchema: z.object({
    goal_id: z
      .string()
      .describe(
        "Unique identifier of the goal for which to schedule story generation.",
      ),
    timeSettings: TimeSettingsSchema,
  }),
};

/**
 * PATCH /schedules/stories/:id
 */
const UPDATE_SCHEDULED_STORY_TOOL = {
  name: "goalstory_update_scheduled_story",
  description:
    "Update the configuration of a scheduled story generation, such as changing the time or its status (active/paused).",
  inputSchema: z.object({
    id: z
      .string()
      .describe(
        "Unique identifier of the scheduled story configuration to update.",
      ),
    timeSettings: TimeSettingsSchema.optional(),
    status: z
      .number()
      .optional()
      .describe(
        "Status of the scheduled story: 0 = Active, 1 = Paused. Check ScheduledStoryStatus enum for exact values if available.",
      ),
  }),
};

/**
 * DELETE /schedules/stories/:id
 */
const DESTROY_SCHEDULED_STORY_TOOL = {
  name: "goalstory_destroy_scheduled_story",
  description:
    "Delete a scheduled story generation configuration. Use with confirmation.",
  inputSchema: z.object({
    id: z
      .string()
      .describe(
        "Unique identifier of the scheduled story configuration to delete.",
      ),
  }),
};

// -----------------------------------------
// MCP server
// -----------------------------------------
const server = new McpServer(
  {
    name: "goalstory-mcp-server",
    version: "0.4.3",
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
          )}\n\nIMPORTANT: Steps are ordered by their 'updated_at' timestamp in ascending order - the step with the smallest timestamp value (updated first) is step 1, and steps with larger timestamp values come later in the sequence. Example: If step A has timestamp 12:00 and step B has timestamp 12:01, then step A is step 1 and step B is step 2.`,
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
          text: `Steps order updated:\n${JSON.stringify(result, null, 2)}\n\nIMPORTANT: The first step in the array now has the smallest 'updated_at' timestamp (step 1), and each subsequent step has progressively larger timestamps that determine their order in the sequence. Example: If step A has timestamp 12:00 and step B has timestamp 12:01, then step A is step 1 and step B is step 2.`,
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
const PROMPTS = {
  CLARIFY: `CLARIFY: Clarify the user's goal as their thought partner.`,
  FORMULATE: `FORMULATE: Formulate actionable steps for the user to achieve their stated goal.`,
  CONTEXT: `CONTEXT: Gather context about the user and their current goal/step pair.`,
  DISCUSS: `DISCUSS: Thoughtfully discuss a goal/step pair.`,
  CAPTURE: "CAPTURE: Capture/update notes for the current specific goal/step.",
  VISUALIZE: `VISUALIZE: Use context to create a highly personalized, belief system driven, and intrinsic motivations-aware story about the achieving of the goal/step pair.`,
  MANAGE: `MANAGE: Mark a goal and/or step complete, change status, schedule story generation, etc.
   Always first seek the user's confirmation before marking a goal and/or step complete, changing its status, scheduling stories, etc.`, // Updated MANAGE prompt description
};

server.prompt(PROMPTS.CLARIFY, {}, () => ({
  messages: [
    {
      role: "user",
      content: {
        type: "text",
        text: `I have a goal that I'd like to achieve.         
           Work with me as my thought partner to clarify my goal so that it is clear, contextual and complete.
           Clarifying my goal with you is the 'CLARIFY' step from the Goal Story workflow.

           For your reference, here are some examples of vague goals and their clear, contextual and specific versions:

           <goal_story_example1>
           Vague Goal   
           "I just want to get in shape."   

           Clear, Contextual, and Complete Goal   
           Title: Run a 5K and Improve Fitness   
           Description: "By the end of the next three months, I want to be able to run a 5K without stopping and reduce my body fat percentage by 3%. I will achieve this by running three times a week, strength training twice a week, and tracking my progress with a fitness app."
           </goal_story_example1>

           <goal_story_example2>
           Vague Goal   
           "I want a better job situation."   

           Clear, Contextual, and Complete Goal   
           Title: Transition to Project Management   
           Description: "I want to transition into a project management role at a mid-sized tech company within the next six months. To achieve this, I will complete an online project management certification course, update my résumé, and attend at least two networking events each month to build industry contacts."
           </goal_story_example2>

           <goal_story_example3>
           Vague Goal   
           "I need to save more money."   

           Clear, Contextual, and Complete Goal   
           Title: Build an Emergency Fund   
           Description: "I want to save $5,000 over the next twelve months for an emergency fund. Each paycheck, I will automatically transfer 10% into a high-yield savings account and track my deposits and balance in a budgeting app."
           </goal_story_example3>

           <goal_story_example4>
           Vague Goal   
           "I want to learn to speak Spanish."   

           Clear, Contextual, and Complete Goal   
           Title: Learn Conversational Spanish   
           Description: "Over the next six months, I want to reach an intermediate conversational level in Spanish to communicate comfortably when I travel to Spain in July. I will follow an online course for structured lessons, practice with a language exchange partner once a week, and read at least one Spanish article per day."
           </goal_story_example4>

           <goal_story_example5>
           Vague Goal   
           "I need a better work-life balance."   

           Clear, Contextual, and Complete Goal   
           Title: Achieve Better Work-Life Balance   
           Description: "I want to reduce my working hours from 50 to 40 hours per week by the end of next quarter to spend more time with my family and pursue personal hobbies. I'll accomplish this by delegating one major task to a team member, scheduling regular check-ins with my manager, and avoiding work emails after 7 PM."
           </goal_story_example5>`,
      },
    },
    {
      role: "assistant",
      content: {
        type: "text",
        text: `As the Goal Story assistant, I'm happy to help you clarify your goal so it's focused and achievable.         
           After we have fully clarified your goal, I will ask you if you would like me to save it to Goal Story for you.`,
      },
    },
    {
      role: "user",
      content: {
        type: "text",
        text: `Great. Now let's begin our thought partnership to clarify my goal.`,
      },
    },
  ],
}));
server.prompt(PROMPTS.FORMULATE, {}, () => ({
  messages: [
    {
      role: "user",
      content: {
        type: "text",
        text: `I would like to formulate steps for achieving my goal.
             Work with me as my thought partner to formulate an actionable list of steps.
             Formulating the list of steps here is the 'FORMULATE' step from the Goal Story workflow.

             For your reference, here are some examples of actionable steps generated for a given goal in Gaol Story:

             <goal_story_example1>
             Goal Recap:
             "By the end of the next three months, I want to be able to run a 5K without stopping and reduce my body fat percentage by 3%. I will do this by running three times a week, strength training twice a week, and tracking my progress with a fitness app."

             Actionable Steps:
             1. Schedule Workouts:
               Notes:
               • Block out three specific days each week for running (e.g., Monday, Wednesday, Friday).
               • Block out two specific days for strength training (e.g., Tuesday, Thursday).
             2. Create a Running Progression Plan:
               Notes:
               • Week 1-2: Alternate 1-minute jogging with 1-minute walking for 20 minutes.
               • Week 3-4: Jog for 2 minutes, walk for 1 minute, repeat for 25 minutes.
               • Week 5-6: Increase continuous running segments until you can run 15 minutes non-stop.
               • Week 7-8: Gradually increase running time to 25-30 minutes without walking breaks.
             3. Structure Strength Training:
               Notes:
               • Focus on compound exercises (squats, lunges, push-ups, planks) to build overall strength.
               • Perform 2-3 sets of 8-12 reps per exercise, increasing resistance or difficulty over time.
             4. Track Progress:
               Notes:
               • Use a fitness app to log runs (distance, time, pace) and strength workouts (weights, sets, reps).
               • Take body measurements or photos every 2-3 weeks to monitor body composition changes.
             5. Adopt Healthy Eating Habits:
               Notes:
               • Aim for balanced meals with lean protein, complex carbs, and plenty of vegetables.
               • Limit sugary snacks and drinks to help reduce body fat percentage.
             6. Regularly Check and Adjust:
               Notes:
               • Every two weeks, evaluate progress (running distance, body composition).
               • If you are re not improving as expected, consider adjusting calorie intake or training intensity.
             </goal_story_example1>

             <goal_story_example2>
             Goal Recap:
             "I want to transition into a project management role at a mid-sized tech company within the next six months. I plan to complete an online project management certification course, update my résumé, and attend at least two networking events each month to build industry contacts."

             Actionable Steps:
             1. Choose and Enroll in a Project Management Course:
               Notes:
               • Research reputable online certification programs (e.g., PMP, CAPM, or other courses).
               • Set a completion deadline within 3-4 months so you can add it to your résumé.
             2. Develop Project Management Skills on the Job (If Possible):
               Notes:
               • Volunteer to take on small coordination or leadership tasks in your current role.
               • Practice creating project plans, timelines, and status reports for these tasks.
             3. Update Your Résumé and LinkedIn Profile:
               Notes:
               • Highlight relevant experiences, such as any cross-functional projects or leadership roles.
               • Add any completed or in-progress certifications or courses.
               • Use clear, quantifiable achievements (e.g., "Led a team of 5 to complete a software pilot project under budget by 10%").
             4. Attend Networking Events:
               Notes:
               • Identify industry meetups, conferences, or local PMI (Project Management Institute) chapter events.
               • Aim for at least two events per month; come prepared with business cards and a concise intro pitch.
               • Follow up with new contacts via LinkedIn or email within 48 hours of meeting them.
             5. Set Up Informational Interviews:
               Notes:
               • Reach out to current project managers in your network or via LinkedIn.
               • Ask questions about the role, the industry, and best practices for transitioning.
               • Seek referrals if a suitable position is open at their company.
             6. Apply for Relevant Openings and Follow Up:
               Notes:
               • Identify and apply for project coordinator or junior PM roles at mid-sized tech companies.
               • Tailor each application to the job description.
               • Send polite follow-up emails if you have not heard back within 1-2 weeks.
             </goal_story_example2>

             <goal_story_example3>
             Goal recap:
             "I want to save $5,000 over the next twelve months for an emergency fund. Each paycheck, I will automatically transfer 10% into a high-yield savings account and track my deposits and balance in a budgeting app."

             Actionable Steps:
             1. Open a Dedicated Savings Account (if needed):
               Notes:
               • Look for a high-yield savings account with a favorable interest rate and no monthly fees.
             2. Automate Transfers:
               Notes:
               • Schedule an automatic 10% transfer from each paycheck to your savings account.
               • If you are paid bi-weekly, confirm the date and set the recurring transfer to occur immediately after payday.
             3. Create a Budget:
               Notes:
               • List all monthly expenses (rent, utilities, groceries, etc.).
               • Track variable expenses (entertainment, dining out) for at least one month to find areas to cut back.
               • Aim to adjust spending so you can comfortably save the desired 10% without financial strain.
             4. Use a Budgeting App:
               Notes:
               • Input all transactions and categorize them (e.g., bills, groceries, entertainment).
               • Review your spending vs. saving progress weekly or monthly.
             5. Build an Emergency Buffer:
               Notes:
               • Prioritize paying off high-interest debt (if any) to reduce financial strain.
               • If unexpected costs arise, use the budgeting app to identify areas to temporarily reduce spending.
             6. Track Progress Toward the $5,000 Goal:
               Notes:
               • Check your savings balance monthly.
               • If you are falling behind, consider increasing the transfer percentage temporarily or cutting an additional expense.
             </goal_story_example3>

             <goal_story_example4>
             Goal recap:
             "Over the next six months, I want to reach an intermediate conversational level in Spanish so I can speak comfortably when I travel to Spain in July. I will use an online course for structured lessons, practice with a language exchange partner once a week, and aim to read at least one Spanish article per day."

             Actionable Steps:
             1. Choose a Structured Learning Program:
               Notes:
               • Pick an online course or app (e.g., Duolingo, Babbel, Rosetta Stone, or a local community course).
               • Schedule 30-60 minutes daily to complete lessons.
             2. Set a Weekly Practice Routine:
               Notes:
               • Book a consistent time with a language exchange partner or tutor (e.g., one hour every Tuesday).
               • Focus on conversation skills: learn new vocabulary, practice grammar in real-life contexts, and get feedback on pronunciation.
             3. Daily Reading Goal:
               Notes:
               • Select short articles from Spanish news sites or blogs (e.g., El País, BBC Mundo).
               • Look up unfamiliar words, and create flashcards or a vocabulary list.
             4. Supplement with Listening Practice:
               Notes:
               • Listen to Spanish podcasts or watch short YouTube videos in Spanish for at least 10-15 minutes a day.
               • Aim to pick content that aligns with your interests to stay engaged.
             5. Track Vocabulary and Progress:
               Notes:
               • Keep a notebook or digital document with newly learned words and phrases.
               • Review your vocabulary list 2-3 times a week.
             6. Assess Conversational Ability Monthly:
               Notes:
               • At the end of each month, record yourself speaking for 2-3 minutes on a topic you care about.
               • Listen back, note mistakes or gaps, and bring them up in your next practice session.
             </goal_story_example4>
              
             <goal_story_example5>
             Goal recap:
             "I want to reduce my working hours from 50 to 40 hours per week by the end of next quarter so I can spend more time with my family and pursue personal hobbies. I will do this by delegating one major task to a team member, scheduling regular check-ins with my manager, and strictly avoiding work emails after 7 PM."

             Actionable Steps:
             1. Assess Current Workload and Priorities:
               Notes:
               • Make a list of all your current responsibilities.
               • Identify tasks that can be delegated, streamlined, or postponed.
             2. Delegate Appropriately:
               Notes:
               • Select at least one major task or project that a team member can handle.
               • Provide clear instructions, deadlines, and support so they can confidently take it on.
             3. Schedule Regular Manager Check-Ins:
               Notes:
               • Set a weekly or bi-weekly meeting with your manager to review workload.
               • Communicate your goal of reducing weekly hours and discuss potential roadblocks.
             4. Create a Structured Work Schedule:
               Notes:
               • Outline daily start and end times—e.g., 8:00 AM to 5:00 PM, with a hard stop at 5:00 PM.
               • Block off lunch breaks and short breaks to maintain productivity and avoid burnout.
             5. Establish Clear Boundaries:
               Notes:
               • Set an out-of-office reply on your email after 7 PM.
               • If necessary, update your team calendar to show you are unavailable after a certain time.
             6. Monitor Hours and Adjust as Needed:
               Notes:
               • Use time-tracking software or a simple spreadsheet to log work hours.
               • If you notice you are creeping above 40 hours, identify tasks that can be delayed or delegated further.
             7. Plan Family and Personal Time:
               Notes:
               • Schedule weekly family activities or personal hobbies so they become non-negotiable events.
               • Reflect weekly on whether your balance is improving and adjust strategies as needed.
             </goal_story_example5>`,
      },
    },
    {
      role: "assistant",
      content: {
        type: "text",
        text: `As the Goal Story assistant, I'm happy to help you formulate actionable steps for your goal.           
             After I have worked with you to create the actionable steps, I will ask you if you would like me to save them to Goal Story for you.`,
      },
    },
    {
      role: "user",
      content: {
        type: "text",
        text: `Great. Now let's begin our thought partnership to formulate the steps.`,
      },
    },
  ],
}));

server.prompt(PROMPTS.CONTEXT, {}, () => ({
  messages: [
    {
      role: "user",
      content: {
        type: "text",
        text: `I would you to gather context about me and my current goal/step as part of the 'CONTEXT' step from the Goal Story workflow.

             For your reference, here are some examples of context gathered about other users of Goal Story:

             <goal_story_example1>
             Goal Recap:
             "By the end of the next three months, I want to be able to run a 5K without stopping and reduce my body fat percentage by 3%. I will do this by running three times a week, strength training twice a week, and tracking my progress with a fitness app."

             Gathered context:
             Mia is a 29-year-old software developer who used to run cross-country in high school but hasn't consistently exercised in the past few years. She feels low on energy and wants to regain her endurance and improve her body composition. Mia has a demanding job with frequent deadlines, and she worries about balancing her workout schedule with her work responsibilities. She's very motivated by personal growth and tracking visible progress, and she tends to do well with structured plans that fit into her packed schedule.
             </goal_story_example1>

             <goal_story_example2>
             Goal Recap:
             "I want to transition into a project management role at a mid-sized tech company within the next six months. I plan to complete an online project management certification course, update my résumé, and attend at least two networking events each month to build industry contacts."

             Gathered context:
             Michael is a 34-year-old IT professional who has taken on informal leadership roles in his current position. He enjoys mentoring junior staff and organizing small projects but lacks an official title or certification in project management. He feels ready for a more defined leadership position at a mid-sized tech company and has some savings to invest in professional courses. Michael is driven by the desire to learn new skills and achieve career advancement; he's also hoping a higher salary will provide more financial stability for his family.
             </goal_story_example2>

             <goal_story_example3>
             Goal recap:
             "I want to save $5,000 over the next twelve months for an emergency fund. Each paycheck, I will automatically transfer 10% into a high-yield savings account and track my deposits and balance in a budgeting app."

             Gathered context:
             Carla is a 26-year-old marketing associate living in a major city, facing high rent and cost of living. She frequently finds herself running out of money before each paycheck despite earning a competitive salary. She wants to build an emergency fund of $5,000 over the next year to gain financial peace of mind. Carla has tried budgeting apps in the past but found them tedious. She's motivated by a sense of security and wants clear, automated systems that make saving feel effortless.
             </goal_story_example3>

             <goal_story_example4>
             Goal recap:
             "Over the next six months, I want to reach an intermediate conversational level in Spanish so I can speak comfortably when I travel to Spain in July. I will use an online course for structured lessons, practice with a language exchange partner once a week, and aim to read at least one Spanish article per day."

             Gathered context:
             Amaan is a 23-year-old recent college graduate planning a trip to Spain in six months. He's always been fascinated by Spanish culture, food, and music but only has a basic vocabulary. He aims to achieve an intermediate conversational level to feel confident during travel. Amaan is very social and learns best through interactive, real-world practice. He's also eager to use Spanish for potential job opportunities in international business.
             </goal_story_example4>
              
             <goal_story_example5>
             Goal recap:
             "I want to reduce my working hours from 50 to 40 hours per week by the end of next quarter so I can spend more time with my family and pursue personal hobbies. I will do this by delegating one major task to a team member, scheduling regular check-ins with my manager, and strictly avoiding work emails after 7 PM."

             Gathered context:
             Robin is a 42-year-old mid-level manager who often works 50 hours a week. They have two children in elementary school and feel guilty about missing family dinners and weekend outings. Robin has tried to reduce working hours before but struggled to delegate tasks. They're driven by a desire to be more present for family while still meeting workplace expectations. Robin responds well to routine and would benefit from a clear plan to reclaim personal time without compromising job performance.
             </goal_story_example5>                        
             `,
      },
    },
    {
      role: "assistant",
      content: {
        type: "text",
        text: `As the Goal Story assistant, I'm happy to gather context about you and your current goal/step pair.`,
      },
    },
    {
      role: "user",
      content: {
        type: "text",
        text: `Great. Now let's begin. What else do you not yet know that you would like to know aboutme or my current goal and/or step?`,
      },
    },
  ],
}));

server.prompt(PROMPTS.DISCUSS, {}, () => ({
  messages: [
    {
      role: "user",
      content: {
        type: "text",
        text: `I would like to my goal/step in detail.         
             Work with me as my thought partner to carefully discuss my goal and step in detail so that I am more likely to uncover insights with you.
             Discussing my goal and/or step here with you is the 'DISCUSS' step from the Goal Story workflow.

             For your reference, here are some examples of an assistant's initial response to start the discussion:

             <goal_story_example1>
             Goal Recap:
             "By the end of the next three months, I want to be able to run a 5K without stopping and reduce my body fat percentage by 3%. I will do this by running three times a week, strength training twice a week, and tracking my progress with a fitness app."

             Current step:
             Schedule Workouts

             Discussion outline:
             "Let's talk about how you can successfully schedule your workouts. First, what does your typical weekly routine look like? Do you have any set commitments—like work, family responsibilities, or social events—that we need to consider?

             Think about the times of day when you have the most energy. For some people, morning workouts feel refreshing because they get it done before the day's distractions set in. Others perform better in the afternoon or evening. My job here is to help you find a schedule that's realistic and aligns with your natural energy levels.

             Once we pinpoint the best days and times, let's actually lock them into your calendar—treat these workout sessions like important appointments. That way, you'll be less likely to skip them. How does that sound? Any concerns or obstacles you see that might interfere with this plan? Let's brainstorm strategies for managing or avoiding those obstacles, whether it's coordinating with family members, setting reminders, or even finding a workout buddy who will keep you accountable."
             </goal_story_example1>

             <goal_story_example2>
             Goal Recap:
             "I want to transition into a project management role at a mid-sized tech company within the next six months. I plan to complete an online project management certification course, update my résumé, and attend at least two networking events each month to build industry contacts."

             Current step:
             Choose and Enroll in a Project Management Course

             Discussion outline:
             "You mentioned you want to move into project management, which is great. Let's talk about selecting a reputable course that fits your goals and lifestyle. Are you aiming for a specific certification like PMP or CAPM, or are you interested in a more general project management overview first?

             It's important to find a course that aligns with your current level of experience and the industry you want to be in. For instance, if you're looking at tech, maybe a course that includes agile methodologies is a good fit. Also, consider your time constraints—do you have the bandwidth to tackle a two-month intensive program, or do you need a more flexible, self-paced option?

             Once you've chosen a course, committing to it is key. How will you set aside dedicated study time each week? Will you need to talk to your manager about adjusting your schedule, or could you plan to study on weekends? Let's make sure we map out that time before you enroll. That way, you'll set yourself up for success right from the start."
             </goal_story_example2>

             <goal_story_example3>
             Goal recap:
             "I want to save $5,000 over the next twelve months for an emergency fund. Each paycheck, I will automatically transfer 10% into a high-yield savings account and track my deposits and balance in a budgeting app."

             Current step:
             Open a Dedicated Savings Account (if needed)

             Discussion outline:
             "So, you want to build up your emergency fund by saving consistently. Opening a high-yield savings account is a solid first move. Let's discuss what you need to look for.

             One important consideration is the interest rate, of course, but also think about fees or minimum balances that could affect your savings. Some banks offer great introductory rates that drop after a certain period, so I'd encourage you to look at the long-term benefits.

             Besides the financial details, there's a psychological aspect: When your savings account is separate from your regular checking, you're less tempted to dip into those funds. How do you feel about automating deposits into that new account? Automating is often a key to ensuring you save before you have a chance to spend. Is there anything that might prevent you from setting up an automatic transfer? Let's talk through any concerns so you can confidently take this step."
             </goal_story_example3>

             <goal_story_example4>
             Goal recap:
             "Over the next six months, I want to reach an intermediate conversational level in Spanish so I can speak comfortably when I travel to Spain in July. I will use an online course for structured lessons, practice with a language exchange partner once a week, and aim to read at least one Spanish article per day."

             Current step:
             Choose a Structured Learning Program

             Discussion outline:
             "You want to get to an intermediate conversational level in Spanish within six months. That's exciting—and definitely doable with the right approach. The first step is to pick a structured learning program. Let's think about what sort of format works best for you. Do you enjoy interactive apps, or do you learn better with a more traditional online course that includes assignments and progress tests?

             Also, consider how you like to learn—are you self-driven enough to keep up with a purely self-paced course, or do you benefit from a bit more external accountability, like a live class or a tutor who checks in regularly?

             Once you decide on the right program, I recommend setting specific times each day to study, even if it's just 30 minutes. Consistency really pays off when learning a new language. How can we build those study sessions into your daily routine? Let's explore what mornings, lunch breaks, or evenings look like for you right now."
             </goal_story_example4>
              
             <goal_story_example5>
             Goal recap:
             "I want to reduce my working hours from 50 to 40 hours per week by the end of next quarter so I can spend more time with my family and pursue personal hobbies. I will do this by delegating one major task to a team member, scheduling regular check-ins with my manager, and strictly avoiding work emails after 7 PM."

             Current step:
             Assess Current Workload and Priorities

             Discussion outline:
             "You want to reduce your work hours from 50 to 40 per week. Before we do anything else, it's essential to get a clear picture of where your time is actually going. Let's start by listing out every recurring task, project, or responsibility you handle. We can review how much time each takes and which ones are absolutely critical.

             Sometimes, we discover we're spending hours on tasks that could be automated, delegated, or done more efficiently. Other times, we find tasks that aren't as high-priority as we assumed. Is there a time-tracking tool you might be comfortable with for a week or two, so we can see exact data on your work patterns?

             Once we have that info, we can talk about streamlining processes or reassigning tasks. But first, let's get an honest snapshot of your workload—without that, we can't make meaningful changes. Does anything about this step feel overwhelming or unclear? Let's break it down so it's manageable."
             </goal_story_example5>`,
      },
    },
    {
      role: "assistant",
      content: {
        type: "text",
        text: `As the Goal Story assistant, I'm happy to discuss your goal/step.         
             As we discuss your goal/step in detail, I will ask you along the way if you'd like me to save any notes with insights from our discussion or ideas you want to capture to the goal's notes in Goal Story.`,
      },
    },
    {
      role: "user",
      content: {
        type: "text",
        text: `Great. Now let's begin our discussion.`,
      },
    },
  ],
}));

server.prompt(PROMPTS.CAPTURE, {}, () => ({
  messages: [
    {
      role: "user",
      content: {
        type: "text",
        text: `I would like to capture some notes about my current goal/step.         
             All notes must markdown format.
             Capturing notes for me is the 'CAPTURE' step from the Goal Story workflow.`,
      },
    },
    {
      role: "assistant",
      content: {
        type: "text",
        text: `As the Goal Story assistant, I'm happy to capture notes related to your goal/step.         
             I will always format notes as markdown.`,
      },
    },
    {
      role: "user",
      content: {
        type: "text",
        text: `Great. Now how should we begin capturing my notes?`,
      },
    },
  ],
}));

server.prompt(PROMPTS.VISUALIZE, {}, () => ({
  messages: [
    {
      role: "user",
      content: {
        type: "text",
        text: `I would like you to use all the context you know about me, my beliefs and my intrinsic motivators and generate a story about me achieving my goal step.
             Helping me visualize my goal step by creating a story for me is the 'VISUALIZE' step from the Goal Story workflow.
                   
             If you don't know enough about me to create a story, you can use the 'goalstory_read_self_user' tool.
             If you don't know enough about me and my goal and step, you can both ask me for details and use the 'goalstory_get_story_context' tool.

             For your reference, here are some examples of generated stories:
              
             <goal_story_example1>
             Goal Recap:
             "By the end of the next three months, I want to be able to run a 5K without stopping and reduce my body fat percentage by 3%. I will do this by running three times a week, strength training twice a week, and tracking my progress with a fitness app."

             Current step:
             Schedule Workouts

             Story:
             Mia feels the gentle buzz of her morning alarm at 6:30 AM. Instead of hitting snooze like she used to, she sits up with a quiet excitement. Her smartphone screen already displays the day's schedule—blocking off time at 7 PM for her first running session of the week. As she scrolls through her work calendar, she notices how neatly the workout fits between her project deadlines and a short call with a coworker. Images of her high school cross-country days flood back, reminding her how she used to feel the crisp air rushing past her and the sense of freedom in her stride. By pressing "confirm" on her calendar, Mia makes a tangible promise to herself: to reclaim that feeling of strength and stamina. She pictures herself leaving the office, changing into her new running shoes, and stepping onto the sidewalk to start that first scheduled run. This single moment of scheduling is a confident signal—she has made time in her busy life for her own health. The day ends with a satisfied smile, knowing she has put her plan into action.
             </goal_story_example1>

             <goal_story_example2>
             Goal Recap:
             "I want to transition into a project management role at a mid-sized tech company within the next six months. I plan to complete an online project management certification course, update my résumé, and attend at least two networking events each month to build industry contacts."

             Current step:
             Choose and Enroll in a Project Management Course

             Story:
             Michael sits at his desk in the early evening, laptop open, a steaming cup of coffee by his side. A spreadsheet of potential courses is displayed before him, each row a fresh possibility. He imagines, six months from now, walking into a new mid-sized tech company's office with an official project management certification under his belt. In that vision, he's collaborating with a small, high-energy team, confidently referencing Agile methodologies and guiding them toward project milestones. As he hovers his cursor over the "Enroll Now" button for a top-rated, 10-week online course, he envisions proud updates to his résumé and LinkedIn profile. He sees the moment his manager shakes his hand, congratulating him on completing the course—recognition of his growing expertise. Clicking the button feels symbolic of the bigger shift he's making: from someone who coordinates informally to a bona fide project manager equipped with the right credentials. The gentle ping of the confirmation email echoes his excitement. He has taken the first leap toward his next career chapter.
             </goal_story_example2>

             <goal_story_example3>
             Goal recap:
             "I want to save $5,000 over the next twelve months for an emergency fund. Each paycheck, I will automatically transfer 10% into a high-yield savings account and track my deposits and balance in a budgeting app."

             Current step:
             Open a Dedicated Savings Account (if needed)

             Story:
             Late on a Saturday afternoon, Carla curls up on her couch with her laptop. The sun is warm on her back, and she feels a calm sense of determination. She navigates to an online banking site she's heard good things about—no monthly fees, a high interest rate, and intuitive digital tools. As she fills out the application form, she pictures what this new savings account represents: a safety cushion that protects her from unexpected expenses and a stepping stone toward one day owning her own home. She imagines the balance growing steadily, dollar by dollar, and sees herself a year from now, smiling at a $5,000 balance, free of the stress of living paycheck to paycheck. Clicking the final "Open Account" button, she feels a small thrill of accomplishment. In her mind's eye, she's already transferring that first automatic 10%, hearing the gentle "cha-ching" that signals a better future. She closes her laptop with a contented sigh, proud that she's taken the first real step toward financial security.
             </goal_story_example3>

             <goal_story_example4>
             Goal recap:
             "Over the next six months, I want to reach an intermediate conversational level in Spanish so I can speak comfortably when I travel to Spain in July. I will use an online course for structured lessons, practice with a language exchange partner once a week, and aim to read at least one Spanish article per day."

             Current step:
             Choose a Structured Learning Program

             Story:
             Amaan pictures himself stepping off a plane in Madrid, six months from now, bag slung over his shoulder, confidently greeting the airport staff in Spanish. He imagines ordering tapas in a busy restaurant, chatting with the waiter about local music spots, and laughing at jokes delivered in a language that used to feel so foreign. Now, as he scrolls through an online course catalog, he's looking for a program that uses real conversation practice, one that meshes with his social nature. He clicks on a course promising weekly live sessions with native speakers and sees himself logging on from his laptop, excited to practice new phrases. The first day, he envisions introducing himself in Spanish to a friendly tutor and feeling the spark of motivation that comes from being understood. By choosing this course, Amaan commits to the journey of daily lessons and interactive sessions—his key to making that vision of Spanish immersion a reality. He completes the enrollment form, smiling as he hits "submit," envisioning the day he'll step onto Spanish soil ready to speak, connect, and explore.
             </goal_story_example4>
              
             <goal_story_example5>
             Goal recap:
             "I want to reduce my working hours from 50 to 40 hours per week by the end of next quarter so I can spend more time with my family and pursue personal hobbies. I will do this by delegating one major task to a team member, scheduling regular check-ins with my manager, and strictly avoiding work emails after 7 PM."

             Current step:
             Assess Current Workload and Priorities

             Story:
             Robin stands in their office, an empty whiteboard in front of them. The word "PRIORITIES" is written across the top in bold letters. They close their eyes and imagine a calmer workweek—a 40-hour schedule that leaves space for Wednesday night dinners with family and weekend hikes with the kids. In that vision, Robin is leading team meetings with confidence, knowing which tasks to delegate and which to handle personally. No more late-night inbox scanning or a constant feeling of guilt. Opening their eyes, Robin methodically lists every single project, team request, and committee commitment on the board. It's a surprising amount, but with each new item, Robin sees a path toward clarity forming. They feel relief imagining how some tasks can be handed off or postponed. The mental image of finishing work at 5 PM on Friday, smiling as they leave the office to pick up the kids, motivates Robin to keep writing until every task is accounted for. Stepping back to review the board, they sense the beginnings of balance. This honest snapshot of their workload is the key to building a healthier, more harmonious life.
             </goal_story_example5>
             `,
      },
    },
    {
      role: "assistant",
      content: {
        type: "text",
        text: `As the Goal Story assistant, I'm happy to generate a personalized story about you achieving your goal step.         
             After I have created your story, I will present it to you and ask you if you would like me to save it to Goal Story for you.`,
      },
    },
    {
      role: "user",
      content: {
        type: "text",
        text: `Thank you, can you now go ahead and create the story, and write it all out for me here?
             After you've written it out can you check with me to see if I want to change it or save it to Goal Story?`,
      },
    },
  ],
}));

server.prompt(PROMPTS.MANAGE, {}, () => ({
  messages: [
    {
      role: "user",
      content: {
        type: "text",
        // Updated text to include scheduling
        text: `I would like your help managing my goals, steps, or scheduled stories in Goal Story. This could involve marking things complete, changing status, deleting items, or scheduling/unscheduling automatic story generation. Can you help me with the 'MANAGE' step from the Goal Story workflow?`,
      },
    },
    {
      role: "assistant",
      content: {
        type: "text",
        // Updated assistant response
        text: `As the Goal Story assistant, I'm happy to help you manage your goals, steps, and scheduled stories. What would you like to do? Just let me know, and I'll confirm with you before making any changes.`,
      },
    },
  ],
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

const ABOUT_GOAL_STORYING = `# About Goal Story:

Goal Story is a Goal Tracker and Visualization Tool for personal and professional development, built from the ground up with Claude and Anthropic's Model Context Protocol in mind. 

Chatting with Claude is well suited for ideating and developing goals, getting insights about them and generating goal steps that we might not have thought about on our own. With Goal Story we do all of that, and we also use the power of stories to journey through our goals in a more enaging way. Stories about us and our goals help us visualize what it will be like when we achieve them ahead of actually achieving them. We call this process "Goal Storying", and it's the backbone of what makes Goal Story so effective.

The process of Goal Storying invovles uzing a variety of context about you, your intrinsic motivators, and your goal history and outcomes to generate engaging and powerful vizualizations. It works because it activates some of the same neural pathways used during the execution of tasks, thereby improving focus and reducing anxiety. Research finds that, using mental imagery when forming goal steps leads to higher rates of goal achievement.¹ Goal Story's mission is to help you develop your goals, create insightful and actionable steps, and generate mental imagery (stories) that is customized to you and what makes you tick.

Goal Storying vizualizations are not generic, they're personally relevant to you. They use mental imagery that you can identify with, priming you to achieve personal and professional success. They're fun, inspiring and we know you're going to love them.

**New Feature: Scheduled Stories!** You can now schedule Goal Story to automatically generate a visualization story for a specific goal at a time that works best for you each day. This helps keep your motivation high and your goal top-of-mind.

Goal Story is also a productivity tool that builds momentum as you effortlessly track your progress through each goal step. Goal steps have built-in notes that you can create and update conversationally, and then come back to in any Goal Story enabled chat thread. Mark a step as complete, capture insightful pieces of knowledge, or capture your thoughts simply by asking your AI assistant to do so. All personal data and stories are encrypted with Goal Story. It is all under your control.

We've used stories to shape our destiny for thousands of years. Goal story follows that tradition into new territory, making it into a valuable new tool for people who want a new and engaging approach to personal and professional development.

¹ See abastract on [Research Gate](https://www.researchgate.net/publication/225722903_Using_Mental_Imagery_to_Enhance_the_Effectiveness_of_Implementation_Intentions)
"""

## "Storying" and the Goal Story Workflow:

### Storying 

"Storying", the present participle of the verb "story", is not commonly used in everyday language. It means:
 1. To tell, narrate, or recount events in the form of a story.
 2. To construct or create stories, often in a creative or imaginative context.

"Storying" is often used in academic, creative, or philosophical contexts, particularly in discussions about storytelling, narrative construction, or the way individuals or cultures make sense of the world through stories. For example:
 • "The act of storying our experiences helps us make meaning of our lives."
 • "Storying the past is a key aspect of historical representation."

While not widely recognized in casual speech, it is accepted in specific contexts.

### The Goal Story Workflow:

The practice of Goal Storying is your completion of the following workflow in thought partnership with Claude:
1. CLARIFY: work with Claude to clarify a goal
2. FORMULATE: work with Claude to formulate actionable goal steps
3. CONTEXT: ask Claude to gather context about the user and their current goal/step pair
4. DISCUSS: thoughtfully discuss a goal/step pair with Claude to fully understand things like completion criteria, and to uncover new insights that will help achieve the goal
5. CAPTURE: ask Claude to capture/update notes for the current goal/step
6. VISUALIZE: ask Claude to use context to create a highly personalized, belief system driven, and intrinsic motivations-aware story about the achieving of the goal/step pair (can now be scheduled!)
7. MANAGE: ask Claude to mark a goal and/or step complete, change status, schedule/manage story generation, and so on

## User instructions for Claude
As your Goal Story assistant, Claude should guide you through the Goal Storying Workflow by:
- CLARIFY - only saving your goal to Goal Story after you and Claude have clarified it, or if you ask for it to be saved to Goal Story.
- FORMULATE - only saving your goal steps to Goal Story after Claude has presented them to you, or if you tell Claude about certain goal steps and wish for them to be saved to Goal Story.
- CONTEXT - if you engage Claude in a discussion about your "current" goal and/or goal step, Claude will gather context before discussing.
- DISCUSS and CAPTURE - as you and Claude discuss a goal step, any apparent insights or valuable information that arise should be saved to the goal step notes
- VISUALIZE - if you ask for a story or for help visualizing your goal step, Claude should always share the full and complete story with you after creating it and saving it to Goal Story. Claude can also help schedule automatic story generation for a goal.
- MANAGE - Claude should always first seek your confirmation before marking a goal and/or step complete, changing its status, scheduling/updating/deleting scheduled stories, and so on`;
