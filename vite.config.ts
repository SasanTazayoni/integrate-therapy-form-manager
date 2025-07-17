import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";

export default defineConfig({
  base: "/ysq-questionnaire/",
  plugins: [react()],
  test: {
    environment: "jsdom",
    setupFiles: "./setupTests.js",
    coverage: {
      provider: "v8",
      reporter: ["text"],
      exclude: ["**/server.ts", "node_modules/**"],
    },
    exclude: ["**/server.ts", "node_modules/**"],
  },
});
