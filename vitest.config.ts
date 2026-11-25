import { defineConfig } from "vitest/config";

// Long AI-vs-AI games run slower on GitHub's machines than locally.
export default defineConfig({
  // tools/ holds the slow balance tester; run it by hand (see the file).
  test: { testTimeout: 60000, include: ["tests/**/*.test.ts"] },
});
