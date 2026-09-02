import Image from "next/image";
import Link from "next/link";

import { MockTestPopup } from "@/components/mock-test-popup";

const features = [
  {
    title: "Full-length MBA entrance exam mocks",
    description:
      "Sectional MCQ tests covering Quant, Verbal, Logical Reasoning, and General Awareness - built the way CAT, MAH-CET, and every other MBA entrance exam is actually structured.",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} className="h-5 w-5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M6 3.5h9l3 3v14a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1v-16a1 1 0 0 1 1-1Z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 11h6M9 14.5h6M9 18h3.5" />
      </svg>
    ),
  },
  {
    title: "Percentile-based scoring",
    description:
      "See exactly where you stand against every other student who has taken the same test, not just a raw score.",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} className="h-5 w-5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M4 19V13M11 19V5M18 19v-7" />
      </svg>
    ),
  },
  {
    title: "Section-wise breakdown",
    description:
      "Know which section is pulling your score down - accuracy and marks broken out by section, every time.",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} className="h-5 w-5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v9l7.8 4.5" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M20.5 12a8.5 8.5 0 1 1-4.25-7.36" />
      </svg>
    ),
  },
  {
    title: "Time-per-question analysis",
    description:
      "Find out where you're losing time: questions you rushed, questions you got stuck on, and questions you left blank.",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} className="h-5 w-5">
        <circle cx="12" cy="13" r="7.75" strokeLinecap="round" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v4l3 1.75M9.5 2.5h5" />
      </svg>
    ),
  },
  {
    title: "Answer review with solutions",
    description:
      "Go back through every question after submitting, see the correct answer, and read the explanation.",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} className="h-5 w-5">
        <circle cx="12" cy="12" r="8.5" />
        <path strokeLinecap="round" strokeLinejoin="round" d="m8.25 12.25 2.5 2.5 5-5.25" />
      </svg>
    ),
  },
  {
    title: "Timed, exam-like conditions",
    description:
      "A single running clock per test keeps practice honest and builds real exam pressure and pacing.",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} className="h-5 w-5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M8 2.75h8M9.5 21.25h5" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M7 2.75c0 4 1.8 6 5 6s5-2 5-6M7 21.25c0-4 1.8-6 5-6s5 2 5 6" />
      </svg>
    ),
  },
];

const steps = [
  {
    step: "1",
    title: "Create your free account",
    description: "Sign up in under a minute - no payment required to get started.",
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
    description: "CAT, MAH-CET, and more.",
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
      <MockTestPopup />
      <section className="relative overflow-hidden bg-brand-cream">
        <div className="relative overflow-hidden">
          <Image
            src="/images/hero-student-bg.jpg"
            alt=""
            fill
            priority
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-brand-navy via-brand-navy/85 to-brand-navy/25" />
          <div className="relative z-10 mx-auto flex max-w-3xl flex-col items-center px-4 pb-16 pt-16 text-center sm:px-6 sm:pb-20 md:pt-20 lg:max-w-6xl lg:items-start lg:text-left">
            <h1 className="text-4xl font-bold leading-tight text-white sm:text-5xl">
              Practice like it&apos;s exam day. <br />
              Know your <span className="text-brand-gold">percentile</span>{" "}
              before you walk in.
            </h1>
            <div className="mt-5 h-1.5 w-16 rounded-full bg-brand-gold" />
            <p className="mt-5 max-w-xl text-base text-white/80 sm:text-lg">
              Percentile Lab gives you timed mock tests for every major MBA
              entrance exam - CAT, MAH-CET, MAT, and ATMA - with section-wise
              scoring, time-per-question analysis, and full answer reviews.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-4 lg:justify-start">
              <Link
                href="/register"
                className="inline-flex items-center gap-2 rounded-full bg-brand-gold px-6 py-3.5 text-sm font-semibold text-brand-navy transition-colors hover:bg-brand-gold-light"
              >
                Start practicing free
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="h-4 w-4">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14M13 6l6 6-6 6" />
                </svg>
              </Link>
              <Link
                href="/about"
                className="inline-flex items-center gap-2 rounded-full border border-white/30 px-6 py-3.5 text-sm font-semibold text-white transition-colors hover:bg-white/10"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} className="h-4 w-4">
                  <circle cx="12" cy="12" r="8.5" />
                  <path fill="currentColor" stroke="none" d="M10.5 9.2v5.6l4.7-2.8-4.7-2.8Z" />
                </svg>
                Learn more
              </Link>
            </div>
          </div>
        </div>

        <div className="relative z-10 mx-auto max-w-5xl px-4 pb-14 pt-10 sm:px-6 sm:pt-14">
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

        <div className="relative z-10 mx-auto max-w-4xl px-4 pb-14 sm:px-6">
          <div className="relative aspect-video w-full overflow-hidden rounded-3xl bg-black shadow-xl shadow-brand-navy/10">
            <video
              src="https://vnjmcqyuoqbnxnpjbsod.supabase.co/storage/v1/object/public/uploads/47177fc5-2b48-4232-bf03-f5938c108529.mp4"
              autoPlay
              loop
              muted
              playsInline
              className="h-full w-full object-cover"
            />
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="https://vnjmcqyuoqbnxnpjbsod.supabase.co/storage/v1/object/public/uploads/f6412b1f-059b-474b-82d8-9b471806e475.png"
              alt="Percentile Lab"
              className="absolute bottom-[10%] right-[7%] w-[6%] aspect-square object-contain"
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
              <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-full bg-brand-gold/15 text-brand-gold">
                {feature.icon}
              </div>
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
              className="aspect-[3/2] w-full object-cover"
            />
            <div className="p-6">
              <h3 className="text-center text-lg font-semibold text-brand-navy">
                Real exam pressure, right at home
              </h3>
              <p className="mt-1 text-center text-sm text-brand-ink/70">
                One running clock, no pausing - practice the way you&apos;ll
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
              className="aspect-[3/2] w-full object-cover"
            />
            <div className="p-6">
              <h3 className="text-center text-lg font-semibold text-brand-navy">
                Think it through, then check yourself
              </h3>
              <p className="mt-1 text-center text-sm text-brand-ink/70">
                Every question gets a full explanation afterward - not just a
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
