import { Receiver } from "@upstash/qstash";

import { getEnv } from "@/domains/shared/config/env";
import { err, ok, type Result } from "@/domains/shared/types/result";

let receiver: Receiver | null = null;

function getReceiver() {
  if (receiver) return receiver;

  const env = getEnv();

  if (!env.QSTASH_CURRENT_SIGNING_KEY || !env.QSTASH_NEXT_SIGNING_KEY) {
    return null;
  }

  receiver = new Receiver({
    currentSigningKey: env.QSTASH_CURRENT_SIGNING_KEY,
    nextSigningKey: env.QSTASH_NEXT_SIGNING_KEY,
  });

  return receiver;
}

export async function verifyQStashRequest(
  request: Request,
): Promise<Result<{ body: unknown }>> {
  const signature = request.headers.get("upstash-signature");
  const rawBody = await request.text();
  const verifier = getReceiver();

  if (!verifier) return ok({ body: JSON.parse(rawBody) });
  if (!signature) return err(new Error("Missing Upstash signature"));

  await verifier.verify({
    body: rawBody,
    signature,
    url: request.url,
  });

  return ok({ body: JSON.parse(rawBody) });
}
