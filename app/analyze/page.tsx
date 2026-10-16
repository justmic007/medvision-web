"use client";

import { useEffect, useRef, useState } from "react";
import { Protected } from "@/components/protected";
import { AppHeader } from "@/components/app-header";
import { Button } from "@/components/ui/button";
import { ApiError } from "@/lib/api";
import { analyzeImage } from "@/lib/analysis";
import { listPatients } from "@/lib/patients";
import { validateImageFile } from "@/lib/validation";
import type { AnalysisResponse } from "@/types/analysis";
import type { Patient } from "@/types/patient";

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
    <div className="min-h-screen">
      <AppHeader />
      <main className="mx-auto w-full max-w-5xl px-4 py-10 sm:px-6">
        <p className="font-mono text-xs uppercase tracking-widest text-primary">
          Analysis
        </p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight">
          Analyze a chest X-ray
        </h1>
        <p className="mt-2 text-muted-foreground">
          Upload a frontal chest radiograph (PNG or JPG, up to 10 MB).
        </p>

        <div className="mt-8 grid gap-6 lg:grid-cols-2">
          {/* Upload */}
          <div>
            <div
              onClick={() => inputRef.current?.click()}
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault();
                pickFile(e.dataTransfer.files?.[0] ?? null);
              }}
              className="flex h-72 cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-border p-6 text-center transition-colors hover:border-primary/40 hover:bg-primary/5"
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
              <p className="mt-2 text-sm text-destructive">{fileError}</p>
            ) : null}

            <div className="mt-5">
              <label htmlFor="patient" className="text-sm font-medium">
                Save as a case for a patient{" "}
                <span className="text-muted-foreground">(optional)</span>
              </label>
              <select
                id="patient"
                value={patientId}
                onChange={(e) => setPatientId(e.target.value)}
                className="mt-1.5 w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm focus:border-ring focus:ring-2 focus:ring-ring/30 focus:outline-none"
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
              className="mt-5 w-full"
            >
              {analyzing ? "Analyzing — a few seconds" : "Analyze"}
            </Button>
            {serverError ? (
              <p className="mt-2 text-sm text-destructive">{serverError}</p>
            ) : null}
          </div>

          {/* Result pane */}
          <div>
            {analyzing ? (
              <div className="flex h-72 items-center justify-center rounded-xl border border-border">
                <p className="text-sm text-muted-foreground">
                  Running the model and finding literature...
                </p>
              </div>
            ) : null}
            {!analyzing && !result ? (
              <div className="flex h-72 items-center justify-center rounded-xl border border-dashed border-border text-center">
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
    </div>
  );
}

function ResultsSummary({ result }: { result: AnalysisResponse }) {
  return (
    <div className="rounded-xl border border-border p-6">
      <div className="flex items-baseline justify-between">
        <span className="text-sm text-muted-foreground">Findings present</span>
        <span className="font-mono text-xs text-muted-foreground">
          {result.model_name}
        </span>
      </div>
      <p className="mt-1 text-4xl font-semibold tabular-nums">
        {result.num_present}
      </p>
      <p className="mt-5 rounded-lg border-l-2 border-amber-400 bg-amber-50 p-3 text-xs leading-relaxed text-amber-900">
        {result.disclaimer}
      </p>
    </div>
  );
}

function ExternalLinkIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      className="ml-1 inline-block h-3 w-3 shrink-0 align-[-0.1em]"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.25"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
      <polyline points="15 3 21 3 21 9" />
      <line x1="10" y1="14" x2="21" y2="3" />
    </svg>
  );
}

// Confidence bar: fill to the model's confidence, with a marker at the 50%
// operating point (the present/absent boundary). Fill past the marker = stronger.
function ConfidenceBar({ value }: { value: number }) {
  const pct = Math.max(0, Math.min(100, value * 100));
  return (
    <div className="relative mt-2 h-1.5 w-full rounded-full bg-muted">
      <div
        className="absolute inset-y-0 left-0 rounded-full bg-primary/85"
        style={{ width: `${pct}%` }}
      />
      <div
        className="absolute -inset-y-1 w-px bg-foreground/50"
        style={{ left: "50%" }}
        title="Operating point (50%)"
      />
    </div>
  );
}

function pctLabel(p: number) {
  return `${Math.round(p * 100)}% confidence`;
}

function humanizeName(name: string) {
  return name.replace(/_/g, " ");
}

function Findings({ result }: { result: AnalysisResponse }) {
  const withHeatmap = result.findings.filter((f) => f.heatmap_base64);
  return (
    <section className="mt-12 space-y-10">
      {withHeatmap.length > 0 ? (
        <div>
          <h2 className="text-xl font-semibold">Explained findings</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Where the model looked, for the most salient findings.
          </p>
          <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {withHeatmap.map((f) => (
              <div
                key={f.name}
                className="overflow-hidden rounded-xl border border-border"
              >
                <img
                  src={"data:image/png;base64," + f.heatmap_base64}
                  alt={"Heatmap for " + f.name}
                  className="w-full"
                />
                <div className="p-3">
                  <p className="font-medium">{humanizeName(f.name)}</p>
                  <p className="font-mono text-xs text-muted-foreground">
                    {pctLabel(f.probability)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : null}

      <div>
        <h2 className="text-xl font-semibold">Detected findings</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Confidence is the model&rsquo;s score for each pathology. A finding is
          shown when confidence reaches the 50% operating point (the marker on
          each bar); the further past it, the stronger the signal.
        </p>
        {result.findings.length === 0 ? (
          <div className="mt-4 rounded-xl border border-dashed border-border p-6 text-center">
            <p className="text-sm text-muted-foreground">
              No findings reached the operating point for this image.
            </p>
          </div>
        ) : (
          <div className="mt-4 divide-y divide-border rounded-xl border border-border">
            {result.findings.map((f) => (
              <div key={f.name} className="p-4">
                <div className="flex items-baseline justify-between gap-4">
                  <p className="font-medium">{humanizeName(f.name)}</p>
                  <p className="shrink-0 font-mono text-xs font-semibold tabular-nums">
                    {pctLabel(f.probability)}
                  </p>
                </div>
                <ConfidenceBar value={f.probability} />
                {f.articles.length > 0 ? (
                  <ul className="mt-3 space-y-1.5">
                    {f.articles.map((a) => (
                      <li key={a.pmid} className="text-sm leading-relaxed">
                        <a
                          href={a.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="font-medium text-primary underline decoration-primary/50 decoration-1 underline-offset-2 transition-colors hover:text-primary/80 hover:decoration-primary"
                        >
                          {a.title}
                          <ExternalLinkIcon />
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
        )}
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
