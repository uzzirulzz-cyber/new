"use client";

import { useState } from "react";
import { useAuth, View } from "@/lib/auth-store";
import { Logo } from "./logo";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ChevronDown, Bell, Home, BarChart3, Wallet, MoreHorizontal, LogOut, User, Settings, Star, Clock, ArrowDownToLine, ArrowUpFromLine, PieChart } from "lucide-react";

const PRIMARY_NAV: { view: View; label: string; icon: any }[] = [
  { view: "home", label: "Home", icon: Home },
  { view: "markets", label: "Markets", icon: BarChart3 },
  { view: "trade", label: "Trade", icon: BarChart3 },
  { view: "wallet", label: "Wallet", icon: Wallet },
];

const SECONDARY_NAV: { view: View; label: string; icon: any }[] = [
  { view: "watchlist", label: "Watchlist", icon: Star },
  { view: "assets", label: "Assets", icon: PieChart },
  { view: "deposit", label: "Deposit", icon: ArrowDownToLine },
  { view: "withdraw", label: "Withdraw", icon: ArrowUpFromLine },
  { view: "history", label: "History", icon: Clock },
  { view: "profile", label: "Profile", icon: User },
  { view: "notifications", label: "Notifications", icon: Bell },
  { view: "settings", label: "Settings", icon: Settings },
];

export function Navbar() {
  const { user, view, navigate, logout } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);

  const allNav = [...PRIMARY_NAV, ...SECONDARY_NAV];

  return (
    <header className="fixed top-0 left-0 right-0 z-50 h-16 bx-glass border-b border-white/5">
      <div className="max-w-7xl mx-auto h-full px-4 sm:px-6 flex items-center justify-between gap-4">
        <button onClick={() => navigate("home")} className="shrink-0">
          <Logo size={36} />
        </button>

        {/* Desktop primary nav */}
        <nav className="hidden md:flex items-center gap-1">
          {PRIMARY_NAV.map((item) => {
            const active = view === item.view;
            return (
              <button
                key={item.view}
                onClick={() => navigate(item.view)}
                className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${
                  active ? "text-[#2196f3] bg-[#2196f3]/10" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {item.label}
              </button>
            );
          })}
          {/* More dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="px-3 py-1.5 text-sm rounded-lg text-muted-foreground hover:text-foreground flex items-center gap-1">
                More <MoreHorizontal className="h-3.5 w-3.5" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              {SECONDARY_NAV.map((item) => (
                <DropdownMenuItem key={item.view} onClick={() => navigate(item.view)}>
                  <item.icon className="mr-2 h-4 w-4" />
                  {item.label}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </nav>

        {/* Right side */}
        <div className="flex items-center gap-2">
          {user ? (
            <>
              <span className="hidden sm:block text-sm font-mono text-[#2196f3]">
                ${user.balance.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
              <button onClick={() => navigate("notifications")} className="relative p-1.5">
                <Bell className="h-5 w-5 text-muted-foreground" />
              </button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="flex items-center gap-2 rounded-full hover:bg-white/5 p-1">
                    <Avatar className="h-8 w-8 border border-white/10">
                      <AvatarFallback className="bg-[#2196f3]/20 text-[#2196f3] text-xs font-semibold">
                        {user.name.split(" ").map(n => n[0]).slice(0, 2).join("")}
                      </AvatarFallback>
                    </Avatar>
                    <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-52">
                  <div className="px-2 py-1">
                    <p className="text-sm font-medium">{user.name}</p>
                    <p className="text-[10px] text-muted-foreground font-mono">{user.uid}</p>
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => navigate("profile")}><User className="mr-2 h-4 w-4" /> Profile</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate("settings")}><Settings className="mr-2 h-4 w-4" /> Settings</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate("history")}><Clock className="mr-2 h-4 w-4" /> History</DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem className="text-red-400" onClick={logout}><LogOut className="mr-2 h-4 w-4" /> Sign Out</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            <>
              <Button variant="ghost" size="sm" onClick={() => navigate("login")} className="text-sm">Login</Button>
              <Button size="sm" onClick={() => navigate("register")} className="bx-blue-gradient text-white">Register</Button>
            </>
          )}
        </div>
      </div>

      {/* Mobile nav */}
      {mobileOpen && (
        <div className="md:hidden border-t border-white/5 px-4 py-2 space-y-1 max-h-96 overflow-y-auto">
          {allNav.map((item) => (
            <button
              key={item.view}
              onClick={() => { navigate(item.view); setMobileOpen(false); }}
              className={`w-full flex items-center gap-3 px-3 py-2 text-sm rounded-lg ${
                view === item.view ? "text-[#2196f3] bg-[#2196f3]/10" : "text-muted-foreground"
              }`}
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </button>
          ))}
        </div>
      )}
    </header>
  );
}
