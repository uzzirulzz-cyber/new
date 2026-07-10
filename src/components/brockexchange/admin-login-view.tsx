"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Eye, EyeOff, Lock, Mail, Shield, ArrowRight, ShieldCheck } from "lucide-react";
import { useAuth, type AuthUser } from "@/lib/auth-store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Logo } from "./logo";
import { toast } from "sonner";

export function AdminLoginView() {
  const { navigate, setUser, apiFetch } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await apiFetch("/api/auth/login", {
        method: "POST",
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || "Login failed.");
        return;
      }
      const u = data.user as AuthUser;
      if (u.role !== "SUPER_ADMIN" && u.role !== "SUB_AGENT") {
        toast.error("This portal is for staff only.");
        return;
      }
      setUser(u);
      toast.success(`Welcome, ${u.name}`);
      if (u.role === "SUPER_ADMIN") navigate("admin");
      else navigate("subagent");
    } catch {
      toast.error("Network error. Try again.");
    } finally {
      setLoading(false);
    }
  };

  const useAdmin = () => {
    setEmail("crdbixx@gmail.com");
    setPassword("123playbeat");
    toast.info("Super admin credentials filled.");
  };

  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-6 bx-grid-bg relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-[#0d47a1]/25 via-transparent to-[#2196f3]/15" />
      <motion.div
        className="absolute top-1/4 left-1/4 h-72 w-72 rounded-full bg-[#2196f3]/15 blur-3xl"
        animate={{ y: [0, 30, 0], x: [0, 20, 0] }}
        transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute bottom-1/4 right-1/4 h-64 w-64 rounded-full bg-[#42a5f5]/15 blur-3xl"
        animate={{ y: [0, -25, 0], x: [0, -15, 0] }}
        transition={{ duration: 14, repeat: Infinity, ease: "easeInOut" }}
      />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative w-full max-w-md"
      >
        <div className="flex flex-col items-center mb-8">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.1, type: "spring" }}
          >
            <Logo size={64} />
          </motion.div>
          <div className="mt-6 inline-flex items-center gap-2 rounded-full border border-[#2196f3]/30 bg-[#2196f3]/10 px-3 py-1 text-[11px] text-[#42a5f5]">
            <Shield className="h-3 w-3" /> Staff Portal • Authorized Access Only
          </div>
          <h1 className="mt-4 text-2xl font-bold">Staff Portal</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Login for super admins and sub-agents.
          </p>
        </div>

        <div className="bx-glass rounded-2xl p-6 sm:p-8 bx-glow">
          <form onSubmit={submit} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="admin-email" className="text-xs">
                Email
              </Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="admin-email"
                  type="email"
                  placeholder="staff@brock.exchange"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-9 bg-white/5 border-white/10"
                  required
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="admin-password" className="text-xs">
                Password
              </Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="admin-password"
                  type={show ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-9 pr-9 bg-white/5 border-white/10"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShow(!show)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-white"
                  tabIndex={-1}
                >
                  {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>
            <Button
              type="submit"
              disabled={loading}
              className="w-full bx-blue-gradient bx-glow text-white border-0 h-11"
            >
              {loading ? "Logging in..." : "Login to Dashboard"}
              {!loading && <ArrowRight className="ml-2 h-4 w-4" />}
            </Button>
          </form>

          <div className="bx-glass-soft rounded-lg p-3 text-xs space-y-2 mt-4">
            <div className="text-muted-foreground font-medium flex items-center gap-1.5">
              <ShieldCheck className="h-3 w-3" /> Demo credential
            </div>
            <div className="flex items-center justify-between gap-2">
              <div>
                <div className="text-white">Super Admin</div>
                <div className="text-muted-foreground">crdbixx@gmail.com</div>
              </div>
              <Button
                size="sm"
                variant="outline"
                onClick={useAdmin}
                className="h-7 text-xs border-white/10"
              >
                Use admin
              </Button>
            </div>
          </div>
        </div>

        <div className="mt-6 text-center">
          <button
            onClick={() => navigate("login")}
            className="text-xs text-muted-foreground hover:text-[#42a5f5]"
          >
            ← Back to customer login
          </button>
        </div>
      </motion.div>
    </main>
  );
}

export default AdminLoginView;
