"use client";

import { useEffect, useState } from "react";
import { Protected } from "@/components/protected";
import { AppHeader } from "@/components/app-header";
import { Button } from "@/components/ui/button";
import { ApiError } from "@/lib/api";
import { listPatients } from "@/lib/patients";
import type { Patient } from "@/types/patient";

function PatientsView() {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    listPatients()
      .then(setPatients)
      .catch((e) =>
        setError(e instanceof ApiError ? e.message : "Failed to load patients.")
      )
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen">
      <AppHeader />
      <main className="mx-auto w-full max-w-5xl px-4 py-10 sm:px-6">
        <div className="flex items-end justify-between">
          <div>
            <p className="font-mono text-xs uppercase tracking-widest text-primary">
              Records
            </p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight">
              Patients
            </h1>
            <p className="mt-2 text-muted-foreground">
              Your patients and their case history.
            </p>
          </div>
          <a href="/patients/new">
            <Button size="lg">Add patient</Button>
          </a>
        </div>

        {loading ? (
          <p className="mt-8 text-sm text-muted-foreground">Loading...</p>
        ) : error ? (
          <p className="mt-8 text-sm text-destructive">{error}</p>
        ) : patients.length === 0 ? (
          <div className="mt-8 rounded-xl border border-dashed border-border p-10 text-center">
            <p className="font-medium">No patients yet</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Add your first patient to start building case history.
            </p>
            <a href="/patients/new" className="mt-4 inline-block">
              <Button>Add patient</Button>
            </a>
          </div>
        ) : (
          <div className="mt-8 overflow-hidden rounded-xl border border-border">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-border bg-muted/40">
                <tr className="text-muted-foreground">
                  <th className="px-4 py-3 font-medium">Name</th>
                  <th className="px-4 py-3 font-medium">MRN</th>
                  <th className="px-4 py-3 font-medium">Sex</th>
                  <th className="px-4 py-3 font-medium">Age</th>
                  <th className="px-4 py-3"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {patients.map((p) => (
                  <tr key={p.id} className="transition-colors hover:bg-muted/30">
                    <td className="px-4 py-3 font-medium">
                      {p.first_name} {p.last_name}
                    </td>
                    <td className="px-4 py-3 font-mono text-xs text-muted-foreground">
                      {p.mrn}
                    </td>
                    <td className="px-4 py-3 capitalize text-muted-foreground">
                      {p.sex}
                    </td>
                    <td className="px-4 py-3 tabular-nums text-muted-foreground">
                      {p.age}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <a
                        href={"/patients/" + p.id}
                        className="text-sm font-medium text-primary hover:underline"
                      >
                        View
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>
    </div>
  );
}

export default function PatientsPage() {
  return (
    <Protected requireClinician>
      <PatientsView />
    </Protected>
  );
}
