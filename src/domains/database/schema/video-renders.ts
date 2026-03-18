import { index, integer, jsonb, text, uuid } from "drizzle-orm/pg-core";

import {
  createTable,
  lifecycleColumns,
} from "@/domains/database/schema/_table";

export const videoRenderStatusValues = [
  "queued",
  "rendering",
  "rendered",
  "failed",
] as const;

export const videoRenders = createTable(
  "video_renders",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    compositionId: text("composition_id").notNull(),
    durationInFrames: integer("duration_in_frames").notNull(),
    fps: integer("fps").notNull(),
    fileSizeInBytes: integer("file_size_in_bytes"),
    height: integer("height").notNull(),
    outputPath: text("output_path").notNull(),
    projectId: uuid("project_id").notNull(),
    publicUrl: text("public_url"),
    renderInput: jsonb("render_input")
      .$type<Record<string, unknown>>()
      .notNull(),
    status: text("status")
      .$type<(typeof videoRenderStatusValues)[number]>()
      .notNull(),
    width: integer("width").notNull(),
    ...lifecycleColumns,
  },
  (table) => [
    index("vvpgs_video_renders_project_idx").on(table.projectId),
    index("vvpgs_video_renders_status_idx").on(table.status),
  ],
);
