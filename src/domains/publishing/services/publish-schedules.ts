import { desc, eq } from "drizzle-orm";

import { getDatabase } from "@/domains/database/client";
import { publishSchedules, videoRenders } from "@/domains/database/schema";
import { publishJobSchema } from "@/domains/orchestration/contracts/publish-job";
import {
  getInternalJobUrl,
  getQStashClient,
  getQStashHeaders,
} from "@/domains/orchestration/qstash";
import {
  appendProjectJobEvent,
  setProjectStatus,
} from "@/domains/projects/services/project-state";
import { getProjectForUser } from "@/domains/projects/services/projects";
import { getActiveInstagramAccountForUser } from "@/domains/publishing/services/instagram-accounts";
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

export async function getPublishScheduleById(publishScheduleId: string) {
  const [schedule] = await getDatabase()
    .select()
    .from(publishSchedules)
    .where(eq(publishSchedules.id, publishScheduleId))
    .limit(1);

  return schedule ?? null;
}

async function queuePublishExecution(input: {
  projectId: string;
  publishAt: Date;
  publishScheduleId: string;
  userId: string;
  videoRenderId: string;
}) {
  const client = getQStashClient();

  if (!client) return ok({ publishScheduleId: input.publishScheduleId });

  await client.publishJSON({
    body: publishJobSchema.assert({
      projectId: input.projectId,
      publishScheduleId: input.publishScheduleId,
      userId: input.userId,
      videoRenderId: input.videoRenderId,
    }),
    headers: getQStashHeaders(),
    notBefore: Math.floor(input.publishAt.getTime() / 1000),
    retries: 3,
    url: getInternalJobUrl("/api/jobs/publish"),
  });

  return ok({ publishScheduleId: input.publishScheduleId });
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
  const instagramAccount = await getActiveInstagramAccountForUser(input.userId);

  if (!latestRender) return err(new Error("Project has no render record"));
  if (!instagramAccount)
    return err(new Error("Connect an Instagram account before scheduling"));
  if (!latestRender.publicUrl)
    return err(new Error("Project render is missing a public URL"));
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
      videoRenderId: latestRender.id,
    },
    projectId: input.projectId,
    stage: "schedule-publish",
    status: "completed",
  });
  await appendProjectJobEvent({
    detail: {
      publishAt: input.publishAt.toISOString(),
      scheduleId: schedule.id,
      source: "publish.enqueue",
    },
    projectId: input.projectId,
    stage: "publish-instagram",
    status: "queued",
  });

  const enqueueResult = await queuePublishExecution({
    projectId: input.projectId,
    publishAt: input.publishAt,
    publishScheduleId: schedule.id,
    userId: input.userId,
    videoRenderId: latestRender.id,
  });

  if (!enqueueResult.ok) return err(enqueueResult.error);

  return ok(schedule);
}

export async function markScheduleAsPublished(publishScheduleId: string) {
  return getDatabase()
    .update(publishSchedules)
    .set({
      status: "published",
      updatedAt: new Date(),
    })
    .where(eq(publishSchedules.id, publishScheduleId));
}

export async function markScheduleAsFailed(publishScheduleId: string) {
  return getDatabase()
    .update(publishSchedules)
    .set({
      status: "failed",
      updatedAt: new Date(),
    })
    .where(eq(publishSchedules.id, publishScheduleId));
}
