import type { Metadata } from "next";

import { prisma } from "@/lib/prisma";

import { SampleQuiz, type SampleQuestion } from "./sample-quiz";

export const metadata: Metadata = {
  title: "Free Sample Test - 10 Practice Questions, No Signup | Percentile Lab",
  description:
    "Try 10 free management entrance practice questions - quant, reasoning, English and general awareness - with instant results and explanations. No signup needed.",
  alternates: { canonical: "/sample-test" },
};

// A different random set on every visit.
export const dynamic = "force-dynamic";

function shuffle<T>(items: T[]) {
  const a = [...items];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

async function pickQuestions(): Promise<SampleQuestion[]> {
  // Plain-text, standalone questions from free-preview tests only.
  const pool = await prisma.question.findMany({
    where: {
      passageId: null,
      imageUrl: null,
      section: { test: { published: true, isFreePreview: true } },
    },
    select: { id: true },
  });

  const picked = shuffle(pool).slice(0, 30).map((q) => q.id);
  const rows = await prisma.question.findMany({
    where: { id: { in: picked } },
    select: {
      id: true,
      text: true,
      section: { select: { name: true } },
      options: {
        orderBy: { order: "asc" },
        select: { id: true, text: true, imageUrl: true, isCorrect: true },
      },
    },
  });

  const usable = rows.filter(
    (q) =>
      q.text.length <= 600 &&
      q.options.length === 4 &&
      q.options.filter((o) => o.isCorrect).length === 1 &&
      q.options.every((o) => !o.imageUrl && o.text.trim().length > 0)
  );

  return shuffle(usable)
    .slice(0, 10)
    .map((q) => ({
      id: q.id,
      text: q.text,
      sectionName: q.section.name,
      options: q.options.map((o) => ({ id: o.id, text: o.text })),
    }));
}

export default async function SampleTestPage() {
  const questions = await pickQuestions();

  return (
    <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
      <p className="text-xs font-semibold uppercase tracking-wide text-brand-gold">
        Free sample test
      </p>
      <h1 className="mt-2 text-3xl font-bold text-brand-navy sm:text-4xl">
        Try 10 questions - no signup needed
      </h1>
      <p className="mt-3 text-brand-ink/70">
        A quick taste of the practice on Percentile Lab: 10 questions drawn from
        our free mock tests across quant, reasoning, English and general
        awareness. Submit to see your score, the correct answers and
        explanations. You get a fresh set every time you reload.
      </p>

      <div className="mt-10">
        {questions.length > 0 ? (
          <SampleQuiz questions={questions} />
        ) : (
          <p className="rounded-xl border border-dashed border-brand-navy/20 bg-white p-8 text-center text-brand-ink/60">
            Sample questions aren&apos;t available right now - please check back soon.
          </p>
        )}
      </div>
    </div>
  );
}
