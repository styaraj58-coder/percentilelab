import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";

import { auth } from "@/auth";
import { MathText } from "@/components/math-text";
import { prisma } from "@/lib/prisma";

import {
  QuestionSummaryTable,
  type ReviewRow,
} from "./question-summary-table";

export const metadata: Metadata = { title: "Test results | Percentile Lab" };

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

  const [test, answers] = await Promise.all([
    prisma.test.findUnique({
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
    }),
    prisma.answer.findMany({ where: { attemptId } }),
  ]);

  if (!test) notFound();

  const answerByQuestion = new Map(answers.map((a) => [a.questionId, a]));

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
  const totalSeconds = allQuestions.reduce(
    (sum, q) => sum + (answerByQuestion.get(q.id)?.timeSpentSeconds ?? 0),
    0
  );
  const avgTime = allQuestions.length > 0 ? totalSeconds / allQuestions.length : 0;

  // Difficulty % per question, across every submitted attempt on this test
  // (this attempt included): wrong answers ÷ attempts that answered it —
  // higher % means more students who tried it got it wrong.
  const correctOptionIdByQuestion = new Map(
    allQuestions.map((q) => [q.id, q.options.find((o) => o.isCorrect)?.id])
  );
  const [otherAttempts, allAnswersForTest] = await Promise.all([
    prisma.testAttempt.findMany({
      where: { testId: test.id, submittedAt: { not: null } },
      select: {
        id: true,
        score: true,
        studentId: true,
        submittedAt: true,
        student: { select: { name: true } },
      },
      orderBy: [{ score: "desc" }, { submittedAt: "asc" }],
    }),
    prisma.answer.findMany({
      where: {
        questionId: { in: allQuestions.map((q) => q.id) },
        selectedOptionId: { not: null },
        attempt: { submittedAt: { not: null } },
      },
      select: { questionId: true, selectedOptionId: true },
    }),
  ]);
  const allScores = otherAttempts.map((a) => a.score ?? 0);
  const myScore = attempt.score ?? 0;
  const below = allScores.filter((s) => s < myScore).length;
  const percentile = allScores.length
    ? Math.round((below / allScores.length) * 1000) / 10
    : 0;
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
      const incorrect = attempted - correct;
      return [q.id, attempted > 0 ? Math.round((incorrect / attempted) * 100) : null];
    })
  );

  // Leaderboard — every submitted attempt on this test, ranked by score
  // (ties broken by who submitted first). otherAttempts is already sorted
  // that way by the query above.
  const leaderboardRows = otherAttempts.map((a, index) => ({
    rank: index + 1,
    attemptId: a.id,
    name: a.student.name,
    score: a.score ?? 0,
    isMe: a.studentId === session.user.id,
  }));
  const myRank = leaderboardRows.find((r) => r.isMe)?.rank ?? null;
  const leaderboardTop = leaderboardRows.slice(0, 10);
  const meInTop = leaderboardTop.some((r) => r.isMe);

  // Weak topics — only meaningful for tests whose questions carry topic tags
  // (currently: mocks generated from the question bank). Hand-built tests
  // have no topic data, so this whole section is skipped rather than shown
  // empty or misleading.
  const topicAgg = new Map<string, { correct: number; total: number }>();
  for (const question of allQuestions) {
    if (!question.topic) continue;
    const entry = topicAgg.get(question.topic) ?? { correct: 0, total: 0 };
    entry.total += 1;
    const answer = answerByQuestion.get(question.id);
    const correctOption = question.options.find((o) => o.isCorrect);
    if (answer?.selectedOptionId && answer.selectedOptionId === correctOption?.id) {
      entry.correct += 1;
    }
    topicAgg.set(question.topic, entry);
  }
  const topicStats = [...topicAgg.entries()]
    .map(([topic, { correct, total }]) => ({
      topic,
      correct,
      total,
      accuracy: Math.round((correct / total) * 100),
    }))
    .sort((a, b) => a.accuracy - b.accuracy);
  const weakTopics = topicStats.filter((t) => t.accuracy < 60);

  // Recommended action — a few rule-based, plain-language suggestions
  // derived from section accuracy, topic accuracy (if available), and
  // pacing (how much got left unattempted).
  const sectionsWithAccuracy = sectionStats.map((s) => ({
    ...s,
    accuracy: s.questionCount > 0 ? Math.round((s.correctCount / s.questionCount) * 100) : 0,
  }));
  const weakestSection = [...sectionsWithAccuracy].sort((a, b) => a.accuracy - b.accuracy)[0];
  const recommendations: string[] = [];
  if (weakestSection && sectionsWithAccuracy.length > 1) {
    recommendations.push(
      `${weakestSection.name} is your weakest section at ${weakestSection.accuracy}% accuracy (${weakestSection.correctCount}/${weakestSection.questionCount} correct) - spend your next study block there before moving on.`
    );
  }
  if (weakTopics.length > 0) {
    const worst = weakTopics[0];
    recommendations.push(
      `Within that, "${worst.topic}" stands out at just ${worst.accuracy}% accuracy (${worst.correct}/${worst.total}) - worth targeted practice on this topic specifically.`
    );
  }
  const unattemptedCount = allQuestions.filter(
    (q) => !answerByQuestion.get(q.id)?.selectedOptionId
  ).length;
  if (allQuestions.length > 0 && unattemptedCount / allQuestions.length > 0.15) {
    recommendations.push(
      `You left ${unattemptedCount} question(s) unattempted - if that wasn't intentional, work on pacing so you reach every question next time.`
    );
  }
  if (recommendations.length === 0) {
    recommendations.push(
      "Solid, even performance across sections - no single weak spot to flag. Keep practicing at this pace and watch your percentile trend over your next few mocks."
    );
  }

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
      seconds: answer?.timeSpentSeconds ?? 0,
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

      {/* Recommended action */}
      <section className="mt-10 rounded-xl border border-brand-gold/30 bg-brand-cream/40 p-5">
        <h2 className="text-lg font-semibold text-brand-navy">
          Recommended action
        </h2>
        <ul className="mt-3 space-y-2 text-sm text-brand-ink/80">
          {recommendations.map((rec, i) => (
            <li key={i} className="flex gap-2">
              <span className="text-brand-gold">•</span>
              <span>{rec}</span>
            </li>
          ))}
        </ul>
      </section>

      {/* Section performance */}
      <section className="mt-10">
        <h2 className="text-lg font-semibold text-brand-navy">
          Section performance
        </h2>
        <div className="mt-4 space-y-4">
          {sectionsWithAccuracy.map((s) => (
            <div
              key={s.id}
              className="rounded-xl border border-black/5 bg-white p-5"
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="font-medium text-brand-navy">{s.name}</p>
                <span
                  className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                    s.accuracy >= 70
                      ? "bg-green-100 text-green-700"
                      : s.accuracy >= 40
                        ? "bg-amber-100 text-amber-700"
                        : "bg-red-100 text-red-700"
                  }`}
                >
                  {s.accuracy}% accuracy
                </span>
              </div>
              <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-brand-cream">
                <div
                  className={`h-full rounded-full ${
                    s.accuracy >= 70
                      ? "bg-green-500"
                      : s.accuracy >= 40
                        ? "bg-amber-500"
                        : "bg-red-500"
                  }`}
                  style={{ width: `${s.accuracy}%` }}
                />
              </div>
              <div className="mt-3 flex flex-wrap gap-4 text-xs text-brand-ink/60">
                <span>Score: {s.correctMarks}/{s.sectionTotalMarks}</span>
                <span>Correct: {s.correctCount}/{s.questionCount}</span>
                <span>Attempted: {s.answeredCount}/{s.questionCount}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Weak topics — only shown when this test's questions carry topic tags */}
      {weakTopics.length > 0 && (
        <section className="mt-10">
          <h2 className="text-lg font-semibold text-brand-navy">
            Weak topics
          </h2>
          <p className="mt-1 text-sm text-brand-ink/60">
            Topics where your accuracy fell below 60%.
          </p>
          <div className="mt-4 overflow-x-auto rounded-xl border border-black/5 bg-white">
            <table className="w-full min-w-[420px] text-left text-sm">
              <thead className="border-b border-black/5 bg-brand-cream/60 text-xs uppercase tracking-wide text-brand-ink/50">
                <tr>
                  <th className="px-5 py-3 font-medium">Topic</th>
                  <th className="px-5 py-3 font-medium">Accuracy</th>
                  <th className="px-5 py-3 font-medium">Correct</th>
                </tr>
              </thead>
              <tbody>
                {weakTopics.map((t) => (
                  <tr key={t.topic} className="border-b border-black/5 last:border-0">
                    <td className="px-5 py-3 font-medium text-brand-navy">
                      {t.topic}
                    </td>
                    <td className="px-5 py-3 text-red-700">{t.accuracy}%</td>
                    <td className="px-5 py-3 text-brand-ink/70">
                      {t.correct}/{t.total}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {/* Leaderboard */}
      <section className="mt-10">
        <h2 className="text-lg font-semibold text-brand-navy">Leaderboard</h2>
        <p className="mt-1 text-sm text-brand-ink/60">
          Ranked by score among everyone who has taken this test
          {myRank ? ` - you're ranked #${myRank} of ${leaderboardRows.length}.` : "."}
        </p>
        <div className="mt-4 overflow-x-auto rounded-xl border border-black/5 bg-white">
          <table className="w-full min-w-[380px] text-left text-sm">
            <thead className="border-b border-black/5 bg-brand-cream/60 text-xs uppercase tracking-wide text-brand-ink/50">
              <tr>
                <th className="px-5 py-3 font-medium">Rank</th>
                <th className="px-5 py-3 font-medium">Name</th>
                <th className="px-5 py-3 font-medium">Score</th>
              </tr>
            </thead>
            <tbody>
              {leaderboardTop.map((row) => (
                <tr
                  key={row.attemptId}
                  className={`border-b border-black/5 last:border-0 ${
                    row.isMe ? "bg-brand-gold/10" : ""
                  }`}
                >
                  <td className="px-5 py-3 font-medium text-brand-navy">
                    #{row.rank}
                  </td>
                  <td className="px-5 py-3 text-brand-ink/70">
                    {row.name}
                    {row.isMe && (
                      <span className="ml-2 rounded-full bg-brand-navy px-2 py-0.5 text-[10px] font-semibold text-white">
                        You
                      </span>
                    )}
                  </td>
                  <td className="px-5 py-3 text-brand-ink/70">
                    {row.score}/{attempt.totalMarks}
                  </td>
                </tr>
              ))}
              {!meInTop && myRank && (
                <tr className="border-t-2 border-dashed border-black/10 bg-brand-gold/10">
                  <td className="px-5 py-3 font-medium text-brand-navy">
                    #{myRank}
                  </td>
                  <td className="px-5 py-3 text-brand-ink/70">
                    {leaderboardRows.find((r) => r.isMe)?.name}
                    <span className="ml-2 rounded-full bg-brand-navy px-2 py-0.5 text-[10px] font-semibold text-white">
                      You
                    </span>
                  </td>
                  <td className="px-5 py-3 text-brand-ink/70">
                    {leaderboardRows.find((r) => r.isMe)?.score}/{attempt.totalMarks}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* Correct / Incorrect / Not attempted */}
      <section className="mt-10">
        <h2 className="text-lg font-semibold text-brand-navy">
          Question breakdown
        </h2>
        <p className="mt-1 text-sm text-brand-ink/60">
          Average: {Math.round(avgTime)}s per question
        </p>
        <div className="mt-4 grid items-start gap-6 sm:grid-cols-3">
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
            emptyMessage="No incorrect answers - nice."
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
                          ? "-"
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
