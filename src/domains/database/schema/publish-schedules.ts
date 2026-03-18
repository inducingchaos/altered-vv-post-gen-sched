import { index, text, timestamp, uuid } from "drizzle-orm/pg-core";

import {
  createTable,
  lifecycleColumns,
} from "@/domains/database/schema/_table";

export const publishScheduleStatusValues = [
  "scheduled",
  "published",
  "failed",
  "canceled",
] as const;

export const publishSchedules = createTable(
  "publish_schedules",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    platform: text("platform").notNull(),
    projectId: uuid("project_id").notNull(),
    publishAt: timestamp("publish_at", {
      mode: "date",
      withTimezone: true,
    }).notNull(),
    status: text("status")
      .$type<(typeof publishScheduleStatusValues)[number]>()
      .notNull(),
    videoRenderId: uuid("video_render_id").notNull(),
    ...lifecycleColumns,
  },
  (table) => [
    index("vvpgs_publish_schedules_project_idx").on(table.projectId),
    index("vvpgs_publish_schedules_status_idx").on(table.status),
  ],
);
