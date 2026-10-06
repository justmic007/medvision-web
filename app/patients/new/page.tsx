"use client";

import Link from "next/link";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Protected } from "@/components/protected";
import { AppHeader } from "@/components/app-header";
import { Button } from "@/components/ui/button";
import { ApiError } from "@/lib/api";
import { createPatient } from "@/lib/patients";
import { patientSchema, type PatientFormValues } from "@/lib/validation";

function NewPatientView() {
  const router = useRouter();
  const [serverError, setServerError] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<PatientFormValues>({ resolver: zodResolver(patientSchema) });

  async function onSubmit(values: PatientFormValues) {
    setServerError("");
    try {
      await createPatient(values);
      router.push("/patients");
    } catch (err) {
      setServerError(
        err instanceof ApiError ? err.message : "Could not create patient."
      );
    }
  }

  const inputCls =
    "w-full rounded-lg border border-border bg-background px-3.5 py-2.5 text-sm focus:border-ring focus:ring-2 focus:ring-ring/30 focus:outline-none";

  return (
    <div className="min-h-screen">
      <AppHeader />
      <main className="mx-auto w-full max-w-lg px-4 py-10 sm:px-6">
        <Link
          href="/patients"
          className="text-sm font-medium text-muted-foreground hover:text-foreground"
        >
          Back to patients
        </Link>
        <h1 className="mt-4 text-3xl font-semibold tracking-tight">
          Add patient
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          The MRN is assigned automatically. Records are synthetic and visible
          only to you.
        </p>

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="mt-8 space-y-5 rounded-2xl border border-border bg-card p-6 sm:p-8"
          noValidate
        >
          <div className="grid grid-cols-2 gap-4">
            <Field label="First name" error={errors.first_name?.message}>
              <input {...register("first_name")} className={inputCls} />
            </Field>
            <Field label="Last name" error={errors.last_name?.message}>
              <input {...register("last_name")} className={inputCls} />
            </Field>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Field label="Sex" error={errors.sex?.message}>
              <select {...register("sex")} className={inputCls} defaultValue="">
                <option value="" disabled>
                  Select
                </option>
                <option value="female">Female</option>
                <option value="male">Male</option>
                <option value="other">Other</option>
              </select>
            </Field>
            <Field label="Age" error={errors.age?.message}>
              <input
                type="number"
                {...register("age", { valueAsNumber: true })}
                className={inputCls}
                placeholder="0"
              />
            </Field>
          </div>

          {serverError ? (
            <p className="text-sm text-destructive">{serverError}</p>
          ) : null}

          <Button type="submit" size="lg" disabled={isSubmitting} className="w-full">
            {isSubmitting ? "Saving..." : "Create patient"}
          </Button>
        </form>
      </main>
    </div>
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

export default function NewPatientPage() {
  return (
    <Protected requireClinician>
      <NewPatientView />
    </Protected>
  );
}
