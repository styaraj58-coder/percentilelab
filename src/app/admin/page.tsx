import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

import { TestListByExam, type TestRow } from "./test-list-by-exam";

export default async function AdminDashboardPage() {
  const session = await auth();

  const tests = await prisma.test.findMany({
    where: { createdById: session!.user.id },
    orderBy: { createdAt: "desc" },
    include: {
      sections: { include: { questions: true } },
      _count: { select: { attempts: true } },
    },
  });

  const rows: TestRow[] = tests.map((test) => ({
    id: test.id,
    title: test.title,
    targetExam: test.targetExam,
    durationMinutes: test.durationMinutes,
    published: test.published,
    questionCount: test.sections.reduce((sum, s) => sum + s.questions.length, 0),
    sectionCount: test.sections.length,
    attemptCount: test._count.attempts,
  }));

  return <TestListByExam tests={rows} />;
}
