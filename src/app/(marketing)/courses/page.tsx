import type { Metadata } from "next";
import Link from "next/link";

import { JsonLd } from "@/components/json-ld";
import { exams } from "@/lib/exam-data";
import { plans } from "@/lib/plans";
import { EXAM_TARGET_EXAM } from "@/lib/site";
import { getPublishedTests } from "@/lib/tests-data";

export const metadata: Metadata = {
  title: "Courses | Percentile Lab",
  description:
    "Exam-specific prep courses for MAH-CET, CAT, MAT, ATMA and UG BMS CET - live lectures, recordings, full-length mocks, sectional tests and doubt solving.",
  alternates: { canonical: "/courses" },
};

const included = [
  "Live lectures",
  "Recordings of every session",
  "15+ full-length mocks",
  "20+ sectional tests",
  "Personalized doubt solving",
  "Percentile and section-wise analysis",
];

function joinList(items: string[]) {
  if (items.length <= 1) return items.join("");
  return `${items.slice(0, -1).join(", ")} and ${items[items.length - 1]}`;
}

export default async function CoursesPage() {
  const tests = await getPublishedTests();
  const liveExamNames = exams
    .filter((exam) => tests.some((t) => t.targetExam === EXAM_TARGET_EXAM[exam.slug]))
    .map((exam) => exam.shortName);
  const comingSoonNames = exams
    .map((exam) => exam.shortName)
    .filter((name) => !liveExamNames.includes(name));

  const free = plans[0];
  const premium = plans[1];

  const faqs = [
    {
      question: "Which exams do your courses cover?",
      answer: `We cover ${joinList(exams.map((e) => e.shortName))}. Mock tests are live for ${joinList(liveExamNames)}${
        comingSoonNames.length > 0 ? `, and more are being added for ${joinList(comingSoonNames)}` : ""
      }.`,
    },
    {
      question: "What do I get for free?",
      answer: `A free account includes: ${free.features.join(", ")}.`,
    },
    {
      question: "What does Premium include?",
      answer: `Premium is ${premium.price} and includes: ${premium.features.join(", ")}.`,
    },
    {
      question: "How is my percentile calculated?",
      answer:
        "Your percentile is based on your score compared with every student who has submitted the same test on Percentile Lab - it is the share of them you scored higher than. It becomes more reliable as more students take the test.",
    },
    {
      question: "Can I attempt a test more than once?",
      answer:
        "Yes. Every submitted attempt is saved with its own score and analysis, so you can retake a test and track your progress.",
    },
    {
      question: "Does it work on my phone?",
      answer:
        "Yes. Percentile Lab runs in your phone's browser and can be added to your home screen like an app.",
    },
  ];

  return (
    <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: faqs.map((faq) => ({
            "@type": "Question",
            name: faq.question,
            acceptedAnswer: { "@type": "Answer", text: faq.answer },
          })),
        }}
      />

      <div className="text-center">
        <p className="text-xs font-semibold uppercase tracking-wide text-brand-gold">
          Courses
        </p>
        <h1 className="mt-2 text-3xl font-bold text-brand-navy sm:text-4xl">
          Prep built around your exam
        </h1>
        <p className="mx-auto mt-3 max-w-2xl text-brand-ink/70">
          Every course is built around the real exam&apos;s sections and duration,
          so practice feels like the actual test.
        </p>
      </div>

      <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {exams.map((exam) => (
          <div
            key={exam.slug}
            className="flex flex-col rounded-2xl border border-black/10 bg-white p-6 transition-all duration-200 hover:-translate-y-1 hover:shadow-xl"
          >
            <p className="text-xs font-semibold uppercase tracking-wide text-brand-gold">
              {exam.shortName}
            </p>
            <h2 className="mt-1 text-lg font-semibold text-brand-navy">
              {exam.shortName} Preparation Course
            </h2>
            <p className="mt-1 text-sm text-brand-ink/60">{exam.fullName}</p>

            <p className="mt-5 text-xs font-semibold uppercase tracking-wide text-brand-ink/50">
              What you get
            </p>
            <ul className="mt-3 space-y-2 text-sm">
              {included.map((item) => (
                <li key={item} className="flex items-start gap-2">
                  <span className="text-brand-gold">✓</span>
                  <span className="text-brand-ink/80">{item}</span>
                </li>
              ))}
            </ul>

            <div className="mt-auto grid grid-cols-2 gap-3 pt-6">
              <Link
                href="/register"
                className="flex items-center justify-center whitespace-nowrap rounded-md border border-brand-navy bg-brand-navy px-3 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand-navy-light"
              >
                Register now
              </Link>
              <Link
                href={`/exams/${exam.slug}`}
                className="flex items-center justify-center whitespace-nowrap rounded-md border border-brand-navy/20 px-3 py-2.5 text-sm font-semibold text-brand-navy transition-colors hover:bg-brand-cream"
              >
                More info
              </Link>
            </div>
          </div>
        ))}
      </div>

      <section className="mt-20">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-brand-navy">Start free, upgrade when you are ready</h2>
          <p className="mx-auto mt-2 max-w-xl text-sm text-brand-ink/70">
            One plan covers every exam above.
          </p>
        </div>
        <div className="mx-auto mt-8 grid max-w-4xl gap-6 sm:grid-cols-2">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`flex flex-col rounded-2xl border p-6 ${
                plan.highlight ? "border-brand-gold bg-brand-navy text-white" : "border-black/10 bg-white"
              }`}
            >
              <h3 className={`text-lg font-semibold ${plan.highlight ? "text-brand-gold" : "text-brand-navy"}`}>
                {plan.name}
              </h3>
              <p className="mt-1 text-3xl font-bold">
                {plan.price}
                {plan.period && (
                  <span className={`ml-1 text-sm font-normal ${plan.highlight ? "text-white/60" : "text-brand-ink/50"}`}>
                    / {plan.period}
                  </span>
                )}
              </p>
              <ul className="mt-4 flex-1 space-y-2 text-sm">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-2">
                    <span className={plan.highlight ? "text-brand-gold" : "text-brand-navy"}>✓</span>
                    <span className={plan.highlight ? "text-white/90" : "text-brand-ink/80"}>{feature}</span>
                  </li>
                ))}
              </ul>
              <Link
                href={plan.cta.href}
                className={`mt-6 block rounded-md px-4 py-2.5 text-center text-sm font-semibold transition-colors ${
                  plan.highlight
                    ? "bg-brand-gold text-brand-navy hover:bg-brand-gold-light"
                    : "bg-brand-navy text-white hover:bg-brand-navy-light"
                }`}
              >
                {plan.cta.label}
              </Link>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto mt-20 max-w-3xl">
        <h2 className="text-center text-2xl font-bold text-brand-navy">Frequently asked questions</h2>
        <div className="mt-8 divide-y divide-black/10 rounded-2xl border border-black/10 bg-white">
          {faqs.map((faq) => (
            <details key={faq.question} className="group px-6 py-4">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-medium text-brand-navy">
                {faq.question}
                <span className="text-xl leading-none text-brand-gold transition-transform group-open:rotate-45">
                  +
                </span>
              </summary>
              <p className="mt-3 text-sm leading-relaxed text-brand-ink/75">{faq.answer}</p>
            </details>
          ))}
        </div>
      </section>

      <div className="mt-16 text-center">
        <p className="text-brand-ink/70">
          Not sure which course fits? Try 10 free questions with no signup, or
          tell us your target exam using the Enquire Now tab.
        </p>
        <div className="mt-5 flex flex-wrap justify-center gap-3">
          <Link
            href="/sample-test"
            className="rounded-md bg-brand-gold px-6 py-3 text-sm font-semibold text-brand-navy transition-colors hover:bg-brand-gold-light"
          >
            Try 10 free questions
          </Link>
          <Link
            href="/register"
            className="rounded-md border border-brand-navy/20 px-6 py-3 text-sm font-semibold text-brand-navy transition-colors hover:bg-brand-cream"
          >
            Create free account
          </Link>
        </div>
      </div>
    </div>
  );
}
