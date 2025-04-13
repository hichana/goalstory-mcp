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

const MOCK_USER_NAME = "Test User";
const MOCK_USER_ABOUT = "Loves testing and achieving goals.";

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
    const { content, isError } = (await client.callTool({
      name: TOOL_NAMES.GOALSTORY_ABOUT,
      arguments: {},
    })) as CallToolResult;
    expect(isError).toBeFalsy();
    expect(content).toBeDefined();
  });

  // --- User Tools ---
  describe("User Tools", () => {
    test(`${TOOL_NAMES.GOALSTORY_READ_SELF_USER}`, async () => {
      const { content, isError } = (await client.callTool({
        name: TOOL_NAMES.GOALSTORY_READ_SELF_USER,
        arguments: {},
      })) as CallToolResult;
      expect(isError).toBeFalsy();
      expect(content).toBeDefined();
    });

    test(`${TOOL_NAMES.GOALSTORY_UPDATE_SELF_USER}`, async () => {
      const { content, isError } = (await client.callTool({
        name: TOOL_NAMES.GOALSTORY_UPDATE_SELF_USER,
        arguments: {
          name: MOCK_USER_NAME,
          about: MOCK_USER_ABOUT,
          visibility: 1, // Private
        },
      })) as CallToolResult;
      expect(isError).toBeFalsy();
      expect(content).toBeDefined();
    });
  });
});
