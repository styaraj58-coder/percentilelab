import type { ExamInfo } from "@/lib/exam-data";

export type ExamFaq = { question: string; answer: string };

function joinList(items: string[]) {
  if (items.length <= 1) return items.join("");
  return `${items.slice(0, -1).join(", ")} and ${items[items.length - 1]}`;
}

// FAQ entries for an exam page, written only from the exam's own data so the
// answers can never drift from the pattern/syllabus shown on the page.
export function buildExamFaqs(exam: ExamInfo, name: string, hasMockTests: boolean): ExamFaq[] {
  const { pattern } = exam;
  const sections = pattern.sections.map((s) => `${s.name} (${s.questions})`);
  const exact = exam.tentativeDates.map((d) => `${d.label.toLowerCase()}: ${d.window}`);
  const colleges = exam.topColleges.slice(0, 3).join("; ");
  const categories = exam.syllabus.map((g) => g.category);

  return [
    {
      question: `What is the ${name} exam pattern?`,
      answer: `${name} has ${pattern.totalQuestions} in ${pattern.duration}. Mode of exam: ${pattern.mode}. The sections are ${joinList(sections)}.`,
    },
    {
      question: `What is the marking scheme of ${name}? Is there negative marking?`,
      answer: `${name} marking scheme: ${pattern.markingScheme}.`,
    },
    {
      question: `Who conducts ${name}?`,
      answer: `${name} is the ${exam.fullName}, conducted by ${exam.conductedBy}.`,
    },
    {
      question: `What is the ${name} syllabus?`,
      answer: `The ${name} syllabus covers ${joinList(categories)}. The topics under each area are listed in the syllabus section above.`,
    },
    {
      question: `When is ${name} usually held?`,
      answer: `Based on past cycles, the typical windows are: ${exact.join("; ")}. These are tentative, not confirmed dates - always check the official ${exam.shortName} website for the current year.`,
    },
    {
      question: `Which colleges accept ${name} scores?`,
      answer: `Top colleges accepting ${name} include ${colleges}. The full list is shown above.`,
    },
    {
      question: `How can I practise for ${name}?`,
      answer: hasMockTests
        ? `Take timed ${name} mock tests inside your Percentile Lab student portal and review your percentile and section-wise analysis after each one. You can also try 10 free questions without signing up.`
        : `${name} mock tests are being added to Percentile Lab. Meanwhile, you can try 10 free questions without signing up, and create a free account to be ready when they go live.`,
    },
  ];
}
