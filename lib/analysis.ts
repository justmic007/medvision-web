// Analysis API call — uploads a chest X-ray and returns the structured result.

import { apiUpload } from "@/lib/api";
import type { AnalysisResponse } from "@/types/analysis";

export function analyzeImage(file: File): Promise<AnalysisResponse> {
  const form = new FormData();
  form.append("file", file);
  // patient_id is optional; F2 analyzes without persistence (F3 adds patients).
  return apiUpload<AnalysisResponse>("/analyze", form);
}
