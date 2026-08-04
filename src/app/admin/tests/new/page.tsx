import type { Metadata } from "next";

import { TestBuilder } from "../test-builder";

export const metadata: Metadata = { title: "New test | Percentile Lab MBA" };

export default function NewTestPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold text-brand-navy">Create a new test</h1>
      <p className="mt-1 text-sm text-brand-ink/60">
        Add sections and questions below, then save as a draft or publish it
        for students right away.
      </p>
      <div className="mt-8">
        <TestBuilder />
      </div>
    </div>
  );
}
