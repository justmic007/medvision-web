"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Protected } from "@/components/protected";
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

  return (
    <main className="mx-auto w-full max-w-lg px-4 py-6 sm:px-6 sm:py-10">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
          Add patient
        </h1>
        <a href="/patients" className="text-sm underline">
          Cancel
        </a>
      </div>

      <form
        onSubmit={handleSubmit(onSubmit)}
        className="space-y-5 rounded-2xl border p-6 shadow-sm sm:p-8"
        noValidate
      >
        <p className="text-sm text-muted-foreground">
          Patient records are synthetic and visible only to you.
        </p>

        <div className="grid grid-cols-2 gap-4">
          <Field label="First name" error={errors.first_name?.message}>
            <input
              {...register("first_name")}
              className="w-full rounded-lg border px-4 py-2.5 text-base"
            />
          </Field>
          <Field label="Last name" error={errors.last_name?.message}>
            <input
              {...register("last_name")}
              className="w-full rounded-lg border px-4 py-2.5 text-base"
            />
          </Field>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Field label="Sex" error={errors.sex?.message}>
            <select
              {...register("sex")}
              className="w-full rounded-lg border px-4 py-2.5 text-base"
              defaultValue=""
            >
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
              className="w-full rounded-lg border px-4 py-2.5 text-base"
              placeholder="0"
            />
          </Field>
        </div>

        {serverError ? (
          <p className="text-sm text-red-600">{serverError}</p>
        ) : null}

        <Button type="submit" size="lg" disabled={isSubmitting} className="w-full">
          {isSubmitting ? "Saving..." : "Create patient"}
        </Button>
      </form>
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
    <div className="space-y-1">
      <label className="text-sm font-medium">{label}</label>
      {children}
      {error ? <p className="text-sm text-red-600">{error}</p> : null}
    </div>
  );
}

export default function NewPatientPage() {
  return (
    <Protected>
      <NewPatientView />
    </Protected>
  );
}
