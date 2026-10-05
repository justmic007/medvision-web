"use client";

import { usePathname } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { Button } from "@/components/ui/button";

type NavItem = { href: string; label: string };

const CLINICIAN_NAV: NavItem[] = [
  { href: "/analyze", label: "Analyze" },
  { href: "/patients", label: "Patients" },
];
const ADMIN_NAV: NavItem[] = [{ href: "/admin", label: "Clinicians" }];

export function AppHeader() {
  const { user, logout } = useAuth();
  const pathname = usePathname();

  const nav =
    user?.role === "admin"
      ? ADMIN_NAV
      : user?.role === "clinician"
      ? CLINICIAN_NAV
      : [];

  function isActive(href: string) {
    // Active if the path is the link or a child of it (e.g. /patients/123).
    return pathname === href || pathname.startsWith(href + "/");
  }

  return (
    <header className="sticky top-0 z-10 border-b bg-background/80 backdrop-blur">
      <div className="mx-auto flex w-full max-w-5xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
        <div className="flex items-center gap-8">
          <a href="/dashboard" className="flex items-baseline gap-2">
            <span className="text-lg font-semibold tracking-tight">
              MedVision
            </span>
            <span className="font-mono text-xs uppercase tracking-widest text-primary">
              AI
            </span>
          </a>
          <nav className="hidden items-center gap-1 sm:flex">
            {nav.map((item) => (
              <a
                key={item.href}
                href={item.href}
                className={
                  "rounded-md px-3 py-1.5 text-sm font-medium transition-colors " +
                  (isActive(item.href)
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground")
                }
              >
                {item.label}
              </a>
            ))}
          </nav>
        </div>

        <div className="flex items-center gap-4">
          <div className="hidden text-right sm:block">
            <p className="text-sm font-medium">{user?.email}</p>
            <p className="font-mono text-[11px] uppercase tracking-wider text-muted-foreground">
              {user?.role}
            </p>
          </div>
          <Button variant="outline" size="sm" onClick={() => logout()}>
            Sign out
          </Button>
        </div>
      </div>

      {/* Mobile nav row */}
      {nav.length > 0 ? (
        <nav className="flex items-center gap-1 border-t px-4 py-2 sm:hidden">
          {nav.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className={
                "rounded-md px-3 py-1.5 text-sm font-medium transition-colors " +
                (isActive(item.href)
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:bg-muted")
              }
            >
              {item.label}
            </a>
          ))}
        </nav>
      ) : null}
    </header>
  );
}
