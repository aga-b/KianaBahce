import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    include: ["tests/integration/**/*.test.ts", "tests/security/**/*.test.ts"],
    testTimeout: 20000,
    hookTimeout: 20000,
    reporters: process.env.CI ? ["default", "github-actions"] : ["default"],
  },
});
