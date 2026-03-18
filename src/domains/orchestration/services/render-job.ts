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
import {
  createVideoRenderRecord,
  markVideoRenderAsFailed,
  markVideoRenderAsRendered,
} from "@/domains/videos/services/render-records";
import { renderVideo } from "@/domains/videos/services/render-video";

async function markFailed(input: {
  message: string;
  projectId: string;
  renderId?: string;
}) {
  if (input.renderId) await markVideoRenderAsFailed(input.renderId);
  await setProjectStatus(input.projectId, "failed");
  await appendProjectJobEvent({
    detail: {
      message: input.message,
    },
    projectId: input.projectId,
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
  let renderId: string | undefined;

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
    renderId = renderRecord.id;
    const renderedVideo = await renderVideo({
      outputPath: renderRecord.outputPath,
      renderInput: renderInput.data,
    });

    await markVideoRenderAsRendered({
      fileSizeInBytes: renderedVideo.fileSizeInBytes,
      renderId: renderRecord.id,
    });

    await setProjectStatus(payload.projectId, "rendered");
    await appendProjectJobEvent({
      detail: {
        compositionId: renderInput.data.compositionId,
        outputPath: renderRecord.outputPath,
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

    await markFailed({ message, projectId: payload.projectId, renderId });
    logger.error("Render preparation failed", {
      error: message,
      projectId: payload.projectId,
      userId: payload.userId,
    });

    return err(error instanceof Error ? error : new Error(message));
  }
}
