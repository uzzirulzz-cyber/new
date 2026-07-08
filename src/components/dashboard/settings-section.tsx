"use client";

import { useState } from "react";
import { toast } from "sonner";
import {
  Settings2,
  Shield,
  FileCheck,
  Bell,
  Save,
  RotateCcw,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { settings, type Setting } from "@/lib/dashboard-data";

const CATEGORIES: {
  key: Setting["category"];
  label: string;
  icon: typeof Settings2;
  description: string;
}[] = [
  { key: "trading", label: "Trading Engine", icon: Settings2, description: "Order matching, listing, and circuit breaker controls." },
  { key: "security", label: "Security", icon: Shield, description: "Wallet, withdrawal, and account protection policies." },
  { key: "compliance", label: "Compliance", icon: FileCheck, description: "KYC, AML, and regulatory screening rules." },
  { key: "notifications", label: "Notifications", icon: Bell, description: "Alert routing for ops, compliance, and treasury teams." },
];

export function SettingsSection() {
  const [state, setState] = useState<Record<string, boolean>>(
    Object.fromEntries(settings.map((s) => [s.key, s.value]))
  );
  const [dirty, setDirty] = useState(false);

  const toggle = (key: string) => {
    setState((prev) => ({ ...prev, [key]: !prev[key] }));
    setDirty(true);
  };

  const save = () => {
    setDirty(false);
    toast.success("Settings saved", {
      description: "Changes have been applied to the live configuration.",
    });
  };

  const reset = () => {
    setState(Object.fromEntries(settings.map((s) => [s.key, s.value])));
    setDirty(false);
    toast.info("Changes reverted", {
      description: "All settings restored to their last saved state.",
    });
  };

  return (
    <div className="space-y-5">
      {/* Exchange profile */}
      <Card className="card-gradient p-5 lg:p-6">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h3 className="text-base font-semibold">Exchange Profile</h3>
            <p className="text-xs text-muted-foreground">Public-facing identity and operational parameters.</p>
          </div>
          <Badge variant="secondary" className="bg-emerald-500/15 text-emerald-400">
            Production
          </Badge>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label htmlFor="ex-name" className="text-xs">Exchange name</Label>
            <Input id="ex-name" defaultValue="Brock Exchange" className="h-9 bg-muted/40" />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="ex-domain" className="text-xs">Primary domain</Label>
            <Input id="ex-domain" defaultValue="brock.exchange" className="h-9 bg-muted/40" />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="ex-fee" className="text-xs">Default trading fee (%)</Label>
            <Input id="ex-fee" defaultValue="0.10" className="h-9 bg-muted/40" />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="ex-withdraw" className="text-xs">Daily withdrawal cap (USD)</Label>
            <Input id="ex-withdraw" defaultValue="500000" className="h-9 bg-muted/40" />
          </div>
          <div className="space-y-1.5 md:col-span-2">
            <Label htmlFor="ex-support" className="text-xs">Support email</Label>
            <Input id="ex-support" defaultValue="support@brock.exchange" className="h-9 bg-muted/40" />
          </div>
        </div>
      </Card>

      {/* Categorized toggles */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {CATEGORIES.map((cat) => {
          const Icon = cat.icon;
          const catSettings = settings.filter((s) => s.category === cat.key);
          return (
            <Card key={cat.key} className="card-gradient p-5">
              <div className="flex items-start gap-3 mb-4">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-500/15 text-emerald-400 shrink-0">
                  <Icon className="h-4 w-4" />
                </div>
                <div className="min-w-0">
                  <h4 className="text-sm font-semibold">{cat.label}</h4>
                  <p className="text-xs text-muted-foreground leading-relaxed">{cat.description}</p>
                </div>
              </div>
              <div className="space-y-1">
                {catSettings.map((s) => (
                  <div
                    key={s.key}
                    className="flex items-start justify-between gap-3 rounded-lg px-2 py-2.5 hover:bg-muted/30 transition-colors"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium">{s.label}</p>
                      <p className="text-[11px] text-muted-foreground leading-relaxed mt-0.5">
                        {s.description}
                      </p>
                    </div>
                    <Switch
                      checked={state[s.key]}
                      onCheckedChange={() => toggle(s.key)}
                      className="data-[state=checked]:bg-emerald-500 shrink-0 mt-0.5"
                    />
                  </div>
                ))}
              </div>
            </Card>
          );
        })}
      </div>

      {/* Action bar */}
      <div className="sticky bottom-4 z-10">
        <Card className={`card-gradient p-3 flex items-center justify-between transition-all ${dirty ? "border-emerald-500/40" : ""}`}>
          <div className="flex items-center gap-2 text-sm">
            {dirty ? (
              <>
                <span className="h-2 w-2 rounded-full bg-amber-400 pulse-dot" />
                <span className="text-muted-foreground">You have unsaved changes</span>
              </>
            ) : (
              <>
                <span className="h-2 w-2 rounded-full bg-emerald-400" />
                <span className="text-muted-foreground">All changes saved</span>
              </>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" className="h-8" onClick={reset} disabled={!dirty}>
              <RotateCcw className="h-3.5 w-3.5 mr-1.5" />
              Revert
            </Button>
            <Button
              size="sm"
              className="h-8 bg-emerald-500 hover:bg-emerald-600 text-emerald-950"
              onClick={save}
              disabled={!dirty}
            >
              <Save className="h-3.5 w-3.5 mr-1.5" />
              Save changes
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}
