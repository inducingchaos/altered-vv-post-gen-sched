import { listProjectsForUser } from "@/domains/projects/services/projects";
import { getLatestVideoRenderForProject } from "@/domains/videos/services/render-records";

export async function listProjectOverviewsForUser(userId: string) {
  const projects = await listProjectsForUser(userId);

  return Promise.all(
    projects.map(async (project) => ({
      latestRender: await getLatestVideoRenderForProject(project.id),
      project,
    })),
  );
}
