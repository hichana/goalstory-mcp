import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    testTimeout: 10000,
    setupFiles: "./setup.ts",
  },
});
