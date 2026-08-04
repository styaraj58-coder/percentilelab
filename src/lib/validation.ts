import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export const registerSchema = z.object({
  name: z.string().trim().min(2, "Name must be at least 2 characters"),
  email: z.string().email(),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

export const optionSchema = z.object({
  text: z.string().trim().min(1, "Option text is required"),
  isCorrect: z.boolean(),
});

export const questionSchema = z.object({
  text: z.string().trim().min(1, "Question text is required"),
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

export const sectionSchema = z.object({
  name: z.string().trim().min(1, "Section name is required"),
  questions: z.array(questionSchema).min(1, "Add at least one question"),
});

export const testSchema = z.object({
  title: z.string().trim().min(3, "Title must be at least 3 characters"),
  description: z.string().trim().optional(),
  durationMinutes: z.coerce.number().int().min(1).max(600),
  sections: z.array(sectionSchema).min(1, "Add at least one section"),
});

export type TestInput = z.infer<typeof testSchema>;
