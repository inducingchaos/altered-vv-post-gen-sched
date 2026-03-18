import { desc, eq } from "drizzle-orm";

import { getDatabase } from "@/domains/database/client";
import { publishSchedules, videoRenders } from "@/domains/database/schema";
import {
  appendProjectJobEvent,
  setProjectStatus,
} from "@/domains/projects/services/project-state";
import { getProjectForUser } from "@/domains/projects/services/projects";
import { err, ok, type Result } from "@/domains/shared/types/result";

type ScheduleProjectPublicationInput = {
  projectId: string;
  publishAt: Date;
  userId: string;
};

export async function getLatestPublishScheduleForProject(projectId: string) {
  const [schedule] = await getDatabase()
    .select()
    .from(publishSchedules)
    .where(eq(publishSchedules.projectId, projectId))
    .orderBy(desc(publishSchedules.createdAt))
    .limit(1);

  return schedule ?? null;
}

async function getLatestRenderForProject(projectId: string) {
  const [render] = await getDatabase()
    .select()
    .from(videoRenders)
    .where(eq(videoRenders.projectId, projectId))
    .orderBy(desc(videoRenders.createdAt))
    .limit(1);

  return render ?? null;
}

export async function scheduleProjectPublication(
  input: ScheduleProjectPublicationInput,
): Promise<Result<typeof publishSchedules.$inferSelect>> {
  const project = await getProjectForUser(input.projectId, input.userId);

  if (!project) return err(new Error("Project not found"));

  const latestRender = await getLatestRenderForProject(input.projectId);

  if (!latestRender) return err(new Error("Project has no render record"));
  if (input.publishAt.getTime() <= Date.now())
    return err(new Error("Publish time must be in the future"));

  const [schedule] = await getDatabase()
    .insert(publishSchedules)
    .values({
      platform: "instagram",
      projectId: input.projectId,
      publishAt: input.publishAt,
      status: "scheduled",
      videoRenderId: latestRender.id,
    })
    .returning();

  await setProjectStatus(input.projectId, "scheduled");
  await appendProjectJobEvent({
    detail: {
      platform: "instagram",
      publishAt: input.publishAt.toISOString(),
      scheduleId: schedule.id,
    },
    projectId: input.projectId,
    stage: "schedule-publish",
    status: "completed",
  });

  return ok(schedule);
}
