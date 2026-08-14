"use server";

import { randomUUID } from "node:crypto";

import type { Prisma } from "@prisma/client";
import { revalidateTag } from "next/cache";
import { redirect } from "next/navigation";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { testSchema, type TestInput } from "@/lib/validation";

export type SaveTestState = { error?: string } | undefined;

async function requireAdmin() {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") {
    redirect("/login");
  }
  return session.user;
}

async function persistTest(
  input: TestInput,
  published: boolean,
  createdById: string,
  testId?: string
) {
  // IDs are generated here (instead of left to the DB default) so every
  // section/passage/question/option can be inserted in one createMany call
  // each, rather than one row at a time. With enough questions, one-row-at-
  // a-time inside a single transaction was slow enough to blow past
  // Prisma's default interactive-transaction timeout and fail outright.
  const sectionsData: Omit<Prisma.SectionCreateManyInput, "testId">[] = [];
  const passagesData: Prisma.PassageCreateManyInput[] = [];
  const questionsData: Prisma.QuestionCreateManyInput[] = [];
  const optionsData: Prisma.OptionCreateManyInput[] = [];

  for (const [sectionIndex, section] of input.sections.entries()) {
    const sectionId = randomUUID();
    sectionsData.push({ id: sectionId, name: section.name, order: sectionIndex });

    let order = 0;
    for (const block of section.blocks) {
      if (block.kind === "question") {
        const questionId = randomUUID();
        questionsData.push({
          id: questionId,
          sectionId,
          passageId: null,
          order,
          text: block.question.text,
          imageUrl: block.question.imageUrl || null,
          explanation: block.question.explanation || null,
          marks: block.question.marks,
        });
        for (const [optionIndex, option] of block.question.options.entries()) {
          optionsData.push({
            id: randomUUID(),
            questionId,
            text: option.text,
            imageUrl: option.imageUrl || null,
            isCorrect: option.isCorrect,
            order: optionIndex,
          });
        }
        order += 1;
      } else {
        const passageId = randomUUID();
        passagesData.push({
          id: passageId,
          sectionId,
          title: block.passage.passageTitle || null,
          text: block.passage.passageText,
        });
        for (const question of block.passage.questions) {
          const questionId = randomUUID();
          questionsData.push({
            id: questionId,
            sectionId,
            passageId,
            order,
            text: question.text,
            imageUrl: question.imageUrl || null,
            explanation: question.explanation || null,
            marks: question.marks,
          });
          for (const [optionIndex, option] of question.options.entries()) {
            optionsData.push({
              id: randomUUID(),
              questionId,
              text: option.text,
              imageUrl: option.imageUrl || null,
              isCorrect: option.isCorrect,
              order: optionIndex,
            });
          }
          order += 1;
        }
      }
    }
  }

  await prisma.$transaction(
    async (tx) => {
      let id = testId;

      if (id) {
        const existing = await tx.test.findUnique({ where: { id } });
        if (!existing) {
          throw new Error("Test not found");
        }
        await tx.test.update({
          where: { id },
          data: {
            title: input.title,
            description: input.description || null,
            targetExam: input.targetExam,
            durationMinutes: input.durationMinutes,
            published,
          },
        });
        // Replace sections/questions/options wholesale — simplest consistent
        // approach for an admin-authored form with no partial-edit UI yet.
        // Cascades to passages/questions/options via the schema's onDelete rules.
        await tx.section.deleteMany({ where: { testId: id } });
      } else {
        const created = await tx.test.create({
          data: {
            title: input.title,
            description: input.description || null,
            targetExam: input.targetExam,
            durationMinutes: input.durationMinutes,
            published,
            createdById,
          },
        });
        id = created.id;
      }

      await tx.section.createMany({
        data: sectionsData.map((s) => ({ ...s, testId: id })),
      });
      if (passagesData.length > 0) {
        await tx.passage.createMany({ data: passagesData });
      }
      if (questionsData.length > 0) {
        await tx.question.createMany({ data: questionsData });
      }
      if (optionsData.length > 0) {
        await tx.option.createMany({ data: optionsData });
      }

      return id;
    },
    { timeout: 20_000 }
  );
}

export async function createTest(
  input: TestInput,
  published: boolean
): Promise<SaveTestState> {
  const admin = await requireAdmin();

  const parsed = testSchema.safeParse(input);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid test data" };
  }

  try {
    await persistTest(parsed.data, published, admin.id);
  } catch (error) {
    console.error("Failed to create test:", error);
    return { error: "Could not save this test. Please try again." };
  }
  revalidateTag("tests");
  redirect("/admin");
}

export async function updateTest(
  testId: string,
  input: TestInput,
  published: boolean
): Promise<SaveTestState> {
  const admin = await requireAdmin();

  const parsed = testSchema.safeParse(input);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid test data" };
  }

  try {
    await persistTest(parsed.data, published, admin.id, testId);
  } catch (error) {
    console.error("Failed to update test:", error);
    return { error: "Could not update this test." };
  }
  revalidateTag("tests");
  redirect("/admin");
}

export async function setTestPublished(testId: string, published: boolean) {
  await requireAdmin();

  const test = await prisma.test.findUnique({ where: { id: testId } });
  if (!test) {
    throw new Error("Test not found");
  }

  await prisma.test.update({ where: { id: testId }, data: { published } });
  revalidateTag("tests");
}

export async function deleteTest(testId: string) {
  await requireAdmin();

  const test = await prisma.test.findUnique({ where: { id: testId } });
  if (!test) {
    throw new Error("Test not found");
  }

  await prisma.test.delete({ where: { id: testId } });
  revalidateTag("tests");
}
