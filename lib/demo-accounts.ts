// Public demo roles backing the one-click "Explore" buttons on the landing page.
//
// There are NO credentials here or anywhere in the frontend bundle. The backend
// endpoint POST /auth/demo-login takes only { role } and maps it, server-side,
// to a dedicated demo account (flagged is_demo, on a separate demo domain, with
// a random password nobody needs to know). Demo passwords never ship in JS.

export const DEMO_ROLES = ["clinician", "admin"] as const;
export type DemoRole = (typeof DEMO_ROLES)[number];

export const DEMO_ROLE_LABELS: Record<DemoRole, string> = {
  clinician: "Explore as a clinician",
  admin: "Explore as an admin",
};
