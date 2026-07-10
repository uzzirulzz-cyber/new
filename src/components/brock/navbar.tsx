"use client";

import { useState } from "react";
import { useAuth, type View } from "@/lib/auth-store";
import { BrandWordmark, Logo } from "./logo";
import { Button } from "@/components/ui/button";
import {
  Menu,
  X,
  LayoutDashboard,
  Wallet,
  LineChart,
  History,
  Bell,
  User,
  Settings,
  LogOut,
  ChevronDown,
  Home,
  Star,
  Coins,
  ArrowDownToLine,
  ArrowUpFromLine,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

const PUBLIC_LINKS: { label: string; view: View }[] = [
  { label: "Home", view: "home" },
  { label: "Markets", view: "markets" },
  { label: "Trade", view: "trade" },
];

const CUSTOMER_LINKS: { label: string; view: View; icon: React.ElementType }[] = [
  { label: "Trade", view: "trade", icon: LineChart },
  { label: "Wallet", view: "wallet", icon: Wallet },
  { label: "Markets", view: "markets", icon: Home },
  { label: "Assets", view: "assets", icon: Coins },
  { label: "History", view: "history", icon: History },
];

export function Navbar() {
  const { user, view, navigate, logout } = useAuth();
  const [open, setOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } catch {}
    logout();
    toast.success("Logged out");
    navigate("home");
  };

  const links = user?.role === "CUSTOMER" ? CUSTOMER_LINKS : [];

  return (
    <header className="sticky top-0 z-50 w-full border-b border-white/5 bg-[#02060f]/85 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <button onClick={() => navigate(user ? (user.role === "CUSTOMER" ? "trade" : user.role === "SUB_AGENT" ? "subagent" : "admin") : "home")} className="shrink-0">
          <BrandWordmark size={34} />
        </button>

        {/* Desktop nav */}
        <nav className="hidden lg:flex items-center gap-1">
          {!user &&
            PUBLIC_LINKS.map((l) => (
              <button
                key={l.view}
                onClick={() => navigate(l.view)}
                className={cn(
                  "px-3 py-2 text-sm font-medium rounded-md transition-colors",
                  view === l.view ? "text-white" : "text-muted-foreground hover:text-white hover:bg-white/5"
                )}
              >
                {l.label}
              </button>
            ))}
          {user?.role === "CUSTOMER" &&
            links.map((l) => (
              <button
                key={l.view}
                onClick={() => navigate(l.view)}
                className={cn(
                  "px-3 py-2 text-sm font-medium rounded-md transition-colors flex items-center gap-1.5",
                  view === l.view ? "text-white bg-white/5" : "text-muted-foreground hover:text-white hover:bg-white/5"
                )}
              >
                <l.icon className="h-4 w-4" />
                {l.label}
              </button>
            ))}
        </nav>

        <div className="flex items-center gap-2">
          {!user ? (
            <>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate("login")}
                className="hidden sm:flex text-muted-foreground hover:text-white"
              >
                Login
              </Button>
              <Button
                size="sm"
                onClick={() => navigate("register")}
                className="bx-blue-gradient bx-glow text-white border-0 hover:opacity-90"
              >
                Get Started
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate("admin-login")}
                className="hidden md:flex border-white/10 text-muted-foreground hover:text-white"
              >
                Staff
              </Button>
            </>
          ) : (
            <>
              {user.role === "CUSTOMER" && (
                <div className="hidden md:flex items-center gap-1.5 rounded-md border border-white/10 bg-white/5 px-3 py-1.5 text-sm">
                  <Wallet className="h-3.5 w-3.5 text-[#2196f3]" />
                  <span className="font-semibold text-white">{user.balance.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                  <span className="text-muted-foreground text-xs">USDT</span>
                </div>
              )}
              <button
                onClick={() => navigate("notifications")}
                className="relative h-9 w-9 inline-flex items-center justify-center rounded-md hover:bg-white/5"
                aria-label="Notifications"
              >
                <Bell className="h-4.5 w-4.5 text-muted-foreground hover:text-white" />
                <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-[#2196f3] bx-pulse-dot" />
              </button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="flex items-center gap-2 rounded-md border border-white/10 bg-white/5 px-2.5 py-1.5 hover:bg-white/10 transition">
                    <div className="h-7 w-7 rounded-full bx-blue-gradient flex items-center justify-center text-xs font-bold text-white">
                      {user.name.slice(0, 1).toUpperCase()}
                    </div>
                    <span className="hidden sm:inline text-sm font-medium text-white max-w-[120px] truncate">{user.name}</span>
                    <ChevronDown className="h-4 w-4 text-muted-foreground" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56 bg-[#0a1322] border-white/10">
                  <DropdownMenuLabel className="text-xs text-muted-foreground">
                    <div className="flex flex-col gap-0.5">
                      <span className="text-white text-sm font-medium truncate">{user.name}</span>
                      <span className="text-[11px]">{user.email}</span>
                      <span className="text-[10px] uppercase tracking-wider mt-1 text-[#2196f3]">{user.role.replace("_", " ")}</span>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator className="bg-white/5" />
                  {user.role === "SUPER_ADMIN" && (
                    <DropdownMenuItem onClick={() => navigate("admin")} className="cursor-pointer hover:bg-white/5">
                      <LayoutDashboard className="h-4 w-4 mr-2" /> Admin Panel
                    </DropdownMenuItem>
                  )}
                  {user.role === "SUB_AGENT" && (
                    <DropdownMenuItem onClick={() => navigate("subagent")} className="cursor-pointer hover:bg-white/5">
                      <LayoutDashboard className="h-4 w-4 mr-2" /> Agent Dashboard
                    </DropdownMenuItem>
                  )}
                  {user.role === "CUSTOMER" && (
                    <>
                      <DropdownMenuItem onClick={() => navigate("profile")} className="cursor-pointer hover:bg-white/5">
                        <User className="h-4 w-4 mr-2" /> Profile
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => navigate("wallet")} className="cursor-pointer hover:bg-white/5">
                        <Wallet className="h-4 w-4 mr-2" /> Wallet
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => navigate("deposit")} className="cursor-pointer hover:bg-white/5">
                        <ArrowDownToLine className="h-4 w-4 mr-2" /> Deposit
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => navigate("withdraw")} className="cursor-pointer hover:bg-white/5">
                        <ArrowUpFromLine className="h-4 w-4 mr-2" /> Withdraw
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => navigate("watchlist")} className="cursor-pointer hover:bg-white/5">
                        <Star className="h-4 w-4 mr-2" /> Watchlist
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => navigate("settings")} className="cursor-pointer hover:bg-white/5">
                        <Settings className="h-4 w-4 mr-2" /> Settings
                      </DropdownMenuItem>
                    </>
                  )}
                  <DropdownMenuSeparator className="bg-white/5" />
                  <DropdownMenuItem onClick={handleLogout} className="cursor-pointer text-red-400 hover:bg-red-500/10">
                    <LogOut className="h-4 w-4 mr-2" /> Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          )}
          <button
            onClick={() => setOpen(!open)}
            className="lg:hidden h-9 w-9 inline-flex items-center justify-center rounded-md hover:bg-white/5"
            aria-label="Menu"
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile nav */}
      {open && (
        <div className="lg:hidden border-t border-white/5 bg-[#02060f]/95 backdrop-blur-xl">
          <nav className="px-4 py-3 space-y-1">
            {!user &&
              PUBLIC_LINKS.map((l) => (
                <button
                  key={l.view}
                  onClick={() => {
                    navigate(l.view);
                    setOpen(false);
                  }}
                  className="block w-full text-left px-3 py-2 text-sm font-medium rounded-md hover:bg-white/5"
                >
                  {l.label}
                </button>
              ))}
            {user?.role === "CUSTOMER" &&
              links.map((l) => (
                <button
                  key={l.view}
                  onClick={() => {
                    navigate(l.view);
                    setOpen(false);
                  }}
                  className="flex items-center gap-2 w-full text-left px-3 py-2 text-sm font-medium rounded-md hover:bg-white/5"
                >
                  <l.icon className="h-4 w-4" />
                  {l.label}
                </button>
              ))}
            {!user && (
              <div className="flex gap-2 pt-2">
                <Button variant="outline" size="sm" className="flex-1" onClick={() => { navigate("login"); setOpen(false); }}>
                  Login
                </Button>
                <Button size="sm" className="flex-1 bx-blue-gradient bx-glow border-0" onClick={() => { navigate("register"); setOpen(false); }}>
                  Register
                </Button>
              </div>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}
