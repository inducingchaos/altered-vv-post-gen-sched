import { desc, eq } from "drizzle-orm";

import { getDatabase } from "@/domains/database/client";
import { publishJobs } from "@/domains/database/schema";

type StartPublishJobInput = {
  platform: string;
  projectId: string;
  publishScheduleId: string;
  videoRenderId: string;
};

export async function getLatestPublishJobForSchedule(
  publishScheduleId: string,
) {
  const [job] = await getDatabase()
    .select()
    .from(publishJobs)
    .where(eq(publishJobs.publishScheduleId, publishScheduleId))
    .orderBy(desc(publishJobs.createdAt))
    .limit(1);

  return job ?? null;
}

export async function startPublishJob(input: StartPublishJobInput) {
  const [job] = await getDatabase()
    .insert(publishJobs)
    .values({
      payload: {
        startedAt: new Date().toISOString(),
      },
      platform: input.platform,
      projectId: input.projectId,
      publishScheduleId: input.publishScheduleId,
      status: "publishing",
      videoRenderId: input.videoRenderId,
    })
    .returning();

  return job;
}

export async function markPublishJobAsPublished(
  publishScheduleId: string,
  payload: Record<string, unknown>,
) {
  return getDatabase()
    .update(publishJobs)
    .set({
      executedAt: new Date(),
      payload,
      status: "published",
      updatedAt: new Date(),
    })
    .where(eq(publishJobs.publishScheduleId, publishScheduleId));
}

export async function markPublishJobAsFailed(
  publishScheduleId: string,
  payload: Record<string, unknown>,
) {
  return getDatabase()
    .update(publishJobs)
    .set({
      payload,
      status: "failed",
      updatedAt: new Date(),
    })
    .where(eq(publishJobs.publishScheduleId, publishScheduleId));
}
