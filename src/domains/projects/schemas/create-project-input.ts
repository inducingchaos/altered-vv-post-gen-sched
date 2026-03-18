import { type } from "arktype";

export const createProjectInputSchema = type({
  prompt: "string > 0",
});
