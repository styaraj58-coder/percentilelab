import Image from "next/image";
import Link from "next/link";

const features = [
  {
    title: "Full-length MBA CET mocks",
    description:
      "Sectional MCQ tests covering Quant, Verbal, Logical Reasoning, and General Awareness — built the way the real exam is structured.",
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

export default function HomePage() {
  return (
    <div>
      <section className="relative overflow-hidden bg-brand-cream">
        <div className="mx-auto grid max-w-6xl items-center gap-10 px-4 py-16 sm:px-6 md:grid-cols-2 md:py-24">
          <div>
            <h1 className="text-4xl font-bold leading-tight text-brand-navy sm:text-5xl">
              Practice like it&apos;s exam day. <br />
              Know your <span className="text-brand-gold">percentile</span>{" "}
              before you walk in.
            </h1>
            <p className="mt-5 max-w-xl text-base text-brand-ink/70 sm:text-lg">
              Percentile Lab gives you timed MBA CET mock tests with
              section-wise scoring, time-per-question analysis, and full
              answer reviews — so every practice test tells you exactly what
              to fix next.
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <Link
                href="/register"
                className="rounded-md bg-brand-navy px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-brand-navy-light"
              >
                Start practicing free
              </Link>
              <Link
                href="/about"
                className="rounded-md border border-brand-navy/20 px-6 py-3 text-sm font-semibold text-brand-navy transition-colors hover:bg-brand-navy/5"
              >
                Learn more
              </Link>
            </div>
          </div>

          <div className="flex justify-center">
            <Image
              src="/logo.png"
              alt="Percentile Lab"
              width={320}
              height={320}
              className="h-56 w-56 object-contain sm:h-72 sm:w-72"
              priority
            />
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
