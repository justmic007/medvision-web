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


// File-upload limits — mirror the backend's /analyze guards.
export const MAX_UPLOAD_BYTES = 10 * 1024 * 1024; // 10 MB
export const ALLOWED_IMAGE_TYPES = ["image/png", "image/jpeg"];
export const ALLOWED_EXTENSIONS = [".png", ".jpg", ".jpeg"];

export function validateImageFile(file: File): string | null {
  const okType =
    ALLOWED_IMAGE_TYPES.includes(file.type) ||
    ALLOWED_EXTENSIONS.some((ext) => file.name.toLowerCase().endsWith(ext));
  if (!okType) return "Please upload a PNG or JPG chest X-ray.";
  if (file.size > MAX_UPLOAD_BYTES) return "File is too large (max 10 MB).";
  return null; // valid
}


// Patient form validation.
export const patientSchema = z.object({
  first_name: z.string().min(1, "First name is required").max(100),
  last_name: z.string().min(1, "Last name is required").max(100),
  sex: z.enum(["male", "female", "other"]),
  age: z.number().int().min(0, "Age must be 0 or more").max(150),
});

export type PatientFormValues = z.infer<typeof patientSchema>;
