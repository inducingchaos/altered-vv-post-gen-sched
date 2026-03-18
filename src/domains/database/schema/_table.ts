import { pgTableCreator, timestamp } from "drizzle-orm/pg-core";

export const createTable = pgTableCreator((name) => `vvpgs_${name}`);

export const lifecycleColumns = {
  createdAt: timestamp("created_at", {
    mode: "date",
    withTimezone: true,
  })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp("updated_at", {
    mode: "date",
    withTimezone: true,
  })
    .defaultNow()
    .notNull(),
};
