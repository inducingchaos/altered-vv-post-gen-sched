import { Button } from "@/components/ui/button";
import { AuthShell } from "@/domains/auth/components/auth-shell";
import { getCurrentSession } from "@/domains/auth/server/session";
import { ProjectIntake } from "@/domains/projects/components/project-intake";
import { listProjectOverviewsForUser } from "@/domains/projects/services/project-overview";
import { themeTokens } from "@/domains/shared/theme/tokens";

export default async function Home() {
  const pipeline = [
    "Prompt intake",
    "Storyboard generation",
    "Remotion composition",
    "Render queue",
    "Schedule handoff",
    "Instagram publish",
  ];

  const stack = [
    "Next.js host",
    "Remotion compositions",
    "Better Auth",
    "Drizzle + postgres",
    "QStash orchestration",
    "React Query client state",
  ];
  const currentSession = await getCurrentSession();
  const projects = currentSession
    ? await listProjectOverviewsForUser(currentSession.user.id)
    : [];

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-7xl flex-col gap-10 px-5 py-5 md:px-8 md:py-8">
      <section className="grid min-h-[32rem] gap-5 border-2 border-border bg-background p-5 md:grid-cols-[1.4fr_0.8fr] md:p-8">
        <div className="flex flex-col justify-between gap-8">
          <div className="space-y-6">
            <p className="font-mono text-[0.6875rem] uppercase tracking-[0.32em] text-muted-foreground">
              Prompt / Annotate / Animate / Schedule
            </p>
            <div className="space-y-4">
              <h1 className="max-w-4xl text-4xl leading-none font-medium uppercase md:text-7xl">
                One click from concept to queued visual essay.
              </h1>
              <p className="max-w-2xl text-sm leading-7 text-muted-foreground md:text-base">
                A minimal control plane for turning a conceptual prompt into a
                storyboarded Remotion video, routed through durable jobs, then
                scheduled for Instagram publishing.
              </p>
            </div>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <Button>Enter Prompt</Button>
            <Button variant="ghost">Inspect Pipeline</Button>
          </div>
        </div>

        <div className="grid gap-4">
          <div className="border-2 border-border bg-card p-4">
            <p className="font-mono text-[0.6875rem] uppercase tracking-[0.24em] text-muted-foreground">
              Palette Rule
            </p>
            <p className="mt-3 text-sm leading-7">
              Monochrome first. Accent optional. Fractional lightness only.
            </p>
            <p className="mt-4 font-mono text-[0.75rem] text-muted-foreground">
              Dark background: {themeTokens.palette.dark.background}
            </p>
            <p className="font-mono text-[0.75rem] text-muted-foreground">
              Light foreground: {themeTokens.palette.light.foreground}
            </p>
          </div>

          <div className="grid gap-0 border-2 border-border bg-card">
            {pipeline.map((step, index) => (
              <div
                className="flex items-center justify-between border-b-2 border-border px-4 py-3 last:border-b-0"
                key={step}
              >
                <span className="font-mono text-[0.75rem] text-muted-foreground">
                  0{index + 1}
                </span>
                <span className="text-right text-sm uppercase">{step}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="grid gap-5 md:grid-cols-[0.9fr_1.1fr]">
        <div className="grid gap-5">
          <div className="border-2 border-border bg-card p-5 md:p-6">
            <p className="font-mono text-[0.6875rem] uppercase tracking-[0.24em] text-muted-foreground">
              Style directives
            </p>
            <div className="mt-6 grid gap-3 text-sm uppercase">
              <div className="border-2 border-border px-3 py-4">
                2px strokes only
              </div>
              <div className="border-2 border-border px-3 py-4">No shadows</div>
              <div className="border-2 border-border px-3 py-4">
                Ample negative space
              </div>
              <div className="border-2 border-border px-3 py-4">
                Visualize Value inspired motion language
              </div>
            </div>
          </div>

          <AuthShell />
        </div>

        <div className="grid gap-5">
          <div className="border-2 border-border bg-card p-5 md:p-6">
            <div className="flex items-center justify-between gap-4 border-b-2 border-border pb-4">
              <p className="font-mono text-[0.6875rem] uppercase tracking-[0.24em] text-muted-foreground">
                Foundation stack
              </p>
              <span className="font-mono text-[0.75rem] text-muted-foreground">
                v0 foundation
              </span>
            </div>
            <div className="mt-4 grid gap-0">
              {stack.map((item) => (
                <div
                  className="border-b-2 border-border py-3 text-sm uppercase last:border-b-0"
                  key={item}
                >
                  {item}
                </div>
              ))}
            </div>
          </div>

          {currentSession ? (
            <ProjectIntake
              initialProjects={projects.map((entry) => ({
                createdAt: entry.project.createdAt,
                id: entry.project.id,
                latestRender: entry.latestRender
                  ? {
                      compositionId: entry.latestRender.compositionId,
                      createdAt: entry.latestRender.createdAt,
                      durationInFrames: entry.latestRender.durationInFrames,
                      fps: entry.latestRender.fps,
                      id: entry.latestRender.id,
                      outputPath: entry.latestRender.outputPath,
                      status: entry.latestRender.status,
                    }
                  : null,
                latestSchedule: entry.latestSchedule
                  ? {
                      id: entry.latestSchedule.id,
                      platform: entry.latestSchedule.platform,
                      publishAt: entry.latestSchedule.publishAt,
                      status: entry.latestSchedule.status,
                    }
                  : null,
                prompt: entry.project.prompt,
                status: entry.project.status,
              }))}
            />
          ) : (
            <div className="border-2 border-border bg-card p-5 text-sm leading-7 text-muted-foreground">
              Sign in to persist prompts as projects and begin the
              prompt-to-storyboard pipeline.
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
