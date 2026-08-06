"use server";

import { redirect } from "next/navigation";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { testSchema, type QuestionInput, type TestInput } from "@/lib/validation";

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
  await prisma.$transaction(async (tx) => {
    let id = testId;

    if (id) {
      const existing = await tx.test.findUnique({ where: { id } });
      if (!existing || existing.createdById !== createdById) {
        throw new Error("Test not found");
      }
      await tx.test.update({
        where: { id },
        data: {
          title: input.title,
          description: input.description || null,
          durationMinutes: input.durationMinutes,
          published,
        },
      });
      // Replace sections/questions/options wholesale — simplest consistent
      // approach for an admin-authored form with no partial-edit UI yet.
      await tx.section.deleteMany({ where: { testId: id } });
    } else {
      const created = await tx.test.create({
        data: {
          title: input.title,
          description: input.description || null,
          durationMinutes: input.durationMinutes,
          published,
          createdById,
        },
      });
      id = created.id;
    }

    for (const [sectionIndex, section] of input.sections.entries()) {
      const createdSection = await tx.section.create({
        data: { testId: id, name: section.name, order: sectionIndex },
      });

      async function createQuestion(
        question: QuestionInput,
        order: number,
        passageId: string | null
      ) {
        const createdQuestion = await tx.question.create({
          data: {
            sectionId: createdSection.id,
            passageId,
            order,
            text: question.text,
            explanation: question.explanation || null,
            marks: question.marks,
          },
        });

        for (const [optionIndex, option] of question.options.entries()) {
          await tx.option.create({
            data: {
              questionId: createdQuestion.id,
              text: option.text,
              isCorrect: option.isCorrect,
              order: optionIndex,
            },
          });
        }
      }

      let order = 0;
      for (const block of section.blocks) {
        if (block.kind === "question") {
          await createQuestion(block.question, order, null);
          order += 1;
        } else {
          const createdPassage = await tx.passage.create({
            data: {
              sectionId: createdSection.id,
              title: block.passage.passageTitle || null,
              text: block.passage.passageText,
            },
          });
          for (const question of block.passage.questions) {
            await createQuestion(question, order, createdPassage.id);
            order += 1;
          }
        }
      }
    }

    return id;
  });
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

  await persistTest(parsed.data, published, admin.id);
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
  } catch {
    return { error: "Could not update this test." };
  }
  redirect("/admin");
}

export async function setTestPublished(testId: string, published: boolean) {
  const admin = await requireAdmin();

  const test = await prisma.test.findUnique({ where: { id: testId } });
  if (!test || test.createdById !== admin.id) {
    throw new Error("Test not found");
  }

  await prisma.test.update({ where: { id: testId }, data: { published } });
}

export async function deleteTest(testId: string) {
  const admin = await requireAdmin();

  const test = await prisma.test.findUnique({ where: { id: testId } });
  if (!test || test.createdById !== admin.id) {
    throw new Error("Test not found");
  }

  await prisma.test.delete({ where: { id: testId } });
}
