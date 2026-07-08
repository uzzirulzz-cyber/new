"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Mail, Lock, User, Phone, Gift, Eye, EyeOff, ArrowRight, Loader2, ShieldCheck } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { Brand } from "@/components/brand";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

export function AuthScreen() {
  const { login, register } = useAuth();
  const [tab, setTab] = useState<"login" | "register">("login");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  // Login form
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");

  // Register form
  const [reg, setReg] = useState({
    invitationCode: "",
    name: "",
    email: "",
    mobile: "",
    password: "",
    confirmPassword: "",
  });

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const result = await login(loginEmail, loginPassword);
    if (!result.success) setError(result.error || "Login failed");
    setLoading(false);
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const result = await register(reg);
    if (!result.success) setError(result.error || "Registration failed");
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex">
      {/* Left: brand panel */}
      <div className="hidden lg:flex flex-col w-1/2 bg-gradient-to-br from-[#020617] via-[#0f172a] to-[#1e293b] relative overflow-hidden">
        <div className="absolute inset-0 bg-dots opacity-30" />
        <div className="absolute top-1/4 -left-20 h-96 w-96 rounded-full bg-blue-600/20 blur-3xl" />
        <div className="absolute bottom-1/4 -right-20 h-96 w-96 rounded-full bg-amber-500/20 blur-3xl" />

        <div className="relative z-10 flex flex-col justify-between h-full p-12">
          <Brand variant="full" size="lg" showTagline />

          <div className="space-y-6">
            <h1 className="text-5xl font-extrabold leading-tight">
              <span className="text-white">Trade </span>
              <span className="brand-gradient">Smarter.</span>
              <br />
              <span className="text-white">Grow </span>
              <span className="brand-gradient">Faster.</span>
            </h1>
            <p className="text-lg text-slate-400 max-w-md leading-relaxed">
              The premium crypto trading platform. Trade Bitcoin, Ethereum, and 13+ cryptocurrencies with up to 50% profit in 120 seconds.
            </p>

            <div className="grid grid-cols-3 gap-4 max-w-md">
              <Feature icon="⚡" label="Instant Trades" />
              <Feature icon="🔒" label="Bank-Grade Security" />
              <Feature icon="💎" label="15+ Coins" />
            </div>
          </div>

          <div className="flex items-center gap-6 text-xs text-slate-500">
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="h-3.5 w-3.5 text-amber-500" />
              256-bit SSL Encrypted
            </span>
            <span>© 2026 BlockExchange.buzz</span>
          </div>
        </div>
      </div>

      {/* Right: auth form */}
      <div className="flex-1 flex items-center justify-center p-6 lg:p-12 bg-gradient-to-b from-[#030712] to-[#0f172a]">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md"
        >
          <div className="lg:hidden mb-8 flex justify-center">
            <Brand variant="full" showTagline />
          </div>

          <div className="card-gradient rounded-2xl p-8">
            <Tabs value={tab} onValueChange={(v) => { setTab(v as any); setError(null); }}>
              <TabsList className="grid grid-cols-2 w-full bg-sidebar-accent/60 border border-sidebar-border rounded-lg p-1 h-auto">
                <TabsTrigger
                  value="login"
                  className="data-[state=active]:btn-primary-gradient data-[state=active]:text-white rounded-md py-2 text-sm font-semibold"
                >
                  Login
                </TabsTrigger>
                <TabsTrigger
                  value="register"
                  className="data-[state=active]:btn-gold-gradient data-[state=active]:text-black rounded-md py-2 text-sm font-semibold"
                >
                  Register
                </TabsTrigger>
              </TabsList>

              <TabsContent value="login" className="mt-6">
                <form onSubmit={handleLogin} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="login-email" className="text-xs text-slate-400">Email Address</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                      <Input
                        id="login-email"
                        type="email"
                        placeholder="you@example.com"
                        value={loginEmail}
                        onChange={(e) => setLoginEmail(e.target.value)}
                        className="pl-10 h-11 bg-sidebar-accent/60 border-sidebar-border"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="login-password" className="text-xs text-slate-400">Password</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                      <Input
                        id="login-password"
                        type={showPassword ? "text" : "password"}
                        placeholder="••••••••"
                        value={loginPassword}
                        onChange={(e) => setLoginPassword(e.target.value)}
                        className="pl-10 pr-10 h-11 bg-sidebar-accent/60 border-sidebar-border"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>

                  {error && (
                    <div className="rounded-lg bg-red-500/10 border border-red-500/20 px-3 py-2 text-sm text-red-400">
                      {error}
                    </div>
                  )}

                  <Button
                    type="submit"
                    disabled={loading}
                    className="w-full h-11 btn-primary-gradient font-semibold"
                  >
                    {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <>Sign In <ArrowRight className="ml-2 h-4 w-4" /></>}
                  </Button>

                  <p className="text-[10px] text-center text-slate-500">
                    Don't have an account? Ask your referrer for an invitation code.
                  </p>
                </form>
              </TabsContent>

              <TabsContent value="register" className="mt-6">
                <form onSubmit={handleRegister} className="space-y-3.5">
                  <FormField
                    icon={Gift}
                    label="Invitation Code"
                    placeholder="Enter your invitation code"
                    value={reg.invitationCode}
                    onChange={(v) => setReg({ ...reg, invitationCode: v })}
                    required
                  />
                  <FormField
                    icon={User}
                    label="Full Name"
                    placeholder="John Doe"
                    value={reg.name}
                    onChange={(v) => setReg({ ...reg, name: v })}
                    required
                  />
                  <FormField
                    icon={Mail}
                    label="Email Address"
                    type="email"
                    placeholder="you@example.com"
                    value={reg.email}
                    onChange={(v) => setReg({ ...reg, email: v })}
                    required
                  />
                  <FormField
                    icon={Phone}
                    label="Mobile Number"
                    type="tel"
                    placeholder="+1 234 567 890"
                    value={reg.mobile}
                    onChange={(v) => setReg({ ...reg, mobile: v })}
                  />
                  <FormField
                    icon={Lock}
                    label="Password"
                    type="password"
                    placeholder="Min 6 characters"
                    value={reg.password}
                    onChange={(v) => setReg({ ...reg, password: v })}
                    required
                  />
                  <FormField
                    icon={Lock}
                    label="Confirm Password"
                    type="password"
                    placeholder="Re-enter password"
                    value={reg.confirmPassword}
                    onChange={(v) => setReg({ ...reg, confirmPassword: v })}
                    required
                  />

                  {error && (
                    <div className="rounded-lg bg-red-500/10 border border-red-500/20 px-3 py-2 text-sm text-red-400">
                      {error}
                    </div>
                  )}

                  <Button
                    type="submit"
                    disabled={loading}
                    className="w-full h-11 btn-gold-gradient font-semibold mt-2"
                  >
                    {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <>Create Account <ArrowRight className="ml-2 h-4 w-4" /></>}
                  </Button>

                  <p className="text-[10px] text-center text-slate-500">
                    By registering you agree to BlockExchange.buzz Terms of Service and Privacy Policy.
                  </p>
                </form>
              </TabsContent>
            </Tabs>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

function FormField({
  icon: Icon,
  label,
  type = "text",
  placeholder,
  value,
  onChange,
  required,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  type?: string;
  placeholder: string;
  value: string;
  onChange: (v: string) => void;
  required?: boolean;
}) {
  return (
    <div className="space-y-1.5">
      <Label className="text-xs text-slate-400">{label}{required && <span className="text-amber-500"> *</span>}</Label>
      <div className="relative">
        <Icon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
        <Input
          type={type}
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="pl-10 h-11 bg-sidebar-accent/60 border-sidebar-border"
          required={required}
        />
      </div>
    </div>
  );
}

function Feature({ icon, label }: { icon: string; label: string }) {
  return (
    <div className="card-gradient rounded-xl p-3 text-center">
      <div className="text-2xl mb-1">{icon}</div>
      <p className="text-[10px] text-slate-400 font-medium">{label}</p>
    </div>
  );
}
