import { headers } from "next/headers";

import { auth } from "@/domains/auth/server";

export async function getCurrentSession() {
  return auth.api.getSession({
    headers: await headers(),
  });
}
