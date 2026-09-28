// Analysis API call — uploads a chest X-ray and returns the structured result.

import { apiUpload } from "@/lib/api";
import type { AnalysisResponse } from "@/types/analysis";

export function analyzeImage(
  file: File,
  patientId?: string
): Promise<AnalysisResponse> {
  const form = new FormData();
  form.append("file", file);
  if (patientId) form.append("patient_id", patientId);
  return apiUpload<AnalysisResponse>("/analyze", form);
}
