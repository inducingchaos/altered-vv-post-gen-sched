import { type } from "arktype";

const envSchema = type({
  DATABASE_URL: "string | undefined",
  BETTER_AUTH_SECRET: "string > 0 | undefined",
  BETTER_AUTH_URL: "string.url | undefined",
  NEXT_PUBLIC_APP_URL: "string.url | undefined",
  QSTASH_CURRENT_SIGNING_KEY: "string > 0 | undefined",
  QSTASH_NEXT_SIGNING_KEY: "string > 0 | undefined",
  QSTASH_TOKEN: "string > 0 | undefined",
});

type Env = {
  BETTER_AUTH_SECRET?: string;
  BETTER_AUTH_URL?: string;
  DATABASE_URL?: string;
  NEXT_PUBLIC_APP_URL?: string;
  QSTASH_CURRENT_SIGNING_KEY?: string;
  QSTASH_NEXT_SIGNING_KEY?: string;
  QSTASH_TOKEN?: string;
  SUPABASE_DATABASE_URL?: string;
};

let cache: Env | null = null;

export function getEnv(): Env {
  if (cache) {
    return cache;
  }

  const parsed = envSchema({
    DATABASE_URL: process.env.DATABASE_URL,
    BETTER_AUTH_SECRET: process.env.BETTER_AUTH_SECRET,
    BETTER_AUTH_URL: process.env.BETTER_AUTH_URL,
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
    QSTASH_CURRENT_SIGNING_KEY: process.env.QSTASH_CURRENT_SIGNING_KEY,
    QSTASH_NEXT_SIGNING_KEY: process.env.QSTASH_NEXT_SIGNING_KEY,
    QSTASH_TOKEN: process.env.QSTASH_TOKEN,
  });

  if (parsed instanceof type.errors) {
    throw new Error(parsed.summary);
  }

  cache = parsed;

  return cache;
}
