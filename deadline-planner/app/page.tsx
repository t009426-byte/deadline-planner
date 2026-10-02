"use client";

import MorningDigest from "./components/MorningDigest";
import FamilyCalendar from "./components/FamilyCalendar";
import Routines from "./components/Routines";
import Wellbeing from "./components/Wellbeing";
import { useLanguage } from "./lib/i18n";

const navItems = [
  { href: "#digest", icon: "wb_sunny", labelKey: "digest" },
  { href: "#calendar", icon: "calendar_today", labelKey: "calendar" },
  { href: "#tasks", icon: "checklist", labelKey: "routines" },
  { href: "#checkin", icon: "favorite", labelKey: "wellbeing" },
] as const;

function TodayBar() {
  const now = new Date();
  const date = now.toLocaleDateString("en", { weekday: "long", month: "long", day: "numeric" });
  const hour = now.getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

  return (
    <div className="border-b border-surface-container px-4 py-3 flex items-baseline justify-between gap-4">
      <p className="text-sm font-semibold text-on-surface">
        {greeting}
      </p>
      <p className="text-xs text-outline shrink-0">{date}</p>
    </div>
  );
}

export default function Home() {
  const { t, locale, toggleLocale } = useLanguage();

  return (
    <div className="min-h-screen bg-background w-full">
      {/* Header */}
      <header className="bg-background/95 backdrop-blur sticky top-0 z-50 border-b border-surface-container">
        <div className="max-w-3xl mx-auto flex justify-between items-center px-4 h-14">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-full bg-primary flex items-center justify-center">
              <span className="material-symbols-outlined text-white text-[15px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                home
              </span>
            </div>
            <span className="font-heading text-sm font-semibold text-primary">{t.brand}</span>
          </div>

          <nav className="hidden md:flex items-center gap-0.5">
            {navItems.map((n) => (
              <a
                key={n.href}
                href={n.href}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-on-surface-variant hover:text-primary hover:bg-surface-container transition-colors"
              >
                <span className="material-symbols-outlined text-[16px]">{n.icon}</span>
                {t.nav[n.labelKey]}
              </a>
            ))}
          </nav>

          <button
            onClick={toggleLocale}
            className="text-xs font-semibold px-3 py-1.5 rounded-lg border border-surface-container text-on-surface-variant hover:bg-surface-container transition-colors"
          >
            {locale === "en" ? "ع" : "EN"}
          </button>
        </div>
        <TodayBar />
      </header>

      {/* Content */}
      <main className="max-w-3xl mx-auto px-4 pb-24 md:pb-10 space-y-8 pt-6">
        <section id="digest" className="scroll-mt-20">
          <MorningDigest />
        </section>

        <section id="calendar" className="scroll-mt-20">
          <SectionLabel icon="calendar_today" label={t.sections.calendar.title} />
          <FamilyCalendar />
        </section>

        <section id="tasks" className="scroll-mt-20">
          <Routines />
        </section>

        <section id="checkin" className="scroll-mt-20">
          <Wellbeing />
        </section>
      </main>

      {/* Mobile bottom tab bar */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-background border-t border-surface-container flex">
        {navItems.map((n) => (
          <a
            key={n.href}
            href={n.href}
            className="flex-1 flex flex-col items-center gap-0.5 py-2.5 text-on-surface-variant hover:text-primary transition-colors"
          >
            <span className="material-symbols-outlined text-[22px]">{n.icon}</span>
            <span className="text-[10px] font-semibold">{t.nav[n.labelKey]}</span>
          </a>
        ))}
      </nav>
    </div>
  );
}

function SectionLabel({ icon, label }: { icon: string; label: string }) {
  return (
    <div className="flex items-center gap-1.5 mb-3">
      <span className="material-symbols-outlined text-outline text-[16px]">{icon}</span>
      <span className="text-xs font-semibold uppercase tracking-wide text-outline">{label}</span>
    </div>
  );
}
