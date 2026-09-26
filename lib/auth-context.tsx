"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { setAccessToken } from "@/lib/api";
import {
  login as apiLogin,
  logout as apiLogout,
  getMe,
  refreshAccessToken,
} from "@/lib/auth";
import type { User } from "@/types/auth";

interface AuthState {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthState | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // On load, try to restore the session: refresh (via cookie) -> /auth/me.
  useEffect(() => {
    (async () => {
      try {
        const { access_token } = await refreshAccessToken();
        setAccessToken(access_token);
        const me = await getMe();
        setUser(me);
      } catch {
        setAccessToken(null);
        setUser(null);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  async function login(email: string, password: string) {
    const { access_token } = await apiLogin(email, password);
    setAccessToken(access_token);
    const me = await getMe();
    setUser(me);
  }

  async function logout() {
    try {
      await apiLogout();
    } finally {
      setAccessToken(null);
      setUser(null);
    }
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
