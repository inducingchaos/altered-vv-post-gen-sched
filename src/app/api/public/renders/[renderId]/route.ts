import { createReadStream } from "node:fs";
import { stat } from "node:fs/promises";
import { Readable } from "node:stream";

import { NextResponse } from "next/server";

import { getVideoRenderById } from "@/domains/videos/services/render-records";

export const runtime = "nodejs";

export async function GET(
  _request: Request,
  context: { params: Promise<{ renderId: string }> },
) {
  const { renderId } = await context.params;
  const render = await getVideoRenderById(renderId);

  if (!render || render.status !== "rendered") {
    return NextResponse.json({ error: "Render not found" }, { status: 404 });
  }

  try {
    const metadata = await stat(render.outputPath);
    const stream = createReadStream(render.outputPath);

    return new NextResponse(Readable.toWeb(stream) as ReadableStream, {
      headers: {
        "cache-control": "public, max-age=31536000, immutable",
        "content-length": metadata.size.toString(),
        "content-type": "video/mp4",
      },
    });
  } catch {
    return NextResponse.json(
      { error: "Render file is unavailable" },
      { status: 404 },
    );
  }
}
