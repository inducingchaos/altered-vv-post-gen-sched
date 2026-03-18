"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { Button } from "@/components/ui/button";

type Project = {
  createdAt: string | Date;
  id: string;
  prompt: string;
  status: string;
};

type Props = {
  initialProjects: Project[];
};

export function ProjectIntake({ initialProjects }: Props) {
  const router = useRouter();
  const [prompt, setPrompt] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/projects", {
        body: JSON.stringify({ prompt }),
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
