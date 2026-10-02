"use client";

import { useEffect, useState } from "react";
import { Protected } from "@/components/protected";
import { AppHeader } from "@/components/app-header";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { ApiError } from "@/lib/api";
import { listClinicians, changeClinicianStatus } from "@/lib/admin";
import type { ClinicianStatus, ClinicianSummary } from "@/types/admin";

type Target = "approved" | "rejected" | "suspended";

const ACTIONS: Record<
  ClinicianStatus,
  { label: string; status: Target }[]
> = {
  pending: [
    { label: "Approve", status: "approved" },
    { label: "Reject", status: "rejected" },
  ],
  approved: [{ label: "Suspend", status: "suspended" }],
  suspended: [{ label: "Reinstate", status: "approved" }],
  rejected: [{ label: "Reinstate", status: "approved" }],
};

// Access-removing actions ask for confirmation; granting actions don't.
const CONFIRM: Partial<
  Record<Target, { title: (email: string) => string; body: string; label: string }>
> = {
  suspended: {
    title: (email) => `Suspend ${email}?`,
    body: "This immediately revokes the clinician's access. You can reinstate them later.",
    label: "Suspend",
  },
  rejected: {
    title: (email) => `Reject ${email}?`,
    body: "This denies the clinician access. You can reinstate them later.",
    label: "Reject",
  },
};

const PILL: Record<ClinicianStatus, string> = {
  pending: "bg-amber-50 text-amber-700 border-amber-200",
  approved: "bg-emerald-50 text-emerald-700 border-emerald-200",
  suspended: "bg-orange-50 text-orange-700 border-orange-200",
  rejected: "bg-red-50 text-red-700 border-red-200",
};

function AdminView() {
  const [clinicians, setClinicians] = useState<ClinicianSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [busyId, setBusyId] = useState<string | null>(null);
  const [pending, setPending] = useState<{
    clinician: ClinicianSummary;
    status: Target;
  } | null>(null);

  useEffect(() => {
    listClinicians()
      .then(setClinicians)
      .catch((e) =>
        setError(e instanceof ApiError ? e.message : "Failed to load clinicians.")
      )
      .finally(() => setLoading(false));
  }, []);

  async function apply(id: string, status: Target) {
    setBusyId(id);
    setError("");
    try {
      const res = await changeClinicianStatus(id, status);
      setClinicians((prev) =>
        prev.map((c) =>
          c.id === id ? { ...c, status: res.status as ClinicianStatus } : c
        )
      );
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Action failed.");
    } finally {
      setBusyId(null);
      setPending(null);
    }
  }

  function onAction(clinician: ClinicianSummary, status: Target) {
    if (CONFIRM[status]) {
      setPending({ clinician, status }); // show confirm dialog
    } else {
      apply(clinician.id, status); // grant actions apply directly
    }
  }

  const confirm = pending ? CONFIRM[pending.status] : undefined;

  return (
    <div className="min-h-screen">
      <AppHeader />
      <main className="mx-auto w-full max-w-4xl px-4 py-10 sm:px-6">
        <p className="font-mono text-xs uppercase tracking-widest text-primary">
          Access control
        </p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight">Clinicians</h1>
        <p className="mt-2 text-muted-foreground">
          Approve, reject, suspend, or reinstate clinician access.
        </p>

        {error ? <p className="mt-6 text-sm text-destructive">{error}</p> : null}

        {loading ? (
          <p className="mt-8 text-sm text-muted-foreground">Loading...</p>
        ) : clinicians.length === 0 ? (
          <div className="mt-8 rounded-xl border border-dashed border-border p-10 text-center">
            <p className="font-medium">No clinicians yet</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Registered clinicians will appear here for management.
            </p>
          </div>
        ) : (
          <div className="mt-8 overflow-hidden rounded-xl border border-border">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-border bg-muted/40">
                <tr className="text-muted-foreground">
                  <th className="px-4 py-3 font-medium">Email</th>
                  <th className="px-4 py-3 font-medium">Verified</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 text-right font-medium">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {clinicians.map((c) => (
                  <tr key={c.id} className="transition-colors hover:bg-muted/30">
                    <td className="px-4 py-3 font-medium">{c.email}</td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {c.email_verified ? "Yes" : "No"}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={
                          "inline-flex rounded-full border px-2.5 py-0.5 text-xs font-medium capitalize " +
                          PILL[c.status]
                        }
                      >
                        {c.status}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex justify-end gap-2">
                        {ACTIONS[c.status].map((a) => (
                          <button
                            key={a.status}
                            onClick={() => onAction(c, a.status)}
                            disabled={busyId === c.id}
                            className="rounded-lg border border-border px-3 py-1.5 text-sm font-medium transition-colors hover:bg-muted disabled:opacity-50"
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

      <ConfirmDialog
        open={!!pending && !!confirm}
        title={confirm && pending ? confirm.title(pending.clinician.email) : ""}
        body={confirm ? confirm.body : ""}
        confirmLabel={confirm ? confirm.label : "Confirm"}
        destructive
        busy={!!busyId}
        onConfirm={() =>
          pending ? apply(pending.clinician.id, pending.status) : undefined
        }
        onCancel={() => setPending(null)}
      />
    </div>
  );
}

export default function AdminPage() {
  return (
    <Protected requireAdmin>
      <AdminView />
    </Protected>
  );
}
