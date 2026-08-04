import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = { title: "Testimonials | Percentile Lab MBA" };

// Add real student testimonials here once you have them — each entry renders
// as a card below. Leave the array empty to show the "coming soon" state.
type Testimonial = {
  name: string;
  detail: string;
  quote: string;
};

const testimonials: Testimonial[] = [];

export default function TestimonialsPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6">
      <div className="text-center">
        <p className="text-xs font-semibold uppercase tracking-wide text-brand-gold">
          Testimonials
        </p>
        <h1 className="mt-2 text-3xl font-bold text-brand-navy sm:text-4xl">
          Success stories
        </h1>
      </div>

      {testimonials.length > 0 ? (
        <div className="mt-12 grid gap-6 sm:grid-cols-2">
          {testimonials.map((t) => (
            <blockquote
              key={t.name}
              className="rounded-xl border border-black/5 bg-white p-6 shadow-sm"
            >
              <p className="text-brand-ink/80">&ldquo;{t.quote}&rdquo;</p>
              <footer className="mt-4 text-sm font-semibold text-brand-navy">
                {t.name}
                <span className="block font-normal text-brand-ink/50">
                  {t.detail}
                </span>
              </footer>
            </blockquote>
          ))}
        </div>
      ) : (
        <div className="mx-auto mt-12 max-w-lg rounded-2xl border border-dashed border-brand-navy/20 bg-brand-cream p-10 text-center">
          <h2 className="text-lg font-semibold text-brand-navy">
            We&apos;re just getting started
          </h2>
          <p className="mt-2 text-sm text-brand-ink/70">
            Percentile Lab MBA is brand new — real student results and
            success stories will show up here as they come in. Be one of the
            first.
          </p>
          <Link
            href="/register"
            className="mt-6 inline-block rounded-md bg-brand-navy px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand-navy-light"
          >
            Take your first mock test
          </Link>
        </div>
      )}
    </div>
  );
}
