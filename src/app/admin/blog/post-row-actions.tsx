"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import { deletePost, setPostPublished } from "./actions";

export function PostRowActions({
  postId,
  published,
}: {
  postId: string;
  published: boolean;
}) {
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
              await deletePost(postId);
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
    <span className="flex items-center gap-3 text-xs">
      <button
        type="button"
        disabled={isPending}
        onClick={() =>
          startTransition(async () => {
            await setPostPublished(postId, !published);
            router.refresh();
          })
        }
        className="text-brand-navy hover:underline disabled:opacity-50"
      >
        {published ? "Unpublish" : "Publish"}
      </button>
      <button
        type="button"
        onClick={() => setConfirming(true)}
        className="text-red-700 hover:underline"
      >
        Delete
      </button>
    </span>
  );
}
