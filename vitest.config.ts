import { defineConfig } from "vitest/config";

// Long AI-vs-AI games run slower on GitHub's machines than locally.
export default defineConfig({
  test: { testTimeout: 60000 },
});
