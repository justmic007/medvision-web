"use client";

import { useAuth } from "@/lib/auth-context";
import { Protected } from "@/components/protected";
import { Button } from "@/components/ui/button";

function Dashboard() {
  const { user, logout } = useAuth();

  return (
    <main className="mx-auto w-full max-w-5xl px-4 py-6 sm:px-6 sm:py-10">
      <header className="flex flex-col gap-4 border-b pb-6 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
            MedVision AI
          </h1>
          <p className="mt-1 text-base text-muted-foreground">
            Chest X-ray decision support
          </p>
        </div>
        <div className="flex items-center justify-between gap-4 sm:justify-end">
          <div className="text-left sm:text-right">
            <p className="text-sm font-medium sm:text-base">{user?.email}</p>
            <p className="text-sm capitalize text-muted-foreground">
              {user?.role}
            </p>
          </div>
          <Button variant="outline" size="lg" onClick={() => logout()}>
            Sign out
          </Button>
        </div>
      </header>

      <section className="mt-10">
        <div className="rounded-xl border p-6 sm:p-8">
          <h2 className="text-lg font-semibold sm:text-xl">Welcome back</h2>
          <p className="mt-2 text-base text-muted-foreground">
            You are signed in as a {user?.role}.
          </p>
                    <div className="mt-4 flex flex-wrap gap-3">
            <a
              href="/analyze"
              className="inline-block rounded-lg bg-foreground px-5 py-2.5 text-sm font-medium text-background"
            >
              Analyze a chest X-ray
            </a>
            <a
              href="/patients"
              className="inline-block rounded-lg border px-5 py-2.5 text-sm font-medium"
            >
              Patients
            </a>
          </div>
        </div>
      </section>
    </main>
  );
}

export default function Home() {
  return (
    <Protected>
      <Dashboard />
    </Protected>
  );
}
