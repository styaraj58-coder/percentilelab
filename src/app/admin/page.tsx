import { prisma } from "@/lib/prisma";

import { TestListByExam, type TestRow } from "./test-list-by-exam";

export default async function AdminDashboardPage() {
  const tests = await prisma.test.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      createdBy: { select: { name: true } },
      sections: { select: { _count: { select: { questions: true } } } },
      _count: { select: { attempts: true } },
    },
  });

  const rows: TestRow[] = tests.map((test) => ({
    id: test.id,
    title: test.title,
    targetExam: test.targetExam,
    durationMinutes: test.durationMinutes,
    published: test.published,
    isFreePreview: test.isFreePreview,
    questionCount: test.sections.reduce((sum, s) => sum + s._count.questions, 0),
    sectionCount: test.sections.length,
    attemptCount: test._count.attempts,
    createdByName: test.createdBy.name,
  }));

  return <TestListByExam tests={rows} />;
}
