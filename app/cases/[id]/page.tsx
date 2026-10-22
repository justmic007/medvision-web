"use client";

import Link from "next/link";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Protected } from "@/components/protected";
import { AppHeader } from "@/components/app-header";
import { ApiError } from "@/lib/api";
import { getCase, getScanBlob } from "@/lib/patients";
import type { CaseDetail } from "@/types/patient";

function CaseDetailView() {
  const params = useParams<{ id: string }>();
  const id = params.id;
  const [c, setC] = useState<CaseDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [scanUrl, setScanUrl] = useState<string | null>(null);

  useEffect(() => {
    getCase(id)
      .then(setC)
      .catch((e) =>
        setError(e instanceof ApiError ? e.message : "Failed to load case.")
      )
      .finally(() => setLoading(false));
  }, [id]);

  useEffect(() => {
    let revoked: string | null = null;
    getScanBlob(id)
      .then((blob) => {
        const url = URL.createObjectURL(blob);
        revoked = url;
        setScanUrl(url);
      })
      .catch(() => setScanUrl(null));
    return () => {
      if (revoked) URL.revokeObjectURL(revoked);
    };
  }, [id]);

  function downloadScan() {
    if (!scanUrl) return;
    const a = document.createElement("a");
    a.href = scanUrl;
    a.download = "scan-" + id + ".jpg";
    document.body.appendChild(a);
    a.click();
    a.remove();
  }

  return (
    <div className="min-h-screen">
      <AppHeader />
      <main className="mx-auto w-full max-w-4xl px-4 py-10 sm:px-6">
        {loading ? (
          <p className="text-sm text-muted-foreground">Loading...</p>
        ) : error || !c ? (
          <p className="text-sm text-destructive">{error || "Case not found."}</p>
        ) : (
          <>
            <Link
              href={"/patients/" + c.patient_id}
              className="text-sm font-medium text-muted-foreground hover:text-foreground"
            >
              Back to patient
            </Link>
            <div className="mt-4">
              <p className="font-mono text-xs uppercase tracking-widest text-primary">
                Case
              </p>
              <h1 className="mt-2 text-3xl font-semibold tracking-tight">
                {new Date(c.created_at).toLocaleString()}
              </h1>
              <p className="mt-1 font-mono text-xs text-muted-foreground">
                {c.model_name}
              </p>
            </div>

            <div className="mt-8 grid gap-6 sm:grid-cols-2">
              <div className="overflow-hidden rounded-xl border border-border">
                {scanUrl ? (
                  <img
                    src={scanUrl}
                    alt="Analyzed chest X-ray"
                    className="w-full object-contain"
                  />
                ) : (
                  <div className="flex h-56 items-center justify-center text-sm text-muted-foreground">
                    Scan unavailable
                  </div>
                )}
                {scanUrl ? (
                  <button
                    onClick={downloadScan}
                    className="w-full border-t border-border py-2.5 text-sm font-medium transition-colors hover:bg-muted"
                  >
                    Download original scan
                  </button>
                ) : null}
              </div>

              <div className="rounded-xl border border-border p-6">
                <span className="text-sm text-muted-foreground">
                  Findings present
                </span>
                <p className="mt-1 text-4xl font-semibold tabular-nums">
                  {c.results.num_present}
                </p>
                <p className="mt-5 rounded-lg border-l-2 border-amber-400 bg-amber-50 p-3 text-xs leading-relaxed text-amber-900">
                  {c.results.disclaimer}
                </p>
              </div>
            </div>

            <h2 className="mt-12 text-xl font-semibold">Detected findings</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Confidence is the model&rsquo;s score for each pathology. A finding is
              shown when confidence reaches the 50% operating point (the marker on
              each bar); the further past it, the stronger the signal.
            </p>
            <div className="mt-4 divide-y divide-border rounded-xl border border-border">
              {(c.results.findings ?? []).map((f) => (
                <div key={f.name} className="p-4">
                  <div className="flex items-baseline justify-between gap-4">
                    <p className="font-medium">{humanizeName(f.name)}</p>
                    <p className="shrink-0 font-mono text-xs font-semibold tabular-nums">
                      {pctLabel(f.probability)}
                    </p>
                  </div>
                  <ConfidenceBar value={f.probability} />
                  {f.articles && f.articles.length > 0 ? (
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
          </>
        )}
      </main>
    </div>
  );
}

function humanizeName(name: string) {
  return (name ?? "").replace(/_/g, " ");
}

function pctLabel(p: number) {
  return Number.isFinite(p) ? `${Math.round(p * 100)}% confidence` : "—";
}

function ConfidenceBar({ value }: { value: number }) {
  const pct = Number.isFinite(value) ? Math.max(0, Math.min(100, value * 100)) : 0;
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

export default function CaseDetailPage() {
  return (
    <Protected requireClinician>
      <CaseDetailView />
    </Protected>
  );
}
