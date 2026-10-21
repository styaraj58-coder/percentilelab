import { unstable_cache } from "next/cache";

import { prisma } from "@/lib/prisma";

// The header on every marketing page checks auth() (reads cookies), which
// already forces those pages to render dynamically per-request — so this
// cache doesn't buy static generation. What it does buy: skipping the
// Postgres round-trip to Supabase on every single request. Invalidated
// on-demand via revalidateTag("tests") whenever a test is created, edited,
// published, unpublished, or deleted (see src/app/admin/tests/actions.ts).
export const getPublishedTests = unstable_cache(
  async () => {
    return prisma.test.findMany({
      where: { published: true },
      orderBy: { createdAt: "desc" },
      include: {
        sections: { select: { _count: { select: { questions: true } } } },
      },
    });
  },
  ["published-tests"],
  { revalidate: 60, tags: ["tests"] }
);

// Sectional tests are open to every student, whichever exam they registered
// for. A test counts as sectional when "sectional" is in its title.
export function isSectionalTest(title: string) {
  return /sectional/i.test(title);
}

// The same sectional paper is stored once per exam, titled "<exam> Verbal
// Ability Sectional Test 01" (the MBA CET copy has no prefix). Stripping the
// prefix gives the key that groups those copies.
const EXAM_TITLE_PREFIX = /^(UG BMS CET|MH-CET \(MBA\)|MBA CET|MAT|ATMA|CAT)\s+/i;
const DEFAULT_EXAM = "MH-CET (MBA)";

// What the student dashboard lists: every test for the student's own exam,
// plus the sectional tests of all other exams. A sectional paper that exists
// as several per-exam copies is listed once - the student's own exam's copy,
// else the MBA CET one, else the first found.
export function testsForStudent<T extends { title: string; targetExam: string }>(
  tests: T[],
  myExam: string | null
): T[] {
  const chosen = new Map<string, T>();
  const rank = (t: T) => (t.targetExam === myExam ? 0 : t.targetExam === DEFAULT_EXAM ? 1 : 2);
  for (const t of tests) {
    if (!isSectionalTest(t.title)) continue;
    const key = t.title.replace(EXAM_TITLE_PREFIX, "").trim().toLowerCase();
    const current = chosen.get(key);
    if (!current || rank(t) < rank(current)) chosen.set(key, t);
  }
  return tests.filter((t) => {
    if (isSectionalTest(t.title)) return chosen.get(t.title.replace(EXAM_TITLE_PREFIX, "").trim().toLowerCase()) === t;
    return !myExam || t.targetExam === myExam;
  });
}

// What the public site says about an exam's tests: counts only, never the
// individual tests - those are listed and started inside the student portal.
export function summariseTests(
  tests: { targetExam: string; isFreePreview: boolean; sections: unknown[] }[],
  targetExam: string
) {
  const forExam = tests.filter((t) => t.targetExam === targetExam);
  const sectional = forExam.filter((t) => t.sections.length === 1).length;
  return {
    total: forExam.length,
    sectional,
    fullLength: forExam.length - sectional,
    free: forExam.filter((t) => t.isFreePreview).length,
  };
}
