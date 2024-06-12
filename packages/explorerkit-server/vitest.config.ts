import tsconfigPaths from "vite-tsconfig-paths";
import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    globals: true, // <-- **
    coverage: {
      reporter: ["text", "html"],
    },
  },
  plugins: [tsconfigPaths()],
});
