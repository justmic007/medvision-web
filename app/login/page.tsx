"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAuth } from "@/lib/auth-context";
import { ApiError } from "@/lib/api";
import { loginSchema, type LoginValues } from "@/lib/validation";
import { Button } from "@/components/ui/button";

export default function LoginPage() {
  const { login, user } = useAuth();
  const router = useRouter();
  const [serverError, setServerError] = useState("");

  // If already signed in, don't show the login form.
  useEffect(() => {
    if (user) router.replace("/");
  }, [user, router]);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginValues>({ resolver: zodResolver(loginSchema) });

  async function onSubmit(values: LoginValues) {
    setServerError("");
    try {
      await login(values.email, values.password);
      router.push("/");
    } catch (err) {
      setServerError(
        err instanceof ApiError ? err.message : "Login failed. Try again."
      );
    }
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
            Sign in to MedVision AI
          </h1>
          <p className="text-base text-muted-foreground">
            Clinician access — decision support
          </p>
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
          {errors.password && (
            <p className="text-sm text-red-600">{errors.password.message}</p>
          )}
        </div>

        {serverError && <p className="text-sm text-red-600">{serverError}</p>}

        <Button type="submit" size="lg" disabled={isSubmitting} className="w-full">
          {isSubmitting ? "Signing in…" : "Sign in"}
        </Button>

        <p className="text-center text-sm text-muted-foreground">
          No account?{" "}
          <a href="/register" className="font-medium underline">
            Register
          </a>
        </p>
      </form>
    </main>
  );
}
