import { Composition } from "remotion";

import type { MinimalExplainerProps } from "@/domains/videos/contracts/minimal-explainer";
import { MinimalExplainerComposition } from "@/domains/videos/remotion/minimal-explainer-composition";

const defaultProps: MinimalExplainerProps = {
  prompt:
    "Explain why leverage compounds risk faster than it compounds upside.",
  scenes: [
    {
      durationInFrames: 90,
      emphasis: "primary",
      id: "S01",
      narration: "Leverage amplifies every error before it amplifies the gain.",
      overlay: "LEVERAGE PUNISHES FRAGILITY",
    },
    {
      durationInFrames: 90,
      emphasis: "secondary",
      id: "S02",
      narration:
        "If timing slips, your downside accelerates while your options shrink.",
      overlay: "MARGIN REMOVES PATIENCE",
    },
  ],
  theme: {
    accent: null,
    background: "hsl(0 0% 6.25%)",
    border: "hsl(0 0% 18.75%)",
    foreground: "hsl(0 0% 98.4375%)",
    muted: "hsl(0 0% 68.75%)",
  },
  title: "Leverage punishes fragility",
};

export function RemotionRoot() {
  return (
    <Composition
      component={MinimalExplainerComposition}
      defaultProps={defaultProps}
      durationInFrames={180}
      fps={30}
      height={1920}
      id="vvpgs-minimal-explainer"
      width={1080}
    />
  );
}
