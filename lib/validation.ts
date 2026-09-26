// Form validation schemas (Zod). These mirror the backend's rules so the user
// gets instant feedback and never hits a surprise 422 from the API.

import { z } from "zod";

// Password policy matches the backend: 8-72 chars (72 = bcrypt's limit),
// with at least one letter and one number.
const passwordPolicy = z
  .string()
  .min(8, "At least 8 characters")
  .max(72, "At most 72 characters")
  .refine((v) => /[a-zA-Z]/.test(v), "Must contain a letter")
  .refine((v) => /[0-9]/.test(v), "Must contain a number");

export const loginSchema = z.object({
  email: z.email("Enter a valid email"),
  password: z.string().min(1, "Password is required"),
});

export const registerSchema = z.object({
  email: z.email("Enter a valid email"),
  password: passwordPolicy,
});

export type LoginValues = z.infer<typeof loginSchema>;
export type RegisterValues = z.infer<typeof registerSchema>;
