"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAuth } from "@/lib/auth-context";
import { ApiError } from "@/lib/api";
import { loginSchema, type LoginValues } from "@/lib/validation";
import { Button } from "@/components/ui/button";
import { PasswordInput } from "@/components/password-input";

export default function LoginPage() {
  const { login, user } = useAuth();
  const router = useRouter();
  const [serverError, setServerError] = useState("");

  useEffect(() => {
    if (user) router.replace("/dashboard");
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
      router.push("/dashboard");
    } catch (err) {
      setServerError(
        err instanceof ApiError ? err.message : "Login failed. Try again."
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

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="space-y-5 rounded-2xl border border-border bg-card p-6 sm:p-8"
          noValidate
        >
          <h1 className="text-lg font-semibold">Sign in</h1>

          <Field label="Email" error={errors.email?.message}>
            <input
              type="email"
              {...register("email")}
              className="w-full rounded-lg border border-border bg-background px-3.5 py-2.5 text-sm focus:border-ring focus:ring-2 focus:ring-ring/30 focus:outline-none"
              placeholder="you@example.com"
            />
          </Field>

          <Field label="Password" error={errors.password?.message}>
            <PasswordInput {...register("password")} />
          </Field>

          {serverError ? (
            <p className="text-sm text-destructive">{serverError}</p>
          ) : null}

          <Button type="submit" size="lg" disabled={isSubmitting} className="w-full">
            {isSubmitting ? "Signing in..." : "Sign in"}
          </Button>

          <p className="text-center text-sm text-muted-foreground">
            No account?{" "}
            <a href="/register" className="font-medium text-primary hover:underline">
              Register
            </a>
          </p>
        </form>
      </div>
    </main>
  );
}

function Field({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <label className="text-sm font-medium">{label}</label>
      {children}
      {error ? <p className="text-sm text-destructive">{error}</p> : null}
    </div>
  );
}
