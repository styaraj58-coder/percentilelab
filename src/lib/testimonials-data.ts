import { unstable_cache } from "next/cache";

import { canPublish, displayName } from "@/lib/feedback";
import { prisma } from "@/lib/prisma";

// The only shape that ever reaches a public page: no email, phone, college or
// account name - just the quote and the credit line the student chose.
export type Testimonial = {
  id: string;
  quote: string;
  credit: string;
  rating: number;
  // Only set when the student shared both percentiles and improved.
  progress: { from: number; to: number } | null;
};

const round = (n: number) => Number(n.toFixed(1));

// A testimonial is public only if the student agreed to publishing (not
// PRIVATE, age/guardian confirmed, has a quote) AND an admin approved it.
// Invalidated by revalidateTag("testimonials") whenever an admin approves,
// un-approves or deletes a response (see src/app/admin/feedback/actions.ts).
export const getTestimonials = unstable_cache(
  async (): Promise<Testimonial[]> => {
    const rows = await prisma.feedback.findMany({
      where: {
        approved: true,
        ageConfirmed: true,
        publishAs: { not: "PRIVATE" },
        quote: { not: null },
      },
      orderBy: { createdAt: "desc" },
      take: 9,
    });

    return rows.flatMap((fb) => {
      const credit = displayName(fb);
      if (!credit || !canPublish(fb)) return [];
      const improved =
        fb.firstPercentile != null && fb.latestPercentile != null && fb.latestPercentile > fb.firstPercentile;
      return [
        {
          id: fb.id,
          quote: fb.quote!.trim(),
          credit,
          rating: fb.rating,
          progress: improved ? { from: round(fb.firstPercentile!), to: round(fb.latestPercentile!) } : null,
        },
      ];
    });
  },
  ["testimonials"],
  { revalidate: 300, tags: ["testimonials"] }
);
