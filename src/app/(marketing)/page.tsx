import Image from "next/image";
import Link from "next/link";

const features = [
  {
    title: "Full-length MBA entrance exam mocks",
    description:
      "Sectional MCQ tests covering Quant, Verbal, Logical Reasoning, and General Awareness — built the way CAT, XAT, MAH-CET, and every other MBA entrance exam is actually structured.",
  },
  {
    title: "Percentile-based scoring",
    description:
      "See exactly where you stand against every other student who has taken the same test, not just a raw score.",
  },
  {
    title: "Section-wise breakdown",
    description:
      "Know which section is pulling your score down — accuracy and marks broken out by section, every time.",
  },
  {
    title: "Time-per-question analysis",
    description:
      "Find out where you're losing time: questions you rushed, questions you got stuck on, and questions you left blank.",
  },
  {
    title: "Answer review with solutions",
    description:
      "Go back through every question after submitting, see the correct answer, and read the explanation.",
  },
  {
    title: "Timed, exam-like conditions",
    description:
      "A single running clock per test keeps practice honest and builds real exam pressure and pacing.",
  },
];

const steps = [
  {
    step: "1",
    title: "Create your free account",
    description: "Sign up in under a minute — no payment required to get started.",
  },
  {
    step: "2",
    title: "Take a mock test",
    description: "Pick a published test and attempt it under a live timer, just like exam day.",
  },
  {
    step: "3",
    title: "Study your analysis",
    description:
      "Review your percentile, section-wise scores, time spent per question, and full answer explanations.",
  },
];

const heroHighlights = [
  {
    title: "Every major exam",
    description: "CAT, XAT, MAH-CET, and more.",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} className="h-5 w-5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.25 4 9.5l8 3.25 8-3.25-8-3.25Z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 11v4.25c0 .9 2 2.25 4.5 2.25s4.5-1.35 4.5-2.25V11" />
      </svg>
    ),
  },
  {
    title: "Timed mock tests",
    description: "Real exam pressure and pacing.",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} className="h-5 w-5">
        <circle cx="12" cy="13" r="7.25" strokeLinecap="round" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9.5V13l2.5 1.5M9.5 2.5h5" />
      </svg>
    ),
  },
  {
    title: "Percentile analytics",
    description: "Section-wise, question-by-question.",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} className="h-5 w-5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M5 19V10M12 19V5M19 19v-6" />
      </svg>
    ),
  },
  {
    title: "Full answer review",
    description: "Explanations after every test.",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} className="h-5 w-5">
        <path strokeLinecap="round" strokeLinejoin="round" d="m5 12.5 4.5 4.5L19 7" />
      </svg>
    ),
  },
];

export default function HomePage() {
  return (
    <div>
      <section className="relative overflow-hidden bg-brand-cream">
        <div className="mx-auto grid max-w-6xl gap-10 px-4 pb-16 pt-16 sm:px-6 md:grid-cols-2 md:items-stretch md:gap-12 md:pb-20 md:pt-20">
          <div className="flex flex-col justify-center py-6">
            <h1 className="text-4xl font-bold leading-tight text-brand-navy sm:text-5xl">
              Practice like it&apos;s exam day. <br />
              Know your <span className="text-brand-gold">percentile</span>{" "}
              before you walk in.
            </h1>
            <div className="mt-5 h-1.5 w-16 rounded-full bg-brand-gold" />
            <p className="mt-5 max-w-xl text-base text-brand-ink/70 sm:text-lg">
              Percentile Lab gives you timed mock tests for every major MBA
              entrance exam — CAT, XAT, MAH-CET, SNAP, NMAT, CMAT, MAT, and
              ATMA — with section-wise scoring, time-per-question analysis,
              and full answer reviews.
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <Link
                href="/register"
                className="inline-flex items-center gap-2 rounded-full bg-brand-navy px-6 py-3.5 text-sm font-semibold text-white transition-colors hover:bg-brand-navy-light"
              >
                Start practicing free
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="h-4 w-4">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14M13 6l6 6-6 6" />
                </svg>
              </Link>
              <Link
                href="/about"
                className="inline-flex items-center gap-2 rounded-full border border-brand-navy/20 px-6 py-3.5 text-sm font-semibold text-brand-navy transition-colors hover:bg-brand-navy/5"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} className="h-4 w-4">
                  <circle cx="12" cy="12" r="8.5" />
                  <path fill="currentColor" stroke="none" d="M10.5 9.2v5.6l4.7-2.8-4.7-2.8Z" />
                </svg>
                Learn more
              </Link>
            </div>
          </div>

          <div className="relative py-6 md:py-10">
            <div className="relative mx-auto h-[380px] w-full max-w-md overflow-hidden rounded-3xl shadow-xl shadow-brand-navy/10 md:h-full">
              <Image
                src="/images/hero-banner.jpg"
                alt="Student reviewing her mock test performance"
                fill
                sizes="(min-width: 768px) 40vw, 90vw"
                className="object-cover"
                priority
              />
            </div>

            <div className="absolute -left-4 top-8 hidden w-48 rounded-xl border border-black/5 bg-white p-3.5 shadow-lg sm:block">
              <p className="text-[11px] font-medium text-brand-ink/50">
                Your progress
              </p>
              <div className="mt-1.5 flex items-end justify-between gap-2">
                <svg viewBox="0 0 80 32" className="h-8 w-14 text-brand-navy">
                  <polyline
                    points="0,26 12,22 24,24 36,14 48,17 60,7 80,2"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={2}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                <p className="text-lg font-bold text-brand-navy">
                  92<span className="text-xs font-medium">th</span>
                </p>
              </div>
              <p className="mt-1 text-[11px] font-medium text-green-600">
                +18 in 30 days
              </p>
            </div>

            <div className="absolute bottom-16 -right-4 hidden w-44 rounded-xl border border-black/5 bg-white p-3.5 shadow-lg sm:block">
              <p className="text-[11px] font-medium text-brand-ink/50">
                Mock test analysis
              </p>
              <div className="mt-1.5 flex items-center gap-3">
                <div
                  className="h-11 w-11 shrink-0 rounded-full"
                  style={{
                    background:
                      "conic-gradient(var(--color-brand-navy) 0% 78%, rgba(0,0,0,0.08) 78% 100%)",
                  }}
                >
                  <div className="m-1 flex h-9 w-9 items-center justify-center rounded-full bg-white text-[10px] font-bold text-brand-navy">
                    78%
                  </div>
                </div>
                <p className="text-[11px] text-brand-ink/60">
                  accuracy
                  <br />
                  score
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="relative z-10 mx-auto -mt-8 max-w-5xl px-4 pb-14 sm:px-6 md:-mt-10">
          <div className="grid grid-cols-2 gap-6 rounded-2xl bg-brand-navy p-6 shadow-lg sm:grid-cols-4 sm:p-7">
            {heroHighlights.map((item) => (
              <div key={item.title} className="flex items-start gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white/10 text-brand-gold">
                  {item.icon}
                </div>
                <div>
                  <p className="text-sm font-semibold text-white">
                    {item.title}
                  </p>
                  <p className="mt-0.5 text-xs text-white/60">
                    {item.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-brand-navy">
            Everything you need to prep with intent
          </h2>
          <p className="mx-auto mt-3 max-w-2xl text-brand-ink/70">
            Every mock test comes with the analysis to back it up.
          </p>
        </div>

        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="rounded-xl border border-black/5 bg-white p-6 shadow-sm"
            >
              <div className="mb-4 h-1.5 w-10 rounded-full bg-brand-gold" />
              <h3 className="text-lg font-semibold text-brand-navy">
                {feature.title}
              </h3>
              <p className="mt-2 text-sm text-brand-ink/70">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <div className="grid gap-10 sm:grid-cols-2">
          <div className="overflow-hidden rounded-2xl bg-brand-cream">
            <Image
              src="/images/student-taking-test.jpg"
              alt="Student filling in an answer sheet during a timed mock test"
              width={1200}
              height={800}
              className="h-56 w-full object-cover"
            />
            <div className="p-6">
              <h3 className="text-center text-lg font-semibold text-brand-navy">
                Real exam pressure, right at home
              </h3>
              <p className="mt-1 text-center text-sm text-brand-ink/70">
                One running clock, no pausing — practice the way you&apos;ll
                actually be tested.
              </p>
            </div>
          </div>
          <div className="overflow-hidden rounded-2xl bg-brand-cream">
            <Image
              src="/images/student-thinking.jpg"
              alt="Student thinking through an answer during a mock test"
              width={1200}
              height={800}
              className="h-56 w-full object-cover"
            />
            <div className="p-6">
              <h3 className="text-center text-lg font-semibold text-brand-navy">
                Think it through, then check yourself
              </h3>
              <p className="mt-1 text-center text-sm text-brand-ink/70">
                Every question gets a full explanation afterward — not just a
                right or wrong.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-brand-navy py-16 text-white">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <h2 className="text-center text-3xl font-bold">How it works</h2>
          <div className="mt-12 grid gap-10 md:grid-cols-3">
            {steps.map((item) => (
              <div key={item.step} className="text-center">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-brand-gold text-lg font-bold text-brand-navy">
                  {item.step}
                </div>
                <h3 className="mt-4 text-lg font-semibold">{item.title}</h3>
                <p className="mt-2 text-sm text-white/70">
                  {item.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-16 text-center sm:px-6">
        <h2 className="text-3xl font-bold text-brand-navy">
          Ready to find your percentile?
        </h2>
        <p className="mx-auto mt-3 max-w-xl text-brand-ink/70">
          Create a free account and take your first mock test today.
        </p>
        <Link
          href="/register"
          className="mt-8 inline-block rounded-md bg-brand-gold px-8 py-3 text-sm font-semibold text-brand-navy transition-colors hover:bg-brand-gold-light"
        >
          Get started free
        </Link>
      </section>
    </div>
  );
}
