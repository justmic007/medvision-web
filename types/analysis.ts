// Types mirroring the backend's /analyze response (AnalysisResponse).

export interface Article {
  pmid: string;
  title: string;
  journal: string;
  year: string;
  citation: string;
  url: string;
}

export interface Finding {
  name: string;
  probability: number;
  threshold: number;
  heatmap_base64: string | null; // present only for the top-N findings
  articles: Article[];
}

export interface AnalysisResponse {
  model_name: string;
  num_present: number;
  findings: Finding[];
  disclaimer: string;
}
