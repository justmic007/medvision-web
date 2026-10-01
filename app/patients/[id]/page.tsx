"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Protected } from "@/components/protected";
import { ApiError } from "@/lib/api";
import { listPatients, getPatientCases } from "@/lib/patients";
import type { CaseSummary, Patient } from "@/types/patient";

function PatientDetailView() {
  const params = useParams<{ id: string }>();
  const id = params.id;
  const [patient, setPatient] = useState<Patient | null>(null);
  const [cases, setCases] = useState<CaseSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function load() {
      try {
        const [patients, patientCases] = await Promise.all([
          listPatients(),
          getPatientCases(id),
        ]);
        setPatient(patients.find((p) => p.id === id) ?? null);
        setCases(patientCases);
      } catch (e) {
        setError(e instanceof ApiError ? e.message : "Failed to load patient.");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [id]);

  if (loading) {
    return (
      <main className="mx-auto w-full max-w-4xl px-4 py-10">
        <p className="text-sm text-muted-foreground">Loading...</p>
      </main>
    );
  }

  if (error || !patient) {
    return (
      <main className="mx-auto w-full max-w-4xl px-4 py-10">
        <p className="text-sm text-red-600">{error || "Patient not found."}</p>
        <a href="/patients" className="mt-4 inline-block text-sm underline">
          Back to patients
        </a>
      </main>
    );
  }

  return (
    <main className="mx-auto w-full max-w-4xl px-4 py-6 sm:px-6 sm:py-10">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
            {patient.first_name} {patient.last_name}
          </h1>
          <p className="mt-1 text-base text-muted-foreground">
            {patient.mrn} &middot; {patient.sex} &middot; age {patient.age}
          </p>
        </div>
        <a href="/patients" className="text-sm underline">
          All patients
        </a>
      </div>

      <h2 className="mb-3 text-xl font-semibold">Case history</h2>
      {cases.length === 0 ? (
        <div className="rounded-xl border p-8 text-center">
          <p className="text-base font-medium">No cases yet</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Analyze a chest X-ray for this patient to create a case.
          </p>
          <a
            href="/analyze"
            className="mt-4 inline-block rounded-lg bg-foreground px-5 py-2.5 text-sm font-medium text-background"
          >
            New analysis
          </a>
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border">
          <table className="w-full text-left text-sm">
            <thead className="border-b bg-muted/40">
              <tr>
                <th className="px-4 py-3 font-medium">Date</th>
                <th className="px-4 py-3 font-medium">Model</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {cases.map((c) => (
                <tr key={c.id} className="border-b last:border-0">
                  <td className="px-4 py-3">
                    {new Date(c.created_at).toLocaleString()}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {c.model_name}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <a href={"/cases/" + c.id} className="text-sm underline">
                      View case
                    </a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </main>
  );
}

export default function PatientDetailPage() {
  return (
    <Protected requireClinician>
      <PatientDetailView />
    </Protected>
  );
}
