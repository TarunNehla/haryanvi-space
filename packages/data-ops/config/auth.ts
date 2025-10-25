// packages/data-ops/config/auth.ts
import { createBetterAuth } from "../src/auth/setup";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { drizzle } from "drizzle-orm/better-sqlite3";
import Database from "better-sqlite3";

const sqlite = new Database(".wrangler/state/v3/d1/miniflare-D1DatabaseObject/haryanvibe-db.sqlite");
const db = drizzle(sqlite);

export const auth = createBetterAuth({
  database: drizzleAdapter(db, {
    provider: "sqlite",
  }),
});
