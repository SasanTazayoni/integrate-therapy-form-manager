import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  base: "/",
  plugins: [react(), tailwindcss()],
  server: {
    proxy: {
      "/clients": {
        target: "http://localhost:3001",
        changeOrigin: true,
      },
      "/forms": {
        target: "http://localhost:3001",
        changeOrigin: true,
      },
    },
  },
  test: {
    environment: "jsdom",
    setupFiles: "./setupTests.js",
    coverage: {
      provider: "v8",
      reporter: ["text"],
      exclude: ["**/server.ts", "dist/**", "node_modules/**", "prisma/seed.ts"],
    },
  },
});
