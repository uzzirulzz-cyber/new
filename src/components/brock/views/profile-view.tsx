"use client";

import { motion } from "framer-motion";
import { Mail, MapPin, Phone, Shield, User, BadgeCheck, Calendar, CreditCard } from "lucide-react";
import { useAuth } from "@/lib/auth-store";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function ProfileView() {
  const { user, navigate } = useAuth();
  if (!user) return null;

  return (
    <main className="flex-1 pt-20 pb-10 bx-fade-in">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
          <h1 className="text-2xl md:text-3xl font-bold text-white">My Profile</h1>
          <p className="text-sm text-muted-foreground mt-1">Account information and verification status.</p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Profile card */}
          <div className="bx-glass rounded-2xl p-6 text-center">
            <div className="h-20 w-20 rounded-full bx-blue-gradient bx-glow flex items-center justify-center text-3xl font-bold text-white mx-auto">
              {user.name.slice(0, 1).toUpperCase()}
            </div>
            <h2 className="mt-3 text-lg font-bold text-white">{user.name}</h2>
            <p className="text-xs text-muted-foreground">{user.email}</p>
            <div className="mt-3 flex items-center justify-center gap-1.5">
              <Badge variant="outline" className="border-[#2196f3]/40 text-[#2196f3]">VIP {user.vipLevel}</Badge>
              <Badge variant="outline" className="border-[#00c853]/40 text-[#00c853]">
                <BadgeCheck className="h-3 w-3 mr-1" /> Verified
              </Badge>
            </div>
            <div className="mt-5 grid grid-cols-2 gap-2 text-xs">
              <div className="bx-glass-soft rounded-lg p-3">
                <div className="text-muted-foreground">Balance</div>
                <div className="text-white font-bold">{user.balance.toFixed(2)}</div>
              </div>
              <div className="bx-glass-soft rounded-lg p-3">
                <div className="text-muted-foreground">UID</div>
                <div className="text-white font-mono text-[10px]">{user.uid}</div>
              </div>
            </div>
            <Button onClick={() => navigate("settings")} variant="outline" className="w-full mt-4 border-white/10">Edit profile</Button>
          </div>

          {/* Details */}
          <div className="lg:col-span-2 space-y-4">
            <div className="bx-glass rounded-2xl p-5">
              <h3 className="text-sm font-semibold text-white mb-4">Personal information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <Label className="text-xs">Full name</Label>
                  <div className="relative mt-1">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input readOnly value={user.name} className="pl-9 bg-white/5 border-white/10" />
                  </div>
                </div>
                <div>
                  <Label className="text-xs">Email</Label>
                  <div className="relative mt-1">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input readOnly value={user.email} className="pl-9 bg-white/5 border-white/10" />
                  </div>
                </div>
                <div>
                  <Label className="text-xs">Phone</Label>
                  <div className="relative mt-1">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input readOnly value={user.phone || "Not set"} className="pl-9 bg-white/5 border-white/10" />
                  </div>
                </div>
                <div>
                  <Label className="text-xs">Country</Label>
                  <div className="relative mt-1">
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input readOnly value={user.country || "Not set"} className="pl-9 bg-white/5 border-white/10" />
                  </div>
                </div>
                <div>
                  <Label className="text-xs">Joined</Label>
                  <div className="relative mt-1">
                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input readOnly value={new Date(user.registeredAt).toLocaleDateString()} className="pl-9 bg-white/5 border-white/10" />
                  </div>
                </div>
                <div>
                  <Label className="text-xs">Referral code used</Label>
                  <div className="relative mt-1">
                    <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input readOnly value={user.invitationCode || "Direct"} className="pl-9 bg-white/5 border-white/10" />
                  </div>
                </div>
              </div>
            </div>

            <div className="bx-glass rounded-2xl p-5">
              <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2"><Shield className="h-4 w-4 text-[#2196f3]" /> KYC verification</h3>
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm text-white">Identity verification</div>
                  <div className="text-xs text-muted-foreground">Status: {user.kycStatus}</div>
                </div>
                <Badge variant="outline" className={user.kycStatus === "VERIFIED" ? "border-[#00c853]/40 text-[#00c853]" : "border-[#f59e0b]/40 text-[#f59e0b]"}>
                  {user.kycStatus}
                </Badge>
              </div>
              {user.kycStatus !== "VERIFIED" && (
                <Button onClick={() => alert("KYC upload coming soon")} className="mt-3 bx-blue-gradient bx-glow text-white border-0 h-9">Submit KYC</Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

export default ProfileView;
