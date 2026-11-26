import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

// Vitest loads its config from the default export.
export default defineConfig({
  resolve: { alias: { "@": fileURLToPath(new URL("./src", import.meta.url)) } },
  test: { include: ["src/**/*.test.ts"], environment: "node" },
});
