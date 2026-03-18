import { index, text, timestamp } from "drizzle-orm/pg-core";

import {
  createTable,
  lifecycleColumns,
} from "@/domains/database/schema/_table";

export const session = createTable(
  "session",
  {
    id: text("id").primaryKey(),
    expiresAt: timestamp("expires_at", {
      mode: "date",
      withTimezone: true,
    }).notNull(),
    ipAddress: text("ip_address"),
    token: text("token").notNull(),
    userAgent: text("user_agent"),
    userId: text("user_id").notNull(),
    ...lifecycleColumns,
  },
  (table) => [
    index("vvpgs_session_token_idx").on(table.token),
    index("vvpgs_session_user_id_idx").on(table.userId),
  ],
);
