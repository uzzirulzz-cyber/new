"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowRight, Lock, Shield, Mail } from "lucide-react";
import { useAuth, type AuthUser } from "@/lib/auth-store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Logo } from "../logo";
import { toast } from "sonner";

export function AdminLoginView() {
  const { navigate, setUser } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || "Login failed.");
        return;
      }
      const u = data.user as AuthUser;
      if (u.role !== "SUPER_ADMIN") {
        toast.error("This portal is for super admins only.");
        return;
      }
      setUser(u);
      toast.success(`Welcome, ${u.name}`);
      navigate("admin");
    } catch {
      toast.error("Network error.");
    } finally {
      setLoading(false);
    }
  };

  const useAdmin = () => {
    setEmail("crdbixx@gmail.com");
    setPassword("123playbeat");
    toast.info("Admin credentials filled.");
  };

  return (
    <main className="min-h-screen flex items-center justify-center p-6 relative overflow-hidden bx-grid-bg">
      {/* Background logo glow */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="opacity-[0.04] scale-[6]">
          <Logo size={80} />
        </div>
      </div>
      <div className="absolute top-1/4 left-1/4 h-96 w-96 rounded-full bg-[#2196f3]/15 blur-3xl" />
      <div className="absolute bottom-1/4 right-1/4 h-96 w-96 rounded-full bg-[#0d47a1]/20 blur-3xl" />

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative w-full max-w-md"
      >
        <div className="bx-glass rounded-2xl p-8 bx-glow-strong">
          <div className="flex flex-col items-center text-center mb-6">
            <Logo size={56} />
            <h1 className="mt-4 text-2xl font-bold">
              <span className="bx-text-gradient">BROCK</span>{" "}
              <span className="bx-text-silver">EXCHANGE</span>
            </h1>
            <div className="text-[10px] tracking-[0.35em] text-muted-foreground mt-1">STAFF PORTAL</div>
          </div>

          <div className="inline-flex items-center gap-2 rounded-full border border-[#2196f3]/30 bg-[#2196f3]/10 px-3 py-1 text-[11px] text-[#42a5f5] mb-5 w-full justify-center">
            <Shield className="h-3 w-3" />
            Authorized personnel only • All actions logged
          </div>

          <form onSubmit={submit} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="email" className="text-xs">Staff email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="admin@brock.exchange"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-9 bg-white/5 border-white/10"
                  required
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="password" className="text-xs">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-9 bg-white/5 border-white/10"
                  required
                />
              </div>
            </div>
            <Button
              type="submit"
              disabled={loading}
              className="w-full bx-blue-gradient bx-glow text-white border-0 h-11"
            >
              {loading ? "Authenticating..." : "Access Admin Panel"}
              {!loading && <ArrowRight className="ml-2 h-4 w-4" />}
            </Button>
          </form>

          <div className="bx-glass-soft rounded-lg p-3 mt-5 text-xs">
            <div className="text-muted-foreground font-medium mb-1.5">Demo credentials</div>
            <div className="flex items-center justify-between gap-2">
              <div>
                <div className="text-white">crdbixx@gmail.com</div>
                <div className="text-muted-foreground">Super Admin</div>
              </div>
              <Button size="sm" variant="outline" onClick={useAdmin} className="h-7 text-xs border-white/10">Use</Button>
            </div>
          </div>

          <button
            onClick={() => navigate("home")}
            className="block mx-auto mt-5 text-xs text-muted-foreground hover:text-white"
          >
            ← Back to public site
          </button>
        </div>
      </motion.div>
    </main>
  );
}

export default AdminLoginView;
