// Types mirroring the backend's admin endpoints.

export type ClinicianStatus = "pending" | "approved" | "rejected" | "suspended";

export interface ClinicianSummary {
  id: string;
  email: string;
  email_verified: boolean;
  status: ClinicianStatus;
}

export interface ActionResponse {
  id: string;
  status: string;
  message: string;
}
