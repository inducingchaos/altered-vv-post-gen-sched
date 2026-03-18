export type StoryboardScene = {
  animation: "annotation-slide" | "title-reveal";
  beats: string[];
  durationInFrames: number;
  emphasis: "primary" | "secondary";
  id: string;
  narration: string;
  overlay: string;
};

export type Storyboard = {
  aspectRatio: "9:16";
  prompt: string;
  scenes: StoryboardScene[];
  title: string;
  totalFrames: number;
  visualLanguage: "monochrome-brutalist";
};
