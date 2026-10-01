// Admin API calls for the clinician lifecycle (admin-only endpoints).

import { api } from "@/lib/api";
import type { ActionResponse, ClinicianSummary } from "@/types/admin";

// All clinicians, any status — the management view.
export function listClinicians() {
  return api<ClinicianSummary[]>("/admin/clinicians");
}

// Change a clinician's status. The backend enforces allowed transitions:
//   pending -> approved | rejected
//   approved -> suspended
//   suspended -> approved
//   rejected -> approved
export function changeClinicianStatus(
  id: string,
  status: "approved" | "rejected" | "suspended"
) {
  return api<ActionResponse>(`/admin/clinicians/${id}/status`, {
    method: "POST",
    body: { status },
  });
}
