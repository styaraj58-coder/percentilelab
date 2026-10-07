import type { Metadata } from "next";

import { canPublish, displayName } from "@/lib/feedback";
import { prisma } from "@/lib/prisma";

import { FeedbackActions } from "./feedback-actions";

export const metadata: Metadata = { title: "Feedback | Percentile Lab" };

export default async function AdminFeedbackPage() {
  const items = await prisma.feedback.findMany({ orderBy: { createdAt: "desc" } });

  const average = items.length ? items.reduce((s, f) => s + f.rating, 0) / items.length : null;
  const consenting = items.filter((f) => canPublish(f)).length;
  const approved = items.filter((f) => f.approved).length;

  return (
    <div>
      <h1 className="text-2xl font-bold text-brand-navy">Feedback</h1>
      <p className="mt-1 text-sm text-brand-ink/60">
        Beta-student feedback. Only responses where the student agreed to publishing can be approved,
        and a testimonial must use the name style the student chose.
      </p>

      <div className="mt-6 grid gap-4 sm:grid-cols-4">
        {[
          { label: "Responses", value: items.length },
          { label: "Average rating", value: average === null ? "-" : `${average.toFixed(1)} / 5` },
          { label: "Agreed to publish", value: consenting },
          { label: "Approved for website", value: approved },
        ].map((stat) => (
          <div key={stat.label} className="rounded-xl border border-black/5 bg-white p-4">
            <p className="text-xs font-medium uppercase tracking-wide text-brand-ink/50">{stat.label}</p>
            <p className="mt-1 text-2xl font-bold text-brand-navy">{stat.value}</p>
          </div>
        ))}
      </div>

      {items.length === 0 ? (
        <div className="mt-8 rounded-xl border border-dashed border-brand-navy/20 bg-white p-10 text-center text-brand-ink/60">
          No feedback yet. Students can send it from their portal at /student/feedback.
        </div>
      ) : (
        <div className="mt-8 space-y-4">
          {items.map((fb) => {
            const credit = displayName(fb);
            const publishable = canPublish(fb);
            const gain =
              fb.firstPercentile != null && fb.latestPercentile != null
                ? fb.latestPercentile - fb.firstPercentile
                : null;
            return (
              <article key={fb.id} className="rounded-xl border border-black/5 bg-white p-5">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="font-semibold text-brand-navy">
                      {fb.name} <span className="font-normal text-brand-ink/50">· {fb.exam}</span>
                    </p>
                    <p className="mt-0.5 text-xs text-brand-ink/50">
                      {fb.email}
                      {fb.college ? ` · ${fb.college}` : ""} · {fb.createdAt.toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="rounded-full bg-brand-gold/15 px-2.5 py-0.5 text-xs font-semibold text-brand-gold">
                      {fb.rating}/5
                    </span>
                    <span
                      className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                        fb.approved
                          ? "bg-green-100 text-green-700"
                          : publishable
                            ? "bg-blue-100 text-blue-700"
                            : "bg-black/5 text-brand-ink/55"
                      }`}
                    >
                      {fb.approved ? "Approved" : publishable ? "Agreed to publish" : "Private"}
                    </span>
                  </div>
                </div>

                {fb.quote && (
                  <blockquote className="mt-4 border-l-2 border-brand-gold pl-4 text-sm text-brand-ink/85">
                    &ldquo;{fb.quote}&rdquo;
                    {credit && publishable && (
                      <footer className="mt-1 text-xs text-brand-ink/50">- {credit}</footer>
                    )}
                  </blockquote>
                )}

                <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
                  {fb.liked && (
                    <div>
                      <dt className="text-xs font-medium uppercase tracking-wide text-brand-ink/45">Liked most</dt>
                      <dd className="mt-0.5 whitespace-pre-line text-brand-ink/80">{fb.liked}</dd>
                    </div>
                  )}
                  {fb.improve && (
                    <div>
                      <dt className="text-xs font-medium uppercase tracking-wide text-brand-ink/45">To improve</dt>
                      <dd className="mt-0.5 whitespace-pre-line text-brand-ink/80">{fb.improve}</dd>
                    </div>
                  )}
                </dl>

                {(fb.firstPercentile != null || fb.latestPercentile != null) && (
                  <p className="mt-3 text-sm text-brand-ink/70">
                    Percentile: first {fb.firstPercentile ?? "-"} &rarr; latest {fb.latestPercentile ?? "-"}
                    {gain !== null && (
                      <span className={gain >= 0 ? "text-green-700" : "text-red-700"}>
                        {" "}
                        ({gain >= 0 ? "+" : ""}
                        {gain.toFixed(1)})
                      </span>
                    )}
                  </p>
                )}

                <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-black/5 pt-4">
                  <p className="text-xs text-brand-ink/50">
                    Consent: {fb.publishAs === "PRIVATE" ? "keep private" : `publish as ${fb.publishAs.toLowerCase().replace("_", " ")}`}
                    {fb.consentGivenAt ? ` · given ${fb.consentGivenAt.toLocaleDateString()} (${fb.consentVersion})` : ""}
                    {fb.publishAs !== "PRIVATE" && (fb.ageConfirmed ? " · 18+/guardian confirmed" : " · age not confirmed")}
                  </p>
                  <FeedbackActions id={fb.id} approved={fb.approved} canApprove={publishable} />
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}
