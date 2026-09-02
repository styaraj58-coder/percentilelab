"use client";

import { useActionState, useState } from "react";

import { submitEnquiry } from "@/app/(marketing)/enquiry-actions";

export function EnquireNow() {
  const [open, setOpen] = useState(false);
  const [state, formAction, pending] = useActionState(submitEnquiry, undefined);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="fixed right-0 top-1/2 z-40 -translate-y-1/2 rounded-l-lg bg-brand-gold px-3 py-4 text-sm font-semibold text-brand-navy shadow-lg transition-colors hover:bg-brand-gold-light [writing-mode:vertical-rl]"
      >
        Enquire Now
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4"
          onClick={() => setOpen(false)}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="enquire-now-heading"
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl"
          >
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label="Close"
              className="absolute right-4 top-4 text-brand-ink/40 hover:text-brand-ink"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="h-5 w-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 6l12 12M18 6L6 18" />
              </svg>
            </button>

            {state?.success ? (
              <div className="py-4 text-center">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-brand-gold/15 text-brand-gold">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="h-6 w-6">
                    <path strokeLinecap="round" strokeLinejoin="round" d="m5 12.5 4.5 4.5L19 7" />
                  </svg>
                </div>
                <h2 className="mt-4 text-lg font-bold text-brand-navy">
                  Thanks, we&apos;ve got it
                </h2>
                <p className="mt-2 text-sm text-brand-ink/70">
                  We&apos;ll get back to you shortly.
                </p>
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="mt-5 inline-flex w-full items-center justify-center rounded-full bg-brand-navy px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-brand-navy-light"
                >
                  Close
                </button>
              </div>
            ) : (
              <>
                <h2 id="enquire-now-heading" className="text-lg font-bold text-brand-navy">
                  Enquire now
                </h2>
                <p className="mt-1 text-sm text-brand-ink/70">
                  Leave your details and we&apos;ll get in touch.
                </p>

                <form action={formAction} className="mt-5 space-y-4">
                  {state?.error && (
                    <p className="rounded-md bg-red-50 px-4 py-3 text-sm text-red-700">
                      {state.error}
                    </p>
                  )}

                  <div>
                    <label htmlFor="enquiry-name" className="block text-sm font-medium text-brand-ink">
                      Name
                    </label>
                    <input
                      id="enquiry-name"
                      name="name"
                      type="text"
                      required
                      minLength={2}
                      className="mt-1 w-full rounded-md border border-black/10 px-3 py-2 text-sm focus:border-brand-navy focus:outline-none focus:ring-1 focus:ring-brand-navy"
                    />
                  </div>

                  <div>
                    <label htmlFor="enquiry-phone" className="block text-sm font-medium text-brand-ink">
                      Phone
                    </label>
                    <input
                      id="enquiry-phone"
                      name="phone"
                      type="tel"
                      required
                      className="mt-1 w-full rounded-md border border-black/10 px-3 py-2 text-sm focus:border-brand-navy focus:outline-none focus:ring-1 focus:ring-brand-navy"
                    />
                  </div>

                  <div>
                    <label htmlFor="enquiry-email" className="block text-sm font-medium text-brand-ink">
                      Email <span className="text-brand-ink/50">(optional)</span>
                    </label>
                    <input
                      id="enquiry-email"
                      name="email"
                      type="email"
                      className="mt-1 w-full rounded-md border border-black/10 px-3 py-2 text-sm focus:border-brand-navy focus:outline-none focus:ring-1 focus:ring-brand-navy"
                    />
                  </div>

                  <div>
                    <label htmlFor="enquiry-message" className="block text-sm font-medium text-brand-ink">
                      Message <span className="text-brand-ink/50">(optional)</span>
                    </label>
                    <textarea
                      id="enquiry-message"
                      name="message"
                      rows={3}
                      className="mt-1 w-full rounded-md border border-black/10 px-3 py-2 text-sm focus:border-brand-navy focus:outline-none focus:ring-1 focus:ring-brand-navy"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={pending}
                    className="w-full rounded-md bg-brand-navy px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand-navy-light disabled:opacity-60"
                  >
                    {pending ? "Sending..." : "Submit enquiry"}
                  </button>
                </form>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}
