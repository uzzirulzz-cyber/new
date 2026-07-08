"use client";

import { useAuth } from "@/hooks/use-auth";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  User, Mail, Phone, Globe, Calendar, Shield, Smartphone,
  MapPin, CreditCard, Key, Fingerprint, LogIn, Monitor,
} from "lucide-react";
import { fmtUsd } from "@/lib/format";

export function CustomerProfile() {
  const { user, wallet } = useAuth();

  if (!user) return null;

  return (
    <div className="max-w-4xl mx-auto space-y-5">
      {/* Profile header */}
      <Card className="card-gradient p-6">
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4">
          <Avatar className="h-20 w-20 border-2 border-amber-500/30">
            <AvatarFallback className="bg-gradient-to-br from-amber-500/30 to-blue-500/30 text-2xl font-bold">
              {user.name.split(" ").map(n => n[0]).slice(0, 2).join("")}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 text-center sm:text-left">
            <h2 className="text-xl font-bold">{user.name}</h2>
            <p className="text-sm text-muted-foreground">{user.email}</p>
            <div className="flex flex-wrap items-center gap-2 mt-2 justify-center sm:justify-start">
              <Badge variant="secondary" className="bg-amber-500/15 text-amber-400 font-mono">{user.uid}</Badge>
              <Badge variant="secondary" className="capitalize bg-blue-500/15 text-blue-400">{user.role.toLowerCase()}</Badge>
              <Badge variant="secondary" className="capitalize bg-emerald-500/15 text-emerald-400">{user.status.toLowerCase()}</Badge>
              <Badge variant="secondary" className={`capitalize ${user.kycStatus === "VERIFIED" ? "bg-emerald-500/15 text-emerald-400" : "bg-amber-500/15 text-amber-400"}`}>
                KYC: {user.kycStatus.toLowerCase()}
              </Badge>
            </div>
          </div>
          {wallet && (
            <div className="text-center sm:text-right">
              <p className="text-xs text-muted-foreground">Total Balance</p>
              <p className="text-2xl font-bold text-amber-500">{fmtUsd(wallet.totalAssets)}</p>
            </div>
          )}
        </div>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Personal information */}
        <Card className="card-gradient p-5">
          <div className="flex items-center gap-2 mb-4">
            <User className="h-4 w-4 text-amber-500" />
            <h3 className="font-bold">Personal Information</h3>
          </div>
          <div className="space-y-3">
            <InfoRow icon={User} label="Full Name" value={user.name} />
            <InfoRow icon={Mail} label="Email" value={user.email} />
            <InfoRow icon={Phone} label="Mobile" value={user.mobile || "Not set"} />
            <InfoRow icon={Globe} label="Country" value={user.country || "Not set"} />
            <InfoRow icon={Calendar} label="Registered" value={new Date(user.createdAt).toLocaleDateString()} />
            <InfoRow icon={LogIn} label="Last Login" value={user.lastLogin ? new Date(user.lastLogin).toLocaleString() : "Never"} />
          </div>
        </Card>

        {/* Security & account */}
        <Card className="card-gradient p-5">
          <div className="flex items-center gap-2 mb-4">
            <Shield className="h-4 w-4 text-blue-400" />
            <h3 className="font-bold">Security Status</h3>
          </div>
          <div className="space-y-3">
            <InfoRow icon={Key} label="Password" value="•••••••• (Change)" />
            <InfoRow icon={Fingerprint} label="2FA" value={user.kycStatus === "VERIFIED" ? "Enabled" : "Not enabled"} />
            <InfoRow icon={CreditCard} label="KYC Status" value={user.kycStatus} />
            <InfoRow icon={Smartphone} label="Last Device" value={user.lastLoginIp || "Unknown"} />
            <InfoRow icon={MapPin} label="Last IP" value={user.lastLoginIp || "Unknown"} />
            <InfoRow icon={Calendar} label="Referral Code" value={user.referralCode} />
          </div>
        </Card>

        {/* Bank details (placeholder — would be from DB in production) */}
        <Card className="card-gradient p-5">
          <div className="flex items-center gap-2 mb-4">
            <CreditCard className="h-4 w-4 text-emerald-400" />
            <h3 className="font-bold">Bank Details</h3>
          </div>
          <p className="text-xs text-muted-foreground text-center py-6">
            No bank account linked. Add a bank account to enable withdrawals.
          </p>
        </Card>

        {/* Login sessions */}
        <Card className="card-gradient p-5">
          <div className="flex items-center gap-2 mb-4">
            <Monitor className="h-4 w-4 text-purple-400" />
            <h3 className="font-bold">Login History</h3>
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-emerald-400" />
                <span>Current session</span>
              </div>
              <span className="text-muted-foreground">Active now</span>
            </div>
            {user.lastLogin && (
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>Previous login</span>
                <span>{new Date(user.lastLogin).toLocaleString()}</span>
              </div>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}

function InfoRow({ icon: Icon, label, value }: any) {
  return (
    <div className="flex items-center gap-3">
      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-sidebar-accent/60 shrink-0">
        <Icon className="h-4 w-4 text-muted-foreground" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-[10px] text-muted-foreground">{label}</p>
        <p className="text-sm font-medium truncate">{value}</p>
      </div>
    </div>
  );
}
