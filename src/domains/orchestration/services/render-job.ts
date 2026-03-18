import { type } from "arktype";

import {
  type RenderJob,
  renderJobSchema,
} from "@/domains/orchestration/contracts/render-job";
import {
  appendProjectJobEvent,
  setProjectStatus,
} from "@/domains/projects/services/project-state";
import { getProjectById } from "@/domains/projects/services/projects";
import { logger } from "@/domains/shared/lib/logger";
import { err, ok, type Result } from "@/domains/shared/types/result";
import { mapProjectToRenderInput } from "@/domains/videos/services/map-project-to-render-input";
import { createVideoRenderRecord } from "@/domains/videos/services/render-records";

async function markFailed(projectId: string, message: string) {
  await setProjectStatus(projectId, "failed");
  await appendProjectJobEvent({
    detail: {
      message,
    },
    projectId,
    stage: "prepare-render",
    status: "failed",
  });
}

export async function runRenderJob(
  payload: unknown,
): Promise<Result<{ projectId: string; renderId: string }>> {
  const parsed = renderJobSchema(payload);

  if (parsed instanceof type.errors) return err(new Error(parsed.summary));

  return processRenderJob(parsed);
}

export async function processRenderJob(
  payload: RenderJob,
): Promise<Result<{ projectId: string; renderId: string }>> {
  try {
    await setProjectStatus(payload.projectId, "rendering");
    await appendProjectJobEvent({
      detail: {
        source: "render-job.start",
      },
      projectId: payload.projectId,
      stage: "prepare-render",
      status: "started",
    });

    const project = await getProjectById(payload.projectId);

    if (!project) return err(new Error("Project not found"));

    const renderInput = mapProjectToRenderInput(project);

    if (!renderInput.ok) return err(renderInput.error);

    const renderRecord = await createVideoRenderRecord(
      payload.projectId,
      renderInput.data,
    );

    await setProjectStatus(payload.projectId, "rendered");
    await appendProjectJobEvent({
      detail: {
        compositionId: renderInput.data.compositionId,
        renderId: renderRecord.id,
      },
      projectId: payload.projectId,
      stage: "prepare-render",
      status: "completed",
    });

    logger.info("Render prepared", {
      projectId: payload.projectId,
      renderId: renderRecord.id,
      userId: payload.userId,
    });

    return ok({
      projectId: payload.projectId,
      renderId: renderRecord.id,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Render preparation failed";

    await markFailed(payload.projectId, message);
    logger.error("Render preparation failed", {
      error: message,
      projectId: payload.projectId,
      userId: payload.userId,
    });

    return err(error instanceof Error ? error : new Error(message));
  }
}
