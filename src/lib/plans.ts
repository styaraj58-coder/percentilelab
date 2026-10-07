// Single source of truth for what is sold, shown on the Courses page.

// Course price in rupees per exam slug (see exam-data.ts). null = not
// available yet, shown as "N/A".
export const coursePrices: Record<string, number | null> = {
  "mah-cet": 7999,
  cat: 14999,
  mat: null,
  atma: null,
  "ug-bms-cet": 4999,
};

export const testSeries = {
  name: "Test Series",
  price: 1999,
  tagline: "Mock tests and analysis, without the live classes.",
  features: [
    "Full-length mock tests",
    "Sectional tests",
    "Percentile and section-wise analysis",
    "Time-per-question analysis",
    "Full answer review with explanations",
  ],
};

// What a free account includes - no payment needed.
export const freeAccountFeatures = [
  "Access to the free mock tests",
  "Timed, sectional test-taking",
  "Overall score and percentile",
  "Section-wise breakdown",
  "Time-per-question analysis",
  "Full answer review with explanations",
];

const rupees = new Intl.NumberFormat("en-IN");

export function formatPrice(amount: number | null | undefined) {
  return typeof amount === "number" ? `₹${rupees.format(amount)}` : "N/A";
}
