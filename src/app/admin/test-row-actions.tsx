"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import { deleteTest, setTestFreePreview, setTestPublished } from "./tests/actions";

export function PublishToggle({
  testId,
  published,
}: {
  testId: string;
  published: boolean;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  return (
    <button
      type="button"
      disabled={isPending}
      onClick={() =>
        startTransition(async () => {
          await setTestPublished(testId, !published);
          router.refresh();
        })
      }
      className="text-brand-navy hover:text-brand-gold hover:underline disabled:opacity-50"
    >
      {published ? "Unpublish" : "Publish"}
    </button>
  );
}

export function FreePreviewToggle({
  testId,
  isFreePreview,
}: {
  testId: string;
  isFreePreview: boolean;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  return (
    <button
      type="button"
      disabled={isPending}
      onClick={() =>
        startTransition(async () => {
          await setTestFreePreview(testId, !isFreePreview);
          router.refresh();
        })
      }
      className="text-brand-navy hover:text-brand-gold hover:underline disabled:opacity-50"
    >
      {isFreePreview ? "Make premium" : "Make free"}
    </button>
  );
}

export function DeleteTestButton({ testId }: { testId: string }) {
  const router = useRouter();
  const [confirming, setConfirming] = useState(false);
  const [isPending, startTransition] = useTransition();

  if (confirming) {
    return (
      <span className="flex items-center gap-2">
        <span className="text-red-700">Delete?</span>
        <button
          type="button"
          disabled={isPending}
          onClick={() =>
            startTransition(async () => {
              await deleteTest(testId);
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
      className="text-red-700 hover:underline"
    >
      Delete
    </button>
  );
}
