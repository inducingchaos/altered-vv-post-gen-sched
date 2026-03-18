import { index, jsonb, text, timestamp, uuid } from "drizzle-orm/pg-core";

import {
  createTable,
  lifecycleColumns,
} from "@/domains/database/schema/_table";

export const instagramAccountStatusValues = [
  "active",
  "invalid",
  "revoked",
] as const;

export const instagramAccounts = createTable(
  "instagram_accounts",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    accessToken: text("access_token").notNull(),
    instagramUserId: text("instagram_user_id").notNull(),
    lastValidatedAt: timestamp("last_validated_at", {
      mode: "date",
      withTimezone: true,
    }),
    metadata: jsonb("metadata").$type<Record<string, unknown> | null>(),
    status: text("status")
      .$type<(typeof instagramAccountStatusValues)[number]>()
      .notNull(),
    tokenExpiresAt: timestamp("token_expires_at", {
      mode: "date",
      withTimezone: true,
    }),
    userId: text("user_id").notNull(),
    username: text("username").notNull(),
    ...lifecycleColumns,
  },
  (table) => [
    index("vvpgs_instagram_accounts_user_idx").on(table.userId),
    index("vvpgs_instagram_accounts_status_idx").on(table.status),
    index("vvpgs_instagram_accounts_ig_user_idx").on(table.instagramUserId),
  ],
);
