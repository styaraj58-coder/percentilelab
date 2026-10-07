import { Reveal } from "@/components/reveal";
import type { Testimonial } from "@/lib/testimonials-data";

// Renders nothing until there is at least one approved testimonial, so the
// site never shows an empty "what students say" block.
export function Testimonials({
  items,
  className = "",
}: {
  items: Testimonial[];
  className?: string;
}) {
  if (items.length === 0) return null;

  return (
    <section className={className} aria-labelledby="testimonials-heading">
      <div className="text-center">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand-gold">
          Student voices
        </p>
        <h2 id="testimonials-heading" className="mt-3 text-3xl font-bold text-brand-navy">
          What our students say
        </h2>
      </div>

      <div className="mt-10 flex flex-wrap justify-center gap-6">
        {items.map((item, i) => (
          <Reveal
            key={item.id}
            delay={i * 80}
            className="w-full sm:w-[calc(50%-12px)] lg:w-[calc(33.333%-16px)]"
          >
            <figure className="flex h-full flex-col rounded-2xl border border-black/10 bg-white p-6 shadow-sm">
              <div
                className="text-lg tracking-widest text-brand-gold"
                role="img"
                aria-label={`Rated ${item.rating} out of 5`}
              >
                {"★".repeat(item.rating)}
                <span className="text-brand-ink/15">{"★".repeat(5 - item.rating)}</span>
              </div>
              <blockquote className="mt-4 flex-1 text-sm leading-relaxed text-brand-ink/85">
                &ldquo;{item.quote}&rdquo;
              </blockquote>
              {item.progress && (
                <p className="mt-4 inline-flex w-fit items-center rounded-full bg-green-50 px-3 py-1 text-xs font-semibold text-green-700">
                  Percentile {item.progress.from} &rarr; {item.progress.to}
                </p>
              )}
              <figcaption className="mt-4 border-t border-black/5 pt-4 text-sm font-semibold text-brand-navy">
                {item.credit}
              </figcaption>
            </figure>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
