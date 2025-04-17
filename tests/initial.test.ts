import { describe, test, expect } from "vitest";
import { client } from "../setup";
import { CallToolResult } from "@modelcontextprotocol/sdk/types.js";

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
  GOALSTORY_CREATE_STORY: "goalstory_create_story",
  GOALSTORY_READ_STORIES: "goalstory_read_stories",
  GOALSTORY_READ_ONE_STORY: "goalstory_read_one_story",
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
const MOCK_STORY_TITLE = "The Tale of the Tested Tool";
const MOCK_STORY_TEXT = "Once upon a time, a tool was tested thoroughly.";

type ToolCallResult = {
  content: { type: string; text: string }[];
  isError: boolean | undefined;
};

// Helper to parse ID from creation responses (adjust prefixes as needed)
function parseIdFromResponse(text: string, prefix: string): string | undefined {
  try {
    const jsonString = text.substring(prefix.length);
    const { result } = JSON.parse(jsonString);
    return result?.id;
  } catch (error) {
    console.error(
      `Failed to parse ID from text starting with '${prefix}':`,
      error,
    );
    return undefined;
  }
}

// Variables to store created IDs for subsequent tests
let createdGoalId: string | undefined;
let createdStepId: string | undefined;
let createdStoryId: string | undefined;

test("prompts, resources and tools should exist", async () => {
  const { prompts } = await client.listPrompts();
  prompts.forEach(async (p) => {
    expect(p.name).toBeTypeOf("string");

    const prompt = await client.getPrompt({
      name: p.name,
      arguments: {},
    });
    expect(prompt).toBeDefined();
  });

  const { resources } = await client.listResources();

  resources.forEach(async (r) => {
    expect(r.name).toBeTypeOf("string");
    expect(r.uri).toBeTypeOf("string");

    const resource = await client.readResource({
      uri: r.uri,
    });
    const { contents } = resource;
    contents.forEach((c) => {
      expect(c.text).toBeTypeOf("string");
      expect(c.uri).toBeTypeOf("string");
    });

    expect(resource).toBeDefined();
  });

  const { tools } = await client.listTools();
  tools.forEach((t) => {
    expect(t.name).toBeTypeOf("string");
    expect(t.description).toBeTypeOf("string");
    expect(t.inputSchema).toBeDefined();
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
          status: 1, // Example status update (e.g., In Progress)
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

      // Attempt to parse and store the ID of the *first* created step
      try {
        const jsonString = text.substring("Steps created:\n".length);
        const { result } = JSON.parse(jsonString);
        expect(Array.isArray(result)).toBeTruthy();
        expect(result.length).toBeGreaterThan(0);
        createdStepId = result[0]?.id;
        expect(createdStepId).toBeTypeOf("string");
      } catch (error) {
        console.error("Failed to parse Step IDs from response:", error);
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
          status: 1, // Example status update (e.g., In Progress)
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
  });

  // --- Focus/Context Tools ---
  describe("Focus/Context Tools", () => {
    test(`${TOOL_NAMES.GOALSTORY_READ_CURRENT_FOCUS}`, async () => {
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
          title: MOCK_STORY_TITLE,
          story_text: MOCK_STORY_TEXT,
        },
      })) as ToolCallResult;
      expect(isError).toBeFalsy();
      expect(text).toBeTypeOf("string");
      expect(text).toContain("Story created:");
      expect(text).toContain(MOCK_STORY_TITLE);

      // Attempt to parse and store the ID
      createdStoryId = parseIdFromResponse(text, "Story created:\n");
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

  // --- Cleanup ---
  // Run destroy tests last to clean up created resources
  describe("Cleanup Tools", () => {
    test(`${TOOL_NAMES.GOALSTORY_DESTROY_STEP}`, async () => {
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

    test(`${TOOL_NAMES.GOALSTORY_DESTROY_GOAL}`, async () => {
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
