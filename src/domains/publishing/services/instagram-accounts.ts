import { and, desc, eq } from "drizzle-orm";

import { getDatabase } from "@/domains/database/client";
import { instagramAccounts } from "@/domains/database/schema";
import { instagramGraphRequest } from "@/domains/publishing/services/instagram-graph";
import { err, ok, type Result } from "@/domains/shared/types/result";

type ConnectInstagramAccountInput = {
  accessToken: string;
  instagramUserId: string;
  userId: string;
};

type InstagramProfile = {
  account_type?: string;
  id: string;
  name?: string;
  profile_picture_url?: string;
  username?: string;
};

export async function getActiveInstagramAccountForUser(userId: string) {
  const [account] = await getDatabase()
    .select()
    .from(instagramAccounts)
    .where(
      and(
        eq(instagramAccounts.userId, userId),
        eq(instagramAccounts.status, "active"),
      ),
    )
    .orderBy(desc(instagramAccounts.updatedAt))
    .limit(1);

  return account ?? null;
}

export async function listInstagramAccountsForUser(userId: string) {
  return getDatabase()
    .select()
    .from(instagramAccounts)
    .where(eq(instagramAccounts.userId, userId))
    .orderBy(desc(instagramAccounts.updatedAt))
    .limit(6);
}

export async function validateInstagramAccount(input: {
  accessToken: string;
  instagramUserId: string;
}) {
  return instagramGraphRequest<InstagramProfile>({
    accessToken: input.accessToken,
    params: {
      fields: "account_type,id,profile_picture_url,username",
    },
    path: `/${input.instagramUserId}`,
  });
}

export async function connectInstagramAccount(
  input: ConnectInstagramAccountInput,
): Promise<Result<typeof instagramAccounts.$inferSelect>> {
  try {
    const profile = await validateInstagramAccount({
      accessToken: input.accessToken,
      instagramUserId: input.instagramUserId,
    });
    const [existing] = await getDatabase()
      .select()
      .from(instagramAccounts)
      .where(
        and(
          eq(instagramAccounts.userId, input.userId),
          eq(instagramAccounts.instagramUserId, input.instagramUserId),
        ),
      )
      .limit(1);

    if (existing) {
      const [account] = await getDatabase()
        .update(instagramAccounts)
        .set({
          accessToken: input.accessToken,
          lastValidatedAt: new Date(),
          metadata: {
            accountType: profile.account_type ?? null,
            profilePictureUrl: profile.profile_picture_url ?? null,
          },
          status: "active",
          updatedAt: new Date(),
          username: profile.username ?? profile.name ?? input.instagramUserId,
        })
        .where(eq(instagramAccounts.id, existing.id))
        .returning();

      return ok(account);
    }

    const [account] = await getDatabase()
      .insert(instagramAccounts)
      .values({
        accessToken: input.accessToken,
        instagramUserId: input.instagramUserId,
        lastValidatedAt: new Date(),
        metadata: {
          accountType: profile.account_type ?? null,
          profilePictureUrl: profile.profile_picture_url ?? null,
        },
        status: "active",
        userId: input.userId,
        username: profile.username ?? profile.name ?? input.instagramUserId,
      })
      .returning();

    return ok(account);
  } catch (error) {
    return err(
      error instanceof Error
        ? error
        : new Error("Failed to connect Instagram account"),
    );
  }
}

export async function revokeInstagramAccount(input: {
  accountId: string;
  userId: string;
}) {
  const [account] = await getDatabase()
    .update(instagramAccounts)
    .set({
      status: "revoked",
      updatedAt: new Date(),
    })
    .where(
      and(
        eq(instagramAccounts.id, input.accountId),
        eq(instagramAccounts.userId, input.userId),
      ),
    )
    .returning();

  return account ?? null;
}
