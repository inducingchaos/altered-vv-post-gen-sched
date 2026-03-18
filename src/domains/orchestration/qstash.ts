import { Client } from "@upstash/qstash";

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
