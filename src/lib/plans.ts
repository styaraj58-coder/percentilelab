// Single source of truth for the Free / Premium plans, shown on both the
// Pricing and Courses pages.
export const plans = [
  {
    name: "Free",
    price: "₹0",
    period: "forever",
    description: "Everything you need to start practicing for your MBA entrance exam.",
    features: [
      "Access to published mock tests",
      "Timed, sectional test-taking",
      "Overall score and percentile",
      "Section-wise breakdown",
      "Time-per-question analysis",
      "Full answer review with explanations",
    ],
    cta: { label: "Get started free", href: "/register" },
    highlight: false,
  },
  {
    name: "Premium",
    price: "₹4,999",
    period: "",
    description: "Live guidance and a full mock series to prep with an edge.",
    features: [
      "Everything in Free",
      "Live lectures",
      "Recordings of every session",
      "15+ full-length mocks",
      "20+ sectional tests",
      "Personalized doubt solving",
    ],
    cta: { label: "Get Premium", href: "/register" },
    highlight: true,
  },
];
