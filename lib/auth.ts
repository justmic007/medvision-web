// Auth API calls. The refresh token lives in an httpOnly cookie the browser
// manages automatically; we only handle the in-memory access token here.

import { api } from "@/lib/api";
import type { DemoRole } from "@/lib/demo-accounts";
import type { AccessTokenResponse, User } from "@/types/auth";

export function login(email: string, password: string) {
  return api<AccessTokenResponse>("/auth/login", {
    method: "POST",
    body: { email, password },
  });
}

// Role-only demo sign-in. Sends just { role }; the backend resolves it to a
// flagged demo account and sets the same httpOnly refresh cookie as /login.
// No email or password is ever sent from the client.
export function demoLogin(role: DemoRole) {
  return api<AccessTokenResponse>("/auth/demo-login", {
    method: "POST",
    body: { role },
  });
}

export function register(email: string, password: string) {
  return api<User>("/auth/register", {
    method: "POST",
    body: { email, password },
  });
}

export function logout() {
  return api<{ message: string }>("/auth/logout", { method: "POST" });
}

export function getMe() {
  return api<User>("/auth/me");
}

// Exchange the httpOnly refresh cookie for a new access token.
export function refreshAccessToken() {
  return api<AccessTokenResponse>("/auth/refresh", { method: "POST" });
}
