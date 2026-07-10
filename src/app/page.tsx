"use client";

import { useAuth } from "@/lib/auth-store";
import { Navbar } from "@/components/brockexchange/navbar";
import { Footer } from "@/components/brockexchange/footer";
import { HomeView } from "@/components/brockexchange/home-view";
import { AuthView } from "@/components/brockexchange/auth-view";
import { TradeView } from "@/components/brockexchange/trade-view";
import { AdminView } from "@/components/brockexchange/admin-view";
import { AdminLoginView } from "@/components/brockexchange/admin-login-view";
import { SubAgentDashboard } from "@/components/brockexchange/subagent-dashboard";
import {
  MarketsView,
  WatchlistView,
  AssetsView,
  DepositView,
  WithdrawView,
  HistoryView,
  ProfileView,
  NotificationsView,
  SettingsView,
} from "@/components/brockexchange/extra-views";
import { PasswordChangeModal } from "@/components/brockexchange/password-change-modal";
import { SupportChatWidget } from "@/components/brockexchange/support-chat-widget";
import { SupportView } from "@/components/brockexchange/support-view";
import { MembershipView } from "@/components/brockexchange/membership-view";
import { Toaster } from "@/components/ui/sonner";

const CUSTOMER_VIEWS = new Set([
  "trade", "wallet", "markets", "watchlist", "assets",
  "deposit", "withdraw", "history", "profile", "notifications", "settings",
  "support", "membership",
]);

export default function Page() {
  const { user, view } = useAuth();

  // Standalone: Admin login portal
  if (view === "admin-login") {
    return (
      <>
        <AdminLoginView />
        <Toaster richColors theme="dark" position="top-center" />
      </>
    );
  }

  // Standalone: Admin panel (super admin only)
  if (view === "admin" && user?.role === "SUPER_ADMIN") {
    return (
      <>
        <AdminView />
        <PasswordChangeModal />
        <Toaster richColors theme="dark" position="top-right" />
      </>
    );
  }

  // Standalone: Sub-agent dashboard
  if (view === "subagent" && user?.role === "SUB_AGENT") {
    return (
      <>
        <SubAgentDashboard />
        <PasswordChangeModal />
        <Toaster richColors theme="dark" position="top-right" />
      </>
    );
  }

  // Public + customer views (Navbar + Footer)
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      {view === "home" && <HomeView />}
      {(view === "login" || view === "register") && <AuthView />}
      {view === "trade" && <TradeView />}
      {view === "markets" && <MarketsView />}
      {view === "watchlist" && <WatchlistView />}
      {view === "assets" && <AssetsView />}
      {view === "deposit" && <DepositView />}
      {view === "withdraw" && <WithdrawView />}
      {view === "history" && <HistoryView />}
      {view === "profile" && <ProfileView />}
      {view === "notifications" && <NotificationsView />}
      {view === "settings" && <SettingsView />}
      {view === "support" && <SupportView />}
      {view === "membership" && <MembershipView />}
      <Footer />
      {user?.role === "CUSTOMER" && <SupportChatWidget />}
      {user && <PasswordChangeModal />}
      <Toaster richColors theme="dark" position="top-right" />
    </div>
  );
}
