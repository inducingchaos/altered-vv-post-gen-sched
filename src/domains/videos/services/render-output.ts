import { mkdir, stat } from "node:fs/promises";
import path from "node:path";

import { getEnv } from "@/domains/shared/config/env";
import { err, ok, type Result } from "@/domains/shared/types/result";

const renderOutputRoot = path.join(process.cwd(), ".generated", "renders");

export async function ensureRenderOutputDirectory(outputPath: string) {
  await mkdir(path.dirname(outputPath), { recursive: true });
}

export function getRenderOutputPath(input: {
  filename: string;
  projectId: string;
}) {
  return path.join(renderOutputRoot, input.projectId, input.filename);
}

export async function getRenderFileSize(outputPath: string) {
  const metadata = await stat(outputPath);

  return metadata.size;
}

export function getPublicRenderUrl(renderId: string): Result<string> {
  const env = getEnv();
  const appUrl = env.NEXT_PUBLIC_APP_URL ?? env.BETTER_AUTH_URL;

  if (!appUrl)
    return err(new Error("Missing app URL for public render access"));

  return ok(new URL(`/api/public/renders/${renderId}`, appUrl).toString());
}
