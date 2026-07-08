"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard, Users, ArrowLeftRight, CandlestickChart,
  Bell, Shield, Menu, X, LogOut, ChevronDown,
} from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/hooks/use-auth";
import { Brand } from "@/components/brand";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { AdminDashboard } from "./admin-dashboard";
import { AdminUsers } from "./admin-users";
import { AdminPayments } from "./admin-payments";
import { AdminTrades } from "./admin-trades";

export type AdminSection = "dashboard" | "users" | "payments" | "trades" | "notifications" | "security";

const NAV: { key: AdminSection; label: string; icon: any; group: string }[] = [
  { key: "dashboard", label: "Dashboard", icon: LayoutDashboard, group: "Overview" },
  { key: "users", label: "User Management", icon: Users, group: "Management" },
  { key: "payments", label: "Payment Management", icon: ArrowLeftRight, group: "Management" },
  { key: "trades", label: "Trade Management", icon: CandlestickChart, group: "Management" },
  { key: "notifications", label: "Notifications", icon: Bell, group: "System" },
  { key: "security", label: "Security & Audit", icon: Shield, group: "System" },
];

export function AdminShell() {
  const { user, logout } = useAuth();
  const [section, setSection] = useState<AdminSection>("dashboard");
  const [mobileNav, setMobileNav] = useState(false);
  const [pendingCount, setPendingCount] = useState(0);

  useEffect(() => {
    fetch("/api/admin/stats").then(r => r.json()).then(d => {
      if (d.stats) setPendingCount(d.stats.pendingApprovals);
    });
  }, [section]);

  const groups = Array.from(new Set(NAV.map((n) => n.group)));

  return (
    <div className="min-h-screen flex">
      <aside className="hidden lg:flex w-64 shrink-0 flex-col border-r border-sidebar-border bg-sidebar sticky top-0 h-screen z-20">
        <div className="flex h-16 items-center border-b border-sidebar-border px-5 header-backdrop">
          <Brand />
        </div>
        <div className="px-3 pt-3">
          <div className="rounded-lg bg-blue-500/10 border border-blue-500/20 p-2 text-center">
            <p className="text-[10px] text-blue-400 font-semibold uppercase tracking-wider">Admin Console</p>
          </div>
        </div>
        <nav className="flex-1 px-3 py-4 space-y-4 overflow-y-auto">
          {groups.map((group) => (
            <div key={group}>
              <p className="px-3 pb-2 text-[10px] uppercase tracking-wider text-muted-foreground/70 font-semibold">{group}</p>
              <div className="space-y-1">
                {NAV.filter((n) => n.group === group).map((item) => {
                  const Icon = item.icon;
                  const active = section === item.key;
                  return (
                    <button
                      key={item.key}
                      onClick={() => setSection(item.key)}
                      className={`group relative w-full flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-all ${
                        active ? "nav-active-gold font-semibold" : "text-muted-foreground hover:bg-sidebar-accent hover:text-foreground"
                      }`}
                    >
                      <Icon className={`h-4 w-4 ${active ? "text-amber-500" : ""}`} />
                      <span className="flex-1 text-left">{item.label}</span>
                      {item.key === "payments" && pendingCount > 0 && (
                        <Badge variant="secondary" className="bg-amber-500/20 text-amber-400 text-[9px] h-4 px-1">
                          {pendingCount}
                        </Badge>
                      )}
                      {active && (
                        <motion.div layoutId="admin-nav" className="absolute left-0 h-6 w-1 rounded-r-full bg-amber-500" />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>
      </aside>

      <AnimatePresence>
        {mobileNav && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="lg:hidden fixed inset-0 z-40 bg-black/70" onClick={() => setMobileNav(false)} />
            <motion.aside initial={{ x: -300 }} animate={{ x: 0 }} exit={{ x: -300 }}
              className="lg:hidden fixed left-0 top-0 z-50 w-64 h-screen bg-sidebar border-r border-sidebar-border flex flex-col overflow-y-auto">
              <div className="flex items-center justify-between p-4 border-b border-sidebar-border">
                <Brand />
                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setMobileNav(false)}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
              <nav className="flex-1 px-3 py-4 space-y-4">
                {groups.map((group) => (
                  <div key={group}>
                    <p className="px-3 pb-2 text-[10px] uppercase tracking-wider text-muted-foreground/70 font-semibold">{group}</p>
                    <div className="space-y-1">
                      {NAV.filter((n) => n.group === group).map((item) => {
                        const Icon = item.icon;
                        const active = section === item.key;
                        return (
                          <button key={item.key}
                            onClick={() => { setSection(item.key); setMobileNav(false); }}
                            className={`w-full flex items-center gap-3 rounded-lg px-3 py-2 text-sm ${
                              active ? "nav-active-gold font-semibold" : "text-muted-foreground hover:bg-sidebar-accent"
                            }`}>
                            <Icon className="h-4 w-4" />
                            {item.label}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </nav>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      <div className="flex-1 flex flex-col min-w-0">
        <header className="header-backdrop sticky top-0 z-30 flex h-16 items-center gap-3 px-4 lg:px-6">
          <Button variant="ghost" size="icon" className="lg:hidden h-9 w-9" onClick={() => setMobileNav(true)}>
            <Menu className="h-5 w-5" />
          </Button>
          <div className="hidden md:block">
            <h1 className="text-lg font-bold capitalize">{section === "dashboard" ? "Admin Dashboard" : section}</h1>
            <p className="text-xs text-muted-foreground">BlockExchange.buzz · Admin Console</p>
          </div>
          <div className="ml-auto flex items-center gap-3">
            <div className="hidden md:block text-right">
              <p className="text-[10px] text-muted-foreground">Logged in as</p>
              <p className="text-xs font-semibold text-amber-500">{user?.name} · {user?.role}</p>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-2 rounded-full pl-1 pr-2 py-1 hover:bg-sidebar-accent">
                  <Avatar className="h-8 w-8 border border-sidebar-border">
                    <AvatarFallback className="bg-blue-500/15 text-blue-400 text-xs font-semibold">
                      {user?.name?.split(" ").map((n: string) => n[0]).slice(0, 2).join("")}
                    </AvatarFallback>
                  </Avatar>
                  <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-52 bg-popover border-sidebar-border">
                <p className="px-2 text-sm font-medium">{user?.name}</p>
                <p className="px-2 text-[10px] text-muted-foreground">{user?.email}</p>
                <DropdownMenuSeparator className="bg-sidebar-border" />
                <DropdownMenuItem className="text-red-400" onClick={logout}>
                  <LogOut className="mr-2 h-4 w-4" /> Sign Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        <main className="flex-1 p-4 lg:p-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={section}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
            >
              {section === "dashboard" && <AdminDashboard />}
              {section === "users" && <AdminUsers />}
              {section === "payments" && <AdminPayments />}
              {section === "trades" && <AdminTrades />}
              {section === "notifications" && <AdminNotifications />}
              {section === "security" && <AdminSecurity />}
            </motion.div>
          </AnimatePresence>
        </main>

        <footer className="mt-auto border-t border-sidebar-border px-4 lg:px-6 py-4">
          <div className="flex justify-between text-xs text-muted-foreground">
            <p>© 2026 BlockExchange.buzz · Admin Console</p>
            <p className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-emerald-400 pulse-dot" />
              All systems operational
            </p>
          </div>
        </footer>
      </div>
    </div>
  );
}

function AdminNotifications() {
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [audience, setAudience] = useState("all");
  const [sending, setSending] = useState(false);

  const send = async (e: React.FormEvent) => {
    e.preventDefault();
    setSending(true);
    // For now, just create a system notification
    // In production, this would also push to individual user notification queues
    try {
      const res = await fetch("/api/admin/actions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "SEND_NOTIFICATION", targetUserId: "all", title, message, audience }),
      });
      if (res.ok) {
        toast.success("Notification sent");
        setTitle(""); setMessage("");
      }
    } catch (e) {
      toast.error("Failed to send");
    }
    setSending(false);
  };

  return (
    <div className="max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold mb-4">Send System Notification</h2>
      <form onSubmit={send} className="card-gradient rounded-xl p-6 space-y-4">
        <div>
          <label className="text-xs text-muted-foreground">Title</label>
          <input value={title} onChange={(e) => setTitle(e.target.value)} required
            className="w-full mt-1 h-10 px-3 rounded-lg bg-sidebar-accent/60 border border-sidebar-border text-sm" />
        </div>
        <div>
          <label className="text-xs text-muted-foreground">Message</label>
          <textarea value={message} onChange={(e) => setMessage(e.target.value)} required rows={4}
            className="w-full mt-1 px-3 py-2 rounded-lg bg-sidebar-accent/60 border border-sidebar-border text-sm" />
        </div>
        <Button type="submit" disabled={sending} className="btn-gold-gradient">
          {sending ? "Sending..." : "Send Notification"}
        </Button>
      </form>
    </div>
  );
}

function AdminSecurity() {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // For now, show admin login sessions
    fetch("/api/admin/stats").then(r => r.json()).then(() => {
      // Would have a separate audit log endpoint
      setLogs([]);
      setLoading(false);
    });
  }, []);

  return (
    <div className="max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold mb-4">Security & Audit Logs</h2>
      <div className="card-gradient rounded-xl p-6">
        <p className="text-sm text-muted-foreground text-center py-8">
          Audit logs will appear here. All admin actions are tracked in the database.
        </p>
      </div>
    </div>
  );
}
