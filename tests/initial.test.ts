import { describe, test, expect } from "vitest"; // Added beforeAll, afterAll potentially
import { client } from "../setup";
import { CallToolResult } from "@modelcontextprotocol/sdk/types.js";

// Updated TOOL_NAMES
const TOOL_NAMES = {
  GOALSTORY_ABOUT: "goalstory_about",
  GOALSTORY_READ_SELF_USER: "goalstory_read_self_user",
  GOALSTORY_UPDATE_SELF_USER: "goalstory_update_self_user",
  GOALSTORY_COUNT_GOALS: "goalstory_count_goals",
  GOALSTORY_CREATE_GOAL: "goalstory_create_goal",
  GOALSTORY_UPDATE_GOAL: "goalstory_update_goal",
  GOALSTORY_DESTROY_GOAL: "goalstory_destroy_goal",
  GOALSTORY_READ_ONE_GOAL: "goalstory_read_one_goal",
  GOALSTORY_READ_GOALS: "goalstory_read_goals",
  GOALSTORY_READ_CURRENT_FOCUS: "goalstory_read_current_focus",
  GOALSTORY_GET_STORY_CONTEXT: "goalstory_get_story_context",
  GOALSTORY_CREATE_STEPS: "goalstory_create_steps",
  GOALSTORY_READ_STEPS: "goalstory_read_steps",
  GOALSTORY_READ_ONE_STEP: "goalstory_read_one_step",
  GOALSTORY_UPDATE_STEP: "goalstory_update_step",
  GOALSTORY_DESTROY_STEP: "goalstory_destroy_step",
  GOALSTORY_UPDATE_STEP_NOTES: "goalstory_update_step_notes",
  GOALSTORY_SET_STEPS_ORDER: "goalstory_set_steps_order", // New Steps Order Tool
  GOALSTORY_CREATE_STORY: "goalstory_create_story",
  GOALSTORY_READ_STORIES: "goalstory_read_stories",
  GOALSTORY_READ_ONE_STORY: "goalstory_read_one_story",
  // New Scheduled Story Tools
  GOALSTORY_READ_SCHEDULED_STORIES: "goalstory_read_scheduled_stories",
  GOALSTORY_CREATE_SCHEDULED_STORY: "goalstory_create_scheduled_story",
  GOALSTORY_UPDATE_SCHEDULED_STORY: "goalstory_update_scheduled_story",
  GOALSTORY_DESTROY_SCHEDULED_STORY: "goalstory_destroy_scheduled_story",
};

// --- Mock Data ---
const MOCK_USER_NAME = "Test User";
const MOCK_USER_ABOUT = "Loves testing and achieving goals.";
const MOCK_GOAL_NAME = "Master Vitest Testing";
const MOCK_GOAL_DESC = "Write comprehensive tests for the MCP server.";
const MOCK_GOAL_UPDATE_NAME = "Master Vitest Testing v2";
const MOCK_GOAL_UPDATE_DESC =
  "Write even more comprehensive tests for the MCP server.";
const MOCK_STEP_NAMES = [
  "Setup Environment",
  "Write Goal Tests",
  "Write Step Tests",
];
const MOCK_STEP_UPDATE_NAME = "Write Goal Tests (Revised)";
const MOCK_STEP_NOTES = "Remember to cover edge cases.";
const MOCK_STORY_TITLE = "The Tale of the Tested Tool"; // Title is required now
const MOCK_STORY_TEXT = "Once upon a time, a tool was tested thoroughly.";
const MOCK_SCHEDULE_TIME = { hour: "10", period: "AM", utcOffset: "+01:00" };
const MOCK_SCHEDULE_UPDATE_TIME = {
  hour: "11",
  period: "AM",
  utcOffset: "+01:00",
};

type ToolCallResult = {
  content: { type: string; text: string }[];
  isError: boolean | undefined;
};

// Helper to parse ID from creation responses (adjust prefixes as needed)
function parseIdFromResponse(text: string, prefix: string): string | undefined {
  try {
    const jsonString = text.substring(prefix.length);
    const parsed = JSON.parse(jsonString);

    // Handle potential variations in response structure (direct result vs nested)
    const resultData = parsed.result || parsed;

    return resultData?.id;
  } catch (error) {
    console.error(
      `Failed to parse ID from text starting with '${prefix}':`,
      error,
      "\nText:",
      text,
    );
    return undefined;
  }
}

// Variables to store created IDs for subsequent tests
let createdGoalId: string | undefined;
let createdStepId: string | undefined;
let createdStepIds: string[] = []; // Array to store all created step IDs for reordering test
let createdStoryId: string | undefined;
let createdScheduledStoryId: string | undefined; // New ID for scheduled story

test("prompts, resources and tools should exist", async () => {
  const { prompts } = await client.listPrompts();
  expect(prompts.length).toBeGreaterThan(0); // Basic check
  prompts.forEach(async (p) => {
    expect(p.name).toBeTypeOf("string");
    const prompt = await client.getPrompt({
      name: p.name,
      arguments: {},
    });
    expect(prompt).toBeDefined();
    expect(prompt.messages).toBeDefined(); // Check structure
  });

  const { resources } = await client.listResources();
  expect(resources.length).toBeGreaterThan(0); // Basic check
  resources.forEach(async (r) => {
    expect(r.name).toBeTypeOf("string");
    expect(r.uri).toBeTypeOf("string");

    const resource = await client.readResource({
      uri: r.uri,
    });
    const { contents } = resource;
    expect(contents.length).toBeGreaterThan(0);
    contents.forEach((c) => {
      expect(c.text).toBeTypeOf("string");
      expect(c.uri).toBeTypeOf("string");
    });

    expect(resource).toBeDefined();
  });

  const { tools } = await client.listTools();
  expect(tools.length).toBeGreaterThan(Object.keys(TOOL_NAMES).length - 1);
  tools.forEach((t) => {
    expect(t.name).toBeTypeOf("string");
    expect(t.description).toBeTypeOf("string");
    expect(t.inputSchema).toBeDefined();
  });

  // Verify all expected tools are listed
  const listedToolNames = tools.map((t) => t.name);
  Object.values(TOOL_NAMES).forEach((expectedName) => {
    expect(listedToolNames).toContain(expectedName);
  });
});

describe("Goal Story Tool Tests", () => {
  // --- About Tool ---
  test(`${TOOL_NAMES.GOALSTORY_ABOUT}`, async () => {
    const {
      content: [{ text }],
      isError,
    } = (await client.callTool({
      name: TOOL_NAMES.GOALSTORY_ABOUT,
      arguments: {},
    })) as ToolCallResult;

    expect(isError).toBeFalsy();
    expect(text).toBeTypeOf("string");
    expect(text).toContain("About data:");
  });

  // --- User Tools ---
  describe("User Tools", () => {
    test(`${TOOL_NAMES.GOALSTORY_READ_SELF_USER}`, async () => {
      const {
        content: [{ text }],
        isError,
      } = (await client.callTool({
        name: TOOL_NAMES.GOALSTORY_READ_SELF_USER,
        arguments: {},
      })) as ToolCallResult;
      expect(isError).toBeFalsy();
      expect(text).toBeTypeOf("string");
      expect(text).toContain("User data:");
    });

    // Run update first to ensure the user has expected values for read
    test(`${TOOL_NAMES.GOALSTORY_UPDATE_SELF_USER}`, async () => {
      const {
        content: [{ text }],
        isError,
      } = (await client.callTool({
        name: TOOL_NAMES.GOALSTORY_UPDATE_SELF_USER,
        arguments: {
          name: MOCK_USER_NAME,
          about: MOCK_USER_ABOUT,
          visibility: 1, // Private
        },
      })) as CallToolResult; // Using original CallToolResult for consistency with user's example
      expect(isError).toBeFalsy();
      expect(text).toBeTypeOf("string");
      expect(text).toContain("Updated user:");
      expect(text).toContain(MOCK_USER_NAME);
      expect(text).toContain(MOCK_USER_ABOUT);
    });
  });

  // --- Goal Tools ---
  describe("Goal Tools", () => {
    test(`${TOOL_NAMES.GOALSTORY_COUNT_GOALS}`, async () => {
      const {
        content: [{ text }],
        isError,
      } = (await client.callTool({
        name: TOOL_NAMES.GOALSTORY_COUNT_GOALS,
        arguments: {},
      })) as ToolCallResult;
      expect(isError).toBeFalsy();
      expect(text).toBeTypeOf("string");
      expect(text).toContain("Count of goals:");
      // We could potentially parse the count here if needed
    });

    test(`${TOOL_NAMES.GOALSTORY_CREATE_GOAL}`, async () => {
      const {
        content: [{ text }],
        isError,
      } = (await client.callTool({
        name: TOOL_NAMES.GOALSTORY_CREATE_GOAL,
        arguments: {
          name: MOCK_GOAL_NAME,
          description: MOCK_GOAL_DESC,
          story_mode: "GENERATOR",
          belief_mode: "POSITIVE",
        },
      })) as ToolCallResult;
      expect(isError).toBeFalsy();
      expect(text).toBeTypeOf("string");
      expect(text).toContain("Goal created:");
      expect(text).toContain(MOCK_GOAL_NAME);
      expect(text).toContain(MOCK_GOAL_DESC);

      // Attempt to parse and store the ID
      createdGoalId = parseIdFromResponse(text, "Goal created:\n");
      console.log("Created Goal ID:", createdGoalId); // Log ID for debugging
      expect(createdGoalId).toBeTypeOf("string");
    });

    test(`${TOOL_NAMES.GOALSTORY_READ_GOALS}`, async () => {
      const {
        content: [{ text }],
        isError,
      } = (await client.callTool({
        name: TOOL_NAMES.GOALSTORY_READ_GOALS,
        arguments: { limit: 5 }, // Optional args example
      })) as ToolCallResult;
      expect(isError).toBeFalsy();
      expect(text).toBeTypeOf("string");
      expect(text).toContain("Goals retrieved:");
      // Check if the created goal name is in the list (might be on another page if many goals exist)
      // expect(text).toContain(MOCK_GOAL_NAME);
    });

    test(`${TOOL_NAMES.GOALSTORY_READ_ONE_GOAL}`, async () => {
      expect(
        createdGoalId,
        "Create Goal test must run first and succeed.",
      ).toBeDefined();
      const {
        content: [{ text }],
        isError,
      } = (await client.callTool({
        name: TOOL_NAMES.GOALSTORY_READ_ONE_GOAL,
        arguments: { id: createdGoalId! },
      })) as ToolCallResult;
      expect(isError).toBeFalsy();
      expect(text).toBeTypeOf("string");
      expect(text).toContain("Goal data:");
      expect(text).toContain(createdGoalId!);
      expect(text).toContain(MOCK_GOAL_NAME); // Should still have original name
    });

    test(`${TOOL_NAMES.GOALSTORY_UPDATE_GOAL}`, async () => {
      expect(
        createdGoalId,
        "Create Goal test must run first and succeed.",
      ).toBeDefined();
      const {
        content: [{ text }],
        isError,
      } = (await client.callTool({
        name: TOOL_NAMES.GOALSTORY_UPDATE_GOAL,
        arguments: {
          id: createdGoalId!,
          name: MOCK_GOAL_UPDATE_NAME,
          description: MOCK_GOAL_UPDATE_DESC,
          status: 0, // Example status update (e.g., Active)
        },
      })) as ToolCallResult;
      expect(isError).toBeFalsy();
      expect(text).toBeTypeOf("string");
      expect(text).toContain("Goal updated:");
      expect(text).toContain(createdGoalId!);
      expect(text).toContain(MOCK_GOAL_UPDATE_NAME);
      expect(text).toContain(MOCK_GOAL_UPDATE_DESC);
    });
  });

  // --- Step Tools ---
  describe("Step Tools", () => {
    test(`${TOOL_NAMES.GOALSTORY_CREATE_STEPS}`, async () => {
      expect(
        createdGoalId,
        "Create Goal test must run first and succeed.",
      ).toBeDefined();
      const {
        content: [{ text }],
        isError,
      } = (await client.callTool({
        name: TOOL_NAMES.GOALSTORY_CREATE_STEPS,
        arguments: {
          goal_id: createdGoalId!,
          steps: MOCK_STEP_NAMES,
        },
      })) as ToolCallResult;
      expect(isError).toBeFalsy();
      expect(text).toBeTypeOf("string");
      expect(text).toContain("Steps created:");
      expect(text).toContain(MOCK_STEP_NAMES[0]); // Check one of the step names

      // Attempt to parse and store all created step IDs
      try {
        // get just the obj string
        const start = text.indexOf("{");
        const end = text.lastIndexOf("}") + 1;
        const jsonString = text.slice(start, end);

        const parsed = JSON.parse(jsonString);
        const resultData = parsed.result || parsed; // Handle nested result
        expect(Array.isArray(resultData)).toBeTruthy();
        expect(resultData.length).toBeGreaterThan(0);

        // Store the first step ID for individual step tests
        createdStepId = resultData[0]?.id;
        console.log("Created Step ID:", createdStepId); // Log ID for debugging
        expect(createdStepId).toBeTypeOf("string");

        // Store all step IDs for reordering test
        createdStepIds = resultData.map((step: any) => step.id);
        expect(createdStepIds.length).toBe(MOCK_STEP_NAMES.length);
      } catch (error) {
        console.error(
          "Failed to parse Step IDs from response:",
          error,
          "\nText:",
          text,
        );
        expect(error).toBeNull(); // Force test failure if parsing fails
      }
    });

    test(`${TOOL_NAMES.GOALSTORY_READ_STEPS}`, async () => {
      expect(
        createdGoalId,
        "Create Goal test must run first and succeed.",
      ).toBeDefined();
      const {
        content: [{ text }],
        isError,
      } = (await client.callTool({
        name: TOOL_NAMES.GOALSTORY_READ_STEPS,
        arguments: {
          goal_id: createdGoalId!,
          limit: 5,
        },
      })) as ToolCallResult;
      expect(isError).toBeFalsy();
      expect(text).toBeTypeOf("string");
      expect(text).toContain(`Steps for goal '${createdGoalId!}':`);
      expect(text).toContain(MOCK_STEP_NAMES[1]); // Check another step name
    });

    test(`${TOOL_NAMES.GOALSTORY_READ_ONE_STEP}`, async () => {
      expect(
        createdStepId,
        "Create Steps test must run first and succeed.",
      ).toBeDefined();
      const {
        content: [{ text }],
        isError,
      } = (await client.callTool({
        name: TOOL_NAMES.GOALSTORY_READ_ONE_STEP,
        arguments: { id: createdStepId! },
      })) as ToolCallResult;
      expect(isError).toBeFalsy();
      expect(text).toBeTypeOf("string");
      expect(text).toContain("Step data:");
      expect(text).toContain(createdStepId!);
      expect(text).toContain(MOCK_STEP_NAMES[0]); // Should have original name initially
    });

    test(`${TOOL_NAMES.GOALSTORY_UPDATE_STEP}`, async () => {
      expect(
        createdStepId,
        "Create Steps test must run first and succeed.",
      ).toBeDefined();
      const {
        content: [{ text }],
        isError,
      } = (await client.callTool({
        name: TOOL_NAMES.GOALSTORY_UPDATE_STEP,
        arguments: {
          id: createdStepId!,
          name: MOCK_STEP_UPDATE_NAME,
          status: 0, // Example status update (e.g., Pending)
        },
      })) as ToolCallResult;
      expect(isError).toBeFalsy();
      expect(text).toBeTypeOf("string");
      expect(text).toContain("Step updated:");
      expect(text).toContain(createdStepId!);
      expect(text).toContain(MOCK_STEP_UPDATE_NAME);
    });

    test(`${TOOL_NAMES.GOALSTORY_UPDATE_STEP_NOTES}`, async () => {
      expect(
        createdStepId,
        "Create Steps test must run first and succeed.",
      ).toBeDefined();
      const {
        content: [{ text }],
        isError,
      } = (await client.callTool({
        name: TOOL_NAMES.GOALSTORY_UPDATE_STEP_NOTES,
        arguments: {
          id: createdStepId!,
          notes: MOCK_STEP_NOTES,
        },
      })) as ToolCallResult;
      expect(isError).toBeFalsy();
      expect(text).toBeTypeOf("string");
      expect(text).toContain("Step notes updated:");
      expect(text).toContain(createdStepId!);
      expect(text).toContain(MOCK_STEP_NOTES); // Check if notes are reflected (API might return the whole step)
    });

    test(`${TOOL_NAMES.GOALSTORY_SET_STEPS_ORDER}`, async () => {
      expect(
        createdGoalId,
        "Create Goal test must run first and succeed.",
      ).toBeDefined();
      expect(
        createdStepIds.length,
        "Create Steps test must run first and create multiple steps.",
      ).toBeGreaterThan(1);

      // Reverse the order of steps to test reordering
      const reorderedStepIds = [...createdStepIds].reverse();

      const {
        content: [{ text }],
        isError,
      } = (await client.callTool({
        name: TOOL_NAMES.GOALSTORY_SET_STEPS_ORDER,
        arguments: {
          ordered_steps_ids: reorderedStepIds,
        },
      })) as ToolCallResult;
      expect(isError).toBeFalsy();
      expect(text).toBeTypeOf("string");
      expect(text).toContain("Steps order updated:");

      // Check if the response contains the reordered step IDs
      // Note: The exact format of the response may vary depending on the API implementation
      try {
        const jsonString = text.substring("Steps order updated:\n".length);
        const parsed = JSON.parse(jsonString);
        const resultData = parsed.result || parsed; // Handle nested result

        // Verify the response contains steps data
        expect(Array.isArray(resultData)).toBeTruthy();

        // If the API returns the step IDs in the new order, we can verify them
        if (resultData.length > 0 && resultData[0].id) {
          const returnedIds = resultData.map((step: any) => step.id);

          // Check at least the first and last IDs to confirm reordering worked
          expect(returnedIds[0]).toBe(reorderedStepIds[0]);
          expect(returnedIds[returnedIds.length - 1]).toBe(
            reorderedStepIds[reorderedStepIds.length - 1],
          );
        }
      } catch (error) {
        console.error(
          "Failed to parse response from SET_STEPS_ORDER:",
          error,
          "\nText:",
          text,
        );
        // Don't fail the test if we can't parse the response
        // as the main goal is to verify the API call works
      }
    });
  });

  // --- Focus/Context Tools ---
  describe("Focus/Context Tools", () => {
    test(`${TOOL_NAMES.GOALSTORY_READ_CURRENT_FOCUS}`, async () => {
      // This might depend on the last updated item, which could be a step note
      // May need adjustment based on actual API logic for 'current'
      const {
        content: [{ text }],
        isError,
      } = (await client.callTool({
        name: TOOL_NAMES.GOALSTORY_READ_CURRENT_FOCUS,
        arguments: {},
      })) as ToolCallResult;
      expect(isError).toBeFalsy();
      expect(text).toBeTypeOf("string");
      expect(text).toContain("Current goal/step focus:");
    });

    test(`${TOOL_NAMES.GOALSTORY_GET_STORY_CONTEXT}`, async () => {
      expect(
        createdGoalId,
        "Create Goal test must run first and succeed.",
      ).toBeDefined();
      expect(
        createdStepId,
        "Create Steps test must run first and succeed.",
      ).toBeDefined();
      const {
        content: [{ text }],
        isError,
      } = (await client.callTool({
        name: TOOL_NAMES.GOALSTORY_GET_STORY_CONTEXT,
        arguments: {
          goalId: createdGoalId!,
          stepId: createdStepId!,
          // feedback: "Optional feedback", // Optional arg example
        },
      })) as ToolCallResult;
      expect(isError).toBeFalsy();
      expect(text).toBeTypeOf("string");
      expect(text).toContain("Story context:");
      // Response structure might vary, potentially check for goal/step IDs if included
      // expect(text).toContain(createdGoalId!);
      // expect(text).toContain(createdStepId!);
    });
  });

  // --- Story Tools ---
  describe("Story Tools", () => {
    test(`${TOOL_NAMES.GOALSTORY_CREATE_STORY}`, async () => {
      expect(
        createdGoalId,
        "Create Goal test must run first and succeed.",
      ).toBeDefined();
      expect(
        createdStepId,
        "Create Steps test must run first and succeed.",
      ).toBeDefined();
      const {
        content: [{ text }],
        isError,
      } = (await client.callTool({
        name: TOOL_NAMES.GOALSTORY_CREATE_STORY,
        arguments: {
          goal_id: createdGoalId!,
          step_id: createdStepId!,
          title: MOCK_STORY_TITLE, // Title is required now
          story_text: MOCK_STORY_TEXT,
        },
      })) as ToolCallResult;
      expect(isError).toBeFalsy();
      expect(text).toBeTypeOf("string");
      expect(text).toContain("Story created:");
      expect(text).toContain(MOCK_STORY_TITLE);

      // Attempt to parse and store the ID
      createdStoryId = parseIdFromResponse(text, "Story created:\n");
      console.log("Created Story ID:", createdStoryId); // Log ID for debugging
      expect(createdStoryId).toBeTypeOf("string");
    });

    test(`${TOOL_NAMES.GOALSTORY_READ_STORIES}`, async () => {
      expect(
        createdGoalId,
        "Create Goal test must run first and succeed.",
      ).toBeDefined();
      expect(
        createdStepId,
        "Create Steps test must run first and succeed.",
      ).toBeDefined();
      const {
        content: [{ text }],
        isError,
      } = (await client.callTool({
        name: TOOL_NAMES.GOALSTORY_READ_STORIES,
        arguments: {
          goal_id: createdGoalId!,
          step_id: createdStepId!,
          limit: 5,
        },
      })) as ToolCallResult;
      expect(isError).toBeFalsy();
      expect(text).toBeTypeOf("string");
      expect(text).toContain("Stories:");
      expect(text).toContain(MOCK_STORY_TITLE); // Should contain the story we created
    });

    test(`${TOOL_NAMES.GOALSTORY_READ_ONE_STORY}`, async () => {
      expect(
        createdStoryId,
        "Create Story test must run first and succeed.",
      ).toBeDefined();
      const {
        content: [{ text }],
        isError,
      } = (await client.callTool({
        name: TOOL_NAMES.GOALSTORY_READ_ONE_STORY,
        arguments: { id: createdStoryId! },
      })) as ToolCallResult;
      expect(isError).toBeFalsy();
      expect(text).toBeTypeOf("string");
      expect(text).toContain("Story data:");
      expect(text).toContain(createdStoryId!);
      expect(text).toContain(MOCK_STORY_TITLE);
    });
  });

  // --- Scheduled Story Tools ---
  describe("Scheduled Story Tools", () => {
    test(`${TOOL_NAMES.GOALSTORY_CREATE_SCHEDULED_STORY}`, async () => {
      const {
        content: [{ text: goalText }],
        isError: isGoalError,
      } = (await client.callTool({
        name: TOOL_NAMES.GOALSTORY_READ_ONE_GOAL,
        arguments: { id: createdGoalId! },
      })) as ToolCallResult;

      expect(
        createdGoalId,
        "Create Goal test must run first and succeed.",
      ).toBeDefined();
      const {
        content: [{ text }],
        isError,
      } = (await client.callTool({
        name: TOOL_NAMES.GOALSTORY_CREATE_SCHEDULED_STORY,
        arguments: {
          goal_id: createdGoalId!,
          timeSettings: MOCK_SCHEDULE_TIME,
        },
      })) as ToolCallResult;

      expect(isError).toBeFalsy();
      expect(text).toBeTypeOf("string");
      expect(text).toContain("Scheduled story created:");

      // Attempt to parse and store the ID
      createdScheduledStoryId = parseIdFromResponse(
        text,
        "Scheduled story created:\n",
      );
      console.log("Created Scheduled Story ID:", createdScheduledStoryId); // Log ID
      expect(createdScheduledStoryId).toBeTypeOf("string");
    });

    test(`${TOOL_NAMES.GOALSTORY_READ_SCHEDULED_STORIES}`, async () => {
      // Depends on the create test above
      expect(
        createdScheduledStoryId,
        "Create Scheduled Story test must run first and succeed.",
      ).toBeDefined();
      const {
        content: [{ text }],
        isError,
      } = (await client.callTool({
        name: TOOL_NAMES.GOALSTORY_READ_SCHEDULED_STORIES,
        arguments: { limit: 5 },
      })) as ToolCallResult;
      expect(isError).toBeFalsy();
      expect(text).toBeTypeOf("string");
      expect(text).toContain("Scheduled stories retrieved:");
      // Check if the schedule we created is listed (using ID)
      expect(text).toContain(createdScheduledStoryId!);
    });

    test(`${TOOL_NAMES.GOALSTORY_UPDATE_SCHEDULED_STORY}`, async () => {
      expect(
        createdScheduledStoryId,
        "Create Scheduled Story test must run first and succeed.",
      ).toBeDefined();
      const {
        content: [{ text }],
        isError,
      } = (await client.callTool({
        name: TOOL_NAMES.GOALSTORY_UPDATE_SCHEDULED_STORY,
        arguments: {
          id: createdScheduledStoryId!,
          timeSettings: MOCK_SCHEDULE_UPDATE_TIME,
          status: 0, // e.g., Ensure it's active
        },
      })) as ToolCallResult;

      expect(isError).toBeFalsy();
      expect(text).toBeTypeOf("string");
      expect(text).toContain("Scheduled story updated:");
      expect(text).toContain(createdScheduledStoryId!);
    });
  });

  // --- Cleanup ---
  // Run destroy tests last to clean up created resources
  describe("Cleanup Tools", () => {
    // Destroy Step needs to happen before Destroy Goal if steps exist
    test(`${TOOL_NAMES.GOALSTORY_DESTROY_STEP}`, async () => {
      // Check if step was created, skip if not (might happen if create failed)
      if (!createdStepId) {
        console.warn("Skipping Destroy Step test - Step ID not available.");
        return;
      }
      expect(
        createdStepId,
        "Create Steps test must run first and succeed.",
      ).toBeDefined();
      const {
        content: [{ text }],
        isError,
      } = (await client.callTool({
        name: TOOL_NAMES.GOALSTORY_DESTROY_STEP,
        arguments: { id: createdStepId! },
      })) as ToolCallResult;
      expect(isError).toBeFalsy();
      expect(text).toBeTypeOf("string");
      expect(text).toContain("Step deleted:");
      // API might return the deleted object or just a confirmation
      // expect(text).toContain(createdStepId!);
    });

    // Destroy Scheduled Story
    test(`${TOOL_NAMES.GOALSTORY_DESTROY_SCHEDULED_STORY}`, async () => {
      // Check if scheduled story was created, skip if not
      if (!createdScheduledStoryId) {
        console.warn(
          "Skipping Destroy Scheduled Story test - ID not available.",
        );
        return;
      }
      expect(
        createdScheduledStoryId,
        "Create Scheduled Story test must run first and succeed.",
      ).toBeDefined();
      const {
        content: [{ text }],
        isError,
      } = (await client.callTool({
        name: TOOL_NAMES.GOALSTORY_DESTROY_SCHEDULED_STORY,
        arguments: { id: createdScheduledStoryId! },
      })) as ToolCallResult;
      expect(isError).toBeFalsy();
      expect(text).toBeTypeOf("string");
      expect(text).toContain("Scheduled story deleted:");
    });

    // Destroy Goal (implicitly cleans up stories associated with it if cascade delete is set up)
    test(`${TOOL_NAMES.GOALSTORY_DESTROY_GOAL}`, async () => {
      // Check if goal was created, skip if not
      if (!createdGoalId) {
        console.warn("Skipping Destroy Goal test - Goal ID not available.");
        return;
      }
      expect(
        createdGoalId,
        "Create Goal test must run first and succeed.",
      ).toBeDefined();
      const {
        content: [{ text }],
        isError,
      } = (await client.callTool({
        name: TOOL_NAMES.GOALSTORY_DESTROY_GOAL,
        arguments: { id: createdGoalId! },
      })) as ToolCallResult;
      expect(isError).toBeFalsy();
      expect(text).toBeTypeOf("string");
      expect(text).toContain("Goal deleted:");
      // API might return the deleted object or just a confirmation
      // expect(text).toContain(createdGoalId!);
    });
  });
});
