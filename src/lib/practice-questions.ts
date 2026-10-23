import { unstable_cache } from "next/cache";

import { prisma } from "@/lib/prisma";

// Public, crawlable practice-question pages. They only ever show questions
// from published FREE-preview tests (the same pool as the sample test), so no
// premium paper is exposed. Questions are grouped by the section they sit in.
export type PracticeCategory = {
  slug: string;
  title: string;
  // Section names (as stored on tests) that belong to this category.
  sections: string[];
  intro: string;
  topics: string;
};

export const practiceCategories: PracticeCategory[] = [
  {
    slug: "quantitative-aptitude",
    title: "Quantitative Aptitude",
    sections: ["Quantitative Aptitude", "Quants"],
    intro:
      "Arithmetic, algebra, geometry, number systems, permutation and combination, probability and data interpretation - the quant questions that decide your MBA CET percentile.",
    topics: "percentages, profit and loss, time and work, ratio, algebra, geometry, P&C and probability",
  },
  {
    slug: "logical-reasoning",
    title: "Logical Reasoning",
    sections: ["Logical Reasoning", "Reasoning (Verbal & Arithmetic)"],
    intro:
      "Seating arrangements, puzzles, syllogisms, blood relations, direction sense, coding-decoding and critical reasoning - the question types that appear in MAH-CET, CAT, MAT and ATMA.",
    topics: "seating arrangement, puzzles, syllogisms, inequalities, blood relations, direction sense and series",
  },
  {
    slug: "verbal-ability",
    title: "Verbal Ability",
    sections: [
      "Verbal Ability",
      "Verbal Ability & RC",
      "Verbal Ability & Reading Comprehension",
      "English Language",
    ],
    intro:
      "Grammar, vocabulary, sentence correction, para jumbles, odd sentence out and critical reasoning - the verbal questions asked in MBA CET and other management entrance exams.",
    topics: "grammar, vocabulary, error spotting, sentence improvement, para jumbles and cloze tests",
  },
  {
    slug: "general-awareness",
    title: "General Awareness",
    sections: ["General Knowledge & Awareness"],
    intro:
      "Current affairs, static GK, business and economy awareness questions with answers, for management entrance exams that test general awareness.",
    topics: "static GK, business, economy and current affairs",
  },
];

export function getPracticeCategory(slug: string) {
  return practiceCategories.find((c) => c.slug === slug) ?? null;
}

export type PracticeQuestion = {
  id: string;
  text: string;
  explanation: string | null;
  options: { text: string; isCorrect: boolean }[];
};

export const PRACTICE_PAGE_SIZE = 20;

function normalise(text: string) {
  return text.replace(/\s+/g, " ").trim().toLowerCase();
}

async function loadCategoryQuestions(slug: string): Promise<PracticeQuestion[]> {
  const category = getPracticeCategory(slug);
  if (!category) return [];

  const rows = await prisma.question.findMany({
    where: {
      passageId: null,
      imageUrl: null,
      section: {
        name: { in: category.sections },
        test: { published: true, isFreePreview: true },
      },
    },
    orderBy: [{ section: { test: { createdAt: "asc" } } }, { section: { order: "asc" } }, { order: "asc" }],
    select: {
      id: true,
      text: true,
      explanation: true,
      options: { orderBy: { order: "asc" }, select: { text: true, imageUrl: true, isCorrect: true } },
    },
  });

  // The same sectional paper is stored once per exam, so drop repeated
  // questions (the earliest copy wins) and anything that doesn't render as
  // plain text with one clear answer.
  const seen = new Set<string>();
  const out: PracticeQuestion[] = [];
  for (const q of rows) {
    const key = normalise(q.text);
    if (seen.has(key)) continue;
    if (q.text.length > 900) continue;
    if (q.options.length < 4 || q.options.length > 5) continue;
    if (q.options.filter((o) => o.isCorrect).length !== 1) continue;
    if (q.options.some((o) => o.imageUrl || !o.text.trim())) continue;
    seen.add(key);
    out.push({
      id: q.id,
      text: q.text,
      explanation: q.explanation,
      options: q.options.map((o) => ({ text: o.text, isCorrect: o.isCorrect })),
    });
  }
  return out;
}

// Cached for an hour and refreshed whenever tests change ("tests" tag).
export function getCategoryQuestions(slug: string) {
  return unstable_cache(() => loadCategoryQuestions(slug), ["practice-questions", slug], {
    revalidate: 3600,
    tags: ["tests"],
  })();
}
