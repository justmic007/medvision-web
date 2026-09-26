// Auth API calls. The refresh token lives in an httpOnly cookie the browser
// manages automatically; we only handle the in-memory access token here.

import { api } from "@/lib/api";
import type { AccessTokenResponse, User } from "@/types/auth";

export function login(email: string, password: string) {
  return api<AccessTokenResponse>("/auth/login", {
    method: "POST",
    body: { email, password },
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
