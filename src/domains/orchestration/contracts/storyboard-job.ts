import { type } from "arktype";

export const storyboardJobSchema = type({
  projectId: "string.uuid",
  prompt: "string > 0",
  userId: "string > 0",
});

export type StoryboardJob = typeof storyboardJobSchema.infer;
