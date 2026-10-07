"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import { deleteFeedback, setFeedbackApproved } from "./actions";

export function FeedbackActions({
  id,
  approved,
  canApprove,
}: {
  id: string;
  approved: boolean;
  canApprove: boolean;
}) {
  const router = useRouter();
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function run(fn: () => Promise<void>) {
    setError(null);
    startTransition(async () => {
      try {
        await fn();
        setConfirmDelete(false);
        router.refresh();
      } catch (err) {
        setError(err instanceof Error ? err.message : "Something went wrong");
      }
    });
  }

  return (
    <div className="flex flex-wrap items-center gap-3 text-xs">
      {canApprove ? (
        <button
          type="button"
          disabled={pending}
          onClick={() => run(() => setFeedbackApproved(id, !approved))}
          className={`rounded-md px-3 py-1.5 font-semibold transition-colors disabled:opacity-50 ${
            approved
              ? "border border-brand-navy/20 text-brand-navy hover:bg-brand-cream"
              : "bg-brand-navy text-white hover:bg-brand-navy-light"
          }`}
        >
          {approved ? "Remove approval" : "Approve for website"}
        </button>
      ) : (
        <span className="text-brand-ink/45">Private - not for publishing</span>
      )}

      {confirmDelete ? (
        <span className="flex items-center gap-2">
          <span className="text-brand-ink/60">Delete this response?</span>
          <button
            type="button"
            disabled={pending}
            onClick={() => run(() => deleteFeedback(id))}
            className="font-semibold text-red-700 hover:underline disabled:opacity-50"
          >
            Yes
          </button>
          <button type="button" onClick={() => setConfirmDelete(false)} className="text-brand-ink/50 hover:underline">
            No
          </button>
        </span>
      ) : (
        <button
          type="button"
          onClick={() => setConfirmDelete(true)}
          className="text-brand-ink/50 hover:text-red-700 hover:underline"
        >
          Delete
        </button>
      )}
      {error && <span className="text-red-700">{error}</span>}
    </div>
  );
}
