// This file is for Better Auth CLI to read the configuration
// The actual runtime auth instance uses Cloudflare D1 database (see src/lib/auth.ts)
// This file uses a temporary SQLite database only for schema generation

import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import Database from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";
import * as schema from "./src/data/schema/auth-schema";

// Create temporary SQLite database for CLI schema generation
// Runtime uses D1 database via getAuth() in src/lib/auth.ts
const tempDb = drizzle(new Database(":memory:"), { schema });

export const auth = betterAuth({
    database: drizzleAdapter(tempDb, {
        provider: "sqlite",
    }),
    secret: process.env.BETTER_AUTH_SECRET || "temp-secret-for-cli",
    baseURL: process.env.BETTER_AUTH_URL || "http://localhost:8787",
    emailAndPassword: {
        enabled: true,
    },
}


);

export default auth;

