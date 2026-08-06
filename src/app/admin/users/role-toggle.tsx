"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import { setUserRole } from "./actions";

export function RoleToggle({
  userId,
  role,
  isSelf,
}: {
  userId: string;
  role: string;
  isSelf: boolean;
}) {
  const router = useRouter();
  const [confirming, setConfirming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  if (role === "ADMIN" && isSelf) {
    return <span className="text-xs text-brand-ink/40">You</span>;
  }

  const nextRole = role === "ADMIN" ? "STUDENT" : "ADMIN";
  const label = role === "ADMIN" ? "Remove admin" : "Make admin";

  if (confirming) {
    return (
      <span className="flex items-center gap-2">
        <span className="text-xs text-brand-ink/60">{label}?</span>
        <button
          type="button"
          disabled={isPending}
          onClick={() =>
            startTransition(async () => {
              try {
                await setUserRole(userId, nextRole);
                setConfirming(false);
                router.refresh();
              } catch (err) {
                setError(err instanceof Error ? err.message : "Failed");
              }
            })
          }
          className="text-xs font-semibold text-brand-navy hover:underline disabled:opacity-50"
        >
          Yes
        </button>
        <button
          type="button"
          onClick={() => setConfirming(false)}
          className="text-xs text-brand-ink/50 hover:underline"
        >
          No
        </button>
      </span>
    );
  }

  return (
    <span className="flex items-center gap-2">
      <button
        type="button"
        onClick={() => setConfirming(true)}
        className={`text-xs font-medium hover:underline ${
          role === "ADMIN" ? "text-red-700" : "text-brand-navy"
        }`}
      >
        {label}
      </button>
      {error && <span className="text-xs text-red-700">{error}</span>}
    </span>
  );
}
