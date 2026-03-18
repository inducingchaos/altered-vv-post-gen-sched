import { NextResponse } from "next/server";

import { getCurrentSession } from "@/domains/auth/server/session";
import { getProjectForUser } from "@/domains/projects/services/projects";
import { mapProjectToRenderInput } from "@/domains/videos/services/map-project-to-render-input";

type Props = {
  params: Promise<{
    projectId: string;
  }>;
};

export async function GET(_: Request, { params }: Props) {
  const session = await getCurrentSession();

  if (!session)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { projectId } = await params;
  const project = await getProjectForUser(projectId, session.user.id);

  if (!project)
    return NextResponse.json({ error: "Not found" }, { status: 404 });

  const renderInput = mapProjectToRenderInput(project);

  if (!renderInput.ok) {
    return NextResponse.json(
      { error: renderInput.error.message },
      { status: 409 },
    );
  }

  return NextResponse.json(renderInput.data);
}
