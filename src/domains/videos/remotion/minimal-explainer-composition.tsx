import { AbsoluteFill, interpolate, Sequence, useCurrentFrame } from "remotion";

import type { MinimalExplainerProps } from "@/domains/videos/contracts/minimal-explainer";

function SceneCard({
  isTitle,
  scene,
  theme,
}: {
  isTitle: boolean;
  scene: MinimalExplainerProps["scenes"][number];
  theme: MinimalExplainerProps["theme"];
}) {
  const frame = useCurrentFrame();
  const translateY = interpolate(frame, [0, 20], [24, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const opacity = interpolate(frame, [0, 12], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const width = `${interpolate(frame, [0, 18], [22, 100], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  })}%`;

  return (
    <AbsoluteFill
      style={{
        color: theme.foreground,
        justifyContent: "space-between",
        padding: 72,
      }}
    >
      <div
        style={{
          alignItems: "center",
          display: "flex",
          gap: 16,
          opacity,
          transform: `translateY(${translateY}px)`,
        }}
      >
        <div
          style={{
            border: `2px solid ${theme.border}`,
            color: theme.muted,
            fontFamily: "var(--font-ibm-plex-mono)",
            fontSize: 24,
            letterSpacing: "0.28em",
            padding: "10px 14px",
            textTransform: "uppercase",
          }}
        >
          {scene.id}
        </div>
        <div
          style={{
            backgroundColor: theme.border,
            height: 2,
            width,
          }}
        />
      </div>

      <div
        style={{
          display: "grid",
          gap: 28,
          opacity,
          transform: `translateY(${translateY}px)`,
        }}
      >
        <h1
          style={{
            fontFamily: "var(--font-space-grotesk)",
            fontSize: isTitle ? 116 : 88,
            fontWeight: 500,
            letterSpacing: "-0.04em",
            lineHeight: 0.88,
            margin: 0,
            maxWidth: 840,
            textTransform: "uppercase",
          }}
        >
          {scene.overlay}
        </h1>
        <p
          style={{
            color:
              scene.emphasis === "primary" ? theme.foreground : theme.muted,
            fontFamily: "var(--font-ibm-plex-mono)",
            fontSize: 28,
            lineHeight: 1.6,
            margin: 0,
            maxWidth: 760,
          }}
        >
          {scene.narration}
        </p>
      </div>

      <div
        style={{
          color: theme.muted,
          display: "flex",
          fontFamily: "var(--font-ibm-plex-mono)",
          fontSize: 22,
          justifyContent: "space-between",
          letterSpacing: "0.2em",
          opacity,
          textTransform: "uppercase",
          transform: `translateY(${translateY}px)`,
        }}
      >
        <span>Visualize Value adjacent</span>
        <span>VVPGS minimal explainer</span>
      </div>
    </AbsoluteFill>
  );
}

export function MinimalExplainerComposition(props: MinimalExplainerProps) {
  let from = 0;

  return (
    <AbsoluteFill style={{ backgroundColor: props.theme.background }}>
      {props.scenes.map((scene, index) => {
        const startFrame = from;
        from += scene.durationInFrames;

        return (
          <Sequence
            durationInFrames={scene.durationInFrames}
            from={startFrame}
            key={scene.id}
          >
            <SceneCard
              isTitle={index === 0}
              scene={scene}
              theme={props.theme}
            />
          </Sequence>
        );
      })}
    </AbsoluteFill>
  );
}
