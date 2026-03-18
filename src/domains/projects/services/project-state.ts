import { eq } from "drizzle-orm";

import { getDatabase } from "@/domains/database/client";
import {
  jobEvents,
  type projectStatusValues,
  projects,
} from "@/domains/database/schema";

type ProjectStatus = (typeof projectStatusValues)[number];

type AppendProjectJobEventInput = {
  detail: Record<string, unknown>;
  projectId: string;
  stage: string;
  status: string;
};

export async function appendProjectJobEvent(input: AppendProjectJobEventInput) {
  return getDatabase().insert(jobEvents).values({
    detail: input.detail,
    projectId: input.projectId,
    stage: input.stage,
    status: input.status,
  });
}

export async function setProjectStatus(
  projectId: string,
  status: ProjectStatus,
) {
  return getDatabase()
    .update(projects)
    .set({
      status,
      updatedAt: new Date(),
    })
    .where(eq(projects.id, projectId));
}

export async function setProjectStoryboard(
  projectId: string,
  storyboard: Record<string, unknown>,
) {
  return getDatabase()
    .update(projects)
    .set({
      storyboard,
      updatedAt: new Date(),
    })
    .where(eq(projects.id, projectId));
}

export async function setProjectScheduledFor(
  projectId: string,
  scheduledFor: string | null,
) {
  return getDatabase()
    .update(projects)
    .set({
      scheduledFor,
      updatedAt: new Date(),
    })
    .where(eq(projects.id, projectId));
}
