export type MinimalExplainerScene = {
  durationInFrames: number;
  emphasis: "primary" | "secondary";
  id: string;
  narration: string;
  overlay: string;
};

export type MinimalExplainerProps = {
  prompt: string;
  scenes: MinimalExplainerScene[];
  theme: {
    accent: string | null;
    background: string;
    border: string;
    foreground: string;
    muted: string;
  };
  title: string;
};
