"use server";

import { z } from "zod";

import { prisma } from "@/lib/prisma";

const answersSchema = z
  .array(
    z.object({
      questionId: z.string().min(1).max(60),
      optionId: z.string().min(1).max(60).nullable(),
    })
  )
  .min(1)
  .max(10);

export type SampleResult = {
  questionId: string;
  selectedOptionId: string | null;
  correctOptionId: string | null;
  isCorrect: boolean;
  explanation: string | null;
};

export type SampleGrade =
  | { ok: true; score: number; total: number; results: SampleResult[] }
  | { ok: false; error: string };

// Answers are checked on the server and only revealed after submission, so
// the correct options never ship in the page itself. Only questions from
// published free-preview tests can be graded here.
export async function gradeSampleQuiz(input: unknown): Promise<SampleGrade> {
  const parsed = answersSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: "Something went wrong. Please reload and try again." };

  const answers = parsed.data;
  const questions = await prisma.question.findMany({
    where: {
      id: { in: answers.map((a) => a.questionId) },
      section: { test: { published: true, isFreePreview: true } },
    },
    select: {
      id: true,
      explanation: true,
      options: { select: { id: true, isCorrect: true } },
    },
  });
  const byId = new Map(questions.map((q) => [q.id, q]));

  const results: SampleResult[] = answers
    .filter((a) => byId.has(a.questionId))
    .map((a) => {
      const q = byId.get(a.questionId)!;
      const correctOptionId = q.options.find((o) => o.isCorrect)?.id ?? null;
      const validSelection = a.optionId && q.options.some((o) => o.id === a.optionId);
      return {
        questionId: q.id,
        selectedOptionId: validSelection ? a.optionId : null,
        correctOptionId,
        isCorrect: !!validSelection && a.optionId === correctOptionId,
        explanation: q.explanation,
      };
    });

  if (results.length === 0) {
    return { ok: false, error: "These questions are no longer available. Please reload for a fresh set." };
  }

  return {
    ok: true,
    score: results.filter((r) => r.isCorrect).length,
    total: results.length,
    results,
  };
}
