"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { Button } from "@/components/ui/button";

type Project = {
  createdAt: string | Date;
  id: string;
  latestPublishJob: {
    executedAt: string | Date | null;
    id: string;
    platform: string;
    status: string;
  } | null;
  latestRender: {
    compositionId: string;
    createdAt: string | Date;
    durationInFrames: number;
    fps: number;
    id: string;
    outputPath: string;
    status: string;
  } | null;
  latestSchedule: {
    id: string;
    platform: string;
    publishAt: string | Date;
    status: string;
  } | null;
  prompt: string;
  scheduledFor: string | null;
  status: string;
};

type Props = {
  hasInstagramAccount: boolean;
  initialProjects: Project[];
};

function toSeconds(durationInFrames: number, fps: number) {
  return (durationInFrames / fps).toFixed(1);
}

export function ProjectIntake({ hasInstagramAccount, initialProjects }: Props) {
  const router = useRouter();
  const [prompt, setPrompt] = useState("");
  const [publishAt, setPublishAt] = useState("");
  const [publishAtByProject, setPublishAtByProject] = useState<
    Record<string, string>
  >({});
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSchedulingProjectId, setIsSchedulingProjectId] = useState<
    string | null
  >(null);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/projects", {
        body: JSON.stringify({
          prompt,
          publishAt: publishAt ? new Date(publishAt).toISOString() : undefined,
        }),
        credentials: "include",
        headers: {
          "content-type": "application/json",
        },
        method: "POST",
      });

      const data = (await response.json()) as
        | {
            error?: string;
          }
        | undefined;

      if (!response.ok)
        throw new Error(data?.error ?? "Project creation failed");

      setPrompt("");
      setPublishAt("");
      router.refresh();
    } catch (submissionError) {
      setError(
        submissionError instanceof Error
          ? submissionError.message
          : "Project creation failed",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleSchedule(projectId: string) {
    const publishAt = publishAtByProject[projectId];

    if (!publishAt) {
      setError("Choose a publish time first");
      return;
    }

    setError(null);
    setIsSchedulingProjectId(projectId);

    try {
      const response = await fetch(`/api/projects/${projectId}/schedule`, {
        body: JSON.stringify({ publishAt: new Date(publishAt).toISOString() }),
        credentials: "include",
        headers: {
          "content-type": "application/json",
        },
        method: "POST",
      });

      const data = (await response.json()) as
        | {
            error?: string;
          }
        | undefined;

      if (!response.ok) {
        throw new Error(data?.error ?? "Scheduling failed");
      }

      router.refresh();
    } catch (submissionError) {
      setError(
        submissionError instanceof Error
          ? submissionError.message
          : "Scheduling failed",
      );
    } finally {
      setIsSchedulingProjectId(null);
    }
  }

  return (
    <div className="grid gap-5">
      <form
        className="grid gap-3 border-2 border-border bg-card p-5"
        onSubmit={handleSubmit}
      >
        <p className="font-mono text-[0.6875rem] uppercase tracking-[0.24em] text-muted-foreground">
          Project intake
        </p>
        <textarea
          className="min-h-40 border-2 border-border bg-background p-3 text-sm leading-7 outline-none"
          onChange={(event) => setPrompt(event.target.value)}
          placeholder="Describe the idea, thesis, examples, and pacing for the video."
          required
          value={prompt}
        />
        <input
          className="min-h-11 border-2 border-border bg-background px-3 text-sm outline-none"
          disabled={!hasInstagramAccount}
          onChange={(event) => setPublishAt(event.target.value)}
          type="datetime-local"
          value={publishAt}
        />
        {!hasInstagramAccount ? (
          <p className="text-sm text-muted-foreground">
            Connect an Instagram account to schedule the full pipeline in one
            click.
          </p>
        ) : null}
        {error ? (
          <p className="text-sm text-muted-foreground">{error}</p>
        ) : null}
        <Button disabled={isSubmitting} type="submit">
          {isSubmitting ? "Queueing" : "Create project"}
        </Button>
      </form>

      <div className="border-2 border-border bg-card">
        <div className="border-b-2 border-border px-5 py-4">
          <p className="font-mono text-[0.6875rem] uppercase tracking-[0.24em] text-muted-foreground">
            Recent projects
          </p>
        </div>
        <div className="grid">
          {initialProjects.length ? (
            initialProjects.map((project) => (
              <div
                className="grid gap-2 border-b-2 border-border px-5 py-4 last:border-b-0"
                key={project.id}
              >
                <div className="flex items-center justify-between gap-4">
                  <span className="font-mono text-[0.75rem] text-muted-foreground">
                    {project.status}
                  </span>
                  <span className="font-mono text-[0.75rem] text-muted-foreground">
                    {new Date(project.createdAt).toLocaleString()}
                  </span>
                </div>
                <p className="text-sm leading-7">{project.prompt}</p>
                {project.scheduledFor && !project.latestSchedule ? (
                  <p className="font-mono text-[0.75rem] uppercase text-muted-foreground">
                    Auto-schedule target{" "}
                    {new Date(project.scheduledFor).toLocaleString()}
                  </p>
                ) : null}
                {project.latestRender ? (
                  <div className="grid gap-2 border-2 border-border bg-background p-3">
                    <div className="flex items-center justify-between gap-4">
                      <span className="font-mono text-[0.75rem] uppercase text-muted-foreground">
                        Render {project.latestRender.status}
                      </span>
                      <span className="font-mono text-[0.75rem] text-muted-foreground">
                        {project.latestRender.compositionId}
                      </span>
                    </div>
                    <div className="grid gap-1 font-mono text-[0.75rem] text-muted-foreground">
                      <span>
                        {project.latestRender.fps} fps /{" "}
                        {toSeconds(
                          project.latestRender.durationInFrames,
                          project.latestRender.fps,
                        )}
                        s
                      </span>
                      <span>{project.latestRender.outputPath}</span>
                    </div>
                  </div>
                ) : (
                  <p className="font-mono text-[0.75rem] uppercase text-muted-foreground">
                    No render record yet
                  </p>
                )}
                {project.latestSchedule ? (
                  <div className="grid gap-1 border-2 border-border bg-background p-3 font-mono text-[0.75rem] text-muted-foreground">
                    <span className="uppercase">
                      Schedule {project.latestSchedule.status}
                    </span>
                    <span>{project.latestSchedule.platform}</span>
                    <span>
                      {new Date(
                        project.latestSchedule.publishAt,
                      ).toLocaleString()}
                    </span>
                    {project.latestPublishJob ? (
                      <>
                        <span className="uppercase">
                          Publish job {project.latestPublishJob.status}
                        </span>
                        <span>{project.latestPublishJob.platform}</span>
                        <span>
                          {project.latestPublishJob.executedAt
                            ? new Date(
                                project.latestPublishJob.executedAt,
                              ).toLocaleString()
                            : "Awaiting execution"}
                        </span>
                      </>
                    ) : (
                      <span className="uppercase">Publish job queued</span>
                    )}
                  </div>
                ) : project.latestRender ? (
                  <div className="grid gap-3 border-2 border-border bg-background p-3">
                    {!hasInstagramAccount ? (
                      <p className="text-sm text-muted-foreground">
                        Connect an Instagram account before scheduling a render.
                      </p>
                    ) : null}
                    <input
                      className="min-h-11 border-2 border-border bg-card px-3 text-sm outline-none"
                      onChange={(event) =>
                        setPublishAtByProject((current) => ({
                          ...current,
                          [project.id]: event.target.value,
                        }))
                      }
                      type="datetime-local"
                      value={publishAtByProject[project.id] ?? ""}
                    />
                    <Button
                      disabled={
                        isSchedulingProjectId === project.id ||
                        !hasInstagramAccount
                      }
                      onClick={() => handleSchedule(project.id)}
                      type="button"
                    >
                      {isSchedulingProjectId === project.id
                        ? "Scheduling"
                        : "Schedule publish"}
                    </Button>
                  </div>
                ) : null}
              </div>
            ))
          ) : (
            <div className="px-5 py-8 text-sm text-muted-foreground">
              No persisted projects yet.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
