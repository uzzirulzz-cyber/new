"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Lock, Eye, EyeOff, Loader2, ShieldAlert } from "lucide-react";
import { useAuth } from "@/lib/auth-store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

export function PasswordChangeModal() {
  const { user, setUser, apiFetch } = useAuth();
  const [next, setNext] = useState("");
  const [confirm, setConfirm] = useState("");
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);

  if (!user || !user.mustChangePassword) return null;

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!next || !confirm) {
      toast.error("All fields are required.");
      return;
    }
    if (next.length < 6) {
      toast.error("Password must be at least 6 characters.");
      return;
    }
    if (next !== confirm) {
      toast.error("Passwords do not match.");
      return;
    }
    setLoading(true);
    try {
      const res = await apiFetch("/api/auth/change-password", {
        method: "POST",
        body: JSON.stringify({ newPassword: next }),
      });
      const data = await res.json();
      if (res.ok) {
        toast.success("Password changed. Welcome to Brock Exchange!");
        setUser({ ...user, mustChangePassword: false });
        setNext("");
        setConfirm("");
      } else {
        toast.error(data.error || "Failed to change password.");
      }
    } catch {
      toast.error("Network error. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] flex items-center justify-center bg-[#02060f]/92 backdrop-blur-md p-4"
      >
        <motion.div
          initial={{ scale: 0.92, y: 20 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0.92, y: 20 }}
          transition={{ type: "spring", stiffness: 200, damping: 22 }}
          className="bx-glass rounded-2xl p-7 sm:p-8 max-w-md w-full bx-glow relative"
        >
          <div className="text-center mb-6">
            <div className="h-16 w-16 rounded-full bg-[#f59e0b]/15 flex items-center justify-center mx-auto mb-4">
              <ShieldAlert className="h-8 w-8 text-[#f59e0b]" />
            </div>
            <h2 className="text-xl font-bold text-white">Update your password</h2>
            <p className="mt-1.5 text-sm text-muted-foreground leading-relaxed">
              For your security, please set a new password before continuing. This screen cannot be dismissed.
            </p>
          </div>

          <form onSubmit={submit} className="space-y-3.5">
            <div>
              <Label className="text-xs">New password</Label>
              <div className="relative mt-1">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  type={show ? "text" : "password"}
                  value={next}
                  onChange={(e) => setNext(e.target.value)}
                  className="pl-9 pr-9 bg-white/5 border-white/10"
                  placeholder="Min 6 characters"
                  autoFocus
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
            <div>
              <Label className="text-xs">Confirm new password</Label>
              <div className="relative mt-1">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  type={show ? "text" : "password"}
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  className="pl-9 bg-white/5 border-white/10"
                  placeholder="Repeat new password"
                  required
                />
              </div>
            </div>
            <Button
              type="submit"
              disabled={loading}
              className="w-full bx-blue-gradient bx-glow text-white border-0 h-11"
            >
              {loading ? (
                <span className="inline-flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" /> Updating...
                </span>
              ) : (
                "Update password"
              )}
            </Button>
          </form>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

export default PasswordChangeModal;
