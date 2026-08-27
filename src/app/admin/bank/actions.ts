"use server";

import { randomUUID } from "node:crypto";

import type { Prisma } from "@prisma/client";
import { revalidateTag } from "next/cache";
import { redirect } from "next/navigation";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import {
  BANK_SECTIONS,
  CET_DIFFICULTY_MIX,
  DIFFICULTY_LEVELS,
  bankQuestionSchema,
  bankQuestionSetSchema,
  generateMockSchema,
  type BankQuestionInput,
  type BankQuestionSetInput,
  type GenerateMockInput,
} from "@/lib/validation";

export type SaveBankState = { error?: string; success?: boolean } | undefined;
export type GenerateMockState =
  | { error?: string; testId?: string; summary?: MockSectionSummary[] }
  | undefined;

async function requireAdmin() {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") {
    redirect("/login");
  }
  return session.user;
}

function shuffle<T>(items: T[]): T[] {
  const arr = [...items];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

async function persistBankQuestion(
  input: BankQuestionInput,
  createdById: string
) {
  const questionId = randomUUID();
  await prisma.$transaction(async (tx) => {
    await tx.bankQuestion.create({
      data: {
        id: questionId,
        section: input.section,
        topic: input.topic,
        subTopic: input.subTopic || null,
        difficulty: input.difficulty,
        estimatedTimeSeconds: input.estimatedTimeSeconds,
        conceptTested: input.conceptTested || null,
        tags: input.tags,
        text: input.text,
        imageUrl: input.imageUrl || null,
        explanation: input.explanation || null,
        marks: input.marks,
        createdById,
      },
    });
    await tx.bankOption.createMany({
      data: input.options.map((option, order) => ({
        id: randomUUID(),
        bankQuestionId: questionId,
        text: option.text,
        imageUrl: option.imageUrl || null,
        isCorrect: option.isCorrect,
        order,
      })),
    });
  });
}

async function persistBankQuestionSet(
  input: BankQuestionSetInput,
  createdById: string
) {
  const setId = randomUUID();
  const questionsData: Prisma.BankQuestionCreateManyInput[] = [];
  const optionsData: Prisma.BankOptionCreateManyInput[] = [];

  input.questions.forEach((question, order) => {
    const questionId = randomUUID();
    questionsData.push({
      id: questionId,
      section: question.section,
      topic: question.topic,
      subTopic: question.subTopic || null,
      difficulty: question.difficulty,
      estimatedTimeSeconds: question.estimatedTimeSeconds,
      conceptTested: question.conceptTested || null,
      tags: question.tags,
      order,
      setId,
      text: question.text,
      imageUrl: question.imageUrl || null,
      explanation: question.explanation || null,
      marks: question.marks,
      createdById,
    });
    question.options.forEach((option, optionOrder) => {
      optionsData.push({
        id: randomUUID(),
        bankQuestionId: questionId,
        text: option.text,
        imageUrl: option.imageUrl || null,
        isCorrect: option.isCorrect,
        order: optionOrder,
      });
    });
  });

  await prisma.$transaction(
    async (tx) => {
      await tx.bankQuestionSet.create({
        data: {
          id: setId,
          title: input.title || null,
          stimulus: input.stimulus,
          imageUrl: input.imageUrl || null,
        },
      });
      await tx.bankQuestion.createMany({ data: questionsData });
      await tx.bankOption.createMany({ data: optionsData });
    },
    { timeout: 20_000 }
  );
}

export async function addBankQuestion(
  input: BankQuestionInput
): Promise<SaveBankState> {
  const admin = await requireAdmin();
  const parsed = bankQuestionSchema.safeParse(input);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid question data" };
  }
  try {
    await persistBankQuestion(parsed.data, admin.id);
  } catch (error) {
    console.error("Failed to add bank question:", error);
    return { error: "Could not save this question. Please try again." };
  }
  revalidateTag("bank");
  return { success: true };
}

export async function addBankQuestionSet(
  input: BankQuestionSetInput
): Promise<SaveBankState> {
  const admin = await requireAdmin();
  const parsed = bankQuestionSetSchema.safeParse(input);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid question set data" };
  }
  try {
    await persistBankQuestionSet(parsed.data, admin.id);
  } catch (error) {
    console.error("Failed to add bank question set:", error);
    return { error: "Could not save this question set. Please try again." };
  }
  revalidateTag("bank");
  return { success: true };
}

export async function deleteBankQuestion(id: string) {
  await requireAdmin();
  const question = await prisma.bankQuestion.findUnique({ where: { id } });
  if (!question) throw new Error("Question not found");
  if (question.usedInTestId) {
    throw new Error("Can't delete a question already used in a generated mock");
  }
  await prisma.bankQuestion.delete({ where: { id } });
  revalidateTag("bank");
}

// Splits a section's target count across EASY/MODERATE/DIFFICULT using
// CET_DIFFICULTY_MIX, rounding so the parts always sum back to the total.
function splitByDifficulty(total: number) {
  const raw = DIFFICULTY_LEVELS.map((level) => total * CET_DIFFICULTY_MIX[level]);
  const floors = raw.map(Math.floor);
  let remainder = total - floors.reduce((a, b) => a + b, 0);
  const order = raw
    .map((value, i) => ({ i, frac: value - Math.floor(value) }))
    .sort((a, b) => b.frac - a.frac);
  for (const { i } of order) {
    if (remainder <= 0) break;
    floors[i] += 1;
    remainder -= 1;
  }
  return Object.fromEntries(
    DIFFICULTY_LEVELS.map((level, i) => [level, floors[i]])
  ) as Record<(typeof DIFFICULTY_LEVELS)[number], number>;
}

type PoolQuestion = Prisma.BankQuestionGetPayload<{ include: { options: true } }>;

// Groups a section's whole unused pool into clusters (every question sharing
// a setId, or a standalone question on its own) and draws whole clusters per
// difficulty tier until each target is met. Clustering happens once across
// the *entire* section before any difficulty bucketing — a cluster is never
// split, even when its member questions carry different difficulties (a real
// puzzle's sub-questions often do), because doing this per-difficulty-query
// instead let a set's questions be drawn independently in separate tier
// rounds, sometimes leaving only some of a puzzle's questions in the
// generated test with its shared stimulus orphaned.
function drawSectionClusters(
  pool: PoolQuestion[],
  targetsByDifficulty: Record<(typeof DIFFICULTY_LEVELS)[number], number>
): PoolQuestion[] {
  const clusters = new Map<string, PoolQuestion[]>();
  for (const q of pool) {
    const key = q.setId ?? q.id;
    if (!clusters.has(key)) clusters.set(key, []);
    clusters.get(key)!.push(q);
  }

  // A cluster is bucketed under whichever difficulty its questions most
  // often carry (ties broken by DIFFICULTY_LEVELS order) — irrelevant for
  // single-question clusters, and just a placement choice for mixed sets.
  const clustersByTier: Record<(typeof DIFFICULTY_LEVELS)[number], PoolQuestion[][]> = {
    EASY: [],
    MODERATE: [],
    DIFFICULT: [],
  };
  for (const members of clusters.values()) {
    const counts = new Map<string, number>();
    for (const m of members) counts.set(m.difficulty, (counts.get(m.difficulty) ?? 0) + 1);
    const mode = DIFFICULTY_LEVELS.reduce((best, level) =>
      (counts.get(level) ?? 0) > (counts.get(best) ?? 0) ? level : best
    );
    clustersByTier[mode as (typeof DIFFICULTY_LEVELS)[number]].push(members);
  }

  const picked: PoolQuestion[] = [];
  for (const difficulty of DIFFICULTY_LEVELS) {
    const target = targetsByDifficulty[difficulty];
    if (target <= 0) continue;
    const shuffled = shuffle(clustersByTier[difficulty]);
    let count = 0;
    for (const cluster of shuffled) {
      if (count >= target) break;
      picked.push(...cluster);
      count += cluster.length;
    }
  }
  return picked;
}

export type MockSectionSummary = {
  section: string;
  requested: number;
  drawn: number;
  byDifficulty: Record<string, { requested: number; drawn: number }>;
};

export async function generateMock(
  input: GenerateMockInput
): Promise<GenerateMockState> {
  const admin = await requireAdmin();

  const parsed = generateMockSchema.safeParse(input);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid mock configuration" };
  }
  const data = parsed.data;

  try {
    const sectionsData: Prisma.SectionCreateManyInput[] = [];
    const passagesData: Prisma.PassageCreateManyInput[] = [];
    const questionsData: Prisma.QuestionCreateManyInput[] = [];
    const optionsData: Prisma.OptionCreateManyInput[] = [];
    const usedBankQuestionIds: string[] = [];
    const summary: MockSectionSummary[] = [];

    let testId: string = randomUUID();

    for (const [sectionIndex, sectionName] of BANK_SECTIONS.entries()) {
      const requested = data.sectionCounts[sectionName];
      const sectionId = randomUUID();
      if (requested > 0) {
        sectionsData.push({ id: sectionId, testId, name: sectionName, order: sectionIndex });
      }

      const targetsByDifficulty = splitByDifficulty(requested);

      const pool = await prisma.bankQuestion.findMany({
        where: { section: sectionName, usedInTestId: null },
        include: { options: true },
      });
      const drawnForSection = drawSectionClusters(pool, targetsByDifficulty);

      // Reports the *actual* difficulty of what got drawn (not the tier a
      // mixed-difficulty cluster was bucketed under) — that's what's really
      // in the generated test, so it's what the admin should see.
      const byDifficulty: MockSectionSummary["byDifficulty"] = {};
      for (const difficulty of DIFFICULTY_LEVELS) {
        byDifficulty[difficulty] = {
          requested: targetsByDifficulty[difficulty],
          drawn: drawnForSection.filter((q) => q.difficulty === difficulty).length,
        };
      }

      const orderedQuestions = shuffle(drawnForSection);
      const passageIdBySet = new Map<string, string>();

      orderedQuestions.forEach((bankQuestion, order) => {
        let passageId: string | null = null;
        if (bankQuestion.setId) {
          if (!passageIdBySet.has(bankQuestion.setId)) {
            passageIdBySet.set(bankQuestion.setId, randomUUID());
          }
          passageId = passageIdBySet.get(bankQuestion.setId)!;
        }

        questionsData.push({
          id: randomUUID(),
          sectionId,
          passageId,
          order,
          text: bankQuestion.text,
          imageUrl: bankQuestion.imageUrl,
          explanation: bankQuestion.explanation,
          marks: bankQuestion.marks,
          topic: bankQuestion.topic,
          subTopic: bankQuestion.subTopic,
        });
        const questionId = questionsData[questionsData.length - 1].id as string;
        for (const option of bankQuestion.options) {
          optionsData.push({
            id: randomUUID(),
            questionId,
            text: option.text,
            imageUrl: option.imageUrl,
            isCorrect: option.isCorrect,
            order: option.order,
          });
        }
        usedBankQuestionIds.push(bankQuestion.id);
      });

      // Materialize one Passage per distinct set actually drawn into this
      // section, carrying over its stimulus/title/image from the bank.
      if (passageIdBySet.size > 0) {
        const sets = await prisma.bankQuestionSet.findMany({
          where: { id: { in: [...passageIdBySet.keys()] } },
        });
        for (const set of sets) {
          passagesData.push({
            id: passageIdBySet.get(set.id)!,
            sectionId,
            title: set.title,
            text: set.stimulus,
          });
        }
      }

      summary.push({
        section: sectionName,
        requested,
        drawn: drawnForSection.length,
        byDifficulty,
      });
    }

    if (usedBankQuestionIds.length === 0) {
      return {
        error:
          "No matching questions were found in the bank for any requested section — add bank content first.",
      };
    }

    await prisma.$transaction(
      async (tx) => {
        const created = await tx.test.create({
          data: {
            id: testId,
            title: data.title,
            description: `Auto-generated CET-level mock (${usedBankQuestionIds.length} questions) from the Percentile Lab question bank.`,
            targetExam: data.targetExam,
            durationMinutes: data.durationMinutes,
            published: data.published,
            createdById: admin.id,
          },
        });
        testId = created.id;

        if (sectionsData.length > 0) await tx.section.createMany({ data: sectionsData });
        if (passagesData.length > 0) await tx.passage.createMany({ data: passagesData });
        if (questionsData.length > 0) await tx.question.createMany({ data: questionsData });
        if (optionsData.length > 0) await tx.option.createMany({ data: optionsData });

        await tx.bankQuestion.updateMany({
          where: { id: { in: usedBankQuestionIds } },
          data: { usedInTestId: testId },
        });
      },
      { timeout: 30_000 }
    );

    revalidateTag("tests");
    revalidateTag("bank");
    return { testId, summary };
  } catch (error) {
    console.error("Failed to generate mock:", error);
    return { error: "Could not generate this mock. Please try again." };
  }
}

export type BankOverviewRow = {
  section: string;
  topic: string;
  difficulty: string;
  available: number;
  used: number;
};

export async function getBankOverview(): Promise<BankOverviewRow[]> {
  await requireAdmin();
  const rows = await prisma.bankQuestion.groupBy({
    by: ["section", "topic", "difficulty"],
    _count: { _all: true },
  });
  const usedRows = await prisma.bankQuestion.groupBy({
    by: ["section", "topic", "difficulty"],
    _count: { _all: true },
    where: { usedInTestId: { not: null } },
  });
  const usedMap = new Map(
    usedRows.map((r) => [`${r.section}|${r.topic}|${r.difficulty}`, r._count._all])
  );
  return rows
    .map((r) => ({
      section: r.section,
      topic: r.topic,
      difficulty: r.difficulty,
      available: r._count._all - (usedMap.get(`${r.section}|${r.topic}|${r.difficulty}`) ?? 0),
      used: usedMap.get(`${r.section}|${r.topic}|${r.difficulty}`) ?? 0,
    }))
    .sort((a, b) => a.section.localeCompare(b.section) || a.topic.localeCompare(b.topic));
}
