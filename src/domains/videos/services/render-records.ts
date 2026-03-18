import { desc, eq } from "drizzle-orm";

import { getDatabase } from "@/domains/database/client";
import { videoRenders } from "@/domains/database/schema";
import type { MinimalExplainerProps } from "@/domains/videos/contracts/minimal-explainer";

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
  const [record] = await getDatabase()
    .insert(videoRenders)
    .values({
      compositionId: renderInput.compositionId,
      durationInFrames: renderInput.durationInFrames,
      fps: renderInput.fps,
      height: renderInput.height,
      outputPath: `renders/${projectId}/latest.mp4`,
      projectId,
      renderInput: renderInput as unknown as Record<string, unknown>,
      status: "rendered",
      width: renderInput.width,
    })
    .returning();

  return record;
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
