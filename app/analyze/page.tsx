"use client";

import { useEffect, useRef, useState } from "react";
import { Protected } from "@/components/protected";
import { Button } from "@/components/ui/button";
import { ApiError } from "@/lib/api";
import { analyzeImage } from "@/lib/analysis";
import { listPatients } from "@/lib/patients";
import type { Patient } from "@/types/patient";
import { validateImageFile } from "@/lib/validation";
import type { AnalysisResponse } from "@/types/analysis";

function AnalyzeView() {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [fileError, setFileError] = useState("");
  const [result, setResult] = useState<AnalysisResponse | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [serverError, setServerError] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [patientId, setPatientId] = useState<string>("");

  useEffect(() => {
    listPatients().then(setPatients).catch(() => setPatients([]));
  }, []);

  function pickFile(f: File | null) {
    setServerError("");
    setResult(null);
    if (!f) return;
    const err = validateImageFile(f);
    if (err) {
      setFileError(err);
      setFile(null);
      setPreview(null);
      return;
    }
    setFileError("");
    setFile(f);
    setPreview(URL.createObjectURL(f));
  }

  async function onAnalyze() {
    if (!file) return;
    setAnalyzing(true);
    setServerError("");
    setResult(null);
    try {
      const res = await analyzeImage(file, patientId || undefined);
      setResult(res);
    } catch (err) {
      setServerError(
        err instanceof ApiError ? err.message : "Analysis failed. Try again."
      );
    } finally {
      setAnalyzing(false);
    }
  }

  return (
    <main className="mx-auto w-full max-w-5xl px-4 py-6 sm:px-6 sm:py-10">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
            Analyze a chest X-ray
          </h1>
          <p className="mt-1 text-base text-muted-foreground">
            Upload a frontal chest radiograph (PNG or JPG, max 10 MB).
          </p>
        </div>
        <a href="/" className="text-sm underline">
          Dashboard
        </a>
      </div>

      <div className="grid gap-6 sm:grid-cols-2">
        <div>
          <div
            onClick={() => inputRef.current?.click()}
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              e.preventDefault();
              pickFile(e.dataTransfer.files?.[0] ?? null);
            }}
            className="flex h-64 cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed p-6 text-center hover:bg-muted/40"
          >
            {preview ? (
              <img
                src={preview}
                alt="Selected X-ray"
                className="max-h-full max-w-full rounded-md object-contain"
              />
            ) : (
              <div>
                <p className="text-base font-medium">Drop an X-ray here</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  or click to choose a file
                </p>
              </div>
            )}
            <input
              ref={inputRef}
              type="file"
              accept="image/png,image/jpeg"
              className="hidden"
              onChange={(e) => pickFile(e.target.files?.[0] ?? null)}
            />
          </div>
          {fileError ? (
            <p className="mt-2 text-sm text-red-600">{fileError}</p>
          ) : null}
          <div className="mt-4">
            <label className="text-sm font-medium">
              Save as a case for a patient (optional)
            </label>
            <select
              value={patientId}
              onChange={(e) => setPatientId(e.target.value)}
              className="mt-1 w-full rounded-lg border px-3 py-2 text-base"
            >
              <option value="">No patient (one-off analysis)</option>
              {patients.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.first_name} {p.last_name} ({p.mrn})
                </option>
              ))}
            </select>
          </div>
          <Button
            onClick={onAnalyze}
            disabled={!file || analyzing}
            size="lg"
            className="mt-4 w-full"
          >
            {analyzing ? "Analyzing (a few seconds)" : "Analyze"}
          </Button>
          {serverError ? (
            <p className="mt-2 text-sm text-red-600">{serverError}</p>
          ) : null}
        </div>

        <div>
          {analyzing ? (
            <div className="flex h-64 items-center justify-center rounded-xl border">
              <p className="text-sm text-muted-foreground">
                Running the model and finding literature...
              </p>
            </div>
          ) : null}
          {!analyzing && !result ? (
            <div className="flex h-64 items-center justify-center rounded-xl border text-center">
              <p className="text-sm text-muted-foreground">
                Results appear here after analysis.
              </p>
            </div>
          ) : null}
          {!analyzing && result ? <ResultsSummary result={result} /> : null}
        </div>
      </div>

      {result ? <Findings result={result} /> : null}
    </main>
  );
}

function ResultsSummary({ result }: { result: AnalysisResponse }) {
  return (
    <div className="rounded-xl border p-6">
      <p className="text-sm text-muted-foreground">Model</p>
      <p className="font-medium">{result.model_name}</p>
      <p className="mt-3 text-sm text-muted-foreground">Findings present</p>
      <p className="text-2xl font-bold">{result.num_present}</p>
      <p className="mt-4 rounded-md bg-amber-50 p-3 text-xs text-amber-900">
        {result.disclaimer}
      </p>
    </div>
  );
}

function Findings({ result }: { result: AnalysisResponse }) {
  const withHeatmap = result.findings.filter((f) => f.heatmap_base64);
  return (
    <section className="mt-10 space-y-8">
      {withHeatmap.length > 0 ? (
        <div>
          <h2 className="mb-4 text-xl font-semibold">Explained findings</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {withHeatmap.map((f) => (
              <div key={f.name} className="rounded-xl border p-3">
                <img
                  src={"data:image/png;base64," + f.heatmap_base64}
                  alt={"Heatmap for " + f.name}
                  className="w-full rounded-md"
                />
                <p className="mt-2 font-medium">{f.name}</p>
                <p className="text-sm text-muted-foreground">
                  probability {f.probability.toFixed(2)} (threshold{" "}
                  {f.threshold.toFixed(3)})
                </p>
              </div>
            ))}
          </div>
        </div>
      ) : null}

      <div>
        <h2 className="mb-4 text-xl font-semibold">All findings</h2>
        <div className="space-y-3">
          {result.findings.map((f) => (
            <div key={f.name} className="rounded-lg border p-4">
              <div className="flex items-center justify-between">
                <p className="font-medium">{f.name}</p>
                <p className="text-sm text-muted-foreground">
                  {f.probability.toFixed(2)} / thr {f.threshold.toFixed(3)}
                </p>
              </div>
              {f.articles.length > 0 ? (
                <ul className="mt-2 space-y-1">
                  {f.articles.map((a) => (
                    <li key={a.pmid} className="text-sm">
                      <a
                        href={a.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="underline"
                      >
                        {a.title}
                      </a>{" "}
                      <span className="text-muted-foreground">
                        {a.journal} ({a.year})
                      </span>
                    </li>
                  ))}
                </ul>
              ) : null}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default function AnalyzePage() {
  return (
    <Protected requireClinician>
      <AnalyzeView />
    </Protected>
  );
}
