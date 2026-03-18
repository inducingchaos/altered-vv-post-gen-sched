import { desc, eq } from "drizzle-orm";

import { getDatabase } from "@/domains/database/client";
import { jobEvents, projects } from "@/domains/database/schema";
import { logger } from "@/domains/shared/lib/logger";
import { err, ok, type Result } from "@/domains/shared/types/result";

type CreateProjectInput = {
  prompt: string;
  userId: string;
};

export async function createProject(
  input: CreateProjectInput,
): Promise<Result<typeof projects.$inferSelect>> {
  const db = getDatabase();

  try {
    const [project] = await db
      .insert(projects)
      .values({
        prompt: input.prompt,
        status: "draft",
        userId: input.userId,
      })
      .returning();

    await db.insert(jobEvents).values({
      detail: {
        source: "project.create",
      },
      projectId: project.id,
      stage: "project-created",
      status: "completed",
    });

    logger.info("Created project", {
      projectId: project.id,
      userId: input.userId,
    });

    return ok(project);
  } catch (error) {
    logger.error("Failed to create project", {
      error: error instanceof Error ? error.message : "unknown",
      userId: input.userId,
    });

    return err(
      error instanceof Error ? error : new Error("Failed to create project"),
    );
  }
}

export async function listProjectsForUser(userId: string) {
  return getDatabase()
    .select()
    .from(projects)
    .where(eq(projects.userId, userId))
    .orderBy(desc(projects.createdAt))
    .limit(12);
}
