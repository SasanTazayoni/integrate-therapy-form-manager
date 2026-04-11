import { defineConfig, ConfigEnv } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig(({ mode }: ConfigEnv) => ({
  base: mode === "production" ? "/" : "/integrate-therapy-form-manager/",
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
      exclude: [
        "vite.config.ts",
        "eslint.config.js",
        "setupTests.js",
        "src/main.tsx",
        "src/vite-env.d.ts",
        "src/types/**",
        "src/App.tsx",
        "backend/**",
        "dist/**",
        "node_modules/**",
        "**/*.test.*",
      ],
    },
  },
}));
