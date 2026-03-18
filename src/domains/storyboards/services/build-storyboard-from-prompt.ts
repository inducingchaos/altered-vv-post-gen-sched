function normalizeSentence(sentence: string) {
  return sentence.replace(/\s+/g, " ").trim();
}

function splitPrompt(prompt: string) {
  return prompt
    .split(/[\n.!?]+/)
    .map(normalizeSentence)
    .filter(Boolean);
}

function toSceneLabel(index: number) {
  return `S${String(index + 1).padStart(2, "0")}`;
}

export function buildStoryboardFromPrompt(prompt: string) {
  const sentences = splitPrompt(prompt);
  const title = sentences[0] ?? "Untitled concept";
  const source = sentences.length ? sentences : [normalizeSentence(prompt)];
  const scenes = source.slice(0, 6).map((sentence, index) => ({
    animation: index === 0 ? "title-reveal" : "annotation-slide",
    beats: [
      "Introduce key idea",
      "Frame supporting evidence",
      "Land concise takeaway",
    ],
    durationInFrames: 90,
    emphasis: index === 0 ? "primary" : "secondary",
    id: toSceneLabel(index),
    narration: sentence,
    overlay: sentence.toUpperCase(),
  }));

  return {
    aspectRatio: "9:16",
    prompt,
    scenes,
    title,
    totalFrames: scenes.reduce(
      (total, scene) => total + scene.durationInFrames,
      0,
    ),
    visualLanguage: "monochrome-brutalist",
  };
}
