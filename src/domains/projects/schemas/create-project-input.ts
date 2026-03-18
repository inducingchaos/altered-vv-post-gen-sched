import { type } from "arktype";

export const createProjectInputSchema = type({
  publishAt: "string.date.parse | undefined",
  prompt: "string > 0",
});
