import { NextResponse } from "next/server";

import { runStoryboardJob } from "@/domains/orchestration/services/storyboard-job";
import { verifyQStashRequest } from "@/domains/orchestration/verify-qstash-request";

export async function POST(request: Request) {
  const verification = await verifyQStashRequest(request);

  if (!verification.ok) {
    return NextResponse.json(
      { error: verification.error.message },
      { status: 401 },
    );
  }

  const result = await runStoryboardJob(verification.data.body);

  if (!result.ok) {
    return NextResponse.json({ error: result.error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true, project: result.data });
}
