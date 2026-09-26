"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { register as apiRegister } from "@/lib/auth";
import { ApiError } from "@/lib/api";
import { registerSchema, type RegisterValues } from "@/lib/validation";
import { Button } from "@/components/ui/button";

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

  if (done) {
    return (
      <main className="flex min-h-screen items-center justify-center px-4 py-10">
        <div className="w-full max-w-md space-y-4 rounded-2xl border p-6 text-center shadow-sm sm:p-8">
          <h1 className="text-2xl font-bold tracking-tight">Check your email</h1>
          <p className="text-base text-muted-foreground">
            We&apos;ve sent a verification link. After you verify, an admin must
            approve your account before you can sign in.
          </p>
          <a href="/login" className="inline-block text-base font-medium underline">
            Back to sign in
          </a>
        </div>
      </main>
    );
  }

  return (
    <main className="flex min-h-screen items-center justify-center px-4 py-10">
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="w-full max-w-md space-y-6 rounded-2xl border p-6 shadow-sm sm:p-8"
        noValidate
      >
        <div className="space-y-1 text-center">
          <h1 className="text-2xl font-bold tracking-tight">
            Create a clinician account
          </h1>
          <p className="text-base text-muted-foreground">MedVision AI</p>
        </div>

        <div className="space-y-2">
          <label htmlFor="email" className="text-sm font-medium">
            Email
          </label>
          <input
            id="email"
            type="email"
            {...register("email")}
            className="w-full rounded-lg border px-4 py-2.5 text-base outline-none focus:ring-2 focus:ring-ring"
            placeholder="you@example.com"
          />
          {errors.email && (
            <p className="text-sm text-red-600">{errors.email.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <label htmlFor="password" className="text-sm font-medium">
            Password
          </label>
          <input
            id="password"
            type="password"
            {...register("password")}
            className="w-full rounded-lg border px-4 py-2.5 text-base outline-none focus:ring-2 focus:ring-ring"
            placeholder="••••••••"
          />
          {errors.password ? (
            <p className="text-sm text-red-600">{errors.password.message}</p>
          ) : (
            <p className="text-sm text-muted-foreground">
              At least 8 characters, with a letter and a number.
            </p>
          )}
        </div>

        {serverError && <p className="text-sm text-red-600">{serverError}</p>}

        <Button type="submit" size="lg" disabled={isSubmitting} className="w-full">
          {isSubmitting ? "Creating…" : "Create account"}
        </Button>

        <p className="text-center text-sm text-muted-foreground">
          Already have an account?{" "}
          <a href="/login" className="font-medium underline">
            Sign in
          </a>
        </p>
      </form>
    </main>
  );
}
