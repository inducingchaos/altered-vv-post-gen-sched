import { type } from "arktype";

import type {
  instagramAccounts,
  projects,
  videoRenders,
} from "@/domains/database/schema";
import { instagramGraphRequest } from "@/domains/publishing/services/instagram-graph";
import type { Storyboard } from "@/domains/storyboards/contracts/storyboard";

type InstagramAccountRecord = typeof instagramAccounts.$inferSelect;
type ProjectRecord = typeof projects.$inferSelect;
type VideoRenderRecord = typeof videoRenders.$inferSelect;

function sleep(milliseconds: number) {
  return new Promise((resolve) => setTimeout(resolve, milliseconds));
}

function isStoryboard(value: ProjectRecord["storyboard"]): value is Storyboard {
  if (!value || typeof value !== "object") return false;

  const parsed = type({
    prompt: "string",
    scenes: "object[]",
    title: "string",
    totalFrames: "number",
  })(value);

  return !(parsed instanceof type.errors);
}

function buildInstagramCaption(project: ProjectRecord) {
  const lines = isStoryboard(project.storyboard)
    ? [
        project.storyboard.title,
        project.storyboard.scenes.map((scene) => scene.overlay).join(" / "),
        project.prompt,
      ]
    : [project.prompt];

  return lines.join("\n\n").slice(0, 2200);
}

async function waitForContainerReady(input: {
  accessToken: string;
  containerId: string;
}) {
  for (let attempt = 0; attempt < 24; attempt += 1) {
    const status = await instagramGraphRequest<{
      id: string;
      status?: string;
      status_code?: string;
    }>({
      accessToken: input.accessToken,
      params: {
        fields: "id,status,status_code",
      },
      path: `/${input.containerId}`,
    });
    const code = status.status_code ?? status.status ?? "UNKNOWN";

    if (code === "FINISHED" || code === "PUBLISHED") return;
    if (code === "ERROR" || code === "EXPIRED")
      throw new Error(`Instagram media container failed with status ${code}`);

    await sleep(5_000);
  }

  throw new Error("Timed out waiting for Instagram media container");
}

export async function publishRenderToInstagram(input: {
  account: InstagramAccountRecord;
  project: ProjectRecord;
  render: VideoRenderRecord;
}) {
  if (!input.render.publicUrl) {
    throw new Error("Render is missing a public URL");
  }

  const container = await instagramGraphRequest<{ id: string }>({
    accessToken: input.account.accessToken,
    method: "POST",
    params: {
      caption: buildInstagramCaption(input.project),
      media_type: "REELS",
      share_to_feed: "true",
      video_url: input.render.publicUrl,
    },
    path: `/${input.account.instagramUserId}/media`,
  });

  await waitForContainerReady({
    accessToken: input.account.accessToken,
    containerId: container.id,
  });

  const publication = await instagramGraphRequest<{ id: string }>({
    accessToken: input.account.accessToken,
    method: "POST",
    params: {
      creation_id: container.id,
    },
    path: `/${input.account.instagramUserId}/media_publish`,
  });

  return {
    containerId: container.id,
    externalPostId: publication.id,
    publishedAt: new Date().toISOString(),
  };
}
