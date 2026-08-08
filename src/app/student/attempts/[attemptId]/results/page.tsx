import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";

import { auth } from "@/auth";
import { MathText } from "@/components/math-text";
import { prisma } from "@/lib/prisma";

export const metadata: Metadata = { title: "Test results | Percentile Lab" };

type ReviewRow = {
  index: number;
  id: string;
  text: string;
  difficulty: number | null;
};

function QuestionSummaryTable({
  title,
  badgeClass,
  rows,
  emptyMessage,
}: {
  title: string;
  badgeClass: string;
  rows: ReviewRow[];
  emptyMessage: string;
}) {
  return (
    <div>
      <h3 className="flex items-center gap-2 text-sm font-semibold text-brand-navy">
        {title}
        <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${badgeClass}`}>
          {rows.length}
        </span>
      </h3>
      <div className="mt-3 overflow-x-auto rounded-xl border border-black/5 bg-white">
        {rows.length === 0 ? (
          <p className="p-4 text-sm text-brand-ink/50">{emptyMessage}</p>
        ) : (
          <table className="w-full min-w-[280px] text-left text-sm">
            <thead className="border-b border-black/5 bg-brand-cream/60 text-xs uppercase tracking-wide text-brand-ink/50">
              <tr>
                <th className="px-4 py-2.5 font-medium">Q#</th>
                <th className="px-4 py-2.5 font-medium">Question</th>
                <th className="px-4 py-2.5 font-medium">Difficulty %</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.id} className="border-b border-black/5 last:border-0">
                  <td className="px-4 py-2.5 font-medium text-brand-navy">
                    <a href={`#q-${row.id}`} className="hover:underline">
                      Q{row.index + 1}
                    </a>
                  </td>
                  <td className="max-w-[240px] truncate px-4 py-2.5 text-brand-ink/70">
                    {row.text}
                  </td>
                  <td className="px-4 py-2.5 text-brand-ink/70">
                    {row.difficulty === null ? "—" : `${row.difficulty}%`}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

export default async function AttemptResultsPage({
  params,
}: {
  params: Promise<{ attemptId: string }>;
}) {
  const { attemptId } = await params;
  const session = await auth();
  if (!session?.user) redirect("/login");

  const attempt = await prisma.testAttempt.findUnique({
    where: { id: attemptId },
  });

  if (!attempt || attempt.studentId !== session.user.id) {
    notFound();
  }

  if (!attempt.submittedAt) {
    redirect(`/exam/${attemptId}`);
  }

  const test = await prisma.test.findUnique({
    where: { id: attempt.testId },
    include: {
      sections: {
        orderBy: { order: "asc" },
        include: {
          questions: {
            orderBy: { order: "asc" },
            include: {
              options: { orderBy: { order: "asc" } },
              passage: { select: { id: true, title: true, text: true } },
            },
          },
        },
      },
    },
  });

  if (!test) notFound();

  const answers = await prisma.answer.findMany({ where: { attemptId } });
  const answerByQuestion = new Map(answers.map((a) => [a.questionId, a]));

  const otherAttempts = await prisma.testAttempt.findMany({
    where: { testId: test.id, submittedAt: { not: null } },
    select: { score: true },
  });
  const allScores = otherAttempts.map((a) => a.score ?? 0);
  const myScore = attempt.score ?? 0;
  const below = allScores.filter((s) => s < myScore).length;
  const percentile = allScores.length
    ? Math.round((below / allScores.length) * 1000) / 10
    : 0;

  const sectionStats = test.sections.map((section) => {
    let correctMarks = 0;
    let sectionTotalMarks = 0;
    let correctCount = 0;
    let answeredCount = 0;

    for (const question of section.questions) {
      sectionTotalMarks += question.marks;
      const answer = answerByQuestion.get(question.id);
      const correctOption = question.options.find((o) => o.isCorrect);
      if (answer?.selectedOptionId) answeredCount += 1;
      if (correctOption && answer?.selectedOptionId === correctOption.id) {
        correctMarks += question.marks;
        correctCount += 1;
      }
    }

    return {
      id: section.id,
      name: section.name,
      correctMarks,
      sectionTotalMarks,
      correctCount,
      answeredCount,
      questionCount: section.questions.length,
    };
  });

  const allQuestions = test.sections.flatMap((s) => s.questions);
  const timeEntries = allQuestions.map((q) => ({
    id: q.id,
    text: q.text,
    seconds: answerByQuestion.get(q.id)?.timeSpentSeconds ?? 0,
  }));
  const avgTime =
    timeEntries.length > 0
      ? timeEntries.reduce((sum, t) => sum + t.seconds, 0) / timeEntries.length
      : 0;

  // Difficulty % per question, across every submitted attempt on this test
  // (this attempt included): correct answers ÷ attempts that answered it.
  const correctOptionIdByQuestion = new Map(
    allQuestions.map((q) => [q.id, q.options.find((o) => o.isCorrect)?.id])
  );
  const allAnswersForTest = await prisma.answer.findMany({
    where: {
      questionId: { in: allQuestions.map((q) => q.id) },
      selectedOptionId: { not: null },
      attempt: { submittedAt: { not: null } },
    },
    select: { questionId: true, selectedOptionId: true },
  });
  const attemptedCountByQuestion = new Map<string, number>();
  const correctCountByQuestion = new Map<string, number>();
  for (const a of allAnswersForTest) {
    attemptedCountByQuestion.set(
      a.questionId,
      (attemptedCountByQuestion.get(a.questionId) ?? 0) + 1
    );
    if (a.selectedOptionId === correctOptionIdByQuestion.get(a.questionId)) {
      correctCountByQuestion.set(
        a.questionId,
        (correctCountByQuestion.get(a.questionId) ?? 0) + 1
      );
    }
  }
  const difficultyByQuestion = new Map<string, number | null>(
    allQuestions.map((q) => {
      const attempted = attemptedCountByQuestion.get(q.id) ?? 0;
      const correct = correctCountByQuestion.get(q.id) ?? 0;
      return [q.id, attempted > 0 ? Math.round((correct / attempted) * 100) : null];
    })
  );

  const correctQuestions: ReviewRow[] = [];
  const incorrectQuestions: ReviewRow[] = [];
  const notAttemptedQuestions: ReviewRow[] = [];
  allQuestions.forEach((question, index) => {
    const answer = answerByQuestion.get(question.id);
    const correctOption = question.options.find((o) => o.isCorrect);
    const entry: ReviewRow = {
      index,
      id: question.id,
      text: question.text,
      difficulty: difficultyByQuestion.get(question.id) ?? null,
    };
    if (!answer?.selectedOptionId) {
      notAttemptedQuestions.push(entry);
    } else if (answer.selectedOptionId === correctOption?.id) {
      correctQuestions.push(entry);
    } else {
      incorrectQuestions.push(entry);
    }
  });

  return (
    <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6">
      <Link href="/student" className="text-sm text-brand-navy hover:underline">
        ← Back to dashboard
      </Link>
      <h1 className="mt-2 text-2xl font-bold text-brand-navy">{test.title}</h1>
      <p className="mt-1 text-sm text-brand-ink/60">
        Submitted {attempt.submittedAt?.toLocaleString()}
      </p>

      {/* Overview */}
      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-black/5 bg-white p-5">
          <p className="text-xs uppercase tracking-wide text-brand-ink/50">Score</p>
          <p className="mt-1 text-2xl font-bold text-brand-navy">
            {attempt.score} / {attempt.totalMarks}
          </p>
        </div>
        <div className="rounded-xl border border-black/5 bg-white p-5">
          <p className="text-xs uppercase tracking-wide text-brand-ink/50">
            Percentile
          </p>
          <p className="mt-1 text-2xl font-bold text-brand-gold">
            {percentile}th
          </p>
        </div>
        <div className="rounded-xl border border-black/5 bg-white p-5">
          <p className="text-xs uppercase tracking-wide text-brand-ink/50">
            Accuracy
          </p>
          <p className="mt-1 text-2xl font-bold text-brand-navy">
            {allQuestions.length > 0
              ? Math.round(
                  (sectionStats.reduce((s, sec) => s + sec.correctCount, 0) /
                    allQuestions.length) *
                    100
                )
              : 0}
            %
          </p>
        </div>
      </div>

      {/* Section-wise breakdown */}
      <section className="mt-10">
        <h2 className="text-lg font-semibold text-brand-navy">
          Section-wise breakdown
        </h2>
        <div className="mt-4 overflow-x-auto rounded-xl border border-black/5 bg-white">
          <table className="w-full min-w-[480px] text-left text-sm">
            <thead className="border-b border-black/5 bg-brand-cream/60 text-xs uppercase tracking-wide text-brand-ink/50">
              <tr>
                <th className="px-5 py-3 font-medium">Section</th>
                <th className="px-5 py-3 font-medium">Score</th>
                <th className="px-5 py-3 font-medium">Correct</th>
                <th className="px-5 py-3 font-medium">Attempted</th>
              </tr>
            </thead>
            <tbody>
              {sectionStats.map((s) => (
                <tr key={s.id} className="border-b border-black/5 last:border-0">
                  <td className="px-5 py-3 font-medium text-brand-navy">
                    {s.name}
                  </td>
                  <td className="px-5 py-3 text-brand-ink/70">
                    {s.correctMarks} / {s.sectionTotalMarks}
                  </td>
                  <td className="px-5 py-3 text-brand-ink/70">
                    {s.correctCount} / {s.questionCount}
                  </td>
                  <td className="px-5 py-3 text-brand-ink/70">
                    {s.answeredCount} / {s.questionCount}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Time-per-question */}
      <section className="mt-10">
        <h2 className="text-lg font-semibold text-brand-navy">
          Time per question
        </h2>
        <p className="mt-1 text-sm text-brand-ink/60">
          Average: {Math.round(avgTime)}s per question
        </p>
        <div className="mt-4 grid grid-cols-6 gap-2 sm:grid-cols-8 md:grid-cols-10">
          {timeEntries.map((t, index) => {
            const overAverage = avgTime > 0 && t.seconds > avgTime * 1.6;
            const skipped = t.seconds === 0;
            return (
              <div
                key={t.id}
                title={`Q${index + 1}: ${t.seconds}s — ${t.text}`}
                className={`flex h-14 flex-col items-center justify-center rounded-md text-xs font-semibold ${
                  skipped
                    ? "bg-black/5 text-brand-ink/40"
                    : overAverage
                      ? "bg-red-50 text-red-700"
                      : "bg-brand-navy/5 text-brand-navy"
                }`}
              >
                <span>Q{index + 1}</span>
                <span className="font-normal">{t.seconds}s</span>
              </div>
            );
          })}
        </div>
        <p className="mt-2 text-xs text-brand-ink/50">
          Red = well above your average time · Grey = skipped
        </p>
      </section>

      {/* Correct / Incorrect / Not attempted */}
      <section className="mt-10">
        <h2 className="text-lg font-semibold text-brand-navy">
          Question breakdown
        </h2>
        <p className="mt-1 text-sm text-brand-ink/60">
          Difficulty % = students who got it right ÷ students who attempted
          it, across every submitted attempt on this test.
        </p>
        <div className="mt-4 grid gap-6 lg:grid-cols-3">
          <QuestionSummaryTable
            title="Correct"
            badgeClass="bg-green-100 text-green-700"
            rows={correctQuestions}
            emptyMessage="No correct answers yet."
          />
          <QuestionSummaryTable
            title="Incorrect"
            badgeClass="bg-red-100 text-red-700"
            rows={incorrectQuestions}
            emptyMessage="No incorrect answers — nice."
          />
          <QuestionSummaryTable
            title="Not attempted"
            badgeClass="bg-black/5 text-brand-ink/60"
            rows={notAttemptedQuestions}
            emptyMessage="You attempted every question."
          />
        </div>
      </section>

      {/* Answer review */}
      <section className="mt-10">
        <h2 className="text-lg font-semibold text-brand-navy">Answer review</h2>
        <div className="mt-4 space-y-4">
          {(() => {
            let lastPassageId: string | null = null;
            return allQuestions.map((question, index) => {
              const answer = answerByQuestion.get(question.id);
              const correctOption = question.options.find((o) => o.isCorrect);
              const isCorrect =
                !!answer?.selectedOptionId &&
                answer.selectedOptionId === correctOption?.id;
              const isSkipped = !answer?.selectedOptionId;
              const showPassage =
                question.passage && question.passage.id !== lastPassageId;
              lastPassageId = question.passage?.id ?? null;

              return (
                <div key={question.id}>
                  {showPassage && question.passage && (
                    <div className="mb-3 rounded-xl border border-brand-gold/30 bg-brand-cream/40 p-4">
                      {question.passage.title && (
                        <p className="mb-1 font-semibold text-brand-navy">
                          {question.passage.title}
                        </p>
                      )}
                      <MathText
                        text={question.passage.text}
                        className="text-sm text-brand-ink/80"
                      />
                    </div>
                  )}
                  <div
                    id={`q-${question.id}`}
                    className="scroll-mt-24 rounded-xl border border-black/5 bg-white p-5"
                  >
                <div className="flex items-start justify-between gap-4">
                  <div className="text-sm font-medium text-brand-ink">
                    <span>Q{index + 1}. </span>
                    <MathText text={question.text} />
                    {question.imageUrl && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={question.imageUrl}
                        alt="Question illustration"
                        className="mt-2 max-h-72 rounded-md border border-black/10 object-contain"
                      />
                    )}
                  </div>
                  <div className="flex shrink-0 flex-col items-end gap-1.5">
                    <span
                      className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                        isSkipped
                          ? "bg-black/5 text-brand-ink/50"
                          : isCorrect
                            ? "bg-green-100 text-green-700"
                            : "bg-red-100 text-red-700"
                      }`}
                    >
                      {isSkipped ? "Skipped" : isCorrect ? "Correct" : "Incorrect"}
                    </span>
                    <span className="text-xs text-brand-ink/50">
                      Difficulty:{" "}
                      {(() => {
                        const difficulty = difficultyByQuestion.get(question.id);
                        return difficulty === null || difficulty === undefined
                          ? "—"
                          : `${difficulty}%`;
                      })()}
                    </span>
                  </div>
                </div>

                <div className="mt-3 space-y-2">
                  {question.options.map((option, oIndex) => {
                    const isSelected = answer?.selectedOptionId === option.id;
                    const isTheCorrectOne = option.isCorrect;
                    return (
                      <div
                        key={option.id}
                        className={`flex items-center gap-2 rounded-md border px-3 py-2 text-sm ${
                          isTheCorrectOne
                            ? "border-green-300 bg-green-50"
                            : isSelected
                              ? "border-red-300 bg-red-50"
                              : "border-black/10"
                        }`}
                      >
                        <span className="text-brand-ink/50">
                          {String.fromCharCode(65 + oIndex)}.
                        </span>
                        <span className="flex-1">
                          <MathText text={option.text} />
                          {option.imageUrl && (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={option.imageUrl}
                              alt="Option illustration"
                              className="mt-2 max-h-40 rounded-md border border-black/10 object-contain"
                            />
                          )}
                        </span>
                        {isTheCorrectOne && (
                          <span className="ml-auto text-xs font-semibold text-green-700">
                            Correct answer
                          </span>
                        )}
                        {isSelected && !isTheCorrectOne && (
                          <span className="ml-auto text-xs font-semibold text-red-700">
                            Your answer
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>

                {question.explanation && (
                  <p className="mt-3 rounded-md bg-brand-cream p-3 text-sm text-brand-ink/80">
                    <span className="font-semibold text-brand-navy">
                      Explanation:{" "}
                    </span>
                    <MathText text={question.explanation} />
                  </p>
                )}
                  </div>
                </div>
              );
            });
          })()}
        </div>
      </section>
    </div>
  );
}
