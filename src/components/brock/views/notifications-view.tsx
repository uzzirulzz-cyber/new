"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Bell, Check, CheckCheck, Info, AlertTriangle, Trophy, Shield } from "lucide-react";
import { useAuth, apiFetch } from "@/lib/auth-store";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

type Notif = {
  id: string;
  title: string;
  body: string;
  type: string;
  read: boolean;
  createdAt: string;
};

const ICONS: Record<string, React.ElementType> = {
  info: Info,
  success: Trophy,
  warning: AlertTriangle,
  danger: Shield,
};

export function NotificationsView() {
  const { user } = useAuth();
  const [items, setItems] = useState<Notif[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    try {
      const res = await apiFetch("/api/notifications");
      const data = await res.json();
      if (data.notifications) setItems(data.notifications);
    } catch {} finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const markAll = async () => {
    await apiFetch("/api/notifications", { method: "PATCH", body: JSON.stringify({ all: true }) });
    setItems((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const markOne = async (id: string) => {
    await apiFetch("/api/notifications", { method: "PATCH", body: JSON.stringify({ id }) });
    setItems((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
  };

  const unread = items.filter((n) => !n.read).length;

  return (
    <main className="flex-1 pt-20 pb-10 bx-fade-in">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-white">Notifications</h1>
            <p className="text-sm text-muted-foreground mt-1">{unread} unread of {items.length}</p>
          </div>
          {unread > 0 && (
            <Button onClick={markAll} variant="outline" className="border-white/10">
              <CheckCheck className="h-4 w-4 mr-1.5" /> Mark all read
            </Button>
          )}
        </motion.div>

        {loading ? (
          <div className="text-center text-xs text-muted-foreground py-8">Loading...</div>
        ) : items.length === 0 ? (
          <div className="bx-glass rounded-2xl p-12 text-center">
            <Bell className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
            <h3 className="text-lg font-semibold text-white">No notifications</h3>
            <p className="text-sm text-muted-foreground mt-1">You're all caught up.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {items.map((n) => {
              const Icon = ICONS[n.type] || Info;
              const color = n.type === "success" ? "#00c853" : n.type === "warning" ? "#f59e0b" : n.type === "danger" ? "#ff3b30" : "#2196f3";
              return (
                <motion.div
                  key={n.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`bx-glass rounded-xl p-4 ${!n.read ? "border-l-2 border-l-[#2196f3]" : ""}`}
                >
                  <div className="flex items-start gap-3">
                    <div className="h-9 w-9 rounded-full flex items-center justify-center shrink-0" style={{ background: `${color}1a`, color }}>
                      <Icon className="h-4 w-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h4 className="text-sm font-semibold text-white">{n.title}</h4>
                        {!n.read && <Badge variant="outline" className="border-[#2196f3]/40 text-[#2196f3] text-[10px]">NEW</Badge>}
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">{n.body}</p>
                      <div className="text-[10px] text-muted-foreground mt-2">{new Date(n.createdAt).toLocaleString()}</div>
                    </div>
                    {!n.read && (
                      <button onClick={() => markOne(n.id)} className="text-muted-foreground hover:text-white" title="Mark as read">
                        <Check className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}

export default NotificationsView;
