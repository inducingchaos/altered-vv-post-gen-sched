import { type } from "arktype";

export const renderJobSchema = type({
  projectId: "string.uuid",
  userId: "string > 0",
});

export type RenderJob = typeof renderJobSchema.infer;
