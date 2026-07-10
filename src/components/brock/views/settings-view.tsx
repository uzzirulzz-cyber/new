"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Globe, Lock, Bell, Palette, Shield, Smartphone } from "lucide-react";
import { useAuth } from "@/lib/auth-store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";

export function SettingsView() {
  const { user } = useAuth();
  const [name, setName] = useState(user?.name || "");
  const [phone, setPhone] = useState(user?.phone || "");
  const [country, setCountry] = useState(user?.country || "");
  const [notifEmail, setNotifEmail] = useState(true);
  const [notifPush, setNotifPush] = useState(true);
  const [notifTrade, setNotifTrade] = useState(true);

  if (!user) return null;

  const save = () => toast.success("Settings saved (demo)");
  const savePwd = () => toast.success("Password updated (demo)");

  return (
    <main className="flex-1 pt-20 pb-10 bx-fade-in">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
          <h1 className="text-2xl md:text-3xl font-bold text-white">Settings</h1>
          <p className="text-sm text-muted-foreground mt-1">Manage your account preferences.</p>
        </motion.div>

        <div className="bx-glass rounded-2xl p-5">
          <Tabs defaultValue="profile">
            <TabsList className="bg-white/5 flex-wrap h-auto">
              <TabsTrigger value="profile" className="data-[state=active]:bx-blue-gradient data-[state=active]:text-white"><Shield className="h-3.5 w-3.5 mr-1.5" /> Profile</TabsTrigger>
              <TabsTrigger value="security" className="data-[state=active]:bx-blue-gradient data-[state=active]:text-white"><Lock className="h-3.5 w-3.5 mr-1.5" /> Security</TabsTrigger>
              <TabsTrigger value="notifications" className="data-[state=active]:bx-blue-gradient data-[state=active]:text-white"><Bell className="h-3.5 w-3.5 mr-1.5" /> Notifications</TabsTrigger>
              <TabsTrigger value="preferences" className="data-[state=active]:bx-blue-gradient data-[state=active]:text-white"><Palette className="h-3.5 w-3.5 mr-1.5" /> Preferences</TabsTrigger>
            </TabsList>

            <TabsContent value="profile" className="mt-5 space-y-3">
              <div>
                <Label className="text-xs">Full name</Label>
                <Input value={name} onChange={(e) => setName(e.target.value)} className="bg-white/5 border-white/10 mt-1" />
              </div>
              <div>
                <Label className="text-xs">Phone</Label>
                <Input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+1 555 000 0000" className="bg-white/5 border-white/10 mt-1" />
              </div>
              <div>
                <Label className="text-xs">Country</Label>
                <Select value={country} onValueChange={setCountry}>
                  <SelectTrigger className="bg-white/5 border-white/10 mt-1"><SelectValue placeholder="Select country" /></SelectTrigger>
                  <SelectContent className="bg-[#0a1322] border-white/10">
                    {["United States", "United Kingdom", "United Arab Emirates", "Singapore", "Pakistan", "India", "Malaysia", "Nigeria", "Germany", "Brazil"].map((c) => (
                      <SelectItem key={c} value={c}>{c}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <Button onClick={save} className="bx-blue-gradient bx-glow text-white border-0">Save changes</Button>
            </TabsContent>

            <TabsContent value="security" className="mt-5 space-y-3">
              <div>
                <Label className="text-xs">Current password</Label>
                <Input type="password" placeholder="••••••••" className="bg-white/5 border-white/10 mt-1" />
              </div>
              <div>
                <Label className="text-xs">New password</Label>
                <Input type="password" placeholder="Min 6 characters" className="bg-white/5 border-white/10 mt-1" />
              </div>
              <div>
                <Label className="text-xs">Confirm new password</Label>
                <Input type="password" placeholder="Repeat" className="bg-white/5 border-white/10 mt-1" />
              </div>
              <Button onClick={savePwd} className="bx-blue-gradient bx-glow text-white border-0">Update password</Button>
              <div className="bx-glass-soft rounded-lg p-3 flex items-center justify-between mt-4">
                <div className="flex items-center gap-2">
                  <Smartphone className="h-4 w-4 text-[#2196f3]" />
                  <div>
                    <div className="text-sm text-white">Two-factor authentication</div>
                    <div className="text-xs text-muted-foreground">Add an extra layer of security</div>
                  </div>
                </div>
                <Switch />
              </div>
            </TabsContent>

            <TabsContent value="notifications" className="mt-5 space-y-2">
              <div className="bx-glass-soft rounded-lg p-3 flex items-center justify-between">
                <div><div className="text-sm text-white">Email notifications</div><div className="text-xs text-muted-foreground">Deposits, withdrawals, security alerts</div></div>
                <Switch checked={notifEmail} onCheckedChange={setNotifEmail} />
              </div>
              <div className="bx-glass-soft rounded-lg p-3 flex items-center justify-between">
                <div><div className="text-sm text-white">Push notifications</div><div className="text-xs text-muted-foreground">Real-time trade updates</div></div>
                <Switch checked={notifPush} onCheckedChange={setNotifPush} />
              </div>
              <div className="bx-glass-soft rounded-lg p-3 flex items-center justify-between">
                <div><div className="text-sm text-white">Trade result alerts</div><div className="text-xs text-muted-foreground">Get notified when trades settle</div></div>
                <Switch checked={notifTrade} onCheckedChange={setNotifTrade} />
              </div>
              <Button onClick={save} className="mt-2 bx-blue-gradient bx-glow text-white border-0">Save preferences</Button>
            </TabsContent>

            <TabsContent value="preferences" className="mt-5 space-y-3">
              <div>
                <Label className="text-xs"><Globe className="h-3 w-3 inline mr-1" /> Language</Label>
                <Select defaultValue="en">
                  <SelectTrigger className="bg-white/5 border-white/10 mt-1"><SelectValue /></SelectTrigger>
                  <SelectContent className="bg-[#0a1322] border-white/10">
                    <SelectItem value="en">English</SelectItem>
                    <SelectItem value="es">Español</SelectItem>
                    <SelectItem value="ar">العربية</SelectItem>
                    <SelectItem value="ur">اردو</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-xs">Display currency</Label>
                <Select defaultValue="USDT">
                  <SelectTrigger className="bg-white/5 border-white/10 mt-1"><SelectValue /></SelectTrigger>
                  <SelectContent className="bg-[#0a1322] border-white/10">
                    <SelectItem value="USDT">USDT</SelectItem>
                    <SelectItem value="USD">USD</SelectItem>
                    <SelectItem value="EUR">EUR</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button onClick={save} className="bx-blue-gradient bx-glow text-white border-0">Save preferences</Button>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </main>
  );
}

export default SettingsView;
