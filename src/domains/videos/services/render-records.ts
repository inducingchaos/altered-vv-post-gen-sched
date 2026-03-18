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
