import { defineConfig } from "vitest/config";
import tsconfigPaths from "vite-tsconfig-paths";

// Unit/domain tests only (pure functions — no live database). Server Actions
// that need Prisma/Supabase are exercised via manual DB scripts and browser
// testing, per this project's established practice (see CLAUDE.md) — this
// config is deliberately narrow rather than trying to fake a full
// integration-test harness in one pass.
export default defineConfig({
  plugins: [tsconfigPaths()],
  test: {
    environment: "node",
    include: ["**/*.test.ts"],
    exclude: ["node_modules/**", ".next/**"],
  },
});
