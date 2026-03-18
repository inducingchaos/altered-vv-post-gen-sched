import { type } from "arktype";
import { NextResponse } from "next/server";

import { getCurrentSession } from "@/domains/auth/server/session";
import {
  connectInstagramAccount,
  getActiveInstagramAccountForUser,
  revokeInstagramAccount,
} from "@/domains/publishing/services/instagram-accounts";

const connectInstagramAccountInputSchema = type({
  accessToken: "string > 0",
  instagramUserId: "string > 0",
});

function unauthorized() {
  return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
}

export async function GET() {
  const session = await getCurrentSession();

  if (!session) return unauthorized();

  const account = await getActiveInstagramAccountForUser(session.user.id);

  return NextResponse.json({ account });
}

export async function PUT(request: Request) {
  const session = await getCurrentSession();

  if (!session) return unauthorized();

  const payload = await request.json();
  const parsed = connectInstagramAccountInputSchema(payload);

  if (parsed instanceof type.errors) {
    return NextResponse.json({ error: parsed.summary }, { status: 400 });
  }

  const result = await connectInstagramAccount({
    accessToken: parsed.accessToken,
    instagramUserId: parsed.instagramUserId,
    userId: session.user.id,
  });

  if (!result.ok) {
    return NextResponse.json({ error: result.error.message }, { status: 400 });
  }

  return NextResponse.json({ account: result.data }, { status: 200 });
}

export async function DELETE() {
  const session = await getCurrentSession();

  if (!session) return unauthorized();

  const account = await getActiveInstagramAccountForUser(session.user.id);

  if (!account) {
    return NextResponse.json(
      { error: "No Instagram account connected" },
      { status: 404 },
    );
  }

  await revokeInstagramAccount({
    accountId: account.id,
    userId: session.user.id,
  });

  return NextResponse.json({ ok: true }, { status: 200 });
}
