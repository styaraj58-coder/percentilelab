"use client";

import { useEffect, useMemo, useRef, useState, useTransition } from "react";

import { saveAnswer, submitAttempt } from "./actions";

export type ExamData = {
  attemptId: string;
  testTitle: string;
  durationMinutes: number;
  startedAtMs: number;
  sections: {
    id: string;
    name: string;
    questions: {
      id: string;
      text: string;
      marks: number;
      options: { id: string; text: string }[];
    }[];
  }[];
  initialAnswers: Record<string, string>;
};

type FlatQuestion = {
  sectionName: string;
  question: ExamData["sections"][number]["questions"][number];
};

function formatTime(ms: number) {
  const totalSeconds = Math.max(0, Math.floor(ms / 1000));
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
}

export function ExamRunner({ data }: { data: ExamData }) {
  const flatQuestions = useMemo<FlatQuestion[]>(() => {
    const list: FlatQuestion[] = [];
    data.sections.forEach((section) => {
      section.questions.forEach((question) => {
        list.push({ sectionName: section.name, question });
      });
    });
    return list;
  }, [data.sections]);

  const [answers, setAnswers] = useState<Record<string, string>>(
    data.initialAnswers
  );
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPending, startTransition] = useTransition();
  const [confirmingSubmit, setConfirmingSubmit] = useState(false);
  const submittedRef = useRef(false);
  const activeSinceRef = useRef(Date.now());
  const currentQuestionIdRef = useRef(flatQuestions[0]?.question.id);

  const deadline = data.startedAtMs + data.durationMinutes * 60_000;
  const [remainingMs, setRemainingMs] = useState(() =>
    Math.max(0, deadline - Date.now())
  );

  function flushTime(nextQuestionId?: string, selectedOptionId?: string) {
    const now = Date.now();
    const elapsedSeconds = (now - activeSinceRef.current) / 1000;
    const questionId = currentQuestionIdRef.current;
    activeSinceRef.current = now;
    if (nextQuestionId) currentQuestionIdRef.current = nextQuestionId;

    if (questionId && (elapsedSeconds > 0.5 || selectedOptionId !== undefined)) {
      void saveAnswer(data.attemptId, questionId, selectedOptionId, elapsedSeconds);
    }
  }

  function handleSubmit(auto: boolean) {
    if (submittedRef.current) return;
    if (!auto && !confirmingSubmit) {
      setConfirmingSubmit(true);
      return;
    }
    submittedRef.current = true;
    flushTime();
    startTransition(async () => {
      await submitAttempt(data.attemptId);
    });
  }

  useEffect(() => {
    const interval = setInterval(() => {
      const remaining = Math.max(0, deadline - Date.now());
      setRemainingMs(remaining);
      if (remaining <= 0) {
        clearInterval(interval);
        handleSubmit(true);
      }
    }, 1000);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Periodic autosave so time-on-question isn't lost if the tab closes.
  useEffect(() => {
    const interval = setInterval(() => flushTime(), 20_000);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function goToIndex(index: number) {
    if (index < 0 || index >= flatQuestions.length) return;
    flushTime(flatQuestions[index].question.id);
    setCurrentIndex(index);
  }

  function selectOption(questionId: string, optionId: string) {
    setAnswers((prev) => ({ ...prev, [questionId]: optionId }));
    flushTime(questionId, optionId);
  }

  const current = flatQuestions[currentIndex];
  const answeredCount = Object.keys(answers).length;
  const lowTime = remainingMs < 5 * 60_000;

  return (
    <div className="min-h-screen bg-brand-cream">
      <header className="sticky top-0 z-10 border-b border-black/5 bg-white">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-4 py-3 sm:px-6">
          <div>
            <p className="text-sm font-semibold text-brand-navy">
              {data.testTitle}
            </p>
            <p className="text-xs text-brand-ink/50">
              {answeredCount} / {flatQuestions.length} answered
            </p>
          </div>
          <div
            className={`rounded-md px-4 py-2 text-lg font-bold tabular-nums ${
              lowTime ? "bg-red-50 text-red-700" : "bg-brand-navy/5 text-brand-navy"
            }`}
          >
            {formatTime(remainingMs)}
          </div>
          {confirmingSubmit ? (
            <div className="flex items-center gap-2">
              <span className="text-sm text-brand-ink/70">
                Submit? You can&apos;t change answers after this.
              </span>
              <button
                type="button"
                disabled={isPending}
                onClick={() => handleSubmit(false)}
                className="rounded-md bg-brand-gold px-4 py-2 text-sm font-semibold text-brand-navy hover:bg-brand-gold-light disabled:opacity-50"
              >
                {isPending ? "Submitting..." : "Confirm submit"}
              </button>
              <button
                type="button"
                onClick={() => setConfirmingSubmit(false)}
                className="rounded-md border border-brand-navy/20 px-4 py-2 text-sm font-semibold text-brand-navy hover:bg-brand-navy/5"
              >
                Cancel
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => handleSubmit(false)}
              className="rounded-md bg-brand-gold px-5 py-2.5 text-sm font-semibold text-brand-navy transition-colors hover:bg-brand-gold-light"
            >
              Submit test
            </button>
          )}
        </div>
      </header>

      <div className="mx-auto grid max-w-6xl gap-6 px-4 py-8 sm:px-6 md:grid-cols-[1fr_260px]">
        <div className="rounded-xl border border-black/5 bg-white p-6">
          <p className="text-xs font-semibold uppercase tracking-wide text-brand-gold">
            {current.sectionName} · Question {currentIndex + 1} of{" "}
            {flatQuestions.length} · {current.question.marks} mark
            {current.question.marks === 1 ? "" : "s"}
          </p>
          <p className="mt-3 text-base text-brand-ink">{current.question.text}</p>

          <div className="mt-6 space-y-3">
            {current.question.options.map((option, index) => {
              const selected = answers[current.question.id] === option.id;
              return (
                <label
                  key={option.id}
                  className={`flex cursor-pointer items-center gap-3 rounded-md border px-4 py-3 text-sm transition-colors ${
                    selected
                      ? "border-brand-navy bg-brand-navy/5"
                      : "border-black/10 hover:border-brand-navy/40"
                  }`}
                >
                  <input
                    type="radio"
                    name={`q-${current.question.id}`}
                    checked={selected}
                    onChange={() => selectOption(current.question.id, option.id)}
                    className="h-4 w-4 accent-brand-navy"
                  />
                  <span className="text-brand-ink/50">
                    {String.fromCharCode(65 + index)}.
                  </span>
                  <span>{option.text}</span>
                </label>
              );
            })}
          </div>

          <div className="mt-8 flex justify-between">
            <button
              type="button"
              onClick={() => goToIndex(currentIndex - 1)}
              disabled={currentIndex === 0}
              className="rounded-md border border-brand-navy/20 px-5 py-2.5 text-sm font-semibold text-brand-navy hover:bg-brand-navy/5 disabled:opacity-40"
            >
              Previous
            </button>
            <button
              type="button"
              onClick={() => goToIndex(currentIndex + 1)}
              disabled={currentIndex === flatQuestions.length - 1}
              className="rounded-md bg-brand-navy px-5 py-2.5 text-sm font-semibold text-white hover:bg-brand-navy-light disabled:opacity-40"
            >
              Next
            </button>
          </div>
        </div>

        <div className="h-fit rounded-xl border border-black/5 bg-white p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-brand-ink/50">
            Question navigator
          </p>
          {data.sections.map((section) => (
            <div key={section.id} className="mt-3">
              <p className="text-xs font-medium text-brand-ink/60">
                {section.name}
              </p>
              <div className="mt-2 grid grid-cols-6 gap-1.5 md:grid-cols-5">
                {section.questions.map((question) => {
                  const globalIndex = flatQuestions.findIndex(
                    (f) => f.question.id === question.id
                  );
                  const isAnswered = Boolean(answers[question.id]);
                  const isCurrent = globalIndex === currentIndex;
                  return (
                    <button
                      key={question.id}
                      type="button"
                      onClick={() => goToIndex(globalIndex)}
                      className={`flex h-8 w-8 items-center justify-center rounded-md text-xs font-semibold transition-colors ${
                        isCurrent
                          ? "bg-brand-gold text-brand-navy"
                          : isAnswered
                            ? "bg-brand-navy text-white"
                            : "bg-black/5 text-brand-ink/60 hover:bg-black/10"
                      }`}
                    >
                      {globalIndex + 1}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
