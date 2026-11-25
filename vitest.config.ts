import { defineConfig } from "vitest/config";

// Long AI-vs-AI games run slower on GitHub's machines than locally.
export default defineConfig({
  // tools/ holds the slow balance tester; run it by hand (see the file).
  // BALANCE=1 runs only the slow balance tester in tools/.
  test: { testTimeout: 60000, include: process.env.BALANCE ? ["tools/balance.test.ts"] : process.env.PLAY ? ["tools/play.test.ts"] : ["tests/**/*.test.ts"] },
});
