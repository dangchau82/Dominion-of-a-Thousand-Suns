// Runs one slow tool test outside npm test. TOOL=tools/<name>.test.ts (default: the Master AI tournament).
import { defineConfig } from "vitest/config";
export default defineConfig({ test: { testTimeout: 6000000, include: [process.env.TOOL ?? "tools/tournament.test.ts"] } });
