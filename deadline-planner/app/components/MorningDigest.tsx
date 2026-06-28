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
      setError(locale === "ar" ? "تعذّر الوصول إلى المساعد الآن." : "Couldn't reach the assistant right now.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-gutter">
      {/* Clash Alert */}
      <div className="bg-error-container text-on-error-container p-4 rounded-xl flex items-start gap-4 shadow-[0_4px_12px_rgba(186,26,26,0.08)]">
        <span className="material-symbols-outlined mt-0.5" style={{ fontVariationSettings: "'FILL' 1" }}>
          warning
        </span>
        <div className="flex-1">
          <p className="font-heading text-[18px] font-semibold mb-1">{c.clashTitle}</p>
          <p className="text-sm opacity-90">{c.clashText}</p>
        </div>
      </div>

      {/* AI Digest Brief */}
      <div className="bg-surface-container-lowest rounded-xl p-6 shadow-[0_8px_32px_rgba(42,111,125,0.08)]">
        <div className="flex items-center gap-2 mb-4">
          <span className="material-symbols-outlined text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>
            auto_awesome
          </span>
          <h3 className="font-heading text-xl font-semibold text-primary">{c.briefTitle}</h3>
        </div>
        <p className="text-lg text-on-surface-variant leading-relaxed">{c.briefText}</p>
        <div className="flex flex-wrap gap-2 pt-4">
          <span className="px-3 py-1 bg-primary-container/10 text-primary rounded-full text-xs font-semibold flex items-center gap-1">
            <span className="material-symbols-outlined text-[14px]">event</span> {c.events}
          </span>
          <span className="px-3 py-1 bg-tertiary-fixed text-on-tertiary-fixed-variant rounded-full text-xs font-semibold flex items-center gap-1">
            <span className="material-symbols-outlined text-[14px]">priority_high</span> {c.conflict}
          </span>
        </div>
      </div>

      {/* Chat */}
      <div className="flex flex-col h-[480px] bg-white rounded-xl shadow-[0_4px_20px_rgba(42,111,125,0.05)] border border-surface-container overflow-hidden">
        <div className="px-6 py-4 bg-surface-container-low flex items-center justify-between border-b border-surface-container">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white">
              <span className="material-symbols-outlined text-[18px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                smart_toy
              </span>
            </div>
            <div>
              <p className="font-heading text-sm font-semibold text-on-surface">{c.assistant}</p>
              <p className="text-xs text-on-surface-variant flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-green-500" /> {c.online}
              </p>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {messages.map((m, i) => (
            <div
              key={i}
              className={`flex items-start gap-3 max-w-[85%] ${
                m.from === "user" ? "ms-auto flex-row-reverse" : ""
              }`}
            >
              <div
                className={`w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center ${
                  m.from === "user" ? "bg-primary-container" : "bg-surface-container-highest"
                }`}
              >
                <span
                  className="material-symbols-outlined text-[16px]"
                  style={{
                    color: m.from === "user" ? "var(--color-on-primary-container)" : "var(--color-primary)",
                  }}
                >
                  {m.from === "user" ? "person" : "face"}
                </span>
              </div>
              <div
                className={`p-4 rounded-2xl shadow-sm ${
                  m.from === "user"
                    ? "bg-primary text-white rounded-br-md"
                    : "bg-surface-container-low text-on-surface-variant rounded-bl-md"
                }`}
              >
                <p className="text-sm">{m.text}</p>
                <span
                  className={`text-[10px] mt-2 block ${
                    m.from === "user" ? "text-primary-fixed-dim text-end" : "text-outline"
                  }`}
                >
                  {m.time}
                </span>
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex items-start gap-3 max-w-[85%]">
              <div className="w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center bg-surface-container-highest">
                <span className="material-symbols-outlined text-[16px]" style={{ color: "var(--color-primary)" }}>
                  face
                </span>
              </div>
              <div className="bg-surface-container-low rounded-2xl rounded-bl-md shadow-sm flex items-center gap-1 px-4 py-3">
                <div className="w-1.5 h-1.5 bg-outline rounded-full animate-bounce" />
                <div className="w-1.5 h-1.5 bg-outline rounded-full animate-bounce [animation-delay:0.2s]" />
                <div className="w-1.5 h-1.5 bg-outline rounded-full animate-bounce [animation-delay:0.4s]" />
              </div>
            </div>
          )}
          {error && <p className="text-xs text-error text-center">{error}</p>}
        </div>

        <div className="p-4 bg-white border-t border-surface-container">
          <div className="relative flex items-center">
            <input
              className="w-full bg-surface-container rounded-full py-3 ps-5 pe-12 border-none focus:ring-2 focus:ring-primary focus:bg-white transition-all text-on-surface outline-none disabled:opacity-60"
              placeholder={c.placeholder}
              type="text"
              value={input}
              disabled={loading}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && send()}
            />
            <button
              onClick={send}
              disabled={loading}
              className="absolute end-2 w-10 h-10 bg-primary text-white rounded-full flex items-center justify-center active:scale-90 transition-transform disabled:opacity-60"
            >
              <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>
                send
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
