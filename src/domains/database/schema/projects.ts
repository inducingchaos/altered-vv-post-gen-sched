import { index, jsonb, text, uuid } from "drizzle-orm/pg-core";

import {
  createTable,
  lifecycleColumns,
} from "@/domains/database/schema/_table";

export const projectStatusValues = [
  "draft",
  "queued",
  "storyboarding",
  "storyboarded",
  "rendering",
  "scheduled",
  "published",
  "failed",
] as const;

export const projects = createTable(
  "projects",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    prompt: text("prompt").notNull(),
    status: text("status")
      .$type<(typeof projectStatusValues)[number]>()
      .notNull(),
    storyboard: jsonb("storyboard").$type<Record<string, unknown> | null>(),
    scheduledFor: text("scheduled_for"),
    userId: text("user_id").notNull(),
    ...lifecycleColumns,
  },
  (table) => [
    index("vvpgs_projects_status_idx").on(table.status),
    index("vvpgs_projects_user_id_idx").on(table.userId),
  ],
);
