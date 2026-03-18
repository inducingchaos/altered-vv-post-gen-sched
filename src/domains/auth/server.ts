import { drizzleAdapter } from "@better-auth/drizzle-adapter";
import { betterAuth } from "better-auth";
import { nextCookies } from "better-auth/next-js";

import { getDatabase } from "@/domains/database/client";
import {
  account,
  session,
  user,
  verification,
} from "@/domains/database/schema";
import { getEnv } from "@/domains/shared/config/env";

const env = getEnv();

export const auth = betterAuth({
  baseURL:
    env.BETTER_AUTH_URL ?? env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000",
  database: drizzleAdapter(getDatabase(), {
    provider: "pg",
    schema: {
      account,
      session,
      user,
      verification,
    },
  }),
  emailAndPassword: {
    enabled: true,
  },
  plugins: [nextCookies()],
  secret: env.BETTER_AUTH_SECRET ?? "development-only-secret-change-me",
  trustedOrigins: [
    env.BETTER_AUTH_URL ?? env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000",
  ],
});
