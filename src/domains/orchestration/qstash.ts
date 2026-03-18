import { Client } from "@upstash/qstash";
import { appConfig } from "@/domains/shared/config/app";
import { getEnv } from "@/domains/shared/config/env";

let client: Client | null = null;

export function getQStashClient() {
  const env = getEnv();

  if (!env.QSTASH_TOKEN) {
    return null;
  }

  if (client) {
    return client;
  }

  client = new Client({
    token: env.QSTASH_TOKEN,
  });

  return client;
}

export function getInternalJobUrl(path: string) {
  const env = getEnv();
  const origin =
    env.NEXT_PUBLIC_APP_URL ?? env.BETTER_AUTH_URL ?? `http://localhost:3000`;

  return new URL(path, origin).toString();
}

export function getQStashHeaders() {
  return {
    "content-type": "application/json",
    "x-vvpgs-app": appConfig.shortName,
  };
}
