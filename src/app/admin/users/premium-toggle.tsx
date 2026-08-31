"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import { setUserPremium } from "./actions";

export function PremiumToggle({
  userId,
  isPremium,
}: {
  userId: string;
  isPremium: boolean;
}) {
  const router = useRouter();
  const [confirming, setConfirming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const label = isPremium ? "Remove premium" : "Make premium";

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
                await setUserPremium(userId, !isPremium);
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
      <span
        className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
          isPremium ? "bg-blue-100 text-blue-700" : "bg-black/5 text-brand-ink/60"
        }`}
      >
        {isPremium ? "Premium" : "Free"}
      </span>
      <button
        type="button"
        onClick={() => setConfirming(true)}
        className="text-xs font-medium text-brand-navy hover:underline"
      >
        {label}
      </button>
      {error && <span className="text-xs text-red-700">{error}</span>}
    </span>
  );
}
