import type { projects } from "@/domains/database/schema";
import { themeTokens } from "@/domains/shared/theme/tokens";
import { err, ok, type Result } from "@/domains/shared/types/result";
import type { Storyboard } from "@/domains/storyboards/contracts/storyboard";
import type { MinimalExplainerProps } from "@/domains/videos/contracts/minimal-explainer";

type ProjectRecord = typeof projects.$inferSelect;

function isStoryboard(value: ProjectRecord["storyboard"]): value is Storyboard {
  if (!value || typeof value !== "object") return false;

  const candidate = value as Partial<Storyboard>;
  return (
    typeof candidate.title === "string" &&
    Array.isArray(candidate.scenes) &&
    typeof candidate.totalFrames === "number"
  );
}

export function mapProjectToRenderInput(project: ProjectRecord): Result<{
  compositionId: string;
  durationInFrames: number;
  fps: number;
  height: number;
  props: MinimalExplainerProps;
  width: number;
}> {
  if (!isStoryboard(project.storyboard))
    return err(new Error("Project storyboard is not ready"));

  const storyboard = project.storyboard;
  const props: MinimalExplainerProps = {
    prompt: storyboard.prompt,
    scenes: storyboard.scenes.map((scene) => ({
      durationInFrames: scene.durationInFrames,
      emphasis: scene.emphasis,
      id: scene.id,
      narration: scene.narration,
      overlay: scene.overlay,
    })),
    theme: {
      accent: themeTokens.accent,
      background: themeTokens.palette.dark.background,
      border: themeTokens.palette.dark.border,
      foreground: themeTokens.palette.dark.foreground,
      muted: themeTokens.palette.dark.mutedForeground,
    },
    title: storyboard.title,
  };

  return ok({
    compositionId: "vvpgs-minimal-explainer",
    durationInFrames: storyboard.totalFrames,
    fps: 30,
    height: 1920,
    props,
    width: 1080,
  });
}
