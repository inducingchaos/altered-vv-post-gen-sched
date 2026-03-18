import { type } from "arktype";
import { headers } from "next/headers";
import { NextResponse } from "next/server";

import { auth } from "@/domains/auth/server";
import { createProjectInputSchema } from "@/domains/projects/schemas/create-project-input";
import {
  createProject,
  listProjectsForUser,
} from "@/domains/projects/services/projects";

function unauthorized() {
  return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
}

export async function GET() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) return unauthorized();

  const projects = await listProjectsForUser(session.user.id);

  return NextResponse.json({ projects });
}

export async function POST(request: Request) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) return unauthorized();

  const payload = await request.json();
  const parsed = createProjectInputSchema(payload);

  if (parsed instanceof type.errors)
    return NextResponse.json({ error: parsed.summary }, { status: 400 });

  const result = await createProject({
    publishAt: parsed.publishAt,
    prompt: parsed.prompt,
    userId: session.user.id,
  });

  if (!result.ok) {
    return NextResponse.json({ error: result.error.message }, { status: 500 });
  }

  return NextResponse.json({ project: result.data }, { status: 201 });
}
