import { index, jsonb, text, timestamp, uuid } from "drizzle-orm/pg-core";

import {
  createTable,
  lifecycleColumns,
} from "@/domains/database/schema/_table";

export const publishJobStatusValues = [
  "queued",
  "publishing",
  "published",
  "failed",
] as const;

export const publishJobs = createTable(
  "publish_jobs",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    executedAt: timestamp("executed_at", {
      mode: "date",
      withTimezone: true,
    }),
    payload: jsonb("payload").$type<Record<string, unknown>>().notNull(),
    platform: text("platform").notNull(),
    projectId: uuid("project_id").notNull(),
    publishScheduleId: uuid("publish_schedule_id").notNull(),
    status: text("status")
      .$type<(typeof publishJobStatusValues)[number]>()
      .notNull(),
    videoRenderId: uuid("video_render_id").notNull(),
    ...lifecycleColumns,
  },
  (table) => [
    index("vvpgs_publish_jobs_schedule_idx").on(table.publishScheduleId),
    index("vvpgs_publish_jobs_project_idx").on(table.projectId),
    index("vvpgs_publish_jobs_status_idx").on(table.status),
  ],
);
