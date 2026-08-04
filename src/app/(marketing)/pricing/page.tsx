import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = { title: "Pricing | Percentile Lab MBA" };

const plans = [
  {
    name: "Free",
    price: "₹0",
    period: "forever",
    description: "Everything you need to start practicing for MBA CET.",
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
    price: "Coming soon",
    period: "",
    description: "Extra mock series, deeper analytics, and priority support.",
    features: [
      "Everything in Free",
      "Extended mock test series",
      "Peer comparison analytics",
      "Priority doubt support",
    ],
    cta: { label: "Get notified", href: "/register" },
    highlight: true,
  },
];

export default function PricingPage() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-16 sm:px-6">
      <div className="text-center">
        <p className="text-xs font-semibold uppercase tracking-wide text-brand-gold">
          Pricing
        </p>
        <h1 className="mt-2 text-3xl font-bold text-brand-navy sm:text-4xl">
          Start free. Upgrade when you need more.
        </h1>
        <p className="mx-auto mt-3 max-w-xl text-brand-ink/70">
          Core test-taking and analysis features are free — no card required.
        </p>
      </div>

      <div className="mt-12 grid gap-8 sm:grid-cols-2">
        {plans.map((plan) => (
          <div
            key={plan.name}
            className={`rounded-2xl border p-8 ${
              plan.highlight
                ? "border-brand-gold bg-brand-navy text-white"
                : "border-black/10 bg-white"
            }`}
          >
            <h2
              className={`text-lg font-semibold ${
                plan.highlight ? "text-brand-gold" : "text-brand-navy"
              }`}
            >
              {plan.name}
            </h2>
            <p className="mt-2 flex items-baseline gap-1">
              <span className="text-3xl font-bold">{plan.price}</span>
              {plan.period && (
                <span
                  className={
                    plan.highlight ? "text-white/60" : "text-brand-ink/50"
                  }
                >
                  / {plan.period}
                </span>
              )}
            </p>
            <p
              className={`mt-2 text-sm ${
                plan.highlight ? "text-white/70" : "text-brand-ink/70"
              }`}
            >
              {plan.description}
            </p>

            <ul className="mt-6 space-y-3 text-sm">
              {plan.features.map((feature) => (
                <li key={feature} className="flex items-start gap-2">
                  <span
                    className={
                      plan.highlight ? "text-brand-gold" : "text-brand-navy"
                    }
                  >
                    ✓
                  </span>
                  <span
                    className={plan.highlight ? "text-white/90" : "text-brand-ink/80"}
                  >
                    {feature}
                  </span>
                </li>
              ))}
            </ul>

            <Link
              href={plan.cta.href}
              className={`mt-8 block rounded-md px-4 py-2.5 text-center text-sm font-semibold transition-colors ${
                plan.highlight
                  ? "bg-brand-gold text-brand-navy hover:bg-brand-gold-light"
                  : "bg-brand-navy text-white hover:bg-brand-navy-light"
              }`}
            >
              {plan.cta.label}
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}
