import { config as loadEnv } from "dotenv";
import { defineConfig, env } from "prisma/config";

// The Prisma config loader does not auto-load .env.local before evaluating
// this file (its internal loader runs with `dotenv: false`), so env() below
// would otherwise fail to resolve. Load it explicitly first.
loadEnv({ path: ".env.local" });

// Prisma 7 moved connection URLs out of schema.prisma. This file only feeds
// the Prisma CLI (migrate, db push, introspect, studio) — it does NOT affect
// the runtime PrismaClient, which uses the pooled DATABASE_URL via
// @prisma/adapter-pg in lib/prisma.ts.
//
// Migrate needs a direct (non-pgbouncer) connection to run DDL, so this uses
// DIRECT_URL rather than the pooled DATABASE_URL.
export default defineConfig({
  schema: "prisma/schema.prisma",
  datasource: {
    url: env("DIRECT_URL"),
  },
});
