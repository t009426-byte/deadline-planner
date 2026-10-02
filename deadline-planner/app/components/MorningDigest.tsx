"use client";

import { useState } from "react";
import { useLanguage } from "../lib/i18n";

type Message = { from: "ai" | "user"; text: string; time: string };

function now() {
  return new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

export default function MorningDigest() {
  const { t, locale } = useLanguage();
  const c = t.digestCard;
  const [messages, setMessages] = useState<Message[]>([...c.messages] as Message[]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [clashDismissed, setClashDismissed] = useState(false);

  async function send() {
    const text = input.trim();
    if (!text || loading) return;
    const userMessage: Message = { from: "user", text, time: now() };
    const history = [...messages, userMessage];
    setMessages(history);
    setInput("");
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/assistant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          locale,
          messages: history.map((m) => ({
            role: m.from === "user" ? "user" : "assistant",
            content: m.text,
          })),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Request failed");
      setMessages((m) => [...m, { from: "ai", text: data.text, time: now() }]);
    } catch {
      setError(locale === "ar" ? "تعذّر الوصول إلى المساعد." : "Couldn't reach the assistant right now.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-3">
      {/* Section label */}
      <div className="flex items-center gap-1.5">
        <span className="material-symbols-outlined text-outline text-[16px]">wb_sunny</span>
        <span className="text-xs font-semibold uppercase tracking-wide text-outline">
          {locale === "ar" ? "ملخص اليوم" : "Today's Brief"}
        </span>
      </div>

      {/* Clash alert — thin banner */}
      {!clashDismissed && (
        <div className="flex items-center gap-2.5 px-3 py-2.5 bg-error-container text-on-error-container rounded-lg text-sm">
          <span className="material-symbols-outlined text-[18px] shrink-0" style={{ fontVariationSettings: "'FILL' 1" }}>
            warning
          </span>
          <p className="flex-1 font-medium">{c.clashTitle} — {c.clashText.split(".")[0]}.</p>
          <button
            onClick={() => setClashDismissed(true)}
            className="shrink-0 text-on-error-container/60 hover:text-on-error-container transition-colors"
          >
            <span className="material-symbols-outlined text-[18px]">close</span>
          </button>
        </div>
      )}

      {/* Brief */}
      <div className="bg-surface-container-lowest rounded-xl border border-surface-container p-4">
        <div className="flex items-center gap-2 mb-2">
          <span className="material-symbols-outlined text-primary text-[18px]" style={{ fontVariationSettings: "'FILL' 1" }}>
            auto_awesome
          </span>
          <span className="font-semibold text-sm text-on-surface">{c.briefTitle}</span>
          <div className="ms-auto flex gap-2">
            <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary font-semibold">{c.events}</span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-error-container text-on-error-container font-semibold">{c.conflict}</span>
          </div>
        </div>
        <p className="text-sm text-on-surface-variant leading-relaxed line-clamp-3">{c.briefText}</p>
      </div>

      {/* Chat */}
      <div className="bg-surface-container-lowest rounded-xl border border-surface-container overflow-hidden">
        <div className="px-4 py-3 border-b border-surface-container flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-full bg-primary flex items-center justify-center">
            <span className="material-symbols-outlined text-white text-[15px]" style={{ fontVariationSettings: "'FILL' 1" }}>
              smart_toy
            </span>
          </div>
          <div>
            <p className="text-sm font-semibold text-on-surface leading-tight">{c.assistant}</p>
            <p className="text-xs text-on-surface-variant flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-green-500 inline-block" />
              {c.online}
            </p>
          </div>
        </div>

        <div className="h-56 overflow-y-auto p-4 space-y-3">
          {messages.map((m, i) => (
            <div key={i} className={`flex items-end gap-2 ${m.from === "user" ? "flex-row-reverse" : ""}`}>
              <div className={`max-w-[78%] px-3 py-2 rounded-2xl text-sm ${
                m.from === "user"
                  ? "bg-primary text-white rounded-br-sm"
                  : "bg-surface-container text-on-surface rounded-bl-sm"
              }`}>
                <p>{m.text}</p>
                <span className={`text-[10px] mt-1 block ${m.from === "user" ? "text-primary-fixed-dim text-end" : "text-outline"}`}>
                  {m.time}
                </span>
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex items-end gap-2">
              <div className="bg-surface-container rounded-2xl rounded-bl-sm px-3 py-3 flex gap-1">
                <span className="w-1.5 h-1.5 bg-outline rounded-full animate-bounce" />
                <span className="w-1.5 h-1.5 bg-outline rounded-full animate-bounce [animation-delay:0.15s]" />
                <span className="w-1.5 h-1.5 bg-outline rounded-full animate-bounce [animation-delay:0.3s]" />
              </div>
            </div>
          )}
          {error && <p className="text-xs text-center text-red-500">{error}</p>}
        </div>

        <div className="p-3 border-t border-surface-container bg-surface-container-lowest">
          <div className="flex items-center gap-2">
            <input
              className="flex-1 bg-surface-container rounded-full py-2 px-4 text-sm text-on-surface placeholder:text-on-surface-variant/50 outline-none focus:ring-2 focus:ring-primary/20 disabled:opacity-50 transition-all"
              placeholder={c.placeholder}
              value={input}
              disabled={loading}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && send()}
            />
            <button
              onClick={send}
              disabled={loading || !input.trim()}
              className="w-9 h-9 bg-primary text-white rounded-full flex items-center justify-center shrink-0 disabled:opacity-40 hover:opacity-90 transition-opacity"
            >
              <span className="material-symbols-outlined text-[18px]" style={{ fontVariationSettings: "'FILL' 1" }}>send</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
