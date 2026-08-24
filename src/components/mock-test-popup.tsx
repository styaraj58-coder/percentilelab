"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

const DISMISSED_KEY = "mockTestPopupDismissed";

export function MockTestPopup() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (sessionStorage.getItem(DISMISSED_KEY)) return;
    const timer = setTimeout(() => setOpen(true), 4000);
    return () => clearTimeout(timer);
  }, []);

  function dismiss() {
    sessionStorage.setItem(DISMISSED_KEY, "1");
    setOpen(false);
  }

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4"
      onClick={dismiss}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="mock-test-popup-heading"
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-sm rounded-2xl bg-white p-6 text-center shadow-2xl"
      >
        <button
          type="button"
          onClick={dismiss}
          aria-label="Close"
          className="absolute right-4 top-4 text-brand-ink/40 hover:text-brand-ink"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="h-5 w-5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 6l12 12M18 6L6 18" />
          </svg>
        </button>

        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-brand-gold/15 text-brand-gold">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} className="h-6 w-6">
            <path strokeLinecap="round" strokeLinejoin="round" d="M8 2.75h8M9.5 21.25h5" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M7 2.75c0 4 1.8 6 5 6s5-2 5-6M7 21.25c0-4 1.8-6 5-6s5 2 5 6" />
          </svg>
        </div>

        <h2 id="mock-test-popup-heading" className="mt-4 text-lg font-bold text-brand-navy">
          Take a mock test now
        </h2>
        <p className="mt-2 text-sm text-brand-ink/70">
          See exactly where you stand — pick a timed mock and get your
          percentile, section-wise breakdown, and full answer review right
          after you submit.
        </p>

        <Link
          href="/tests"
          onClick={dismiss}
          className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-full bg-brand-navy px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-brand-navy-light"
        >
          Take a mock test now
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="h-4 w-4">
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14M13 6l6 6-6 6" />
          </svg>
        </Link>
        <button
          type="button"
          onClick={dismiss}
          className="mt-3 block w-full text-xs font-medium text-brand-ink/50 hover:text-brand-ink/70"
        >
          Maybe later
        </button>
      </div>
    </div>
  );
}
