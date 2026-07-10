"use client";

import { useAuth, type View } from "@/lib/auth-store";
import { Logo } from "./logo";
import { Mail, MessageCircle, Shield, Twitter, Send, Github } from "lucide-react";

export function Footer() {
  const { navigate } = useAuth();
  const year = new Date().getFullYear();

  const go = (v: View) => () => navigate(v);

  return (
    <footer className="mt-auto border-t border-white/5 bg-[#02060f]/80 backdrop-blur-md">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-8">
          <div className="col-span-2">
            <div className="flex items-center gap-2.5">
              <Logo size={36} />
              <div className="flex flex-col leading-none">
                <span className="font-extrabold text-base">
                  <span className="bx-text-gradient">BROCK</span>
                  <span className="bx-text-silver ml-1">EXCHANGE</span>
                </span>
                <span className="text-[9px] tracking-[0.35em] text-muted-foreground mt-0.5">TRADE • INVEST • GROW</span>
              </div>
            </div>
            <p className="mt-4 text-sm text-muted-foreground max-w-xs leading-relaxed">
              The next-generation crypto trading platform. Trade binary options on 12+ assets with up to 50% returns in 120 seconds.
            </p>
            <div className="flex items-center gap-3 mt-5">
              {[Twitter, Send, Github, Mail].map((Icon, i) => (
                <a
                  key={i}
                  href="#"
                  onClick={(e) => e.preventDefault()}
                  className="h-9 w-9 inline-flex items-center justify-center rounded-md border border-white/10 text-muted-foreground hover:text-white hover:border-[#2196f3]/40 hover:bg-white/5 transition"
                >
                  <Icon className="h-4 w-4" />
                </a>
              ))}
            </div>
          </div>

          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-white mb-3">Platform</h4>
            <ul className="space-y-2 text-sm">
              <li><button onClick={go("trade")} className="text-muted-foreground hover:text-white">Trade</button></li>
              <li><button onClick={go("markets")} className="text-muted-foreground hover:text-white">Markets</button></li>
              <li><button onClick={go("watchlist")} className="text-muted-foreground hover:text-white">Watchlist</button></li>
              <li><button onClick={go("assets")} className="text-muted-foreground hover:text-white">Assets</button></li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-white mb-3">Account</h4>
            <ul className="space-y-2 text-sm">
              <li><button onClick={go("wallet")} className="text-muted-foreground hover:text-white">Wallet</button></li>
              <li><button onClick={go("deposit")} className="text-muted-foreground hover:text-white">Deposit</button></li>
              <li><button onClick={go("withdraw")} className="text-muted-foreground hover:text-white">Withdraw</button></li>
              <li><button onClick={go("history")} className="text-muted-foreground hover:text-white">History</button></li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-white mb-3">Support</h4>
            <ul className="space-y-2 text-sm">
              <li><button onClick={go("notifications")} className="text-muted-foreground hover:text-white">Notifications</button></li>
              <li><button onClick={go("settings")} className="text-muted-foreground hover:text-white">Settings</button></li>
              <li><button onClick={go("profile")} className="text-muted-foreground hover:text-white">Profile</button></li>
              <li><span className="text-muted-foreground inline-flex items-center gap-1"><Shield className="h-3 w-3" /> 256-bit SSL</span></li>
            </ul>
          </div>
        </div>

        <div className="mt-10 pt-6 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-xs text-muted-foreground">
            © {year} Brock Exchange. All rights reserved. Trading crypto carries risk.
          </p>
          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            <button className="hover:text-white">Terms</button>
            <button className="hover:text-white">Privacy</button>
            <button className="hover:text-white">AML/KYC</button>
            <span className="inline-flex items-center gap-1 text-[#00c853]">
              <MessageCircle className="h-3 w-3" /> 24/7 Live Support
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
