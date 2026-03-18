import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";

import { getEnv } from "@/domains/shared/config/env";

let database: ReturnType<typeof drizzle> | null = null;

export function getDatabase() {
  if (database) {
    return database;
  }

  const env = getEnv();
  const connectionString = env.DATABASE_URL;

  if (!connectionString) throw new Error("DATABASE_URL is required");

  const client = postgres(connectionString, {
    max: 1,
    prepare: false,
  });

  database = drizzle({ client });

  return database;
}
