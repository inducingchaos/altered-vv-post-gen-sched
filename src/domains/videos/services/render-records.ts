import { randomUUID } from "node:crypto";
import { desc, eq } from "drizzle-orm";

import { getDatabase } from "@/domains/database/client";
import { videoRenders } from "@/domains/database/schema";
import type { MinimalExplainerProps } from "@/domains/videos/contracts/minimal-explainer";
import {
  getPublicRenderUrl,
  getRenderOutputPath,
} from "@/domains/videos/services/render-output";

type RenderInput = {
  compositionId: string;
  durationInFrames: number;
  fps: number;
  height: number;
  props: MinimalExplainerProps;
  width: number;
};

export async function createVideoRenderRecord(
  projectId: string,
  renderInput: RenderInput,
) {
  const filename = `${randomUUID()}.mp4`;
  const outputPath = getRenderOutputPath({ filename, projectId });

  const [record] = await getDatabase()
    .insert(videoRenders)
    .values({
      compositionId: renderInput.compositionId,
      durationInFrames: renderInput.durationInFrames,
      fps: renderInput.fps,
      height: renderInput.height,
      outputPath,
      projectId,
      renderInput: renderInput as unknown as Record<string, unknown>,
      status: "rendering",
      width: renderInput.width,
    })
    .returning();

  return record;
}

export async function getVideoRenderById(renderId: string) {
  const [record] = await getDatabase()
    .select()
    .from(videoRenders)
    .where(eq(videoRenders.id, renderId))
    .limit(1);

  return record ?? null;
}

export async function getLatestVideoRenderForProject(projectId: string) {
  const [record] = await getDatabase()
    .select()
    .from(videoRenders)
    .where(eq(videoRenders.projectId, projectId))
    .orderBy(desc(videoRenders.createdAt))
    .limit(1);

  return record ?? null;
}

export async function markVideoRenderAsFailed(renderId: string) {
  return getDatabase()
    .update(videoRenders)
    .set({
      status: "failed",
      updatedAt: new Date(),
    })
    .where(eq(videoRenders.id, renderId));
}

export async function markVideoRenderAsRendered(input: {
  fileSizeInBytes: number;
  renderId: string;
}) {
  const publicUrl = getPublicRenderUrl(input.renderId);

  return getDatabase()
    .update(videoRenders)
    .set({
      fileSizeInBytes: input.fileSizeInBytes,
      publicUrl: publicUrl.ok ? publicUrl.data : null,
      status: "rendered",
      updatedAt: new Date(),
    })
    .where(eq(videoRenders.id, input.renderId));
}
