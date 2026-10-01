"use client";

import { useEffect, useState } from "react";
import { Protected } from "@/components/protected";
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
    <main className="mx-auto w-full max-w-5xl px-4 py-6 sm:px-6 sm:py-10">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
            Patients
          </h1>
          <p className="mt-1 text-base text-muted-foreground">
            Your patients and their scan history.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <a href="/" className="text-sm underline">
            Dashboard
          </a>
          <a href="/patients/new">
            <Button size="lg">Add patient</Button>
          </a>
        </div>
      </div>

      {loading ? (
        <p className="text-sm text-muted-foreground">Loading...</p>
      ) : error ? (
        <p className="text-sm text-red-600">{error}</p>
      ) : patients.length === 0 ? (
        <div className="rounded-xl border p-8 text-center">
          <p className="text-base font-medium">No patients yet</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Add your first patient to start building case history.
          </p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border">
          <table className="w-full text-left text-sm">
            <thead className="border-b bg-muted/40">
              <tr>
                <th className="px-4 py-3 font-medium">Name</th>
                <th className="px-4 py-3 font-medium">MRN</th>
                <th className="px-4 py-3 font-medium">Sex</th>
                <th className="px-4 py-3 font-medium">Age</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {patients.map((p) => (
                <tr key={p.id} className="border-b last:border-0">
                  <td className="px-4 py-3 font-medium">
                    {p.first_name} {p.last_name}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{p.mrn}</td>
                  <td className="px-4 py-3 capitalize text-muted-foreground">
                    {p.sex}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{p.age}</td>
                  <td className="px-4 py-3 text-right">
                    <a
                      href={"/patients/" + p.id}
                      className="text-sm underline"
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
  );
}

export default function PatientsPage() {
  return (
    <Protected requireClinician>
      <PatientsView />
    </Protected>
  );
}
