"use client";

import { useAuth } from "@/lib/auth-context";
import { Protected } from "@/components/protected";
import { AppHeader } from "@/components/app-header";

function Dashboard() {
  const { user } = useAuth();
  const isClinician = user?.role === "clinician";
  const isAdmin = user?.role === "admin";

  return (
    <div className="min-h-screen">
      <AppHeader />
      <main className="mx-auto w-full max-w-5xl px-4 py-10 sm:px-6 sm:py-14">
        <p className="font-mono text-xs uppercase tracking-widest text-primary">
          {user?.role} workspace
        </p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">
          {isClinician ? "What would you like to do?" : "Manage access"}
        </h1>
        <p className="mt-2 max-w-xl text-muted-foreground">
          {isClinician
            ? "Analyze a chest radiograph, or review your patients and their case history."
            : "Review and manage clinician access to the platform."}
        </p>

        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {isClinician ? (
            <>
              <ActionCard
                href="/analyze"
                title="Analyze a chest X-ray"
                body="Upload a radiograph for findings, visual explanation, and cited evidence."
                primary
              />
              <ActionCard
                href="/patients"
                title="Patients"
                body="Your patient records and their saved case history."
              />
            </>
          ) : null}
          {isAdmin ? (
            <ActionCard
              href="/admin"
              title="Clinicians"
              body="Approve, suspend, or reinstate clinician access."
              primary
            />
          ) : null}
        </div>
      </main>
    </div>
  );
}

function ActionCard({
  href,
  title,
  body,
  primary = false,
}: {
  href: string;
  title: string;
  body: string;
  primary?: boolean;
}) {
  return (
    <a
      href={href}
      className={
        "group flex flex-col rounded-xl border p-6 transition-colors " +
        (primary
          ? "border-primary/30 bg-primary/5 hover:bg-primary/10"
          : "hover:bg-muted/50")
      }
    >
      <h2 className="text-lg font-semibold">{title}</h2>
      <p className="mt-1 text-sm text-muted-foreground">{body}</p>
      <span
        className={
          "mt-4 text-sm font-medium " +
          (primary ? "text-primary" : "text-foreground")
        }
      >
        Open
      </span>
    </a>
  );
}

export default function Home() {
  return (
    <Protected>
      <Dashboard />
    </Protected>
  );
}
