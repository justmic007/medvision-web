"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Protected } from "@/components/protected";
import { AppHeader } from "@/components/app-header";
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

  return (
    <div className="min-h-screen">
      <AppHeader />
      <main className="mx-auto w-full max-w-4xl px-4 py-10 sm:px-6">
        <a
          href="/patients"
          className="text-sm font-medium text-muted-foreground hover:text-foreground"
        >
          Back to patients
        </a>

        {loading ? (
          <p className="mt-6 text-sm text-muted-foreground">Loading...</p>
        ) : error || !patient ? (
          <p className="mt-6 text-sm text-destructive">
            {error || "Patient not found."}
          </p>
        ) : (
          <>
            <div className="mt-4">
              <h1 className="text-3xl font-semibold tracking-tight">
                {patient.first_name} {patient.last_name}
              </h1>
              <dl className="mt-3 flex flex-wrap gap-x-8 gap-y-2 text-sm">
                <Meta label="MRN" value={patient.mrn} mono />
                <Meta label="Sex" value={patient.sex} />
                <Meta label="Age" value={String(patient.age)} />
              </dl>
            </div>

            <h2 className="mt-10 text-xl font-semibold">Case history</h2>
            {cases.length === 0 ? (
              <div className="mt-4 rounded-xl border border-dashed border-border p-10 text-center">
                <p className="font-medium">No cases yet</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  Analyze a chest X-ray for this patient to create a case.
                </p>
                <a href="/analyze" className="mt-4 inline-block">
                  <span className="inline-flex items-center justify-center rounded-lg bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90">
                    New analysis
                  </span>
                </a>
              </div>
            ) : (
              <div className="mt-4 overflow-hidden rounded-xl border border-border">
                <table className="w-full text-left text-sm">
                  <thead className="border-b border-border bg-muted/40">
                    <tr className="text-muted-foreground">
                      <th className="px-4 py-3 font-medium">Date</th>
                      <th className="px-4 py-3 font-medium">Model</th>
                      <th className="px-4 py-3"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {cases.map((c) => (
                      <tr key={c.id} className="transition-colors hover:bg-muted/30">
                        <td className="px-4 py-3">
                          {new Date(c.created_at).toLocaleString()}
                        </td>
                        <td className="px-4 py-3 font-mono text-xs text-muted-foreground">
                          {c.model_name}
                        </td>
                        <td className="px-4 py-3 text-right">
                          <a
                            href={"/cases/" + c.id}
                            className="text-sm font-medium text-primary hover:underline"
                          >
                            View case
                          </a>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}

function Meta({
  label,
  value,
  mono = false,
}: {
  label: string;
  value: string;
  mono?: boolean;
}) {
  return (
    <div>
      <dt className="font-mono text-xs uppercase tracking-wider text-muted-foreground">
        {label}
      </dt>
      <dd className={"mt-0.5 capitalize " + (mono ? "font-mono text-sm" : "")}>
        {value}
      </dd>
    </div>
  );
}

export default function PatientDetailPage() {
  return (
    <Protected requireClinician>
      <PatientDetailView />
    </Protected>
  );
}
