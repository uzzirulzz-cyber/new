"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Eye, EyeOff, Lock, Mail, Shield, UserPlus, LogIn, ArrowRight, BadgeCheck, Zap, Wallet, Headset, ChevronRight } from "lucide-react";
import { useAuth, apiFetch, type AuthUser } from "@/lib/auth-store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { BrandWordmark, Logo } from "../logo";
import { toast } from "sonner";

const COUNTRIES = ["United States", "United Kingdom", "United Arab Emirates", "Singapore", "Pakistan", "India", "Malaysia", "Nigeria", "Germany", "Brazil"];

const BENEFITS = [
  { icon: Zap, title: "Lightning-fast execution", body: "Sub-second order matching on every trade." },
  { icon: Wallet, title: "Instant deposits", body: "Card, bank, or crypto. Credited in seconds." },
  { icon: Headset, title: "24/7 human support", body: "Real brokers, real answers — any time." },
  { icon: BadgeCheck, title: "KYC verified", body: "Compliant onboarding. Tier-1 bank custody." },
];

export function AuthView({ mode: initialMode = "login" }: { mode?: "login" | "register" }) {
  const { navigate, setUser, view } = useAuth();
  const [mode, setMode] = useState<"login" | "register">(initialMode);
  const [showPwd, setShowPwd] = useState(false);
  const [showPwd2, setShowPwd2] = useState(false);
  const [loading, setLoading] = useState(false);

  // login
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // register
  const [name, setName] = useState("");
  const [rEmail, setREmail] = useState("");
  const [phone, setPhone] = useState("");
  const [country, setCountry] = useState("");
  const [rPwd, setRPwd] = useState("");
  const [confirm, setConfirm] = useState("");
  const [invitation, setInvitation] = useState("");
  const [terms, setTerms] = useState(false);

  // Sync to store view changes (e.g. navbar clicked register)
  useEffect(() => {
    if (view === "login") setMode("login");
    if (view === "register") setMode("register");
  }, [view]);

  const handleLogin = async (e: React.FormEvent) => {
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
      setUser(u);
      toast.success(`Welcome back, ${u.name}!`);
      if (u.role === "SUPER_ADMIN") navigate("admin");
      else if (u.role === "SUB_AGENT") navigate("subagent");
      else navigate("trade");
    } catch {
      toast.error("Network error. Try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !rEmail || !rPwd) {
      toast.error("Please fill all required fields.");
      return;
    }
    if (rPwd.length < 6) {
      toast.error("Password must be at least 6 characters.");
      return;
    }
    if (rPwd !== confirm) {
      toast.error("Passwords do not match.");
      return;
    }
    if (!invitation) {
      toast.error("Invitation code is required.");
      return;
    }
    if (!terms) {
      toast.error("Please accept the terms to continue.");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email: rEmail, password: rPwd, country, phone, invitationCode: invitation }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || "Registration failed.");
        return;
      }
      const u = data.user as AuthUser;
      setUser(u);
      toast.success(`Welcome to Brock Exchange, ${u.name}!`);
      navigate("trade");
    } catch {
      toast.error("Network error. Try again.");
    } finally {
      setLoading(false);
    }
  };

  const useAdmin = () => {
    setEmail("crdbixx@gmail.com");
    setPassword("123playbeat");
    setMode("login");
    toast.info("Super admin credentials filled.");
  };

  const useSubAgent = () => {
    setEmail("subagent1@trade.com");
    setPassword("default");
    setMode("login");
    toast.info("Sub-agent demo credentials filled.");
  };

  return (
    <main className="flex-1 pt-16 bx-fade-in min-h-[calc(100vh-4rem)] grid lg:grid-cols-[45%_55%]">
      {/* Left brand panel */}
      <section className="hidden lg:flex relative overflow-hidden bx-grid-bg border-r border-white/5">
        <div className="absolute inset-0 bg-gradient-to-br from-[#0d47a1]/30 via-transparent to-[#2196f3]/20" />
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          className="relative flex flex-col justify-between p-12 xl:p-16 w-full"
        >
          <div>
            <BrandWordmark size={48} />
          </div>

          <div className="space-y-8">
            <h2 className="text-4xl xl:text-5xl font-extrabold leading-tight">
              Trade smarter.
              <br />
              <span className="bx-text-gradient">Invest with confidence.</span>
              <br />
              <span className="bx-text-silver">Grow your wealth.</span>
            </h2>
            <p className="text-muted-foreground max-w-md leading-relaxed">
              The next-generation crypto trading platform. Industry-leading payouts, pro charting, and 24/7
              human support — all in one place.
            </p>
            <ul className="space-y-3">
              {BENEFITS.map((b) => (
                <li key={b.title} className="flex items-start gap-3">
                  <div className="relative">
                    <div className="h-9 w-9 rounded-full bx-blue-gradient flex items-center justify-center">
                      <b.icon className="h-4 w-4 text-white" />
                    </div>
                    <BadgeCheck className="absolute -bottom-1 -right-1 h-4 w-4 text-[#00c853] bg-[#02060f] rounded-full" />
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-white">{b.title}</div>
                    <div className="text-xs text-muted-foreground">{b.body}</div>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          <div className="bx-glass rounded-xl p-4 max-w-sm">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bx-silver-gradient flex items-center justify-center text-[#02060f] font-bold">S</div>
              <div>
                <div className="text-sm font-semibold text-white">Sarah K.</div>
                <div className="text-xs text-muted-foreground">VIP Level 3 • Active trader</div>
              </div>
            </div>
            <p className="mt-2 text-sm text-muted-foreground italic">
              "Brock Exchange pays out faster than any platform I've used. The 120s trades are addictive."
            </p>
          </div>
        </motion.div>
      </section>

      {/* Right form panel */}
      <section className="flex items-center justify-center p-6 sm:p-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md"
        >
          <div className="bx-glass rounded-2xl p-6 sm:p-8 bx-glow">
            <div className="flex flex-col items-center text-center mb-6">
              <div className="lg:hidden mb-4"><Logo size={48} /></div>
              <h1 className="text-2xl font-bold">
                {mode === "login" ? "Welcome back" : "Create your account"}
              </h1>
              <p className="text-sm text-muted-foreground mt-1">
                {mode === "login" ? "Login to access your dashboard" : "Start trading in under 60 seconds"}
              </p>
            </div>

            <div className="inline-flex items-center gap-2 rounded-full border border-[#2196f3]/30 bg-[#2196f3]/10 px-3 py-1 text-[11px] text-[#42a5f5] mb-5 w-full justify-center">
              <Shield className="h-3 w-3" />
              Secured by Brock Exchange • 256-bit encryption
            </div>

            <Tabs value={mode} onValueChange={(v) => setMode(v as "login" | "register")}>
              <TabsList className="grid w-full grid-cols-2 bg-white/5">
                <TabsTrigger value="login" className="data-[state=active]:bx-blue-gradient data-[state=active]:text-white">
                  <LogIn className="h-3.5 w-3.5 mr-1.5" /> Login
                </TabsTrigger>
                <TabsTrigger value="register" className="data-[state=active]:bx-blue-gradient data-[state=active]:text-white">
                  <UserPlus className="h-3.5 w-3.5 mr-1.5" /> Register
                </TabsTrigger>
              </TabsList>

              {/* LOGIN */}
              <TabsContent value="login" className="mt-5 space-y-4">
                <form onSubmit={handleLogin} className="space-y-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="email" className="text-xs">Email</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="email"
                        type="email"
                        placeholder="you@example.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="pl-9 bg-white/5 border-white/10"
                        required
                      />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="password" className="text-xs">Password</Label>
                      <button type="button" onClick={() => toast.info("Contact support to reset password.")} className="text-xs text-[#42a5f5] hover:underline">
                        Forgot?
                      </button>
                    </div>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="password"
                        type={showPwd ? "text" : "password"}
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="pl-9 pr-9 bg-white/5 border-white/10"
                        required
                      />
                      <button type="button" onClick={() => setShowPwd(!showPwd)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-white">
                        {showPwd ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>
                  <Button
                    type="submit"
                    disabled={loading}
                    className="w-full bx-blue-gradient bx-glow text-white border-0 h-11"
                  >
                    {loading ? "Logging in..." : "Login"}
                    {!loading && <ArrowRight className="ml-2 h-4 w-4" />}
                  </Button>
                </form>

                <div className="bx-glass-soft rounded-lg p-3 text-xs space-y-2">
                  <div className="text-muted-foreground font-medium">Demo credentials</div>
                  <div className="flex items-center justify-between gap-2">
                    <div>
                      <div className="text-white">Super Admin</div>
                      <div className="text-muted-foreground">crdbixx@gmail.com</div>
                    </div>
                    <Button size="sm" variant="outline" onClick={useAdmin} className="h-7 text-xs border-white/10">Use admin</Button>
                  </div>
                  <div className="flex items-center justify-between gap-2 pt-1 border-t border-white/5">
                    <div>
                      <div className="text-white">Sub-Agent</div>
                      <div className="text-muted-foreground">subagent1@trade.com / default</div>
                    </div>
                    <Button size="sm" variant="outline" onClick={useSubAgent} className="h-7 text-xs border-white/10">Use</Button>
                  </div>
                </div>

                <p className="text-center text-sm text-muted-foreground">
                  No account?{" "}
                  <button onClick={() => setMode("register")} className="text-[#42a5f5] hover:underline font-medium">
                    Register <ChevronRight className="inline h-3 w-3" />
                  </button>
                </p>
              </TabsContent>

              {/* REGISTER */}
              <TabsContent value="register" className="mt-5 space-y-3.5">
                <form onSubmit={handleRegister} className="space-y-3.5">
                  <div className="space-y-1.5">
                    <Label htmlFor="name" className="text-xs">Full name *</Label>
                    <Input
                      id="name"
                      placeholder="John Doe"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="bg-white/5 border-white/10"
                      required
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="rEmail" className="text-xs">Email *</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="rEmail"
                        type="email"
                        placeholder="you@example.com"
                        value={rEmail}
                        onChange={(e) => setREmail(e.target.value)}
                        className="pl-9 bg-white/5 border-white/10"
                        required
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <Label htmlFor="phone" className="text-xs">Phone</Label>
                      <Input
                        id="phone"
                        placeholder="+1 555 000 0000"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className="bg-white/5 border-white/10"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs">Country</Label>
                      <Select value={country} onValueChange={setCountry}>
                        <SelectTrigger className="bg-white/5 border-white/10">
                          <SelectValue placeholder="Select" />
                        </SelectTrigger>
                        <SelectContent className="bg-[#0a1322] border-white/10 max-h-60">
                          {COUNTRIES.map((c) => (
                            <SelectItem key={c} value={c}>{c}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <Label htmlFor="rPwd" className="text-xs">Password *</Label>
                      <div className="relative">
                        <Input
                          id="rPwd"
                          type={showPwd2 ? "text" : "password"}
                          placeholder="Min 6 chars"
                          value={rPwd}
                          onChange={(e) => setRPwd(e.target.value)}
                          className="pr-9 bg-white/5 border-white/10"
                          required
                        />
                        <button type="button" onClick={() => setShowPwd2(!showPwd2)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-white">
                          {showPwd2 ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="confirm" className="text-xs">Confirm *</Label>
                      <Input
                        id="confirm"
                        type={showPwd2 ? "text" : "password"}
                        placeholder="Repeat"
                        value={confirm}
                        onChange={(e) => setConfirm(e.target.value)}
                        className="bg-white/5 border-white/10"
                        required
                      />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="invitation" className="text-xs">Invitation code *</Label>
                    <div className="relative">
                      <BadgeCheck className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="invitation"
                        placeholder="PB-AG001"
                        value={invitation}
                        onChange={(e) => setInvitation(e.target.value.toUpperCase())}
                        className="pl-9 bg-white/5 border-white/10 uppercase"
                        required
                      />
                    </div>
                    <p className="text-[10px] text-muted-foreground">Provided by your broker. Try PB-AG001.</p>
                  </div>
                  <label className="flex items-start gap-2 cursor-pointer">
                    <Checkbox checked={terms} onCheckedChange={(v) => setTerms(!!v)} className="mt-0.5" />
                    <span className="text-xs text-muted-foreground leading-relaxed">
                      I agree to the <a href="#" onClick={(e) => e.preventDefault()} className="text-[#42a5f5]">Terms of Service</a>,{" "}
                      <a href="#" onClick={(e) => e.preventDefault()} className="text-[#42a5f5]">Privacy Policy</a>, and AML/KYC requirements.
                    </span>
                  </label>
                  <Button
                    type="submit"
                    disabled={loading}
                    className="w-full bx-blue-gradient bx-glow text-white border-0 h-11"
                  >
                    {loading ? "Creating..." : "Create Account"}
                    {!loading && <ArrowRight className="ml-2 h-4 w-4" />}
                  </Button>
                </form>
                <p className="text-center text-sm text-muted-foreground">
                  Already have an account?{" "}
                  <button onClick={() => setMode("login")} className="text-[#42a5f5] hover:underline font-medium">
                    Login
                  </button>
                </p>
              </TabsContent>
            </Tabs>
          </div>
        </motion.div>
      </section>
    </main>
  );
}

export default AuthView;
