import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export const forgotPasswordSchema = z.object({
  email: z.string().email(),
});

export const resetPasswordSchema = z.object({
  token: z.string().min(1),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

export const MBA_ENTRANCE_EXAMS = [
  "MH-CET (MBA)",
  "CAT",
  "XAT",
  "CMAT",
  "MAT",
  "NMAT",
  "SNAP",
  "ATMA",
  "Other",
] as const;

export const registerSchema = z.object({
  name: z.string().trim().min(2, "Name must be at least 2 characters"),
  email: z.string().email(),
  password: z.string().min(8, "Password must be at least 8 characters"),
  phone: z
    .string()
    .trim()
    .min(10, "Enter a valid contact number")
    .max(15, "Enter a valid contact number")
    .regex(/^[0-9+\-\s]+$/, "Enter a valid contact number"),
  college: z.string().trim().min(2, "College name is required"),
  course: z.string().trim().min(2, "Course is required"),
  targetExam: z.enum(MBA_ENTRANCE_EXAMS, {
    message: "Select an MBA entrance exam",
  }),
});

export const optionSchema = z.object({
  text: z.string().trim().min(1, "Option text is required"),
  imageUrl: z.string().trim().optional(),
  isCorrect: z.boolean(),
});

export const questionSchema = z.object({
  text: z.string().trim().min(1, "Question text is required"),
  imageUrl: z.string().trim().optional(),
  explanation: z.string().trim().optional(),
  marks: z.coerce.number().int().min(1).max(100),
  options: z
    .array(optionSchema)
    .min(2, "At least 2 options are required")
    .max(6, "At most 6 options are allowed")
    .refine((opts) => opts.filter((o) => o.isCorrect).length === 1, {
      message: "Exactly one option must be marked correct",
    }),
});

// A section's content is an ordered list of blocks — a standalone question,
// or a passage shared by several sub-questions (e.g. a reading passage or a
// cloze paragraph).
export const passageGroupSchema = z.object({
  passageTitle: z.string().trim().optional(),
  passageText: z.string().trim().min(1, "Passage text is required"),
  questions: z.array(questionSchema).min(1, "Add at least one question"),
});

export const sectionBlockSchema = z.discriminatedUnion("kind", [
  z.object({ kind: z.literal("question"), question: questionSchema }),
  z.object({ kind: z.literal("passage"), passage: passageGroupSchema }),
]);

export const sectionSchema = z.object({
  name: z.string().trim().min(1, "Section name is required"),
  blocks: z.array(sectionBlockSchema).min(1, "Add at least one question"),
});

export const testSchema = z.object({
  title: z.string().trim().min(3, "Title must be at least 3 characters"),
  description: z.string().trim().optional(),
  targetExam: z.enum(MBA_ENTRANCE_EXAMS, {
    message: "Select which entrance exam this test is for",
  }),
  durationMinutes: z.coerce.number().int().min(1).max(600),
  sections: z.array(sectionSchema).min(1, "Add at least one section"),
});

export type TestInput = z.infer<typeof testSchema>;
export type QuestionInput = z.infer<typeof questionSchema>;
