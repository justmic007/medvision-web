// Patient and case API calls.

import { api } from "@/lib/api";
import type {
  CaseDetail,
  CaseSummary,
  Patient,
  PatientCreate,
} from "@/types/patient";

export function listPatients() {
  return api<Patient[]>("/patients");
}

export function createPatient(body: PatientCreate) {
  return api<Patient>("/patients", { method: "POST", body });
}

export function listCases() {
  return api<CaseSummary[]>("/cases");
}

export function getCase(id: string) {
  return api<CaseDetail>(`/cases/${id}`);
}

export function getPatientCases(patientId: string) {
  return api<CaseSummary[]>(`/patients/${patientId}/cases`);
}
