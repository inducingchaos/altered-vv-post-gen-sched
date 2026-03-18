import { listProjectsForUser } from "@/domains/projects/services/projects";
import { getLatestPublishScheduleForProject } from "@/domains/publishing/services/publish-schedules";
import { getLatestVideoRenderForProject } from "@/domains/videos/services/render-records";

export async function listProjectOverviewsForUser(userId: string) {
  const projects = await listProjectsForUser(userId);

  return Promise.all(
    projects.map(async (project) => ({
      latestRender: await getLatestVideoRenderForProject(project.id),
      latestSchedule: await getLatestPublishScheduleForProject(project.id),
      project,
    })),
  );
}
