"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Protected } from "@/components/protected";
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

  // Fetch the stored scan as an authenticated blob, then show it inline.
  useEffect(() => {
    let revoked: string | null = null;
    getScanBlob(id)
      .then((blob) => {
        const url = URL.createObjectURL(blob);
        revoked = url;
        setScanUrl(url);
      })
      .catch(() => setScanUrl(null)); // no scan or fetch failed; hide the image
    return () => {
      if (revoked) URL.revokeObjectURL(revoked);
    };
  }, [id]);

  function downloadScan() {
    if (!scanUrl) return;
    const a = document.createElement("a");
    a.href = scanUrl;
    a.download = `scan-${id}.jpg`;
    document.body.appendChild(a);
    a.click();
    a.remove();
  }

  if (loading) {
    return (
      <main className="mx-auto w-full max-w-4xl px-4 py-10">
        <p className="text-sm text-muted-foreground">Loading...</p>
      </main>
    );
  }

  if (error || !c) {
    return (
      <main className="mx-auto w-full max-w-4xl px-4 py-10">
        <p className="text-sm text-red-600">{error || "Case not found."}</p>
        <a href="/patients" className="mt-4 inline-block text-sm underline">
          Back to patients
        </a>
      </main>
    );
  }

  return (
    <main className="mx-auto w-full max-w-4xl px-4 py-6 sm:px-6 sm:py-10">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
            Case
          </h1>
          <p className="mt-1 text-base text-muted-foreground">
            {new Date(c.created_at).toLocaleString()} &middot; {c.model_name}
          </p>
        </div>
        <a href={"/patients/" + c.patient_id} className="text-sm underline">
          Patient
        </a>
      </div>

      <div className="mb-6 grid gap-6 sm:grid-cols-2">
        {/* The analyzed scan, shown inline */}
        <div className="rounded-xl border p-3">
          {scanUrl ? (
            <img
              src={scanUrl}
              alt="Analyzed chest X-ray"
              className="w-full rounded-md object-contain"
            />
          ) : (
            <div className="flex h-48 items-center justify-center text-sm text-muted-foreground">
              Scan unavailable
            </div>
          )}
          {scanUrl ? (
            <button
              onClick={downloadScan}
              className="mt-3 w-full rounded-lg border px-4 py-2 text-sm font-medium"
            >
              Download original scan
            </button>
          ) : null}
        </div>

        {/* Summary */}
        <div className="rounded-xl border p-6">
          <p className="text-sm text-muted-foreground">Findings present</p>
          <p className="text-2xl font-bold">{c.results.num_present}</p>
          <p className="mt-4 rounded-md bg-amber-50 p-3 text-xs text-amber-900">
            {c.results.disclaimer}
          </p>
        </div>
      </div>

      <h2 className="mb-3 text-xl font-semibold">All findings</h2>
      <div className="space-y-3">
        {c.results.findings.map((f) => (
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
    </main>
  );
}

export default function CaseDetailPage() {
  return (
    <Protected>
      <CaseDetailView />
    </Protected>
  );
}
