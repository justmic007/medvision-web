"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { register as apiRegister } from "@/lib/auth";
import { ApiError } from "@/lib/api";
import { registerSchema, type RegisterValues } from "@/lib/validation";
import { Button } from "@/components/ui/button";
import { PasswordInput } from "@/components/password-input";

export default function RegisterPage() {
  const [serverError, setServerError] = useState("");
  const [done, setDone] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterValues>({ resolver: zodResolver(registerSchema) });

  async function onSubmit(values: RegisterValues) {
    setServerError("");
    try {
      await apiRegister(values.email, values.password);
      setDone(true);
    } catch (err) {
      setServerError(
        err instanceof ApiError ? err.message : "Registration failed."
      );
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center px-4 py-10">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <div className="flex items-baseline justify-center gap-2">
            <span className="text-xl font-semibold tracking-tight">
              MedVision
            </span>
            <span className="font-mono text-xs uppercase tracking-widest text-primary">
              AI
            </span>
          </div>
          <p className="mt-1 text-sm text-muted-foreground">
            Chest X-ray decision support
          </p>
        </div>

        {done ? (
          <div className="space-y-3 rounded-2xl border border-border bg-card p-6 text-center sm:p-8">
            <h1 className="text-lg font-semibold">Check your email</h1>
            <p className="text-sm leading-relaxed text-muted-foreground">
              We&apos;ve sent a verification link. After you verify, an admin must
              approve your account before you can sign in.
            </p>
            <a
              href="/login"
              className="inline-block text-sm font-medium text-primary hover:underline"
            >
              Back to sign in
            </a>
          </div>
        ) : (
          <form
            onSubmit={handleSubmit(onSubmit)}
            className="space-y-5 rounded-2xl border border-border bg-card p-6 sm:p-8"
            noValidate
          >
            <h1 className="text-lg font-semibold">Create a clinician account</h1>

            <Field label="Email" error={errors.email?.message}>
              <input
                type="email"
                {...register("email")}
                className="w-full rounded-lg border border-border bg-background px-3.5 py-2.5 text-sm focus:border-ring focus:ring-2 focus:ring-ring/30 focus:outline-none"
                placeholder="you@example.com"
              />
            </Field>

            <Field
              label="Password"
              error={errors.password?.message}
              hint="At least 8 characters, with a letter and a number."
            >
              <PasswordInput {...register("password")} />
            </Field>

            {serverError ? (
              <p className="text-sm text-destructive">{serverError}</p>
            ) : null}

            <Button type="submit" size="lg" disabled={isSubmitting} className="w-full">
              {isSubmitting ? "Creating..." : "Create account"}
            </Button>

            <p className="text-center text-sm text-muted-foreground">
              Already have an account?{" "}
              <a href="/login" className="font-medium text-primary hover:underline">
                Sign in
              </a>
            </p>
          </form>
        )}
      </div>
    </main>
  );
}

function Field({
  label,
  error,
  hint,
  children,
}: {
  label: string;
  error?: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <label className="text-sm font-medium">{label}</label>
      {children}
      {error ? (
        <p className="text-sm text-destructive">{error}</p>
      ) : hint ? (
        <p className="text-xs text-muted-foreground">{hint}</p>
      ) : null}
    </div>
  );
}
