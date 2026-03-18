import { desc, eq } from "drizzle-orm";

import { getDatabase } from "@/domains/database/client";
import { projects } from "@/domains/database/schema";
import type { StoryboardJob } from "@/domains/orchestration/contracts/storyboard-job";
import {
  getInternalJobUrl,
  getQStashClient,
  getQStashHeaders,
} from "@/domains/orchestration/qstash";
import { processStoryboardJob } from "@/domains/orchestration/services/storyboard-job";
import {
  appendProjectJobEvent,
  setProjectStatus,
} from "@/domains/projects/services/project-state";
import { logger } from "@/domains/shared/lib/logger";
import { err, ok, type Result } from "@/domains/shared/types/result";

type CreateProjectInput = {
  prompt: string;
  userId: string;
};

async function queueStoryboardGeneration(job: StoryboardJob) {
  const client = getQStashClient();

  if (!client) return processStoryboardJob(job);

  await client.publishJSON({
    body: job,
    headers: getQStashHeaders(),
    retries: 3,
    url: getInternalJobUrl("/api/jobs/storyboard"),
  });

  return ok({ projectId: job.projectId });
}

export async function createProject(
  input: CreateProjectInput,
): Promise<Result<typeof projects.$inferSelect>> {
  const db = getDatabase();

  try {
    const [project] = await db
      .insert(projects)
      .values({
        prompt: input.prompt,
        status: "queued",
        userId: input.userId,
      })
      .returning();

    await appendProjectJobEvent({
      detail: {
        source: "project.create",
      },
      projectId: project.id,
      stage: "project-created",
      status: "completed",
    });
    await appendProjectJobEvent({
      detail: {
        source: "storyboard.enqueue",
      },
      projectId: project.id,
      stage: "generate-storyboard",
      status: "queued",
    });

    const enqueueResult = await queueStoryboardGeneration({
      projectId: project.id,
      prompt: input.prompt,
      userId: input.userId,
    });

    if (!enqueueResult.ok) {
      await setProjectStatus(project.id, "failed");

      return err(enqueueResult.error);
    }

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
