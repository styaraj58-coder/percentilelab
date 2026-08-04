"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import type { TestInput } from "@/lib/validation";

import { createTest, updateTest } from "./actions";

type OptionState = { id: string; text: string; isCorrect: boolean };
type QuestionState = {
  id: string;
  text: string;
  explanation: string;
  marks: number;
  options: OptionState[];
};
type SectionState = { id: string; name: string; questions: QuestionState[] };

function newId() {
  return typeof crypto !== "undefined" && crypto.randomUUID
    ? crypto.randomUUID()
    : Math.random().toString(36).slice(2);
}

function newOption(): OptionState {
  return { id: newId(), text: "", isCorrect: false };
}

function newQuestion(): QuestionState {
  return {
    id: newId(),
    text: "",
    explanation: "",
    marks: 1,
    options: [newOption(), newOption()],
  };
}

function newSection(name: string): SectionState {
  return { id: newId(), name, questions: [newQuestion()] };
}

export type InitialTestData = {
  title: string;
  description: string;
  durationMinutes: number;
  sections: SectionState[];
};

export function TestBuilder({
  testId,
  initialData,
}: {
  testId?: string;
  initialData?: InitialTestData;
}) {
  const router = useRouter();
  const [title, setTitle] = useState(initialData?.title ?? "");
  const [description, setDescription] = useState(initialData?.description ?? "");
  const [durationMinutes, setDurationMinutes] = useState(
    initialData?.durationMinutes ?? 60
  );
  const [sections, setSections] = useState<SectionState[]>(
    initialData?.sections ?? [newSection("Section 1")]
  );
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function updateSection(sectionId: string, patch: Partial<SectionState>) {
    setSections((prev) =>
      prev.map((s) => (s.id === sectionId ? { ...s, ...patch } : s))
    );
  }

  function addSection() {
    setSections((prev) => [...prev, newSection(`Section ${prev.length + 1}`)]);
  }

  function removeSection(sectionId: string) {
    setSections((prev) => prev.filter((s) => s.id !== sectionId));
  }

  function addQuestion(sectionId: string) {
    setSections((prev) =>
      prev.map((s) =>
        s.id === sectionId
          ? { ...s, questions: [...s.questions, newQuestion()] }
          : s
      )
    );
  }

  function removeQuestion(sectionId: string, questionId: string) {
    setSections((prev) =>
      prev.map((s) =>
        s.id === sectionId
          ? { ...s, questions: s.questions.filter((q) => q.id !== questionId) }
          : s
      )
    );
  }

  function updateQuestion(
    sectionId: string,
    questionId: string,
    patch: Partial<QuestionState>
  ) {
    setSections((prev) =>
      prev.map((s) =>
        s.id === sectionId
          ? {
              ...s,
              questions: s.questions.map((q) =>
                q.id === questionId ? { ...q, ...patch } : q
              ),
            }
          : s
      )
    );
  }

  function addOption(sectionId: string, questionId: string) {
    setSections((prev) =>
      prev.map((s) =>
        s.id === sectionId
          ? {
              ...s,
              questions: s.questions.map((q) =>
                q.id === questionId && q.options.length < 6
                  ? { ...q, options: [...q.options, newOption()] }
                  : q
              ),
            }
          : s
      )
    );
  }

  function removeOption(sectionId: string, questionId: string, optionId: string) {
    setSections((prev) =>
      prev.map((s) =>
        s.id === sectionId
          ? {
              ...s,
              questions: s.questions.map((q) =>
                q.id === questionId && q.options.length > 2
                  ? { ...q, options: q.options.filter((o) => o.id !== optionId) }
                  : q
              ),
            }
          : s
      )
    );
  }

  function updateOption(
    sectionId: string,
    questionId: string,
    optionId: string,
    patch: Partial<OptionState>
  ) {
    setSections((prev) =>
      prev.map((s) =>
        s.id === sectionId
          ? {
              ...s,
              questions: s.questions.map((q) =>
                q.id === questionId
                  ? {
                      ...q,
                      options: q.options.map((o) =>
                        o.id === optionId ? { ...o, ...patch } : o
                      ),
                    }
                  : q
              ),
            }
          : s
      )
    );
  }

  function setCorrectOption(sectionId: string, questionId: string, optionId: string) {
    setSections((prev) =>
      prev.map((s) =>
        s.id === sectionId
          ? {
              ...s,
              questions: s.questions.map((q) =>
                q.id === questionId
                  ? {
                      ...q,
                      options: q.options.map((o) => ({
                        ...o,
                        isCorrect: o.id === optionId,
                      })),
                    }
                  : q
              ),
            }
          : s
      )
    );
  }

  function buildPayload(): TestInput {
    return {
      title,
      description,
      durationMinutes,
      sections: sections.map((s) => ({
        name: s.name,
        questions: s.questions.map((q) => ({
          text: q.text,
          explanation: q.explanation,
          marks: q.marks,
          options: q.options.map((o) => ({
            text: o.text,
            isCorrect: o.isCorrect,
          })),
        })),
      })),
    };
  }

  function handleSave(published: boolean) {
    setError(null);
    startTransition(async () => {
      const payload = buildPayload();
      const result = testId
        ? await updateTest(testId, payload, published)
        : await createTest(payload, published);
      if (result?.error) {
        setError(result.error);
      } else {
        router.refresh();
      }
    });
  }

  return (
    <div className="space-y-8 pb-24">
      {error && (
        <p className="rounded-md bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </p>
      )}

      <div className="rounded-xl border border-black/5 bg-white p-6 space-y-4">
        <h2 className="text-lg font-semibold text-brand-navy">Test details</h2>

        <div>
          <label className="block text-sm font-medium text-brand-ink">Title</label>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. MBA CET Full Mock 1"
            className="mt-1 w-full rounded-md border border-black/10 px-3 py-2 text-sm focus:border-brand-navy focus:outline-none focus:ring-1 focus:ring-brand-navy"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-brand-ink">
            Description (optional)
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={2}
            className="mt-1 w-full rounded-md border border-black/10 px-3 py-2 text-sm focus:border-brand-navy focus:outline-none focus:ring-1 focus:ring-brand-navy"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-brand-ink">
            Duration (minutes)
          </label>
          <input
            type="number"
            min={1}
            max={600}
            value={durationMinutes}
            onChange={(e) => setDurationMinutes(Number(e.target.value))}
            className="mt-1 w-32 rounded-md border border-black/10 px-3 py-2 text-sm focus:border-brand-navy focus:outline-none focus:ring-1 focus:ring-brand-navy"
          />
        </div>
      </div>

      {sections.map((section, sIndex) => (
        <div
          key={section.id}
          className="rounded-xl border border-black/5 bg-white p-6 space-y-6"
        >
          <div className="flex items-center justify-between gap-4">
            <input
              value={section.name}
              onChange={(e) => updateSection(section.id, { name: e.target.value })}
              placeholder={`Section ${sIndex + 1} name`}
              className="w-full max-w-sm rounded-md border border-black/10 px-3 py-2 text-sm font-semibold text-brand-navy focus:border-brand-navy focus:outline-none focus:ring-1 focus:ring-brand-navy"
            />
            {sections.length > 1 && (
              <button
                type="button"
                onClick={() => removeSection(section.id)}
                className="text-sm text-red-700 hover:underline"
              >
                Remove section
              </button>
            )}
          </div>

          <div className="space-y-6">
            {section.questions.map((question, qIndex) => (
              <div
                key={question.id}
                className="rounded-lg border border-black/10 bg-brand-cream/40 p-4 space-y-4"
              >
                <div className="flex items-center justify-between gap-4">
                  <span className="text-sm font-semibold text-brand-ink/70">
                    Question {qIndex + 1}
                  </span>
                  {section.questions.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeQuestion(section.id, question.id)}
                      className="text-xs text-red-700 hover:underline"
                    >
                      Remove question
                    </button>
                  )}
                </div>

                <textarea
                  value={question.text}
                  onChange={(e) =>
                    updateQuestion(section.id, question.id, { text: e.target.value })
                  }
                  placeholder="Question text"
                  rows={2}
                  className="w-full rounded-md border border-black/10 bg-white px-3 py-2 text-sm focus:border-brand-navy focus:outline-none focus:ring-1 focus:ring-brand-navy"
                />

                <div className="space-y-2">
                  {question.options.map((option, oIndex) => (
                    <div key={option.id} className="flex items-center gap-2">
                      <input
                        type="radio"
                        name={`correct-${question.id}`}
                        checked={option.isCorrect}
                        onChange={() =>
                          setCorrectOption(section.id, question.id, option.id)
                        }
                        className="h-4 w-4 accent-brand-navy"
                        aria-label={`Mark option ${oIndex + 1} correct`}
                      />
                      <input
                        value={option.text}
                        onChange={(e) =>
                          updateOption(section.id, question.id, option.id, {
                            text: e.target.value,
                          })
                        }
                        placeholder={`Option ${oIndex + 1}`}
                        className="flex-1 rounded-md border border-black/10 bg-white px-3 py-1.5 text-sm focus:border-brand-navy focus:outline-none focus:ring-1 focus:ring-brand-navy"
                      />
                      {question.options.length > 2 && (
                        <button
                          type="button"
                          onClick={() =>
                            removeOption(section.id, question.id, option.id)
                          }
                          className="text-xs text-red-700 hover:underline"
                        >
                          Remove
                        </button>
                      )}
                    </div>
                  ))}
                  {question.options.length < 6 && (
                    <button
                      type="button"
                      onClick={() => addOption(section.id, question.id)}
                      className="text-xs font-medium text-brand-navy hover:underline"
                    >
                      + Add option
                    </button>
                  )}
                </div>

                <div className="flex flex-wrap items-end gap-4">
                  <div>
                    <label className="block text-xs font-medium text-brand-ink/70">
                      Marks
                    </label>
                    <input
                      type="number"
                      min={1}
                      max={100}
                      value={question.marks}
                      onChange={(e) =>
                        updateQuestion(section.id, question.id, {
                          marks: Number(e.target.value),
                        })
                      }
                      className="mt-1 w-20 rounded-md border border-black/10 bg-white px-3 py-1.5 text-sm focus:border-brand-navy focus:outline-none focus:ring-1 focus:ring-brand-navy"
                    />
                  </div>
                  <div className="min-w-[240px] flex-1">
                    <label className="block text-xs font-medium text-brand-ink/70">
                      Explanation (shown after submission)
                    </label>
                    <input
                      value={question.explanation}
                      onChange={(e) =>
                        updateQuestion(section.id, question.id, {
                          explanation: e.target.value,
                        })
                      }
                      className="mt-1 w-full rounded-md border border-black/10 bg-white px-3 py-1.5 text-sm focus:border-brand-navy focus:outline-none focus:ring-1 focus:ring-brand-navy"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>

          <button
            type="button"
            onClick={() => addQuestion(section.id)}
            className="text-sm font-medium text-brand-navy hover:underline"
          >
            + Add question to this section
          </button>
        </div>
      ))}

      <button
        type="button"
        onClick={addSection}
        className="rounded-md border border-brand-navy/20 px-5 py-2.5 text-sm font-semibold text-brand-navy hover:bg-brand-navy/5"
      >
        + Add section
      </button>

      <div className="fixed inset-x-0 bottom-0 border-t border-black/10 bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-end gap-4 px-4 py-4 sm:px-6">
          <button
            type="button"
            disabled={isPending}
            onClick={() => handleSave(false)}
            className="rounded-md border border-brand-navy/20 px-5 py-2.5 text-sm font-semibold text-brand-navy hover:bg-brand-navy/5 disabled:opacity-50"
          >
            Save as draft
          </button>
          <button
            type="button"
            disabled={isPending}
            onClick={() => handleSave(true)}
            className="rounded-md bg-brand-navy px-5 py-2.5 text-sm font-semibold text-white hover:bg-brand-navy-light disabled:opacity-50"
          >
            {isPending ? "Saving..." : "Save & publish"}
          </button>
        </div>
      </div>
    </div>
  );
}
