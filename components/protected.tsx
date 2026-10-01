"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";

/**
 * Wrap any page/section that requires authentication. While the session is
 * resolving it shows a loading state; if there's no user it redirects to /login.
 */
export function Protected({
  children,
  requireAdmin = false,
  requireClinician = false,
}: {
  children: React.ReactNode;
  requireAdmin?: boolean;
  requireClinician?: boolean;
}) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;
    if (!user) {
      router.replace("/login");
    } else if (requireAdmin && user.role !== "admin") {
      router.replace("/");
    } else if (requireClinician && user.role !== "clinician") {
      router.replace("/");
    }
  }, [loading, user, requireAdmin, router]);

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center">
        <p className="text-sm text-muted-foreground">Loading…</p>
      </main>
    );
  }

  if (!user) return null; // redirecting
  if (requireAdmin && user.role !== "admin") return null; // redirecting
  if (requireClinician && user.role !== "clinician") return null; // redirecting

  return <>{children}</>;
}
