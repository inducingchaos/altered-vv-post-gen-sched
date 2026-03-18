import { index, text } from "drizzle-orm/pg-core";

import {
  createTable,
  lifecycleColumns,
} from "@/domains/database/schema/_table";

export const user = createTable(
  "user",
  {
    id: text("id").primaryKey(),
    email: text("email").notNull(),
    emailVerified: text("email_verified").$type<boolean>().notNull(),
    image: text("image"),
    name: text("name").notNull(),
    ...lifecycleColumns,
  },
  (table) => [index("vvpgs_user_email_idx").on(table.email)],
);
