import { expect, test } from "vitest";
import { client } from "../setup";

test("prompts, resources and tools to exist", async () => {
  const { prompts } = await client.listPrompts();
  const firstPrompt = prompts[0];
  const firstPromptName = firstPrompt.name;
  expect(firstPromptName).toBeDefined();

  const prompt = await client.getPrompt({
    name: firstPromptName,
    arguments: {},
  });
  expect(prompt).toBeDefined();

  const { resources } = await client.listResources();
  const firstResource = resources[0];
  const firstResourceUri = firstResource.uri;

  const resource = await client.readResource({
    uri: firstResourceUri,
  });
  expect(resource).toBeDefined();

  const { tools } = await client.listTools();
  const firstTool = tools[0];
  const firstToolName = firstTool.name;

  const { content, isError } = await client.callTool({
    name: firstToolName,
    arguments: {},
  });
  expect(content).toBeDefined();
  expect(isError).toBeFalsy();

  expect(true).toBe(true);
});
