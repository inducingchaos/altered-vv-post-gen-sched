import { type } from "arktype";
import { NextResponse } from "next/server";

import { getCurrentSession } from "@/domains/auth/server/session";
import { scheduleProjectPublication } from "@/domains/publishing/services/publish-schedules";

const scheduleInputSchema = type({
  publishAt: "string.date.parse",
});

type Props = {
  params: Promise<{
    projectId: string;
  }>;
};

export async function POST(request: Request, { params }: Props) {
  const session = await getCurrentSession();

  if (!session)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { projectId } = await params;
  const payload = await request.json();
  const parsed = scheduleInputSchema(payload);

  if (parsed instanceof type.errors)
    return NextResponse.json({ error: parsed.summary }, { status: 400 });

  const result = await scheduleProjectPublication({
    projectId,
    publishAt: parsed.publishAt,
    userId: session.user.id,
  });

  if (!result.ok) {
    return NextResponse.json({ error: result.error.message }, { status: 409 });
  }

  return NextResponse.json({ schedule: result.data }, { status: 201 });
}
