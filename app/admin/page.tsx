"use client";

import { useEffect, useState } from "react";
import { Protected } from "@/components/protected";
import { ApiError } from "@/lib/api";
import { listClinicians, changeClinicianStatus } from "@/lib/admin";
import type { ClinicianStatus, ClinicianSummary } from "@/types/admin";

// Which actions are offered for each current status (mirrors the backend's
// allowed transitions).
const ACTIONS: Record<
  ClinicianStatus,
  { label: string; status: "approved" | "rejected" | "suspended" }[]
> = {
  pending: [
    { label: "Approve", status: "approved" },
    { label: "Reject", status: "rejected" },
  ],
  approved: [{ label: "Suspend", status: "suspended" }],
  suspended: [{ label: "Reinstate", status: "approved" }],
  rejected: [{ label: "Reinstate", status: "approved" }],
};

const STATUS_STYLE: Record<ClinicianStatus, string> = {
  pending: "text-amber-700",
  approved: "text-green-700",
  suspended: "text-orange-700",
  rejected: "text-red-700",
};

function AdminView() {
  const [clinicians, setClinicians] = useState<ClinicianSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [busyId, setBusyId] = useState<string | null>(null);

  async function load() {
    try {
      setClinicians(await listClinicians());
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Failed to load clinicians.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function act(
    id: string,
    status: "approved" | "rejected" | "suspended"
  ) {
    setBusyId(id);
    setError("");
    try {
      const res = await changeClinicianStatus(id, status);
      // Update the row in place with the new status.
      setClinicians((prev) =>
        prev.map((c) =>
          c.id === id ? { ...c, status: res.status as ClinicianStatus } : c
        )
      );
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Action failed.");
    } finally {
      setBusyId(null);
    }
  }

  return (
    <main className="mx-auto w-full max-w-4xl px-4 py-6 sm:px-6 sm:py-10">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
            Clinicians
          </h1>
          <p className="mt-1 text-base text-muted-foreground">
            Manage clinician access: approve, reject, suspend, or reinstate.
          </p>
        </div>
        <a href="/" className="text-sm underline">
          Dashboard
        </a>
      </div>

      {error ? <p className="mb-4 text-sm text-red-600">{error}</p> : null}

      {loading ? (
        <p className="text-sm text-muted-foreground">Loading...</p>
      ) : clinicians.length === 0 ? (
        <div className="rounded-xl border p-8 text-center">
          <p className="text-base font-medium">No clinicians yet</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Registered clinicians will appear here for management.
          </p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border">
          <table className="w-full text-left text-sm">
            <thead className="border-b bg-muted/40">
              <tr>
                <th className="px-4 py-3 font-medium">Email</th>
                <th className="px-4 py-3 font-medium">Verified</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 text-right font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {clinicians.map((c) => (
                <tr key={c.id} className="border-b last:border-0">
                  <td className="px-4 py-3 font-medium">{c.email}</td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {c.email_verified ? "Yes" : "No"}
                  </td>
                  <td className="px-4 py-3">
                    <span className={"capitalize " + STATUS_STYLE[c.status]}>
                      {c.status}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-2">
                      {ACTIONS[c.status].map((a) => (
                        <button
                          key={a.status}
                          onClick={() => act(c.id, a.status)}
                          disabled={busyId === c.id}
                          className="rounded-lg border px-3 py-1.5 text-sm font-medium disabled:opacity-50"
                        >
                          {a.label}
                        </button>
                      ))}
                    </div>
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

export default function AdminPage() {
  return (
    <Protected requireAdmin>
      <AdminView />
    </Protected>
  );
}
