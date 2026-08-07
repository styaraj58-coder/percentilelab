"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import { deleteResource } from "./actions";

export function DeleteResourceButton({ resourceId }: { resourceId: string }) {
  const router = useRouter();
  const [confirming, setConfirming] = useState(false);
  const [isPending, startTransition] = useTransition();

  if (confirming) {
    return (
      <span className="flex items-center gap-2 text-xs">
        <span className="text-red-700">Delete?</span>
        <button
          type="button"
          disabled={isPending}
          onClick={() =>
            startTransition(async () => {
              await deleteResource(resourceId);
              router.refresh();
            })
          }
          className="font-semibold text-red-700 hover:underline disabled:opacity-50"
        >
          Yes
        </button>
        <button
          type="button"
          onClick={() => setConfirming(false)}
          className="text-brand-ink/60 hover:underline"
        >
          No
        </button>
      </span>
    );
  }

  return (
    <button
      type="button"
      onClick={() => setConfirming(true)}
      className="text-xs text-red-700 hover:underline"
    >
      Delete
    </button>
  );
}
