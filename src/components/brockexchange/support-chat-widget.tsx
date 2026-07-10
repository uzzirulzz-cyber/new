"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageCircle, Send, X } from "lucide-react";
import { useAuth } from "@/lib/auth-store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  body: string;
  createdAt: string;
}

interface Conversation {
  id: string;
  customerId: string;
  subAgentId: string | null;
  subject: string;
  status: string;
  createdAt: string;
}

export function SupportChatWidget() {
  const { user, apiFetch } = useAuth();
  const [open, setOpen] = useState(false);
  const [conversation, setConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [bootloading, setBootloading] = useState(false);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Load existing conversation on mount
  useEffect(() => {
    if (!user || user.role !== "CUSTOMER") return;
    (async () => {
      try {
        const res = await apiFetch("/api/messages/conversations");
        const data = await res.json();
        if (data.conversations && data.conversations.length > 0) {
          setConversation(data.conversations[0]);
        }
      } catch {
        /* noop */
      }
    })();
  }, [user, apiFetch]);

  // Poll for new messages every 3s when open
  useEffect(() => {
    if (!open || !conversation) {
      if (pollRef.current) clearInterval(pollRef.current);
      return;
    }
    const poll = async () => {
      try {
        const res = await apiFetch(`/api/messages/conversations/${conversation.id}`);
        const data = await res.json();
        if (data.conversation?.messages) {
          setMessages(data.conversation.messages);
        }
      } catch {
        /* noop */
      }
    };
    poll();
    pollRef.current = setInterval(poll, 3000);
    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, [open, conversation, apiFetch]);

  // Auto-scroll
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  if (!user || user.role !== "CUSTOMER") return null;

  const startConversation = async () => {
    setBootloading(true);
    try {
      const res = await apiFetch("/api/messages/conversations", {
        method: "POST",
        body: JSON.stringify({ subject: "Support Chat" }),
      });
      const data = await res.json();
      if (res.ok) {
        setConversation(data.conversation);
        setMessages([]);
        toast.success("Support conversation started");
      } else {
        toast.error(data.error || "Failed to start chat");
      }
    } catch {
      toast.error("Network error");
    } finally {
      setBootloading(false);
    }
  };

  const send = async () => {
    if (!input.trim() || !conversation || loading) return;
    const body = input.trim();
    setInput("");
    setLoading(true);
    try {
      const res = await apiFetch("/api/messages/send", {
        method: "POST",
        body: JSON.stringify({ conversationId: conversation.id, body }),
      });
      const data = await res.json();
      if (res.ok && data.message) {
        setMessages((prev) => [...prev, data.message]);
      }
    } catch {
      /* noop */
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <motion.button
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setOpen(!open)}
        className="fixed bottom-5 right-5 z-50 h-14 w-14 rounded-full bx-blue-gradient bx-glow flex items-center justify-center text-white shadow-lg"
        aria-label="Support chat"
      >
        {open ? <X className="h-6 w-6" /> : <MessageCircle className="h-6 w-6" />}
        {!open && (
          <span className="absolute top-0 right-0 h-3 w-3 rounded-full bg-emerald-400 bx-pulse-dot" />
        )}
      </motion.button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 24, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 24, scale: 0.95 }}
            className="fixed bottom-24 right-5 z-50 w-[360px] max-w-[calc(100vw-2rem)] bx-glass rounded-2xl overflow-hidden bx-glow flex flex-col"
            style={{ height: "min(540px, calc(100vh - 8rem))" }}
          >
            {/* Header */}
            <div className="bx-blue-gradient p-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="h-9 w-9 rounded-full bg-white/20 flex items-center justify-center">
                  <MessageCircle className="h-5 w-5 text-white" />
                </div>
                <div>
                  <div className="text-sm font-semibold text-white">Brock Exchange Support</div>
                  <div className="text-[10px] text-white/80 flex items-center gap-1">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 bx-pulse-dot" /> Online • Replies in ~2m
                  </div>
                </div>
              </div>
              <button onClick={() => setOpen(false)} className="text-white/80 hover:text-white">
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Body */}
            {!conversation ? (
              <div className="flex-1 p-5 flex flex-col justify-center items-center">
                <MessageCircle className="h-10 w-10 text-[#2196f3] mb-3" />
                <h3 className="text-sm font-semibold text-white">How can we help?</h3>
                <p className="text-xs text-muted-foreground text-center mt-1 mb-4">
                  Start a conversation with our support team and we&apos;ll respond shortly.
                </p>
                <Button
                  onClick={startConversation}
                  disabled={bootloading}
                  className="w-full bx-blue-gradient bx-glow text-white border-0 h-9"
                >
                  {bootloading ? "Starting..." : "Start chat"}
                </Button>
              </div>
            ) : (
              <>
                <div className="px-4 py-2 border-b border-white/5 text-xs">
                  <div className="text-muted-foreground">Subject</div>
                  <div className="text-white font-medium">{conversation.subject}</div>
                </div>
                <div ref={scrollRef} className="flex-1 overflow-y-auto p-3 space-y-2">
                  {messages.length === 0 && (
                    <div className="text-center text-xs text-muted-foreground py-4">
                      No messages yet. Say hello 👋
                    </div>
                  )}
                  {messages.map((m) => {
                    const own = m.senderId === user.id;
                    return (
                      <div key={m.id} className={`flex ${own ? "justify-end" : "justify-start"}`}>
                        <div
                          className={`max-w-[78%] rounded-lg px-3 py-2 text-xs ${
                            own
                              ? "bx-blue-gradient text-white"
                              : "bg-white/5 text-white border border-white/5"
                          }`}
                        >
                          <div className="break-words">{m.body}</div>
                          <div
                            className={`text-[9px] mt-1 ${
                              own ? "text-white/70" : "text-muted-foreground"
                            }`}
                          >
                            {new Date(m.createdAt).toLocaleTimeString()}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
                <div className="p-3 border-t border-white/5 flex items-center gap-2">
                  <Input
                    placeholder="Type a message..."
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") send();
                    }}
                    className="bg-white/5 border-white/10 h-9 text-sm"
                  />
                  <Button
                    onClick={send}
                    size="icon"
                    disabled={loading}
                    className="bx-blue-gradient bx-glow text-white border-0 h-9 w-9 shrink-0"
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

export default SupportChatWidget;
