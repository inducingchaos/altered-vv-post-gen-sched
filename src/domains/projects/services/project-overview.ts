import { listProjectsForUser } from "@/domains/projects/services/projects";
import { getLatestPublishJobForSchedule } from "@/domains/publishing/services/publish-jobs";
import { getLatestPublishScheduleForProject } from "@/domains/publishing/services/publish-schedules";
import { getLatestVideoRenderForProject } from "@/domains/videos/services/render-records";

export async function listProjectOverviewsForUser(userId: string) {
  const projects = await listProjectsForUser(userId);

  return Promise.all(
    projects.map(async (project) => {
      const latestSchedule = await getLatestPublishScheduleForProject(
        project.id,
      );

      return {
        latestPublishJob: latestSchedule
          ? await getLatestPublishJobForSchedule(latestSchedule.id)
          : null,
        latestRender: await getLatestVideoRenderForProject(project.id),
        latestSchedule,
        project,
      };
    }),
  );
}
