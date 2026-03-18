import { index, text, timestamp } from "drizzle-orm/pg-core";

import {
  createTable,
  lifecycleColumns,
} from "@/domains/database/schema/_table";

export const verification = createTable(
  "verification",
  {
    id: text("id").primaryKey(),
    expiresAt: timestamp("expires_at", {
      mode: "date",
      withTimezone: true,
    }).notNull(),
    identifier: text("identifier").notNull(),
    value: text("value").notNull(),
    ...lifecycleColumns,
  },
  (table) => [
    index("vvpgs_verification_identifier_idx").on(table.identifier),
    index("vvpgs_verification_value_idx").on(table.value),
  ],
);
