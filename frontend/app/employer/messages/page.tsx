"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Loader2, MessageCircle, Send, Sparkles } from "lucide-react";
import EmployerShell from "@/components/employer/EmployerShell";
import {
  getConversationMessages,
  getConversations,
  getSuggestedReplies,
  sendMessage,
  type Conversation,
  type MessageItem,
} from "@/lib/api";
import { useAuthStore } from "@/store/authStore";

const POLL_MS = 6000;

function MessagesPage() {
  const token = useAuthStore((s) => s.token);
  const requestedConversationId = useSearchParams().get("conversation");
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeId, setActiveId] = useState<string | null>(requestedConversationId);
  const [messages, setMessages] = useState<MessageItem[]>([]);
  const [draft, setDraft] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const bottomRef = useRef<HTMLDivElement>(null);

  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [suggesting, setSuggesting] = useState(false);
  const [suggestUnavailable, setSuggestUnavailable] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function loadConversations() {
    if (!token) return;
    const convos = await getConversations(token);
    setConversations(convos);
    if (!activeId && convos.length > 0) setActiveId(convos[0].id);
  }

  async function loadMessages(conversationId: string) {
    if (!token) return;
    const msgs = await getConversationMessages(token, conversationId);
    setMessages(msgs);
  }

  useEffect(() => {
    if (!token) return;
    loadConversations().finally(() => setIsLoading(false));
    const interval = setInterval(loadConversations, POLL_MS);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  useEffect(() => {
    if (!activeId) return;
    loadMessages(activeId);
    setSuggestions([]);
    setSuggestUnavailable(false);
    const interval = setInterval(() => loadMessages(activeId), POLL_MS);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function handleSend() {
    if (!token || !activeId || !draft.trim()) return;
    const content = draft.trim();
    setDraft("");
    setSuggestions([]);
    try {
      const msg = await sendMessage(token, activeId, content);
      setMessages((prev) => [...prev, msg]);
    } catch {
      setDraft(content);
      setError("Your message could not be sent. Please try again.");
    }
  }

  async function handleSuggest() {
    if (!token || !activeId) return;
    setSuggesting(true);
    setSuggestUnavailable(false);
    try {
      const res = await getSuggestedReplies(token, activeId);
      if (res.ai_available) {
        setSuggestions(res.suggestions);
      } else {
        setSuggestions([]);
        setSuggestUnavailable(true);
      }
    } finally {
      setSuggesting(false);
    }
  }

  const activeConversation = conversations.find((c) => c.id === activeId);

  return (
    <EmployerShell>
      <div className="flex items-center gap-2">
        <MessageCircle className="h-6 w-6 text-wazifny-green" />
        <h1 className="text-2xl font-bold text-wazifny-navy">Messages</h1>
      </div>
      <p className="mt-1 text-sm text-slate-500">Stay in touch with candidates and hiring teams.</p>
      {error && <p className="mt-3 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>}

      {isLoading ? (
        <div className="flex justify-center py-24">
          <Loader2 className="h-6 w-6 animate-spin text-wazifny-green" />
        </div>
      ) : conversations.length === 0 ? (
        <div className="mt-6 rounded-xl border border-dashed border-slate-200 py-16 text-center text-slate-400">
          No conversations yet.
        </div>
      ) : (
        <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-[300px_1fr]">
          <div className="rounded-xl border border-slate-100 bg-white shadow-card">
            <p className="border-b border-slate-100 px-4 py-3 text-sm font-semibold text-wazifny-navy">
              Conversations
            </p>
            {conversations.map((c) => (
              <button
                key={c.id}
                onClick={() => setActiveId(c.id)}
                className={`flex w-full items-center gap-3 border-b border-slate-50 px-4 py-3 text-left transition-colors ${
                  c.id === activeId ? "bg-wazifny-green/5" : "hover:bg-slate-50"
                }`}
              >
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-wazifny-green text-sm font-bold text-white">
                  {c.other_party_name[0]?.toUpperCase()}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="flex items-center justify-between">
                    <span className="truncate text-sm font-semibold text-wazifny-navy">
                      {c.other_party_name}
                    </span>
                    {c.unread_count > 0 && (
                      <span className="ml-2 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-wazifny-green text-[10px] font-bold text-white">
                        {c.unread_count}
                      </span>
                    )}
                  </span>
                  <span className="block truncate text-xs text-slate-400">{c.last_message}</span>
                </span>
              </button>
            ))}
          </div>

          <div className="flex h-[560px] flex-col rounded-xl border border-slate-100 bg-white shadow-card">
            {activeConversation && (
              <div className="border-b border-slate-100 px-5 py-3">
                <p className="font-semibold text-wazifny-navy">{activeConversation.other_party_name}</p>
                <p className="text-xs capitalize text-slate-400">{activeConversation.other_party_role}</p>
              </div>
            )}

            <div className="flex-1 space-y-3 overflow-y-auto px-5 py-4">
              {messages.map((m) => {
                const isMine = m.sender_id !== activeConversation?.other_party_id;
                return (
                  <div key={m.id} className={`flex ${isMine ? "justify-end" : "justify-start"}`}>
                    <div
                      className={`max-w-xs rounded-2xl px-4 py-2.5 text-sm ${
                        isMine
                          ? "bg-wazifny-green text-white"
                          : "bg-slate-100 text-wazifny-navy"
                      }`}
                    >
                      {m.content}
                      {m.sent_at && (
                        <p className={`mt-1 text-[10px] ${isMine ? "text-white/70" : "text-slate-400"}`}>
                          {new Date(m.sent_at).toLocaleTimeString("en-US", {
                            hour: "2-digit", minute: "2-digit",
                          })}
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
              <div ref={bottomRef} />
            </div>

            {(suggestions.length > 0 || suggestUnavailable) && (
              <div className="border-t border-slate-100 px-5 py-3">
                {suggestUnavailable ? (
                  <p className="text-xs text-slate-400">
                    AI suggestions aren&apos;t available right now — try again shortly.
                  </p>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {suggestions.map((s, i) => (
                      <button
                        key={i}
                        onClick={() => {
                          setDraft(s);
                          setSuggestions([]);
                        }}
                        className="rounded-full border border-wazifny-green/30 bg-wazifny-green/5 px-3 py-1.5 text-xs text-wazifny-navy hover:bg-wazifny-green/10"
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            <div className="flex items-center gap-2 border-t border-slate-100 p-3">
              <button
                onClick={handleSuggest}
                disabled={suggesting || messages.length === 0}
                title="Suggest a reply"
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-slate-200 text-wazifny-green hover:bg-wazifny-green/5 disabled:opacity-40"
              >
                {suggesting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
              </button>
              <input
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleSend()}
                placeholder="Type a message..."
                className="flex-1 rounded-lg border border-slate-200 px-3 py-2.5 text-sm text-wazifny-navy placeholder:text-slate-400 focus:border-wazifny-green focus:outline-none focus:ring-1 focus:ring-wazifny-green"
              />
              <button
                onClick={handleSend}
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-wazifny-green text-white hover:bg-wazifny-green-dark"
                aria-label="Send"
              >
                <Send className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </EmployerShell>
  );
}

export default function EmployerMessagesPage() {
  return (
    <Suspense fallback={null}>
      <MessagesPage />
    </Suspense>
  );
}
