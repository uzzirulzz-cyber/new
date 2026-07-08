"use client";

import { useAuth } from "@/hooks/use-auth";
import { Loader2 } from "lucide-react";
import { AuthScreen } from "@/components/auth/auth-screen";
import { ForcePasswordChange } from "@/components/auth/force-password-change";
import { CustomerShell } from "@/components/customer/customer-shell";
import { AgentShell } from "@/components/agent/agent-shell";
import { AdminShell } from "@/components/admin/admin-shell";

export default function Home() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-[#030712] to-[#0f172a]">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-amber-500 mx-auto" />
          <p className="mt-3 text-sm text-muted-foreground">Loading BlockExchange.buzz...</p>
        </div>
      </div>
    );
  }

  // Not authenticated → show login/register
  if (!user) {
    return <AuthScreen />;
  }

  // Force password change on first login (e.g. sub-agents with default password)
  if (user.mustChangePassword) {
    return <ForcePasswordChange />;
  }

  // Route by role
  if (user.role === "ADMIN" || user.role === "SUPER_ADMIN") {
    return <AdminShell />;
  }

  if (user.role === "AGENT") {
    return <AgentShell />;
  }

  // Regular customer
  return <CustomerShell />;
}
