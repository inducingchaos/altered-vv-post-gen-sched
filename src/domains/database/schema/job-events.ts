import { index, jsonb, text, uuid } from "drizzle-orm/pg-core";

import {
  createTable,
  lifecycleColumns,
} from "@/domains/database/schema/_table";

export const jobEvents = createTable(
  "job_events",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    projectId: uuid("project_id").notNull(),
    stage: text("stage").notNull(),
    status: text("status").notNull(),
    detail: jsonb("detail").$type<Record<string, unknown>>().notNull(),
    ...lifecycleColumns,
  },
  (table) => [
    index("vvpgs_job_events_project_stage_idx").on(
      table.projectId,
      table.stage,
    ),
  ],
);
