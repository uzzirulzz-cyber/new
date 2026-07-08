"use client";

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from "react";

export interface AuthUser {
  id: string;
  uid: string;
  email: string;
  name: string;
  mobile: string | null;
  country: string | null;
  role: "USER" | "AGENT" | "ADMIN" | "SUPER_ADMIN";
  status: "ACTIVE" | "PENDING" | "SUSPENDED" | "BANNED" | "FROZEN";
  kycStatus: "UNVERIFIED" | "PENDING" | "VERIFIED" | "REJECTED";
  referralCode: string;
  invitationCode: string | null;
  profilePhoto: string | null;
  lastLogin: string | null;
  lastLoginIp: string | null;
  createdAt: string;
}

export interface WalletInfo {
  available: number;
  frozen: number;
  totalProfit: number;
  todayProfit: number;
  totalAssets: number;
}

interface AuthContextValue {
  user: AuthUser | null;
  wallet: WalletInfo | null;
  loading: boolean;
  refresh: () => Promise<void>;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  register: (data: {
    invitationCode: string;
    name: string;
    email: string;
    mobile: string;
    password: string;
    confirmPassword: string;
  }) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [wallet, setWallet] = useState<WalletInfo | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    try {
      const res = await fetch("/api/auth/me", { cache: "no-store" });
      if (!res.ok) {
        setUser(null);
        setWallet(null);
        return;
      }
      const data = await res.json();
      setUser(data.user);
      setWallet(data.wallet);
    } catch {
      setUser(null);
      setWallet(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const login = useCallback(async (email: string, password: string) => {
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) return { success: false, error: data.error || "Login failed" };
      await refresh();
      return { success: true };
    } catch (e: any) {
      return { success: false, error: e.message };
    }
  }, [refresh]);

  const register = useCallback(async (regData: any) => {
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(regData),
      });
      const data = await res.json();
      if (!res.ok) return { success: false, error: data.error || "Registration failed" };
      await refresh();
      return { success: true };
    } catch (e: any) {
      return { success: false, error: e.message };
    }
  }, [refresh]);

  const logout = useCallback(async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    setUser(null);
    setWallet(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, wallet, loading, refresh, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
