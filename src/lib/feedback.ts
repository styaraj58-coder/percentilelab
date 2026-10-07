// Shared by the student feedback form, the admin feedback list and (later)
// any public testimonials section.

export const PUBLISH_OPTIONS = [
  {
    value: "FULL_NAME",
    label: "Yes, publish it with my full name",
    hint: "Shown as: your name, exam",
  },
  {
    value: "FIRST_NAME",
    label: "Yes, publish it with my first name only",
    hint: "Shown as: first name, exam",
  },
  {
    value: "ANONYMOUS",
    label: "Yes, publish it anonymously",
    hint: 'Shown as: "A student preparing for <exam>"',
  },
  {
    value: "PRIVATE",
    label: "No, keep my feedback private",
    hint: "Used only to improve Percentile Lab. It will never be shown publicly.",
  },
] as const;

export type PublishAs = (typeof PUBLISH_OPTIONS)[number]["value"];

export const CONSENT_VERSION = "v1";
export const CONSENT_CONTACT_EMAIL = "percentilelab61@gmail.com";

// How the student asked to be credited. Returns null when they chose PRIVATE.
export function displayName(fb: { name: string; exam: string; publishAs: string }) {
  if (fb.publishAs === "FULL_NAME") return `${fb.name}, ${fb.exam}`;
  if (fb.publishAs === "FIRST_NAME") return `${fb.name.trim().split(/\s+/)[0]}, ${fb.exam}`;
  if (fb.publishAs === "ANONYMOUS") return `A student preparing for ${fb.exam}`;
  return null;
}

// Whether this response may ever be shown publicly (still needs admin approval).
export function canPublish(fb: { publishAs: string; ageConfirmed: boolean; quote: string | null }) {
  return fb.publishAs !== "PRIVATE" && fb.ageConfirmed && !!fb.quote?.trim();
}
