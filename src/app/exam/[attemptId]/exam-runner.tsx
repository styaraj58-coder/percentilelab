"use client";

import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState, useTransition } from "react";

import { MathText } from "@/components/math-text";
import { formatMarks, penaltyFor } from "@/lib/marking";

import { saveAnswer, submitAttempt } from "./actions";

export type ExamData = {
  attemptId: string;
  testTitle: string;
  studentName: string;
  durationMinutes: number;
  startedAtMs: number;
  // Fraction of a question's marks lost for a wrong answer (0 = none).
  negativeRatio: number;
  sections: {
    id: string;
    name: string;
    questions: {
      id: string;
      text: string;
      imageUrl: string | null;
      marks: number;
      passage: { id: string; title: string | null; text: string } | null;
      options: { id: string; text: string; imageUrl: string | null }[];
    }[];
  }[];
  initialAnswers: Record<string, string>;
  initialTimeSpent: Record<string, number>;
};

type QuestionStatus =
  | "notVisited"
  | "notAnswered"
  | "answered"
  | "marked"
  | "answeredMarked";

function formatTime(ms: number) {
  const totalSeconds = Math.max(0, Math.floor(ms / 1000));
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  return `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}:${seconds
    .toString()
    .padStart(2, "0")}`;
}

function formatQuestionTime(seconds: number) {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
}

const STATUS_STYLES: Record<QuestionStatus, string> = {
  notVisited: "bg-white text-brand-ink border border-black/15",
  notAnswered: "bg-red-500 text-white",
  answered: "bg-green-600 text-white",
  marked: "bg-purple-600 text-white",
  answeredMarked: "bg-purple-600 text-white ring-2 ring-green-500 ring-offset-1",
};

function ChevronLeft() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M15 18l-6-6 6-6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function ChevronRight() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M9 18l6-6-6-6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function ClockIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 3" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function GridIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <rect x="4" y="4" width="6" height="6" rx="1" />
      <rect x="14" y="4" width="6" height="6" rx="1" />
      <rect x="4" y="14" width="6" height="6" rx="1" />
      <rect x="14" y="14" width="6" height="6" rx="1" />
    </svg>
  );
}

// A reading passage. On phones it can be folded away once read, so the
// question and its options come back into view; on larger screens it is
// always open. Keyed by passage id, so it opens again for a new passage but
// keeps its state while moving between questions of the same passage.
function PassageCard({ title, text }: { title: string | null; text: string }) {
  const [open, setOpen] = useState(true);
  return (
    <div className="mb-4 rounded-md border border-black/10 bg-white text-brand-ink/80">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        className="flex min-h-11 w-full items-center justify-between gap-3 px-4 text-left font-semibold text-brand-navy lg:hidden"
      >
        <span>{title ?? "Passage"}</span>
        <span className="text-xs font-medium text-brand-ink/50">{open ? "Hide" : "Show"}</span>
      </button>
      <div className={`${open ? "block" : "hidden"} px-4 pb-4 lg:block lg:p-4`}>
        {title && <p className="mb-2 hidden font-semibold text-brand-navy lg:block">{title}</p>}
        <MathText text={text} className="leading-relaxed" />
      </div>
    </div>
  );
}

export function ExamRunner({ data }: { data: ExamData }) {
  const [sectionIndex, setSectionIndex] = useState(0);
  const [questionIndex, setQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>(data.initialAnswers);
  const [visited, setVisited] = useState<Record<string, true>>({});
  const [markedForReview, setMarkedForReview] = useState<Record<string, true>>({});
  const [timeSpentMap, setTimeSpentMap] = useState<Record<string, number>>(
    data.initialTimeSpent
  );
  const [confirmingSubmit, setConfirmingSubmit] = useState(false);
  const [paletteOpen, setPaletteOpen] = useState(false);
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const submittedRef = useRef(false);
  const activeSinceRef = useRef(Date.now());
  const currentQuestionIdRef = useRef(data.sections[0]?.questions[0]?.id);
  const [, forceTick] = useState(0);

  const currentSection = data.sections[sectionIndex];
  const currentQuestion = currentSection.questions[questionIndex];

  const deadline = data.startedAtMs + data.durationMinutes * 60_000;
  const [remainingMs, setRemainingMs] = useState(() => Math.max(0, deadline - Date.now()));

  useEffect(() => {
    setVisited((prev) =>
      prev[currentQuestion.id] ? prev : { ...prev, [currentQuestion.id]: true }
    );
  }, [currentQuestion.id]);

  // While the phone's question palette is open, keep the page behind it still.
  useEffect(() => {
    if (!paletteOpen) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setPaletteOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = previous;
      window.removeEventListener("keydown", onKey);
    };
  }, [paletteOpen]);

  function flushTime(nextQuestionId?: string, selectedOptionId?: string | null) {
    const now = Date.now();
    const elapsedSeconds = (now - activeSinceRef.current) / 1000;
    const questionId = currentQuestionIdRef.current;
    activeSinceRef.current = now;
    if (nextQuestionId) currentQuestionIdRef.current = nextQuestionId;

    if (questionId && (elapsedSeconds > 0.5 || selectedOptionId !== undefined)) {
      setTimeSpentMap((prev) => ({
        ...prev,
        [questionId]: (prev[questionId] ?? 0) + elapsedSeconds,
      }));
      return saveAnswer(data.attemptId, questionId, selectedOptionId, elapsedSeconds);
    }
    return undefined;
  }

  function handleSubmit(auto: boolean) {
    if (submittedRef.current) return;
    if (!auto && !confirmingSubmit) {
      setConfirmingSubmit(true);
      return;
    }
    submittedRef.current = true;
    startTransition(async () => {
      // Wait for the last question's time/answer to actually persist before
      // grading reads it back — otherwise a race could silently drop it.
      await flushTime();
      const { redirectTo } = await submitAttempt(data.attemptId);
      router.push(redirectTo);
    });
  }

  useEffect(() => {
    const interval = setInterval(() => {
      const remaining = Math.max(0, deadline - Date.now());
      setRemainingMs(remaining);
      if (remaining <= 0) {
        clearInterval(interval);
        handleSubmit(true);
      } else {
        forceTick((t) => t + 1);
      }
    }, 1000);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const interval = setInterval(() => flushTime(), 20_000);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function goToQuestion(sIdx: number, qIdx: number) {
    if (sIdx < 0 || sIdx >= data.sections.length) return;
    const section = data.sections[sIdx];
    if (qIdx < 0 || qIdx >= section.questions.length) return;
    flushTime(section.questions[qIdx].id);
    setSectionIndex(sIdx);
    setQuestionIndex(qIdx);
    // On a phone the whole page scrolls; start every question at its top.
    window.scrollTo(0, 0);
  }

  function selectOption(optionId: string) {
    setAnswers((prev) => ({ ...prev, [currentQuestion.id]: optionId }));
    flushTime(currentQuestion.id, optionId);
  }

  function clearResponse() {
    setAnswers((prev) => {
      const next = { ...prev };
      delete next[currentQuestion.id];
      return next;
    });
    void saveAnswer(data.attemptId, currentQuestion.id, null, 0);
  }

  function toggleMarkForReview() {
    setMarkedForReview((prev) => {
      const next = { ...prev };
      if (next[currentQuestion.id]) delete next[currentQuestion.id];
      else next[currentQuestion.id] = true;
      return next;
    });
  }

  function goNext(markReview: boolean) {
    if (markReview) toggleMarkForReview();
    const isLastInSection = questionIndex === currentSection.questions.length - 1;
    if (!isLastInSection) {
      goToQuestion(sectionIndex, questionIndex + 1);
    } else if (sectionIndex < data.sections.length - 1) {
      goToQuestion(sectionIndex + 1, 0);
    } else {
      flushTime();
    }
  }

  function statusFor(questionId: string): QuestionStatus {
    const isAnswered = Boolean(answers[questionId]);
    const isMarked = Boolean(markedForReview[questionId]);
    const isVisited = Boolean(visited[questionId]) || questionId === currentQuestion.id;
    if (isMarked && isAnswered) return "answeredMarked";
    if (isMarked) return "marked";
    if (isAnswered) return "answered";
    if (isVisited) return "notAnswered";
    return "notVisited";
  }

  const sectionStats = useMemo(() => {
    const stats = {
      notVisited: 0,
      notAnswered: 0,
      answered: 0,
      marked: 0,
      answeredMarked: 0,
    };
    for (const q of currentSection.questions) {
      stats[statusFor(q.id)] += 1;
    }
    return stats;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentSection, answers, markedForReview, visited, currentQuestion.id]);

  const totalAnswered = useMemo(
    () =>
      data.sections.reduce(
        (sum, s) => sum + s.questions.filter((q) => answers[q.id]).length,
        0
      ),
    [data.sections, answers]
  );
  const totalQuestions = useMemo(
    () => data.sections.reduce((sum, s) => sum + s.questions.length, 0),
    [data.sections]
  );

  const liveQuestionSeconds =
    (timeSpentMap[currentQuestion.id] ?? 0) +
    (currentQuestionIdRef.current === currentQuestion.id
      ? (Date.now() - activeSinceRef.current) / 1000
      : 0);

  const lowTime = remainingMs < 5 * 60_000;
  const isMarked = Boolean(markedForReview[currentQuestion.id]);
  const initial = data.studentName.trim().charAt(0).toUpperCase() || "S";
  const sectionTotal = currentSection.questions.length;

  const [passageText, questionText] = currentQuestion.passage
    ? [currentQuestion.passage.text, currentQuestion.text]
    : [null, currentQuestion.text];

  return (
    <div className="flex min-h-dvh flex-col bg-[#f4f5f7] text-sm text-brand-ink">
      {/* Stays on screen while the question scrolls: the timer, Submit and the sections. */}
      <div className="sticky top-0 z-30">
        <header className="flex items-center justify-between gap-3 border-b border-black/10 bg-white px-3 py-2 sm:px-4 sm:py-2.5">
          <p className="min-w-0 flex-1 truncate font-semibold text-brand-navy">{data.testTitle}</p>
          <div className="flex shrink-0 items-center gap-3 sm:gap-6">
            <span className="hidden text-xs text-brand-ink/50 sm:inline">
              {totalAnswered} / {totalQuestions} answered
            </span>
            <div className="flex items-center gap-1.5 text-brand-ink/70">
              <span className="hidden text-xs sm:inline">Time Left:</span>
              <span className="text-brand-ink/50 sm:hidden">
                <ClockIcon />
              </span>
              {/* the server's clock reading is a second or two behind the browser's, so the first paint always differs */}
              <span
                suppressHydrationWarning
                className={`rounded px-1.5 py-0.5 font-mono text-sm font-semibold tabular-nums sm:px-2 ${
                  lowTime ? "bg-red-50 text-red-700" : "text-brand-navy"
                }`}
              >
                {formatTime(remainingMs)}
              </span>
            </div>
            {confirmingSubmit ? (
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  disabled={isPending}
                  onClick={() => handleSubmit(false)}
                  className="min-h-11 whitespace-nowrap rounded-md bg-brand-gold px-3 text-xs font-semibold text-brand-navy hover:bg-brand-gold-light disabled:opacity-50 sm:min-h-0 sm:py-1.5"
                >
                  {isPending ? "Submitting..." : "Confirm"}
                  <span className="hidden sm:inline">{isPending ? "" : " submit"}</span>
                </button>
                <button
                  type="button"
                  onClick={() => setConfirmingSubmit(false)}
                  className="min-h-11 rounded-md border border-black/10 px-3 text-xs font-semibold text-brand-ink/70 hover:bg-black/5 sm:min-h-0 sm:py-1.5"
                >
                  Cancel
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => handleSubmit(false)}
                className="min-h-11 whitespace-nowrap rounded-md bg-brand-gold px-3 text-xs font-semibold text-brand-navy hover:bg-brand-gold-light sm:min-h-0 sm:py-1.5"
              >
                Submit<span className="hidden sm:inline"> test</span>
              </button>
            )}
          </div>
        </header>

        <div className="flex items-center border-b border-black/10 bg-white px-1">
          <button
            type="button"
            onClick={() => goToQuestion(sectionIndex - 1, 0)}
            disabled={sectionIndex === 0}
            className="flex h-11 w-9 shrink-0 items-center justify-center text-brand-ink/40 hover:text-brand-navy disabled:opacity-30"
            aria-label="Previous section"
          >
            <ChevronLeft />
          </button>
          <div className="flex flex-1 gap-1 overflow-x-auto">
            {data.sections.map((section, sIdx) => (
              <button
                key={section.id}
                type="button"
                onClick={() => goToQuestion(sIdx, 0)}
                className={`flex min-h-11 shrink-0 items-center whitespace-nowrap border-b-2 px-3.5 text-xs font-medium transition-colors ${
                  sIdx === sectionIndex
                    ? "border-brand-navy bg-brand-navy/5 text-brand-navy"
                    : "border-transparent text-brand-ink/60 hover:text-brand-navy"
                }`}
              >
                {section.name}
              </button>
            ))}
          </div>
          <button
            type="button"
            onClick={() => goToQuestion(sectionIndex + 1, 0)}
            disabled={sectionIndex === data.sections.length - 1}
            className="flex h-11 w-9 shrink-0 items-center justify-center text-brand-ink/40 hover:text-brand-navy disabled:opacity-30"
            aria-label="Next section"
          >
            <ChevronRight />
          </button>
        </div>
      </div>

      <div className="flex items-center justify-between gap-2 border-b border-black/10 bg-white px-3 py-2 sm:px-4">
        <div className="flex min-w-0 items-center gap-3">
          <span className="whitespace-nowrap font-medium text-brand-navy">
            Question {questionIndex + 1}
            <span className="font-normal text-brand-ink/45"> / {sectionTotal}</span>
          </span>
          <span className="whitespace-nowrap text-xs text-brand-ink/60">
            <span className="hidden sm:inline">Marking Scheme: </span>
            <span className="font-semibold text-green-700">+{currentQuestion.marks}</span>
            {data.negativeRatio > 0 && (
              <>
                {" / "}
                <span className="font-semibold text-red-700">
                  -{formatMarks(penaltyFor(currentQuestion.marks, data.negativeRatio))}
                </span>
              </>
            )}
          </span>
        </div>
        <div className="flex shrink-0 items-center gap-3 text-xs text-brand-ink/60">
          <span suppressHydrationWarning className="flex items-center gap-1 font-mono tabular-nums">
            <ClockIcon />
            {formatQuestionTime(liveQuestionSeconds)}
          </span>
          <button
            type="button"
            onClick={toggleMarkForReview}
            className={`min-h-11 whitespace-nowrap rounded-md border px-3 font-medium transition-colors sm:min-h-0 sm:py-1.5 ${
              isMarked
                ? "border-purple-600 bg-purple-50 text-purple-700"
                : "border-black/15 text-brand-ink/70 hover:bg-black/5"
            }`}
          >
            {isMarked ? "★ Marked" : "☆ Mark"}
            <span className="hidden sm:inline"> for review</span>
          </button>
        </div>
      </div>

      <div className="flex flex-1 flex-col lg:flex-row">
        {/* pb-28 leaves room for the phone's fixed action bar */}
        <main className="min-w-0 flex-1 p-4 pb-28 sm:p-5 sm:pb-28 lg:pb-5">
          {passageText && currentQuestion.passage && (
            <PassageCard
              key={currentQuestion.passage.id}
              title={currentQuestion.passage.title}
              text={passageText}
            />
          )}

          <MathText text={questionText} className="text-base text-brand-ink" />
          {currentQuestion.imageUrl && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={currentQuestion.imageUrl}
              alt="Question illustration"
              className="mt-4 max-h-96 max-w-full rounded-md border border-black/10 object-contain"
            />
          )}

          <div className="mt-6 space-y-3">
            {currentQuestion.options.map((option) => {
              const selected = answers[currentQuestion.id] === option.id;
              return (
                <label
                  key={option.id}
                  className={`flex cursor-pointer items-center gap-3 rounded-md border px-4 py-3.5 text-base transition-colors lg:py-3 lg:text-sm ${
                    selected
                      ? "border-brand-navy bg-brand-navy/5"
                      : "border-black/10 hover:border-brand-navy/40"
                  }`}
                >
                  <input
                    type="radio"
                    name={`q-${currentQuestion.id}`}
                    checked={selected}
                    onChange={() => selectOption(option.id)}
                    className="h-5 w-5 shrink-0 accent-brand-navy lg:h-4 lg:w-4"
                  />
                  <span className="min-w-0 flex-1">
                    <MathText text={option.text} />
                    {option.imageUrl && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={option.imageUrl}
                        alt="Option illustration"
                        className="mt-2 max-h-48 max-w-full rounded-md border border-black/10 object-contain"
                      />
                    )}
                  </span>
                </label>
              );
            })}
          </div>

          {/* Phones: a plain Clear link under the options (the bar below is for moving on). */}
          {answers[currentQuestion.id] && (
            <button
              type="button"
              onClick={clearResponse}
              className="mt-4 min-h-11 rounded-md border border-black/15 px-4 text-sm font-semibold text-brand-ink/70 active:bg-black/5 lg:hidden"
            >
              Clear response
            </button>
          )}

          <div className="mt-8 hidden flex-wrap gap-3 border-t border-black/10 pt-5 lg:flex">
            <button
              type="button"
              onClick={clearResponse}
              disabled={!answers[currentQuestion.id]}
              className="rounded-md border border-black/15 px-4 py-2 text-xs font-semibold text-brand-ink/70 hover:bg-black/5 disabled:opacity-40"
            >
              Clear response
            </button>
            <button
              type="button"
              onClick={() => goNext(true)}
              className="rounded-md border border-purple-600 px-4 py-2 text-xs font-semibold text-purple-700 hover:bg-purple-50"
            >
              Mark for review &amp; next
            </button>
            <button
              type="button"
              onClick={() => goNext(false)}
              className="rounded-md bg-brand-navy px-5 py-2 text-xs font-semibold text-white hover:bg-brand-navy-light"
            >
              Save &amp; next
            </button>
          </div>
        </main>

        {paletteOpen && (
          <div
            className="fixed inset-0 z-40 bg-black/40 lg:hidden"
            onClick={() => setPaletteOpen(false)}
            aria-hidden="true"
          />
        )}
        <aside
          aria-label="Question palette"
          className={`${
            paletteOpen
              ? "fixed inset-x-0 bottom-0 z-50 max-h-[85dvh] overflow-y-auto rounded-t-2xl shadow-2xl"
              : "hidden"
          } w-full shrink-0 border-t border-black/10 bg-white p-4 pb-[calc(1rem+env(safe-area-inset-bottom))] lg:static lg:z-auto lg:block lg:max-h-none lg:w-72 lg:overflow-visible lg:rounded-none lg:border-l lg:border-t-0 lg:pb-4 lg:shadow-none`}
        >
          <div className="mb-3 flex items-center justify-between lg:hidden">
            <h3 className="text-base font-semibold text-brand-navy">Question palette</h3>
            <button
              type="button"
              onClick={() => setPaletteOpen(false)}
              aria-label="Close question palette"
              className="flex h-11 w-11 items-center justify-center rounded-md text-xl text-brand-ink/60 active:bg-black/5"
            >
              &times;
            </button>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-red-500 text-sm font-semibold text-white">
              {initial}
            </div>
            <span className="font-medium text-brand-ink">{data.studentName}</span>
          </div>

          <p className="mt-4 text-xs font-medium text-brand-ink/70">
            Questions in this section: {currentSection.questions.length}
          </p>

          <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
            <div className="flex items-center gap-2 rounded-md bg-red-50 px-2 py-1.5">
              <span className="flex h-5 w-5 items-center justify-center rounded bg-red-500 font-semibold text-white">
                {sectionStats.notAnswered}
              </span>
              <span className="text-brand-ink/70">Not Answered</span>
            </div>
            <div className="flex items-center gap-2 rounded-md bg-green-50 px-2 py-1.5">
              <span className="flex h-5 w-5 items-center justify-center rounded bg-green-600 font-semibold text-white">
                {sectionStats.answered}
              </span>
              <span className="text-brand-ink/70">Answered</span>
            </div>
            <div className="flex items-center gap-2 rounded-md bg-purple-50 px-2 py-1.5">
              <span className="flex h-5 w-5 items-center justify-center rounded bg-purple-600 font-semibold text-white">
                {sectionStats.marked}
              </span>
              <span className="text-brand-ink/70">Marked</span>
            </div>
            <div className="flex items-center gap-2 rounded-md bg-black/5 px-2 py-1.5">
              <span className="flex h-5 w-5 items-center justify-center rounded border border-black/20 bg-white font-semibold text-brand-ink/70">
                {sectionStats.notVisited}
              </span>
              <span className="text-brand-ink/70">Not Visited</span>
            </div>
            <div className="col-span-2 flex items-center gap-2 rounded-md bg-purple-50 px-2 py-1.5">
              <span className="flex h-5 w-5 items-center justify-center rounded bg-purple-600 font-semibold text-white">
                {sectionStats.answeredMarked}
              </span>
              <span className="text-brand-ink/70">Answered &amp; Marked for Review</span>
            </div>
          </div>

          <h3 className="mt-5 text-center text-sm font-semibold text-brand-navy">
            {currentSection.name}
          </h3>
          <div className="mt-3 grid grid-cols-6 gap-2 pr-1 sm:grid-cols-8 lg:max-h-[420px] lg:grid-cols-5 lg:overflow-y-auto">
            {currentSection.questions.map((q, qIdx) => (
              <button
                key={q.id}
                type="button"
                onClick={() => {
                  goToQuestion(sectionIndex, qIdx);
                  setPaletteOpen(false);
                }}
                className={`flex h-11 w-11 items-center justify-center justify-self-center rounded text-sm font-semibold transition-colors lg:h-8 lg:w-8 lg:text-xs ${
                  qIdx === questionIndex
                    ? "ring-2 ring-brand-navy ring-offset-1"
                    : ""
                } ${STATUS_STYLES[statusFor(q.id)]}`}
              >
                {qIdx + 1}
              </button>
            ))}
          </div>
        </aside>
      </div>

      {/* Phones: always-reachable actions at the bottom of the screen. */}
      <div className="fixed inset-x-0 bottom-0 z-30 flex items-stretch gap-2 border-t border-black/10 bg-white px-3 pb-[calc(0.625rem+env(safe-area-inset-bottom))] pt-2.5 shadow-[0_-4px_12px_rgba(0,0,0,0.06)] lg:hidden">
        <button
          type="button"
          onClick={() => setPaletteOpen(true)}
          className="flex min-h-12 flex-col items-center justify-center gap-0.5 rounded-md border border-black/15 px-3 text-[11px] font-semibold text-brand-navy active:bg-black/5"
        >
          <GridIcon />
          Questions
        </button>
        <button
          type="button"
          onClick={() => goNext(true)}
          className="min-h-12 flex-1 rounded-md border border-purple-600 px-2 text-xs font-semibold text-purple-700 active:bg-purple-50"
        >
          Mark &amp; next
        </button>
        <button
          type="button"
          onClick={() => goNext(false)}
          className="min-h-12 flex-[1.4] rounded-md bg-brand-navy px-2 text-sm font-semibold text-white active:bg-brand-navy-light"
        >
          Save &amp; next
        </button>
      </div>
    </div>
  );
}
