// -----------------------------------------
// Tool Definitions
// -----------------------------------------
import { z } from "zod";

/**
 * GET /about
 */
export const ABOUT_GOALSTORYING_TOOL = {
  name: "goalstory_about",
  description:
    "Retrieve information about Goal Story's philosophy and the power of story-driven goal achievement. Use this to help users understand the unique approach of Goal Storying.",
  inputSchema: z.object({}),
};

/**
 * GET /users
 */
export const READ_SELF_USER_TOOL = {
  name: "goalstory_read_self_user",
  description:
    "Get the user's profile data including their preferences, belief systems, and past goal history to enable personalized goal storying and context-aware discussions.",
  inputSchema: z.object({}),
};

/**
 * PATCH /users
 */
export const UPDATE_SELF_USER_TOOL = {
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
export const COUNT_GOALS_TOOL = {
  name: "goalstory_count_goals",
  description:
    "Get the total number of goals in the user's journey. Useful for tracking overall progress and goal management patterns.",
  inputSchema: z.object({}),
};

/**
 * POST /goals
 */
export const CREATE_GOAL_TOOL = {
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
export const UPDATE_GOAL_TOOL = {
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
export const DESTROY_GOAL_TOOL = {
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
export const READ_ONE_GOAL_TOOL = {
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
export const READ_GOALS_TOOL = {
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
export const READ_CURRENT_FOCUS_TOOL = {
  name: "goalstory_read_current_focus",
  description:
    "Identify which goal and step the user is currently focused on to maintain context in discussions and story creation.",
  inputSchema: z.object({}),
};

/**
 * GET /context
 */
export const GET_STORY_CONTEXT_TOOL = {
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
export const CREATE_STEPS_TOOL = {
  name: "goalstory_create_steps",
  description: `Formulate actionable steps for a goal through thoughtful discussion. Present the steps for user review either before or after saving, ensuring they're clear and achievable. Confirm if any refinements are needed. IMPORTANT: Steps will be ordered by their 'order_ts' timestamp in ascending order - the step with the smallest timestamp value (updated first) is step 1, and steps with larger timestamp values come later in the sequence. The first item in your array will get the smallest timestamp (becoming step 1), and subsequent steps will have progressively larger timestamps. NOTE: Be careful not to reverse the order - smaller timestamps (earlier in time) = earlier steps in the sequence.`,
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
export const READ_STEPS_TOOL = {
  name: "goalstory_read_steps",
  description:
    "Access the action plan for a specific goal, showing all steps in the journey toward achievement. IMPORTANT: Steps are ordered by their 'order_ts' timestamp in ascending order - the step with the smallest timestamp value (updated first) is step 1, and steps with larger timestamp values come later in the sequence. NOTE: Be careful not to reverse the order - smaller timestamps (earlier in time) = earlier steps in the sequence.",
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
export const READ_ONE_STEP_TOOL = {
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
export const UPDATE_STEP_TOOL = {
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
export const DESTROY_STEP_TOOL = {
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
export const UPDATE_STEP_NOTES_TOOL = {
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
export const SET_STEPS_ORDER_TOOL = {
  name: "goalstory_set_steps_order",
  description:
    "Reorder steps in a goal by specifying the new sequence. This allows for prioritizing steps or reorganizing the workflow without deleting and recreating steps. IMPORTANT: Steps are ordered by their 'order_ts' timestamp in ascending order - the step with the smallest timestamp value (updated first) is step 1, and steps with larger timestamp values come later in the sequence. NOTE: Be careful not to reverse the order - smaller timestamps (earlier in time) = earlier steps in the sequence.",
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
export const CREATE_STORY_TOOL = {
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
export const READ_STORIES_TOOL = {
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
export const READ_ONE_STORY_TOOL = {
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
export const TimeSettingsSchema = z
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
export const READ_SCHEDULED_STORIES_TOOL = {
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
export const CREATE_SCHEDULED_STORY_TOOL = {
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
export const UPDATE_SCHEDULED_STORY_TOOL = {
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
export const DESTROY_SCHEDULED_STORY_TOOL = {
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
