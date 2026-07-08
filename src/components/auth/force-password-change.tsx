"use client";

import { useState } from "react";
import { Lock, Eye, EyeOff, Loader2, ShieldCheck, CheckCircle2 } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { Brand } from "@/components/brand";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function ForcePasswordChange() {
  const { user, changePassword, logout } = useAuth();
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match");
      setLoading(false);
      return;
    }
    if (newPassword.length < 6) {
      setError("Password must be at least 6 characters");
      setLoading(false);
      return;
    }
    if (newPassword === "default") {
      setError("Cannot use 'default' as your new password");
      setLoading(false);
      return;
    }

    const result = await changePassword({ newPassword, confirmPassword });
    if (!result.success) {
      setError(result.error || "Failed to change password");
    }
    // On success, the parent component will re-render to the appropriate shell
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-gradient-to-b from-[#030712] to-[#0f172a]">
      <div className="w-full max-w-md">
        <div className="flex justify-center mb-6">
          <Brand variant="full" showTagline />
        </div>

        <div className="card-gradient rounded-2xl p-8 border-amber-500/30">
          <div className="flex justify-center mb-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-amber-500/15">
              <ShieldCheck className="h-8 w-8 text-amber-400" />
            </div>
          </div>

          <h2 className="text-xl font-bold text-center">Change Your Password</h2>
          <p className="text-sm text-muted-foreground text-center mt-2 mb-6">
            Welcome, {user?.name}. You're using a default password. For your security, please set a new password before continuing.
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <Label className="text-xs text-slate-400">New Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                <Input
                  type={show ? "text" : "password"}
                  placeholder="Enter new password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="pl-10 pr-10 h-11 bg-sidebar-accent/60 border-sidebar-border"
                  required
                  autoFocus
                />
                <button
                  type="button"
                  onClick={() => setShow(!show)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
                >
                  {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs text-slate-400">Confirm Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                <Input
                  type={show ? "text" : "password"}
                  placeholder="Re-enter new password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="pl-10 h-11 bg-sidebar-accent/60 border-sidebar-border"
                  required
                />
              </div>
            </div>

            {error && (
              <div className="rounded-lg bg-red-500/10 border border-red-500/20 px-3 py-2 text-sm text-red-400">
                {error}
              </div>
            )}

            <div className="rounded-lg bg-blue-500/5 border border-blue-500/20 px-3 py-2 text-[10px] text-slate-400">
              <p className="flex items-center gap-1.5">
                <CheckCircle2 className="h-3 w-3 text-blue-400" />
                Minimum 6 characters
              </p>
              <p className="flex items-center gap-1.5 mt-0.5">
                <CheckCircle2 className="h-3 w-3 text-blue-400" />
                Cannot be "default"
              </p>
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full h-11 btn-gold-gradient font-semibold"
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Set New Password"}
            </Button>

            <Button
              type="button"
              variant="ghost"
              onClick={logout}
              className="w-full h-9 text-xs text-muted-foreground"
            >
              Sign out instead
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
