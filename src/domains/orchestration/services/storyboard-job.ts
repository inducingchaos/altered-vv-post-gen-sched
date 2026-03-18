import { type } from "arktype";

import {
  type StoryboardJob,
  storyboardJobSchema,
} from "@/domains/orchestration/contracts/storyboard-job";
import {
  appendProjectJobEvent,
  setProjectStatus,
  setProjectStoryboard,
} from "@/domains/projects/services/project-state";
import { logger } from "@/domains/shared/lib/logger";
import { err, ok, type Result } from "@/domains/shared/types/result";
import { buildStoryboardFromPrompt } from "@/domains/storyboards/services/build-storyboard-from-prompt";

async function markFailed(projectId: string, message: string) {
  await setProjectStatus(projectId, "failed");
  await appendProjectJobEvent({
    detail: {
      message,
    },
    projectId,
    stage: "generate-storyboard",
    status: "failed",
  });
}

export async function runStoryboardJob(
  payload: unknown,
): Promise<Result<{ projectId: string }>> {
  const parsed = storyboardJobSchema(payload);

  if (parsed instanceof type.errors) {
    return err(new Error(parsed.summary));
  }

  return processStoryboardJob(parsed);
}

export async function processStoryboardJob(
  payload: StoryboardJob,
): Promise<Result<{ projectId: string }>> {
  try {
    await setProjectStatus(payload.projectId, "storyboarding");
    await appendProjectJobEvent({
      detail: {
        source: "storyboard-job.start",
      },
      projectId: payload.projectId,
      stage: "generate-storyboard",
      status: "started",
    });

    const storyboard = buildStoryboardFromPrompt(payload.prompt);

    await setProjectStoryboard(payload.projectId, storyboard);
    await setProjectStatus(payload.projectId, "storyboarded");
    await appendProjectJobEvent({
      detail: {
        sceneCount: storyboard.scenes.length,
        title: storyboard.title,
      },
      projectId: payload.projectId,
      stage: "generate-storyboard",
      status: "completed",
    });

    logger.info("Storyboard generated", {
      projectId: payload.projectId,
      sceneCount: storyboard.scenes.length,
      userId: payload.userId,
    });

    return ok({ projectId: payload.projectId });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Storyboard generation failed";

    await markFailed(payload.projectId, message);
    logger.error("Storyboard generation failed", {
      error: message,
      projectId: payload.projectId,
      userId: payload.userId,
    });

    return err(error instanceof Error ? error : new Error(message));
  }
}
