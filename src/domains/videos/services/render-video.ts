import { bundle } from "@remotion/bundler";
import { renderMedia, selectComposition } from "@remotion/renderer";

import { logger } from "@/domains/shared/lib/logger";
import type { MinimalExplainerProps } from "@/domains/videos/contracts/minimal-explainer";
import {
  ensureRenderOutputDirectory,
  getRenderFileSize,
} from "@/domains/videos/services/render-output";

type RenderInput = {
  compositionId: string;
  durationInFrames: number;
  fps: number;
  height: number;
  props: MinimalExplainerProps;
  width: number;
};

let bundleLocationPromise: Promise<string> | null = null;

function getRemotionEntryPoint() {
  return `${process.cwd()}/src/domains/videos/remotion/register-root.ts`;
}

async function getBundleLocation() {
  if (!bundleLocationPromise) {
    bundleLocationPromise = bundle({
      entryPoint: getRemotionEntryPoint(),
      ignoreRegisterRootWarning: true,
      onProgress(progress) {
        logger.info("Bundling Remotion project", { progress });
      },
    });
  }

  return bundleLocationPromise;
}

export async function renderVideo(input: {
  outputPath: string;
  renderInput: RenderInput;
}) {
  await ensureRenderOutputDirectory(input.outputPath);

  const serveUrl = await getBundleLocation();
  const composition = await selectComposition({
    id: input.renderInput.compositionId,
    inputProps: input.renderInput.props as Record<string, unknown>,
    serveUrl,
  });

  await renderMedia({
    codec: "h264",
    composition,
    inputProps: input.renderInput.props as Record<string, unknown>,
    logLevel: "warn",
    onProgress(progress) {
      logger.info("Rendering video", {
        encodedFrames: progress.encodedFrames,
        progress: progress.progress,
        renderedFrames: progress.renderedFrames,
        stitchStage: progress.stitchStage,
      });
    },
    outputLocation: input.outputPath,
    overwrite: true,
    serveUrl,
  });

  const fileSizeInBytes = await getRenderFileSize(input.outputPath);

  return { fileSizeInBytes };
}
