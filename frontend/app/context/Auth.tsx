// Simple auth context that stores token/email in memory.
// You can later persist it with AsyncStorage if needed.
import React, { createContext, useContext, useState, ReactNode } from "react";

type User = { email: string } | null;

type AuthCtx = {
  user: User;
  token: string | null;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  signOut: () => void;
  authHeader: () => Record<string, string>;
};

const AuthContext = createContext<AuthCtx | null>(null);

const API_BASE = process.env.EXPO_PUBLIC_API_BASE!;

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<User>(null);

  const authHeader = () => (token ? { Authorization: `Bearer ${token}` } : {});

  async function signIn(email: string, password: string) {
    const res = await fetch(`${API_BASE}/auth/signin`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password })
    });
    if (!res.ok) {
      const msg = (await res.json().catch(() => ({} as any)))?.detail || "Sign in failed";
      throw new Error(String(msg));
    }
    const data = await res.json();
    setToken(data.access_token);
    setUser({ email });
  }

  async function signUp(email: string, password: string) {
    const res = await fetch(`${API_BASE}/auth/signup`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password })
    });
    if (!res.ok) {
      const msg = (await res.json().catch(() => ({} as any)))?.detail || "Sign up failed";
      throw new Error(String(msg));
    }
    // auto sign-in after sign-up
    await signIn(email, password);
  }

  function signOut() {
    setToken(null);
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ user, token, signIn, signUp, signOut, authHeader }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
