import { type } from "arktype";

import {
  type PublishJob,
  publishJobSchema,
} from "@/domains/orchestration/contracts/publish-job";
import {
  appendProjectJobEvent,
  setProjectStatus,
} from "@/domains/projects/services/project-state";
import {
  markPublishJobAsFailed,
  markPublishJobAsPublished,
  startPublishJob,
} from "@/domains/publishing/services/publish-jobs";
import {
  getPublishScheduleById,
  markScheduleAsFailed,
  markScheduleAsPublished,
} from "@/domains/publishing/services/publish-schedules";
import { logger } from "@/domains/shared/lib/logger";
import { err, ok, type Result } from "@/domains/shared/types/result";

async function markFailed(payload: PublishJob, message: string) {
  await markScheduleAsFailed(payload.publishScheduleId);
  await markPublishJobAsFailed(payload.publishScheduleId, {
    message,
  });
  await setProjectStatus(payload.projectId, "failed");
  await appendProjectJobEvent({
    detail: {
      message,
    },
    projectId: payload.projectId,
    stage: "publish-instagram",
    status: "failed",
  });
}

export async function runPublishJob(
  payload: unknown,
): Promise<Result<{ projectId: string; publishScheduleId: string }>> {
  const parsed = publishJobSchema(payload);

  if (parsed instanceof type.errors) return err(new Error(parsed.summary));

  return processPublishJob(parsed);
}

export async function processPublishJob(
  payload: PublishJob,
): Promise<Result<{ projectId: string; publishScheduleId: string }>> {
  try {
    const schedule = await getPublishScheduleById(payload.publishScheduleId);

    if (!schedule) return err(new Error("Publish schedule not found"));

    await startPublishJob({
      platform: schedule.platform,
      projectId: payload.projectId,
      publishScheduleId: payload.publishScheduleId,
      videoRenderId: payload.videoRenderId,
    });
    await appendProjectJobEvent({
      detail: {
        source: "publish-job.start",
      },
      projectId: payload.projectId,
      stage: "publish-instagram",
      status: "started",
    });

    await markScheduleAsPublished(payload.publishScheduleId);
    await markPublishJobAsPublished(payload.publishScheduleId, {
      deliveryMode: "simulated",
      externalPostId: `instagram-simulated-${payload.publishScheduleId}`,
      publishedAt: new Date().toISOString(),
    });
    await setProjectStatus(payload.projectId, "published");
    await appendProjectJobEvent({
      detail: {
        deliveryMode: "simulated",
        publishScheduleId: payload.publishScheduleId,
      },
      projectId: payload.projectId,
      stage: "publish-instagram",
      status: "completed",
    });

    logger.info("Publish job completed", {
      projectId: payload.projectId,
      publishScheduleId: payload.publishScheduleId,
      userId: payload.userId,
    });

    return ok({
      projectId: payload.projectId,
      publishScheduleId: payload.publishScheduleId,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Publish job failed";

    await markFailed(payload, message);
    logger.error("Publish job failed", {
      error: message,
      projectId: payload.projectId,
      publishScheduleId: payload.publishScheduleId,
      userId: payload.userId,
    });

    return err(error instanceof Error ? error : new Error(message));
  }
}
