"use client";

import { useAuth } from "@/hooks/use-auth";
import { Loader2 } from "lucide-react";
import { AuthScreen } from "@/components/auth/auth-screen";
import { CustomerShell } from "@/components/customer/customer-shell";
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

  // Admin / Super Admin → admin console
  if (user.role === "ADMIN" || user.role === "SUPER_ADMIN") {
    return <AdminShell />;
  }

  // Regular user / agent → customer storefront
  return <CustomerShell />;
}
