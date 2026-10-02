"use client";

import { useEffect, useState, useCallback } from "react";
import { useLanguage } from "../lib/i18n";

interface CalendarEvent {
  id: string;
  title: string;
  start: string;
  end: string;
  calendarId: string;
  calendarName: string;
  color: string;
}

interface CalendarMember {
  id: string;
  name: string;
  color: string;
}

interface CalendarData {
  connected: boolean;
  provider: "google" | "apple" | null;
  members: CalendarMember[];
  events: CalendarEvent[];
  error?: string;
}

const DAY_LABELS_EN = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const DAY_LABELS_AR = ["إثنين", "ثلاثاء", "أربعاء", "خميس", "جمعة", "سبت", "أحد"];

function getWeekDays(): Date[] {
  const now = new Date();
  const day = now.getDay();
  const monday = new Date(now);
  monday.setDate(now.getDate() - (day === 0 ? 6 : day - 1));
  monday.setHours(0, 0, 0, 0);
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    return d;
  });
}

function isSameDay(a: Date, b: Date) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

const DEFAULT_COLORS = ["#005764", "#8e4e14", "#8e2e15", "#1f6775"];

export default function FamilyCalendar() {
  const { t, locale } = useLanguage();
  const c = t.calendarCard;

  const [data, setData] = useState<CalendarData | null>(null);
  const [loading, setLoading] = useState(true);
  const [connecting, setConnecting] = useState(false);
  const [showAppleForm, setShowAppleForm] = useState(false);
  const [appleUsername, setAppleUsername] = useState("");
  const [applePassword, setApplePassword] = useState("");
  const [appleError, setAppleError] = useState("");

  const weekDays = getWeekDays();
  const today = new Date();
  const dayLabels = locale === "ar" ? DAY_LABELS_AR : DAY_LABELS_EN;

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/calendar/events");
      const json: CalendarData = await res.json();
      setData(json);
    } catch {
      setData({ connected: false, provider: null, members: [], events: [] });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // Clear the ?calendar=connected query param left by OAuth redirect
    const params = new URLSearchParams(window.location.search);
    if (params.get("calendar") === "connected" || params.get("calendar") === "error") {
      window.history.replaceState({}, "", window.location.pathname);
    }
    fetchData();
  }, [fetchData]);

  async function connectGoogle() {
    setConnecting(true);
    try {
      const res = await fetch("/api/calendar/auth-url");
      const json = await res.json();
      if (json.url) {
        window.location.href = json.url;
      } else {
        alert(json.error ?? "Failed to get authorization URL");
        setConnecting(false);
      }
    } catch {
      alert("Failed to initiate Google sign-in. Is the server running?");
      setConnecting(false);
    }
  }

  async function connectApple() {
    if (!appleUsername || !applePassword) return;
    setConnecting(true);
    setAppleError("");
    try {
      const res = await fetch("/api/calendar/connect-apple", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: appleUsername, password: applePassword }),
      });
      const json = await res.json();
      if (json.success) {
        setShowAppleForm(false);
        setAppleUsername("");
        setApplePassword("");
        await fetchData();
      } else {
        setAppleError(json.error ?? "Connection failed");
      }
    } catch {
      setAppleError("Connection failed. Please try again.");
    } finally {
      setConnecting(false);
    }
  }

  async function disconnect() {
    if (!confirm("Disconnect calendar and show static demo data?")) return;
    await fetch("/api/calendar/disconnect", { method: "DELETE" });
    await fetchData();
  }

  // Build the 7-day grid from real or static events
  const connected = !loading && data?.connected;
  const members: CalendarMember[] =
    connected && (data?.members.length ?? 0) > 0
      ? data!.members
      : c.members.map((name, i) => ({ id: `s${i}`, name, color: DEFAULT_COLORS[i] }));

  const dayGrid = weekDays.map((date, i) => {
    if (!connected) {
      // static demo dots
      const staticDots = [
        [DEFAULT_COLORS[0], DEFAULT_COLORS[2]],
        [DEFAULT_COLORS[0], DEFAULT_COLORS[1], DEFAULT_COLORS[3]],
        [DEFAULT_COLORS[1], DEFAULT_COLORS[2]],
        [],
        [DEFAULT_COLORS[1], DEFAULT_COLORS[0]],
        [DEFAULT_COLORS[2], DEFAULT_COLORS[3], DEFAULT_COLORS[0]],
        [DEFAULT_COLORS[0]],
      ];
      return {
        date,
        dots: staticDots[i] ?? [],
        clash: i === 2,
        isToday: isSameDay(date, today),
        dayEvents: [] as CalendarEvent[],
      };
    }

    const dayEvents = (data?.events ?? []).filter((ev) =>
      isSameDay(new Date(ev.start), date)
    );
    const calIds = new Set(dayEvents.map((e) => e.calendarId));
    const clash = calIds.size >= 2;
    const dots: string[] = [];
    const seenCals = new Set<string>();
    for (const ev of dayEvents) {
      if (!seenCals.has(ev.calendarId) && dots.length < 3) {
        dots.push(ev.color);
        seenCals.add(ev.calendarId);
      }
    }
    return { date, dots, clash, isToday: isSameDay(date, today), dayEvents };
  });

  const clashDay = dayGrid.find((d) => d.clash);

  // ── Apple credentials form ────────────────────────────────────────────────
  if (!loading && !data?.connected && showAppleForm) {
    return (
      <div className="bg-surface-container-lowest rounded-2xl p-6 space-y-4 border border-surface-container">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowAppleForm(false)}
            className="p-2 rounded-lg hover:bg-surface-container transition-colors"
          >
            <span className="material-symbols-outlined text-on-surface-variant">arrow_back</span>
          </button>
          <h3 className="font-heading text-lg font-semibold text-on-surface">
            Connect iCloud Calendar
          </h3>
        </div>
        <p className="text-sm text-on-surface-variant leading-relaxed">
          Enter your Apple ID email and an{" "}
          <a
            href="https://support.apple.com/en-us/102654"
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary underline"
          >
            app-specific password
          </a>{" "}
          — not your regular Apple password. Generate one at appleid.apple.com → Sign-In and
          Security.
        </p>
        <div className="space-y-3">
          <input
            type="email"
            placeholder="Apple ID (e.g. you@icloud.com)"
            value={appleUsername}
            onChange={(e) => setAppleUsername(e.target.value)}
            className="w-full px-4 py-3 rounded-xl border border-surface-container bg-background text-on-surface placeholder:text-on-surface-variant/50 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
          />
          <input
            type="password"
            placeholder="App-specific password (xxxx-xxxx-xxxx-xxxx)"
            value={applePassword}
            onChange={(e) => setApplePassword(e.target.value)}
            className="w-full px-4 py-3 rounded-xl border border-surface-container bg-background text-on-surface placeholder:text-on-surface-variant/50 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
          />
          {appleError && <p className="text-sm text-red-500">{appleError}</p>}
          <button
            onClick={connectApple}
            disabled={connecting || !appleUsername || !applePassword}
            className="w-full bg-primary text-white py-3 rounded-xl font-semibold text-sm hover:opacity-90 disabled:opacity-50 transition-opacity"
          >
            {connecting ? "Connecting…" : "Connect iCloud Calendar"}
          </button>
        </div>
      </div>
    );
  }

  // ── Not connected — provider picker ──────────────────────────────────────
  if (!loading && !data?.connected) {
    return (
      <div className="space-y-stack-lg">
        {/* Static demo calendar (greyed out) */}
        <div className="opacity-40 pointer-events-none select-none">
          <div className="flex flex-wrap gap-3 mb-4">
            {c.members.map((name, i) => (
              <div
                key={name}
                className="flex items-center gap-2 px-3 py-1.5 rounded-full border"
                style={{
                  backgroundColor: `${DEFAULT_COLORS[i]}15`,
                  borderColor: `${DEFAULT_COLORS[i]}30`,
                }}
              >
                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: DEFAULT_COLORS[i] }} />
                <span className="text-xs font-semibold" style={{ color: DEFAULT_COLORS[i] }}>
                  {name}
                </span>
              </div>
            ))}
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
            {dayGrid.map(({ date, dots, clash, isToday }, i) => (
              <div
                key={i}
                className={`rounded-xl p-4 min-h-[120px] flex flex-col justify-between relative ${
                  isToday
                    ? "bg-primary-container"
                    : clash
                    ? "bg-surface-container-lowest border-2 border-secondary-container"
                    : "bg-surface-container-lowest border border-transparent"
                }`}
              >
                {clash && (
                  <span className="material-symbols-outlined text-secondary text-sm absolute top-2 end-2">
                    warning
                  </span>
                )}
                <div className="text-center">
                  <p className={`text-[10px] font-semibold uppercase tracking-wide ${isToday ? "text-on-primary-container opacity-80" : "text-outline"}`}>
                    {dayLabels[i]}
                  </p>
                  <p className={`font-heading text-2xl font-semibold ${isToday ? "text-on-primary-container" : "text-on-surface"}`}>
                    {date.getDate()}
                  </p>
                </div>
                <div className="flex flex-wrap justify-center gap-1.5 mt-4">
                  {isToday ? (
                    <span className="w-2.5 h-2.5 rounded-full bg-on-primary-container" />
                  ) : (
                    dots.map((color, j) => (
                      <span key={j} className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: color }} />
                    ))
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Connect card overlaid */}
        <div className="bg-surface-container-lowest rounded-2xl p-8 text-center space-y-5 border border-surface-container shadow-sm">
          <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
            <span
              className="material-symbols-outlined text-primary text-3xl"
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              calendar_month
            </span>
          </div>
          <div>
            <h3 className="font-heading text-xl font-semibold text-on-surface mb-1">
              Connect Your Calendar
            </h3>
            <p className="text-on-surface-variant text-sm max-w-sm mx-auto">
              Link Google Calendar or iCloud to replace the demo with your family&apos;s real schedule.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button
              onClick={connectGoogle}
              disabled={connecting}
              className="flex items-center justify-center gap-2.5 px-5 py-3 rounded-xl border border-surface-container bg-background hover:bg-surface-container transition-colors font-medium text-sm text-on-surface disabled:opacity-50"
            >
              <GoogleIcon />
              Connect Google Calendar
            </button>
            <button
              onClick={() => setShowAppleForm(true)}
              className="flex items-center justify-center gap-2.5 px-5 py-3 rounded-xl border border-surface-container bg-background hover:bg-surface-container transition-colors font-medium text-sm text-on-surface"
            >
              <AppleIcon />
              Connect iCloud Calendar
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ── Connected — live calendar ─────────────────────────────────────────────
  return (
    <div className="space-y-stack-lg">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="font-heading text-xl font-semibold text-on-surface">{c.familyMembers}</h3>
        <div className="flex gap-2 items-center">
          {data?.connected && (
            <button
              onClick={disconnect}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs text-on-surface-variant hover:bg-surface-container transition-colors"
              title="Disconnect calendar"
            >
              <span className="material-symbols-outlined text-[15px]">link_off</span>
              {data.provider === "google" ? "Google" : "iCloud"}
            </button>
          )}
          <button className="p-2 rounded-lg bg-surface-container hover:bg-surface-container-high transition-colors">
            <span className="material-symbols-outlined text-primary">chevron_left</span>
          </button>
          <button className="p-2 rounded-lg bg-surface-container hover:bg-surface-container-high transition-colors">
            <span className="material-symbols-outlined text-primary">chevron_right</span>
          </button>
        </div>
      </div>

      {/* Members / calendars */}
      <div className="flex flex-wrap gap-3">
        {members.map((m) => (
          <div
            key={m.id}
            className="flex items-center gap-2 px-3 py-1.5 rounded-full border"
            style={{ backgroundColor: `${m.color}15`, borderColor: `${m.color}30` }}
          >
            <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: m.color }} />
            <span className="text-xs font-semibold" style={{ color: m.color }}>
              {m.name}
            </span>
          </div>
        ))}
      </div>

      {/* Fetch error banner */}
      {data?.error && (
        <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm">
          <span className="material-symbols-outlined text-[18px]">error</span>
          {data.error}
        </div>
      )}

      {/* Day grid */}
      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
          {Array.from({ length: 7 }).map((_, i) => (
            <div
              key={i}
              className="rounded-xl p-4 min-h-[140px] bg-surface-container-lowest border border-transparent animate-pulse"
            />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
          {dayGrid.map(({ date, dots, clash, isToday, dayEvents }, i) => (
            <div
              key={i}
              className={`rounded-xl p-4 min-h-[140px] flex flex-col justify-between cursor-pointer hover:shadow-lg transition-all relative ${
                isToday
                  ? "bg-primary-container shadow-md"
                  : clash
                  ? "bg-surface-container-lowest border-2 border-secondary-container shadow-[0_0_12px_rgba(255,171,105,0.3)]"
                  : "bg-surface-container-lowest border border-transparent"
              }`}
              title={dayEvents.map((e) => e.title).join("\n") || undefined}
            >
              {clash && (
                <span className="material-symbols-outlined text-secondary text-sm absolute top-2 end-2">
                  warning
                </span>
              )}
              <div className="text-center">
                <p
                  className={`text-[10px] font-semibold uppercase tracking-wide ${
                    isToday ? "text-on-primary-container opacity-80" : "text-outline"
                  }`}
                >
                  {dayLabels[i]}
                </p>
                <p
                  className={`font-heading text-2xl font-semibold ${
                    isToday ? "text-on-primary-container" : "text-on-surface"
                  }`}
                >
                  {date.getDate()}
                </p>
              </div>
              <div className="flex flex-wrap justify-center gap-1.5 mt-4">
                {isToday ? (
                  <span className="w-2.5 h-2.5 rounded-full bg-on-primary-container" />
                ) : (
                  dots.map((color, j) => (
                    <span
                      key={j}
                      className="w-2.5 h-2.5 rounded-full"
                      style={{ backgroundColor: color }}
                    />
                  ))
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Clash advisor */}
      {clashDay && clashDay.dayEvents.length >= 2 ? (
        <div className="bg-secondary-fixed text-on-secondary-fixed rounded-2xl p-6 shadow-sm relative overflow-hidden">
          <div className="flex items-start gap-4 relative z-10">
            <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center shrink-0 shadow-sm">
              <span
                className="material-symbols-outlined text-secondary"
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                smart_toy
              </span>
            </div>
            <div>
              <h4 className="font-heading text-lg font-semibold mb-1">{c.advisorTitle}</h4>
              <p className="text-sm opacity-90 leading-relaxed max-w-2xl">
                <span className="font-semibold">{clashDay.dayEvents[0].title}</span> and{" "}
                <span className="font-semibold">{clashDay.dayEvents[1].title}</span> overlap on{" "}
                {clashDay.date.toLocaleDateString("en", {
                  weekday: "long",
                  month: "short",
                  day: "numeric",
                })}
                .
              </p>
              <div className="flex gap-3 mt-4">
                <button className="bg-on-secondary-fixed text-white px-4 py-2 rounded-lg text-xs font-semibold hover:opacity-90 transition-opacity">
                  {c.sendToGrandma}
                </button>
                <button className="border border-on-secondary-fixed/30 px-4 py-2 rounded-lg text-xs font-semibold hover:bg-on-secondary-fixed/10 transition-colors">
                  {c.dismiss}
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* Static advisor panel when there are no real clashes */
        <div className="bg-secondary-fixed text-on-secondary-fixed rounded-2xl p-6 shadow-sm relative overflow-hidden">
          <div className="flex items-start gap-4 relative z-10">
            <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center shrink-0 shadow-sm">
              <span
                className="material-symbols-outlined text-secondary"
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                smart_toy
              </span>
            </div>
            <div>
              <h4 className="font-heading text-lg font-semibold mb-1">{c.advisorTitle}</h4>
              <p className="text-sm opacity-90 leading-relaxed max-w-2xl">
                {c.advisorText} <span className="font-semibold">{c.advisorSuggestion}</span>{" "}
                {c.advisorSuggestionText}
              </p>
              <div className="flex gap-3 mt-4">
                <button className="bg-on-secondary-fixed text-white px-4 py-2 rounded-lg text-xs font-semibold hover:opacity-90 transition-opacity">
                  {c.sendToGrandma}
                </button>
                <button className="border border-on-secondary-fixed/30 px-4 py-2 rounded-lg text-xs font-semibold hover:bg-on-secondary-fixed/10 transition-colors">
                  {c.dismiss}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function GoogleIcon() {
  return (
    <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
        fill="#4285F4"
      />
      <path
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
        fill="#34A853"
      />
      <path
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
        fill="#FBBC05"
      />
      <path
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
        fill="#EA4335"
      />
    </svg>
  );
}

function AppleIcon() {
  return (
    <svg
      className="w-5 h-5 shrink-0"
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
      fill="currentColor"
    >
      <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" />
    </svg>
  );
}
