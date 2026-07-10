"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageCircle, Send, Headphones, Plus, Clock } from "lucide-react";
import { useAuth } from "@/lib/auth-store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
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
  customer?: { name: string; uid: string };
  messages?: Message[];
}

interface SubAgent {
  id: string;
  uid: string;
  name: string;
  email: string;
  phone: string | null;
  status: string;
  lastLoginAt: string | null;
  online: boolean;
}

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return "just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  return `${d}d ago`;
}

function fmtTime(iso: string): string {
  return new Date(iso).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

export function SupportView() {
  const { user, apiFetch } = useAuth();

  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [activeConv, setActiveConv] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [agent, setAgent] = useState<SubAgent | null>(null);

  const [loadingList, setLoadingList] = useState(true);
  const [loadingConv, setLoadingConv] = useState(false);
  const [sending, setSending] = useState(false);
  const [starting, setStarting] = useState(false);

  const [mobileShowChat, setMobileShowChat] = useState(false);

  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Load conversation list
  const loadConversations = useCallback(async () => {
    try {
      const res = await apiFetch("/api/messages/conversations");
      const data = await res.json();
      if (res.ok && data.conversations) {
        setConversations(data.conversations);
        // Auto-select first conversation if none selected
        if (!activeId && data.conversations.length > 0) {
          setActiveId(data.conversations[0].id);
        }
      }
    } catch {
      /* noop */
    } finally {
      setLoadingList(false);
    }
  }, [apiFetch, activeId]);

  // Load assigned sub-agent
  const loadAgent = useCallback(async () => {
    try {
      const res = await apiFetch("/api/messages/agent");
      const data = await res.json();
      if (res.ok) {
        setAgent(data.agent);
      }
    } catch {
      /* noop */
    }
  }, [apiFetch]);

  useEffect(() => {
    loadConversations();
    loadAgent();
  }, [loadConversations, loadAgent]);

  // Poll for new messages every 3s when a conversation is active
  const loadActiveConv = useCallback(async () => {
    if (!activeId) return;
    try {
      const res = await apiFetch(`/api/messages/conversations/${activeId}`);
      const data = await res.json();
      if (res.ok && data.conversation) {
        setActiveConv(data.conversation);
        setMessages(data.conversation.messages || []);
      }
    } catch {
      /* noop */
    } finally {
      setLoadingConv(false);
    }
  }, [apiFetch, activeId]);

  useEffect(() => {
    if (!activeId) {
      setActiveConv(null);
      setMessages([]);
      return;
    }
    setLoadingConv(true);
    loadActiveConv();
    pollRef.current = setInterval(loadActiveConv, 3000);
    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, [activeId, loadActiveConv]);

  // Auto-scroll on new messages
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const startConversation = async () => {
    setStarting(true);
    try {
      const res = await apiFetch("/api/messages/conversations", {
        method: "POST",
        body: JSON.stringify({ subject: "Support Chat" }),
      });
      const data = await res.json();
      if (res.ok && data.conversation) {
        toast.success("New conversation started");
        await loadConversations();
        setActiveId(data.conversation.id);
        setMobileShowChat(true);
      } else {
        toast.error(data.error || "Failed to start conversation");
      }
    } catch {
      toast.error("Network error");
    } finally {
      setStarting(false);
    }
  };

  const send = async () => {
    const body = input.trim();
    if (!body || !activeId || sending) return;
    setInput("");
    setSending(true);
    try {
      const res = await apiFetch("/api/messages/send", {
        method: "POST",
        body: JSON.stringify({ conversationId: activeId, body }),
      });
      const data = await res.json();
      if (res.ok && data.message) {
        setMessages((prev) => [...prev, data.message]);
      } else {
        toast.error(data.error || "Failed to send");
        setInput(body);
      }
    } catch {
      toast.error("Network error");
      setInput(body);
    } finally {
      setSending(false);
    }
  };

  return (
    <main className="flex-1 pt-16 bx-fade-in bx-grid-bg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
        >
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <Headphones className="h-6 w-6 text-[#2196f3]" />
              <span className="bx-text-gradient">Support</span>
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Chat with your dedicated account manager — we typically reply within minutes.
            </p>
          </div>
          <Button
            onClick={startConversation}
            disabled={starting}
            className="bx-blue-gradient bx-glow text-white border-0"
          >
            <Plus className="h-4 w-4 mr-1" />
            {starting ? "Starting..." : "Start New Conversation"}
          </Button>
        </motion.div>

        {/* Agent card */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="bx-glass rounded-xl p-4 mb-4 flex items-center justify-between gap-4"
        >
          <div className="flex items-center gap-3 min-w-0">
            <div className="h-11 w-11 rounded-full bx-blue-gradient flex items-center justify-center shrink-0">
              <Headphones className="h-5 w-5 text-white" />
            </div>
            <div className="min-w-0">
              <div className="text-sm font-semibold truncate">
                {agent ? agent.name : "Account Manager"}
              </div>
              <div className="text-xs text-muted-foreground flex items-center gap-1.5">
                <span
                  className={`h-1.5 w-1.5 rounded-full bx-pulse-dot ${
                    agent?.online ? "bg-emerald-400" : "bg-muted-foreground"
                  }`}
                />
                {agent?.online ? "Online now" : agent?.lastLoginAt ? `Last seen ${timeAgo(agent.lastLoginAt)}` : "Offline"}
                <span className="text-muted-foreground/60">·</span>
                <span className="truncate">Dedicated Support Agent</span>
              </div>
            </div>
          </div>
          <Badge
            variant="outline"
            className="border-[#2196f3]/40 text-[#42a5f5] bg-[#2196f3]/10 shrink-0"
          >
            {agent?.online ? "Available" : "Away"}
          </Badge>
        </motion.div>

        {/* Main split layout */}
        <div className="grid grid-cols-1 lg:grid-cols-[320px_1fr] gap-4 h-[calc(100vh-22rem)] min-h-[480px]">
          {/* Sidebar: conversation list */}
          <div
            className={`bx-glass rounded-xl flex flex-col overflow-hidden ${
              mobileShowChat ? "hidden lg:flex" : "flex"
            }`}
          >
            <div className="px-4 py-3 border-b border-white/5 flex items-center justify-between">
              <div className="text-sm font-semibold flex items-center gap-2">
                <MessageCircle className="h-4 w-4 text-[#2196f3]" />
                Conversations
              </div>
              <Badge variant="secondary" className="text-[10px]">
                {conversations.length}
              </Badge>
            </div>
            <div className="flex-1 overflow-y-auto max-h-96 lg:max-h-none">
              {loadingList ? (
                <div className="p-4 space-y-2">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="h-16 rounded-lg bg-white/5 animate-pulse" />
                  ))}
                </div>
              ) : conversations.length === 0 ? (
                <div className="p-6 text-center text-sm text-muted-foreground">
                  <MessageCircle className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  No conversations yet.
                  <br />
                  Start a new chat to get help.
                </div>
              ) : (
                conversations.map((c) => {
                  const lastMsg = c.messages?.[0];
                  const isActive = c.id === activeId;
                  return (
                    <button
                      key={c.id}
                      onClick={() => {
                        setActiveId(c.id);
                        setMobileShowChat(true);
                      }}
                      className={`w-full text-left px-4 py-3 border-b border-white/5 transition-colors ${
                        isActive ? "bg-[#2196f3]/10" : "hover:bg-white/5"
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <div className="text-sm font-medium truncate">{c.subject}</div>
                        <div className="text-[10px] text-muted-foreground shrink-0 flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {timeAgo(c.createdAt)}
                        </div>
                      </div>
                      <div className="text-xs text-muted-foreground truncate">
                        {lastMsg ? lastMsg.body : "No messages yet"}
                      </div>
                      <div className="flex items-center justify-between mt-1">
                        <Badge
                          variant="outline"
                          className={`text-[9px] h-4 ${
                            c.status === "open"
                              ? "border-emerald-500/40 text-emerald-400 bg-emerald-500/10"
                              : "border-white/10 text-muted-foreground"
                          }`}
                        >
                          {c.status}
                        </Badge>
                      </div>
                    </button>
                  );
                })
              )}
            </div>
          </div>

          {/* Right panel: chat */}
          <div
            className={`bx-glass rounded-xl flex flex-col overflow-hidden ${
              mobileShowChat ? "flex" : "hidden lg:flex"
            }`}
          >
            {mobileShowChat && (
              <button
                onClick={() => setMobileShowChat(false)}
                className="lg:hidden px-4 py-2 text-xs text-muted-foreground border-b border-white/5 text-left"
              >
                ← Back to conversations
              </button>
            )}

            {!activeId ? (
              <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
                <div className="h-16 w-16 rounded-full bx-blue-gradient bx-glow flex items-center justify-center mb-4">
                  <Headphones className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-base font-semibold mb-1">How can we help?</h3>
                <p className="text-sm text-muted-foreground max-w-sm mb-4">
                  Select an existing conversation or start a new one to chat with your account manager.
                </p>
                <Button
                  onClick={startConversation}
                  disabled={starting}
                  className="bx-blue-gradient bx-glow text-white border-0"
                >
                  <Plus className="h-4 w-4 mr-1" />
                  {starting ? "Starting..." : "Start New Conversation"}
                </Button>
              </div>
            ) : (
              <>
                {/* Conversation header */}
                <div className="px-4 py-3 border-b border-white/5 flex items-center justify-between gap-2">
                  <div className="min-w-0">
                    <div className="text-sm font-semibold truncate">
                      {activeConv?.subject || "Support Chat"}
                    </div>
                    <div className="text-[11px] text-muted-foreground flex items-center gap-1.5">
                      <span
                        className={`h-1.5 w-1.5 rounded-full ${
                          agent?.online ? "bg-emerald-400 bx-pulse-dot" : "bg-muted-foreground"
                        }`}
                      />
                      {agent?.name || "Account Manager"}
                      {agent?.online ? " · Online" : ""}
                    </div>
                  </div>
                  <Badge
                    variant="outline"
                    className={`text-[10px] ${
                      activeConv?.status === "open"
                        ? "border-emerald-500/40 text-emerald-400 bg-emerald-500/10"
                        : "border-white/10 text-muted-foreground"
                    }`}
                  >
                    {activeConv?.status || "open"}
                  </Badge>
                </div>

                {/* Messages */}
                <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-3 max-h-[60vh] lg:max-h-none">
                  {loadingConv && messages.length === 0 ? (
                    <div className="space-y-2">
                      {[1, 2, 3].map((i) => (
                        <div
                          key={i}
                          className={`h-12 w-2/3 rounded-lg bg-white/5 animate-pulse ${
                            i % 2 === 0 ? "ml-auto" : ""
                          }`}
                        />
                      ))}
                    </div>
                  ) : messages.length === 0 ? (
                    <div className="text-center text-sm text-muted-foreground py-10">
                      <MessageCircle className="h-8 w-8 mx-auto mb-2 opacity-50" />
                      No messages yet. Say hello 👋
                    </div>
                  ) : (
                    <AnimatePresence initial={false}>
                      {messages.map((m) => {
                        const own = user ? m.senderId === user.id : false;
                        return (
                          <motion.div
                            key={m.id}
                            initial={{ opacity: 0, y: 6 }}
                            animate={{ opacity: 1, y: 0 }}
                            className={`flex ${own ? "justify-end" : "justify-start"}`}
                          >
                            <div
                              className={`max-w-[80%] rounded-2xl px-3.5 py-2 text-sm ${
                                own
                                  ? "bx-blue-gradient text-white rounded-br-sm"
                                  : "bg-white/5 text-[#E0E0E0] border border-white/5 rounded-bl-sm"
                              }`}
                            >
                              <div className="break-words whitespace-pre-wrap">{m.body}</div>
                              <div
                                className={`text-[9px] mt-1 flex items-center gap-1 ${
                                  own ? "text-white/70 justify-end" : "text-muted-foreground"
                                }`}
                              >
                                <Clock className="h-2.5 w-2.5" />
                                {fmtTime(m.createdAt)}
                              </div>
                            </div>
                          </motion.div>
                        );
                      })}
                    </AnimatePresence>
                  )}
                </div>

                {/* Input */}
                <div className="p-3 border-t border-white/5 flex items-center gap-2">
                  <Input
                    placeholder="Type a message..."
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        send();
                      }
                    }}
                    disabled={sending}
                    className="bg-white/5 border-white/10"
                  />
                  <Button
                    onClick={send}
                    size="icon"
                    disabled={sending || !input.trim()}
                    className="bx-blue-gradient bx-glow text-white border-0 shrink-0"
                    aria-label="Send message"
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}

export default SupportView;
