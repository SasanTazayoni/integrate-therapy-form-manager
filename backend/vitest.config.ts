import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    coverage: {
      exclude: [
        "vitest.config.ts",
        "eslint.config.js",
        "env.ts",
        "index.ts",
        "server.ts",
        "data/**",
        "routes/**",
        "prisma/**",
        "dist/**",
        "node_modules/**",
        "**/*.test.*",
      ],
    },
  },
});
