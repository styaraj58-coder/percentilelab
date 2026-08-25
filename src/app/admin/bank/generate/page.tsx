import type { Metadata } from "next";

import { GenerateMockForm } from "./generate-mock-form";

export const metadata: Metadata = { title: "Generate a mock | Percentile Lab" };

export default function GenerateMockPage() {
  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="text-2xl font-bold text-brand-navy">Generate a mock</h1>
      <p className="mt-1 text-sm text-brand-ink/60">
        Draws unused questions from the question bank at the default CET-level
        mix (25% easy / 50% moderate / 25% difficult per section) and
        assembles them into a new test. Each question is retired from the
        bank once used, so no two generated mocks repeat a question.
      </p>
      <div className="mt-8">
        <GenerateMockForm />
      </div>
    </div>
  );
}
