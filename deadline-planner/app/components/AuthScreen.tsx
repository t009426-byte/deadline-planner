"use client";

import { useState } from "react";
import { useLanguage } from "../lib/i18n";
import { supabase } from "../lib/supabase";

export default function AuthScreen() {
  const { t, locale, toggleLocale } = useLanguage();
  const isAr = locale === "ar";
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    setNotice(null);
    if (mode === "signin") {
      const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
      if (error) setError(error.message);
    } else {
      const { data, error } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: { emailRedirectTo: window.location.origin },
      });
      if (error) setError(error.message);
      else if (!data.session)
        setNotice(
          isAr
            ? "تحققي من بريدك الإلكتروني واضغطي رابط التأكيد، ثم سجّلي الدخول."
            : "Check your email and tap the confirmation link, then sign in."
        );
    }
    setBusy(false);
  }

  return (
    <div className="min-h-screen bg-background flex flex-col pt-[env(safe-area-inset-top)] pb-[env(safe-area-inset-bottom)]">
      <div className="flex justify-end p-4">
        <button
          onClick={toggleLocale}
          className="text-xs font-semibold px-3 py-1.5 rounded-lg border border-surface-container text-on-surface-variant hover:bg-surface-container"
        >
          {locale === "en" ? "ع" : "EN"}
        </button>
      </div>
      <div className="flex-1 flex items-center justify-center px-4 pb-16">
        <div className="w-full max-w-sm space-y-6">
          <div className="text-center space-y-2">
            <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center mx-auto">
              <span className="material-symbols-outlined text-white text-[24px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                home
              </span>
            </div>
            <h1 className="font-heading text-xl font-semibold text-on-surface">{t.brand}</h1>
            <p className="text-sm text-on-surface-variant">
              {mode === "signin"
                ? isAr ? "سجّلي الدخول لرؤية تقويم عائلتك." : "Sign in to see your family calendar."
                : isAr ? "أنشئي حساباً لحفظ عائلتك ومهامك." : "Create an account to save your family and tasks."}
            </p>
          </div>

          <form onSubmit={submit} className="bg-surface-container-lowest rounded-xl border border-surface-container p-4 space-y-3">
            <input
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={isAr ? "البريد الإلكتروني" : "Email"}
              className="w-full bg-surface-container rounded-lg px-3 py-2.5 text-sm text-on-surface placeholder:text-on-surface-variant/50 outline-none focus:ring-2 focus:ring-primary/20"
            />
            <input
              type="password"
              autoComplete={mode === "signin" ? "current-password" : "new-password"}
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder={isAr ? "كلمة المرور" : "Password"}
              className="w-full bg-surface-container rounded-lg px-3 py-2.5 text-sm text-on-surface placeholder:text-on-surface-variant/50 outline-none focus:ring-2 focus:ring-primary/20"
            />
            {error && <p className="text-sm text-error">{error}</p>}
            {notice && <p className="text-sm text-primary">{notice}</p>}
            <button
              type="submit"
              disabled={busy}
              className="w-full py-2.5 rounded-lg bg-primary text-white text-sm font-semibold disabled:opacity-50 hover:opacity-90"
            >
              {busy
                ? "…"
                : mode === "signin"
                ? isAr ? "تسجيل الدخول" : "Sign in"
                : isAr ? "إنشاء حساب" : "Create account"}
            </button>
          </form>

          <p className="text-center text-sm text-on-surface-variant">
            {mode === "signin" ? (isAr ? "ليس لديك حساب؟" : "New here?") : isAr ? "لديك حساب؟" : "Already have an account?"}{" "}
            <button
              onClick={() => {
                setMode(mode === "signin" ? "signup" : "signin");
                setError(null);
                setNotice(null);
              }}
              className="font-semibold text-primary hover:underline"
            >
              {mode === "signin" ? (isAr ? "إنشاء حساب" : "Create account") : isAr ? "تسجيل الدخول" : "Sign in"}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
