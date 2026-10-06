"use client";

import Link from "next/link";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";

const GITHUB_API = "https://github.com/justmic007/medvision-api";
const GITHUB_WEB = "https://github.com/justmic007/medvision-web";

// Demo accounts (synthetic data) backing the one-click Explore buttons.
const DEMO = {
  clinician: { email: "demo-clinician@medvision.dev", password: "DemoPass123!" },
  admin: { email: "demo-admin@medvision.dev", password: "DemoPass123!" },
};

export default function LandingPage() {
  const { user, login } = useAuth();
  const router = useRouter();
  const [busy, setBusy] = useState<"clinician" | "admin" | null>(null);
  const [error, setError] = useState("");

  // Already signed in? Go straight to the app.
  useEffect(() => {
    if (user) router.replace("/dashboard");
  }, [user, router]);

  async function explore(role: "clinician" | "admin") {
    setBusy(role);
    setError("");
    try {
      await login(DEMO[role].email, DEMO[role].password);
      router.push("/dashboard");
    } catch {
      setError(
        "Could not start the demo. The server may be waking up — give it ~30s and try again."
      );
      setBusy(null);
    }
  }

  return (
    <div className="min-h-screen">
      {/* Top bar */}
      <header className="border-b">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-4 py-4 sm:px-6">
          <div className="flex items-baseline gap-2">
            <span className="text-lg font-semibold tracking-tight">MedVision</span>
            <span className="font-mono text-xs uppercase tracking-widest text-primary">
              AI
            </span>
          </div>
          <div className="flex items-center gap-4 text-sm">
            <a href={GITHUB_WEB} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-foreground">
              GitHub
            </a>
            <Link href="/login" className="font-medium text-primary hover:underline">
              Sign in
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <main className="mx-auto w-full max-w-6xl px-4 sm:px-6">
        <section className="py-16 sm:py-24">
          <p className="font-mono text-xs uppercase tracking-widest text-primary">
            Chest X-ray decision support
          </p>
          <h1 className="mt-3 max-w-3xl text-4xl font-semibold tracking-tight sm:text-5xl">
            See what the model sees — and the evidence behind it.
          </h1>
          <p className="mt-5 max-w-2xl text-lg text-muted-foreground">
            MedVision AI analyzes a frontal chest radiograph across 18 findings,
            shows a GradCAM heatmap of <em>where</em> each finding is grounded in
            the image, and links peer-reviewed literature for every finding. It
            is a decision-support prototype — non-diagnostic, with the clinician
            always in the loop.
          </p>

          {/* One-click demo */}
          <div className="mt-10 flex flex-col gap-3 sm:flex-row">
            <button
              onClick={() => explore("clinician")}
              disabled={busy !== null}
              className="inline-flex items-center justify-center rounded-lg bg-primary px-6 py-3 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-60"
            >
              {busy === "clinician" ? "Starting demo…" : "Explore as a clinician"}
            </button>
            <button
              onClick={() => explore("admin")}
              disabled={busy !== null}
              className="inline-flex items-center justify-center rounded-lg border border-border px-6 py-3 text-sm font-medium transition-colors hover:bg-muted disabled:opacity-60"
            >
              {busy === "admin" ? "Starting demo…" : "Explore as an admin"}
            </button>
          </div>
          {error ? (
            <p className="mt-3 text-sm text-destructive">{error}</p>
          ) : (
            <p className="mt-3 text-xs text-muted-foreground">
              One click — no sign-up. Demo accounts use synthetic data only.
            </p>
          )}
        </section>

        {/* What it does */}
        <section className="grid gap-6 border-t py-16 sm:grid-cols-3">
          <Feature
            title="Multi-finding classification"
            body="A TorchXRayVision DenseNet scores 18 pathologies per radiograph, with per-finding probabilities and published operating points."
          />
          <Feature
            title="Visual explainability"
            body="GradCAM heatmaps show where each finding is localized, so a clinician can audit the model rather than trust a black box."
          />
          <Feature
            title="Evidence grounding"
            body="Each finding links cited PubMed literature, connecting the output to peer-reviewed sources."
          />
        </section>

        {/* Honest framing */}
        <section className="border-t py-16">
          <h2 className="text-2xl font-semibold tracking-tight">
            Built to be trusted, not to replace judgement
          </h2>
          <div className="mt-6 grid gap-6 sm:grid-cols-2">
            <div className="rounded-xl border-l-2 border-amber-400 bg-amber-50 p-4 text-sm leading-relaxed text-amber-900">
              Research/educational prototype. NOT a diagnostic tool. Outputs are
              not a substitute for evaluation by a qualified clinician. All data
              is public or synthetic.
            </div>
            <p className="text-sm leading-relaxed text-muted-foreground">
              Evaluated on the NIH ChestX-ray14 public sample (mean AUC 0.76
              across 13 findings), with honest per-finding reporting of where the
              model is strong and where it is weak. The analysis core is
              deterministic and auditable, and a clinician stays in the loop by design.
            </p>
          </div>
        </section>

        {/* Stack + links */}
        <section className="border-t py-16">
          <h2 className="text-2xl font-semibold tracking-tight">Under the hood</h2>
          <p className="mt-3 max-w-2xl text-sm text-muted-foreground">
            FastAPI + TorchXRayVision backend, Next.js frontend, Postgres,
            S3-compatible object storage, JWT auth with an httpOnly-cookie session,
            and role-based access control with a clinician approval lifecycle.
          </p>
          <div className="mt-6 flex flex-wrap gap-4 text-sm">
            <a href={GITHUB_API} target="_blank" rel="noopener noreferrer" className="inline-flex items-center rounded-lg border border-border px-4 py-2 font-medium hover:bg-muted">
              Backend repo →
            </a>
            <a href={GITHUB_WEB} target="_blank" rel="noopener noreferrer" className="inline-flex items-center rounded-lg border border-border px-4 py-2 font-medium hover:bg-muted">
              Frontend repo →
            </a>
          </div>
        </section>
      </main>

      <footer className="border-t">
        <div className="mx-auto w-full max-w-6xl px-4 py-8 text-xs text-muted-foreground sm:px-6">
          MedVision AI — research/educational prototype. Non-diagnostic. Synthetic
          and public data only.
        </div>
      </footer>
    </div>
  );
}

function Feature({ title, body }: { title: string; body: string }) {
  return (
    <div>
      <h3 className="font-semibold">{title}</h3>
      <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{body}</p>
    </div>
  );
}
