"use client";

import { useEffect, useState } from "react";
import { useLanguage } from "../lib/i18n";
import { authFetch, supabase } from "../lib/supabase";
import { useFamily } from "../lib/family";

interface Connection {
  apple_username: string | null;
  outlook_ics_url: string | null;
  feed_token: string;
}

async function loadConnection(userId: string): Promise<Connection | null> {
  await supabase
    .from("calendar_connections")
    .upsert({ user_id: userId }, { onConflict: "user_id", ignoreDuplicates: true });
  const { data } = await supabase
    .from("calendar_connections")
    .select("apple_username,outlook_ics_url,feed_token")
    .maybeSingle();
  return data;
}

const inputClass =
  "w-full bg-surface-container rounded-lg px-3 py-2.5 text-sm text-on-surface placeholder:text-on-surface-variant/50 outline-none focus:ring-2 focus:ring-primary/20";

export default function CalendarConnections() {
  const { locale } = useLanguage();
  const isAr = locale === "ar";
  const { session, refreshCalendars } = useFamily();
  const userId = session?.user.id;

  const [conn, setConn] = useState<Connection | null>(null);
  const [version, setVersion] = useState(0);
  const [appleId, setAppleId] = useState("");
  const [applePassword, setApplePassword] = useState("");
  const [outlookUrl, setOutlookUrl] = useState("");
  const [busy, setBusy] = useState<"apple" | "outlook" | null>(null);
  const [error, setError] = useState<{ source: "apple" | "outlook"; message: string } | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!userId) return;
    let cancelled = false;
    loadConnection(userId).then((c) => !cancelled && setConn(c));
    return () => {
      cancelled = true;
    };
  }, [userId, version]);

  function reload() {
    setVersion((v) => v + 1);
    refreshCalendars();
  }

  async function connect(source: "apple" | "outlook") {
    setBusy(source);
    setError(null);
    const res = await authFetch(`/api/calendar/${source}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(source === "apple" ? { username: appleId, password: applePassword } : { url: outlookUrl }),
    });
    const json = await res.json().catch(() => ({}));
    setBusy(null);
    if (!res.ok) {
      setError({ source, message: json.error ?? "Connection failed" });
      return;
    }
    setApplePassword("");
    setOutlookUrl("");
    reload();
  }

  async function disconnect(source: "apple" | "outlook") {
    if (!userId) return;
    const patch =
      source === "apple" ? { apple_username: null, apple_password: null } : { outlook_ics_url: null };
    await supabase.from("calendar_connections").update(patch).eq("user_id", userId);
    reload();
  }

  if (!conn) {
    return <p className="text-sm text-outline">{isAr ? "جارٍ التحميل…" : "Loading…"}</p>;
  }

  const origin = typeof window !== "undefined" ? window.location.origin : "";
  const feedUrl = `${origin}/api/feed/${conn.feed_token}.ics`;
  const webcalUrl = feedUrl.replace(/^https?:/, "webcal:");
  const isLocal = /localhost|127\.0\.0\.1/.test(origin);

  return (
    <div className="space-y-3">
      {/* iPhone → app */}
      <Card icon="phone_iphone" title={isAr ? "تقويم الآيفون ← التطبيق" : "iPhone calendar → app"}>
        {conn.apple_username ? (
          <Connected
            label={isAr ? `متصل: ${conn.apple_username}` : `Connected as ${conn.apple_username}`}
            onDisconnect={() => disconnect("apple")}
            isAr={isAr}
          />
        ) : (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              connect("apple");
            }}
            className="space-y-2"
          >
            <p className="text-xs text-on-surface-variant leading-relaxed">
              {isAr
                ? "استخدمي كلمة سر خاصة بالتطبيق من appleid.apple.com ← تسجيل الدخول والأمان ← كلمات سر خاصة بالتطبيقات. لا تستخدمي كلمة سر Apple ID."
                : "Use an app-specific password from appleid.apple.com → Sign-In and Security → App-Specific Passwords — not your Apple ID password."}
            </p>
            <input
              type="email"
              autoComplete="off"
              required
              value={appleId}
              onChange={(e) => setAppleId(e.target.value)}
              placeholder={isAr ? "Apple ID (البريد)" : "Apple ID email"}
              className={inputClass}
            />
            <input
              type="password"
              autoComplete="off"
              required
              value={applePassword}
              onChange={(e) => setApplePassword(e.target.value)}
              placeholder="xxxx-xxxx-xxxx-xxxx"
              className={inputClass}
            />
            {error?.source === "apple" && <p className="text-xs text-error">{error.message}</p>}
            <SubmitButton busy={busy === "apple"} label={isAr ? "ربط iCloud" : "Connect iCloud"} />
          </form>
        )}
      </Card>

      {/* Teams / Outlook → app */}
      <Card icon="groups" title={isAr ? "تيمز / أوتلوك ← التطبيق" : "Teams / Outlook → app"}>
        {conn.outlook_ics_url ? (
          <Connected
            label={isAr ? "متصل باجتماعات تيمز" : "Teams meetings connected"}
            onDisconnect={() => disconnect("outlook")}
            isAr={isAr}
          />
        ) : (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              connect("outlook");
            }}
            className="space-y-2"
          >
            <p className="text-xs text-on-surface-variant leading-relaxed">
              {isAr
                ? "في أوتلوك على الويب: الإعدادات ← التقويم ← التقويمات المشتركة ← نشر تقويم ← اختاري «التقويم» و«يمكن عرض كل التفاصيل» ← نشر، ثم انسخي رابط ICS."
                : "In Outlook on the web: Settings → Calendar → Shared calendars → Publish a calendar → pick “Calendar” and “Can view all details” → Publish, then copy the ICS link."}
            </p>
            <input
              type="url"
              required
              value={outlookUrl}
              onChange={(e) => setOutlookUrl(e.target.value)}
              placeholder="https://outlook.office365.com/owa/calendar/…/calendar.ics"
              className={inputClass}
            />
            {error?.source === "outlook" && <p className="text-xs text-error">{error.message}</p>}
            <SubmitButton busy={busy === "outlook"} label={isAr ? "ربط تيمز" : "Connect Teams"} />
          </form>
        )}
      </Card>

      {/* App → iPhone */}
      <Card icon="event_upcoming" title={isAr ? "التطبيق ← تقويم الآيفون" : "App → iPhone Calendar"}>
        <p className="text-xs text-on-surface-variant leading-relaxed">
          {isAr
            ? "اشتركي بهذا الرابط على الآيفون لتظهر الواجبات والاختبارات والمواعيد في تطبيق التقويم. أبقيه خاصاً."
            : "Subscribe to this link on your iPhone so homework, tests and appointments show in the Calendar app. Keep it private."}
        </p>
        {isLocal && (
          <p className="text-xs text-secondary bg-secondary-fixed/50 rounded-lg px-2.5 py-2">
            {isAr
              ? "الآيفون لا يستطيع الوصول إلى localhost — سيعمل هذا بعد نشر التطبيق على الإنترنت."
              : "Your iPhone can't reach localhost — this works once the app is deployed online."}
          </p>
        )}
        <div className="flex gap-2">
          <input readOnly value={feedUrl} className={`${inputClass} text-xs`} onFocus={(e) => e.target.select()} />
          <button
            type="button"
            onClick={() => {
              navigator.clipboard.writeText(feedUrl).then(() => {
                setCopied(true);
                setTimeout(() => setCopied(false), 1500);
              });
            }}
            className="shrink-0 px-3 rounded-lg border border-surface-container text-xs font-semibold text-on-surface-variant hover:bg-surface-container"
          >
            {copied ? (isAr ? "تم النسخ" : "Copied") : isAr ? "نسخ" : "Copy"}
          </button>
        </div>
        <a
          href={webcalUrl}
          className="flex items-center justify-center gap-1.5 w-full py-2.5 rounded-lg bg-on-surface text-background text-sm font-semibold hover:opacity-90"
        >
          <span className="material-symbols-outlined text-[18px]">add_circle</span>
          {isAr ? "إضافة إلى تقويم الآيفون" : "Add to iPhone Calendar"}
        </a>
      </Card>
    </div>
  );
}

function Card({ icon, title, children }: { icon: string; title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-surface-container bg-surface-container-lowest p-3 space-y-2.5">
      <div className="flex items-center gap-2">
        <span className="material-symbols-outlined text-primary text-[18px]">{icon}</span>
        <span className="text-sm font-semibold text-on-surface">{title}</span>
      </div>
      {children}
    </div>
  );
}

function Connected({ label, onDisconnect, isAr }: { label: string; onDisconnect: () => void; isAr: boolean }) {
  return (
    <div className="flex items-center justify-between gap-2">
      <span className="flex items-center gap-1.5 text-sm text-on-surface-variant min-w-0">
        <span className="material-symbols-outlined text-[18px] text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>
          check_circle
        </span>
        <span className="truncate">{label}</span>
      </span>
      <button
        onClick={onDisconnect}
        className="shrink-0 text-xs font-semibold text-error px-2.5 py-1.5 rounded-lg hover:bg-error-container/50"
      >
        {isAr ? "فصل" : "Disconnect"}
      </button>
    </div>
  );
}

function SubmitButton({ busy, label }: { busy: boolean; label: string }) {
  return (
    <button
      type="submit"
      disabled={busy}
      className="w-full py-2.5 rounded-lg bg-primary text-white text-sm font-semibold disabled:opacity-50 hover:opacity-90"
    >
      {busy ? "…" : label}
    </button>
  );
}
