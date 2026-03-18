"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { authClient } from "@/domains/auth/client";
import { cn } from "@/lib/utils";

type Mode = "sign-in" | "sign-up";

const copyByMode: Record<Mode, { action: string; label: string }> = {
  "sign-in": {
    action: "Access workspace",
    label: "Sign in",
  },
  "sign-up": {
    action: "Create operator",
    label: "Create account",
  },
};

async function postAuth(path: string, payload: Record<string, string>) {
  const response = await fetch(path, {
    body: JSON.stringify(payload),
    credentials: "include",
    headers: {
      "content-type": "application/json",
    },
    method: "POST",
  });

  const data = (await response.json().catch(() => null)) as {
    error?: {
      message?: string;
    };
  } | null;

  if (!response.ok) {
    throw new Error(data?.error?.message ?? "Authentication failed");
  }
}

export function AuthShell() {
  const router = useRouter();
  const { data, isPending, refetch } = authClient.useSession();
  const [mode, setMode] = useState<Mode>("sign-in");
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const copy = copyByMode[mode];

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      if (mode === "sign-up") {
        await postAuth("/api/auth/sign-up/email", {
          email,
          name,
          password,
        });
      } else {
        await postAuth("/api/auth/sign-in/email", {
          email,
          password,
        });
      }

      await refetch();
      router.refresh();
    } catch (submissionError) {
      setError(
        submissionError instanceof Error
          ? submissionError.message
          : "Authentication failed",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleSignOut() {
    await fetch("/api/auth/sign-out", {
      credentials: "include",
      method: "POST",
    });
    await refetch();
    router.refresh();
  }

  if (isPending)
    return (
      <div className="border-2 border-border bg-card p-5 text-sm uppercase">
        Checking operator session
      </div>
    );

  if (data?.user)
    return (
      <div className="grid gap-4 border-2 border-border bg-card p-5">
        <div>
          <p className="font-mono text-[0.6875rem] uppercase tracking-[0.24em] text-muted-foreground">
            Operator
          </p>
          <h2 className="mt-3 text-2xl uppercase">{data.user.name}</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            {data.user.email}
          </p>
        </div>
        <Button onClick={handleSignOut} variant="ghost">
          Sign out
        </Button>
      </div>
    );

  return (
    <div className="grid gap-5 border-2 border-border bg-card p-5">
      <div className="flex gap-2">
        {(["sign-in", "sign-up"] as const).map((value) => (
          <button
            className={cn(
              "border-2 border-border px-3 py-2 text-[0.6875rem] uppercase tracking-[0.24em]",
              mode === value
                ? "bg-foreground text-background"
                : "bg-background",
            )}
            key={value}
            onClick={() => setMode(value)}
            type="button"
          >
            {copyByMode[value].label}
          </button>
        ))}
      </div>

      <form className="grid gap-3" onSubmit={handleSubmit}>
        {mode === "sign-up" ? (
          <input
            className="min-h-11 border-2 border-border bg-background px-3 text-sm outline-none"
            onChange={(event) => setName(event.target.value)}
            placeholder="Name"
            required
            value={name}
          />
        ) : null}
        <input
          className="min-h-11 border-2 border-border bg-background px-3 text-sm outline-none"
          onChange={(event) => setEmail(event.target.value)}
          placeholder="Email"
          required
          type="email"
          value={email}
        />
        <input
          className="min-h-11 border-2 border-border bg-background px-3 text-sm outline-none"
          minLength={8}
          onChange={(event) => setPassword(event.target.value)}
          placeholder="Password"
          required
          type="password"
          value={password}
        />
        {error ? (
          <p className="text-sm text-muted-foreground">{error}</p>
        ) : null}
        <Button disabled={isSubmitting} type="submit">
          {isSubmitting ? "Submitting" : copy.action}
        </Button>
      </form>
    </div>
  );
}
