"use client";

import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { Button } from "@/components/ui/button";

type InstagramAccount = {
  id: string;
  instagramUserId: string;
  lastValidatedAt: string | Date | null;
  status: string;
  username: string;
};

type Props = {
  account: InstagramAccount | null;
};

export function InstagramAccountPanel({ account }: Props) {
  const router = useRouter();
  const [accessToken, setAccessToken] = useState("");
  const [instagramUserId, setInstagramUserId] = useState(
    account?.instagramUserId ?? "",
  );
  const [error, setError] = useState<string | null>(null);
  const connectMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch("/api/instagram-account", {
        body: JSON.stringify({
          accessToken,
          instagramUserId,
        }),
        credentials: "include",
        headers: {
          "content-type": "application/json",
        },
        method: "PUT",
      });
      const data = (await response.json()) as
        | {
            error?: string;
          }
        | undefined;

      if (!response.ok) {
        throw new Error(data?.error ?? "Instagram connection failed");
      }

      return data;
    },
    onError(errorValue) {
      setError(
        errorValue instanceof Error
          ? errorValue.message
          : "Instagram connection failed",
      );
    },
    onSuccess() {
      setAccessToken("");
      setError(null);
      router.refresh();
    },
  });
  const disconnectMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch("/api/instagram-account", {
        credentials: "include",
        method: "DELETE",
      });
      const data = (await response.json()) as
        | {
            error?: string;
          }
        | undefined;

      if (!response.ok) {
        throw new Error(data?.error ?? "Instagram disconnect failed");
      }

      return data;
    },
    onError(errorValue) {
      setError(
        errorValue instanceof Error
          ? errorValue.message
          : "Instagram disconnect failed",
      );
    },
    onSuccess() {
      setError(null);
      router.refresh();
    },
  });

  return (
    <div className="grid gap-3 border-2 border-border bg-card p-5">
      <div className="flex items-center justify-between gap-3">
        <p className="font-mono text-[0.6875rem] uppercase tracking-[0.24em] text-muted-foreground">
          Instagram account
        </p>
        <span className="font-mono text-[0.75rem] uppercase text-muted-foreground">
          {account ? account.status : "disconnected"}
        </span>
      </div>

      {account ? (
        <div className="grid gap-2 border-2 border-border bg-background p-3 font-mono text-[0.75rem] text-muted-foreground">
          <span className="uppercase">{account.username}</span>
          <span>{account.instagramUserId}</span>
          <span>
            {account.lastValidatedAt
              ? new Date(account.lastValidatedAt).toLocaleString()
              : "Validation pending"}
          </span>
        </div>
      ) : null}

      <div className="grid gap-3">
        <input
          className="min-h-11 border-2 border-border bg-background px-3 text-sm outline-none"
          onChange={(event) => setInstagramUserId(event.target.value)}
          placeholder="Instagram business user ID"
          value={instagramUserId}
        />
        <textarea
          className="min-h-28 border-2 border-border bg-background p-3 text-sm leading-7 outline-none"
          onChange={(event) => setAccessToken(event.target.value)}
          placeholder="Long-lived Instagram Graph access token"
          value={accessToken}
        />
      </div>

      {error ? <p className="text-sm text-muted-foreground">{error}</p> : null}

      <div className="flex flex-col gap-3 sm:flex-row">
        <Button
          disabled={
            connectMutation.isPending || !accessToken.trim() || !instagramUserId
          }
          onClick={() => connectMutation.mutate()}
          type="button"
        >
          {connectMutation.isPending ? "Validating" : "Connect Instagram"}
        </Button>
        {account ? (
          <Button
            disabled={disconnectMutation.isPending}
            onClick={() => disconnectMutation.mutate()}
            type="button"
            variant="ghost"
          >
            {disconnectMutation.isPending ? "Disconnecting" : "Disconnect"}
          </Button>
        ) : null}
      </div>
    </div>
  );
}
