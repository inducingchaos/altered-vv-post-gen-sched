import { type } from "arktype";

export const publishJobSchema = type({
  projectId: "string.uuid",
  publishScheduleId: "string.uuid",
  userId: "string > 0",
  videoRenderId: "string.uuid",
});

export type PublishJob = typeof publishJobSchema.infer;
