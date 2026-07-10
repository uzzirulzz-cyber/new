"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

export type View =
  | "home" | "login" | "register" | "trade"
  | "admin" | "admin-login" | "subagent"
  | "wallet" | "markets" | "watchlist" | "assets"
  | "deposit" | "withdraw" | "history"
  | "profile" | "notifications" | "settings";

export type Role = "CUSTOMER" | "SUB_AGENT" | "SUPER_ADMIN";

export interface AuthUser {
  id: string;
  uid: string;
  email: string;
  name: string;
  phone: string | null;
  country: string | null;
  role: Role;
  status: string;
  kycStatus: string;
  balance: number;
  vipLevel: number;
  invitationCode: string | null;
  referralCode: string;
  linkedSubAgentId: string | null;
  mustChangePassword: boolean;
  registeredAt: string;
  lastLoginAt: string | null;
}

interface AuthState {
  user: AuthUser | null;
  view: View;
  setUser: (user: AuthUser | null) => void;
  navigate: (view: View) => void;
  logout: () => void;
  apiFetch: (url: string, options?: RequestInit) => Promise<Response>;
}

const ALLOWED_VIEWS: View[] = [
  "home", "login", "register", "trade",
  "admin", "admin-login", "subagent",
  "wallet", "markets", "watchlist", "assets",
  "deposit", "withdraw", "history",
  "profile", "notifications", "settings",
];

function gateView(view: View, user: AuthUser | null): View {
  // Staff-only views
  if (view === "admin" && (!user || user.role !== "SUPER_ADMIN")) return "admin-login";
  if (view === "subagent" && (!user || user.role !== "SUB_AGENT")) return "login";
  if (view === "admin-login" && user?.role === "SUPER_ADMIN") return "admin";
  if (view === "admin-login" && user?.role === "SUB_AGENT") return "subagent";

  // Customer-only views (require auth)
  const customerViews: View[] = ["trade", "wallet", "deposit", "withdraw", "history", "profile", "notifications", "settings", "watchlist", "assets"];
  if (customerViews.includes(view) && !user) return "login";
  if (customerViews.includes(view) && user && (user.role === "SUPER_ADMIN" || user.role === "SUB_AGENT")) {
    return user.role === "SUPER_ADMIN" ? "admin" : "subagent";
  }

  return view;
}

export const useAuth = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      view: "home",

      setUser: (user) => {
        set({ user });
        // Auto-navigate based on role after login
        if (user) {
          if (user.role === "SUPER_ADMIN") set({ view: "admin" });
          else if (user.role === "SUB_AGENT") set({ view: "subagent" });
          else if (get().view === "login" || get().view === "register") set({ view: "trade" });
        }
      },

      navigate: (view) => {
        const user = get().user;
        const gated = gateView(view, user);
        set({ view: gated });
      },

      logout: () => {
        set({ user: null, view: "home" });
      },

      apiFetch: async (url, options) => {
        const userId = get().user?.id || "";
        const headers: Record<string, string> = {
          "Content-Type": "application/json",
          "x-user-id": userId,
          ...(options?.headers as Record<string, string>),
        };
        return fetch(url, { ...options, headers });
      },
    }),
    {
      name: "brock-exchange-auth",
      version: 1,
      partialize: (state) => ({ user: state.user, view: state.view }),
      // Migrate: drop stale localStorage from old versions
      migrate: (persistedState: any, version: number) => {
        if (version < 1) return { user: null, view: "home" };
        return persistedState;
      },
    }
  )
);
