"use client";

import MorningDigest from "./components/MorningDigest";
import FamilyCalendar from "./components/FamilyCalendar";
import Routines from "./components/Routines";
import Wellbeing from "./components/Wellbeing";
import { useLanguage } from "./lib/i18n";

export default function Home() {
  const { t, locale, toggleLocale } = useLanguage();

  const navItems = [
    { href: "#digest", icon: "summarize", label: t.nav.digest },
    { href: "#calendar", icon: "calendar_today", label: t.nav.calendar },
    { href: "#routines", icon: "auto_schedule", label: t.nav.routines },
    { href: "#wellbeing", icon: "spa", label: t.nav.wellbeing },
  ];

  return (
    <div className="min-h-screen pb-16 w-full">
      {/* Top nav */}
      <header className="bg-background/95 backdrop-blur w-full top-0 sticky z-50 border-b border-surface-container">
        <div className="max-w-5xl mx-auto flex justify-between items-center px-container-padding py-4">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-full bg-primary flex items-center justify-center text-white">
              <span className="material-symbols-outlined text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                home
              </span>
            </div>
            <span className="font-heading text-lg font-semibold text-primary">{t.brand}</span>
          </div>
          <div className="flex items-center gap-2">
            <nav className="hidden md:flex items-center gap-1">
              {navItems.map((n) => (
                <a
                  key={n.href}
                  href={n.href}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-full text-sm font-medium text-on-surface-variant hover:text-primary hover:bg-primary-container/10 transition-colors"
                >
                  <span className="material-symbols-outlined text-[18px]">{n.icon}</span>
                  {n.label}
                </a>
              ))}
            </nav>
            <button
              onClick={toggleLocale}
              className="flex items-center gap-1.5 px-3 py-2 rounded-full text-sm font-semibold border border-primary/30 text-primary hover:bg-primary-container/10 transition-colors"
              aria-label="Toggle language"
            >
              <span className="material-symbols-outlined text-[18px]">language</span>
              {locale === "en" ? "العربية" : "English"}
            </button>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="max-w-5xl mx-auto px-container-padding pt-stack-lg pb-stack-lg text-center">
        <h1 className="font-heading text-4xl md:text-5xl font-bold text-primary tracking-tight">
          {t.hero.title}
        </h1>
        <p className="text-on-surface-variant text-lg md:text-xl mt-4 max-w-2xl mx-auto leading-relaxed">
          {t.hero.subtitle}
        </p>
        <div className="flex items-center justify-center gap-3 mt-8">
          <button className="bg-primary text-white px-6 py-3 rounded-lg font-semibold shadow-lg hover:opacity-90 active:scale-95 transition-all">
            {t.hero.cta}
          </button>
          <a
            href="#digest"
            className="px-6 py-3 rounded-lg font-semibold text-primary border border-primary/30 hover:bg-primary-container/10 transition-colors"
          >
            {t.hero.secondary}
          </a>
        </div>
      </section>

      <main className="max-w-5xl mx-auto px-container-padding space-y-stack-lg">
        <section id="digest" className="scroll-mt-24 space-y-4">
          <SectionHeading title={t.sections.digest.title} subtitle={t.sections.digest.subtitle} />
          <MorningDigest />
        </section>

        <section id="calendar" className="scroll-mt-24 space-y-4">
          <SectionHeading title={t.sections.calendar.title} subtitle={t.sections.calendar.subtitle} />
          <FamilyCalendar />
        </section>

        <section id="routines" className="scroll-mt-24 space-y-4">
          <Routines />
        </section>

        <section id="wellbeing" className="scroll-mt-24 space-y-4">
          <SectionHeading title={t.sections.wellbeing.title} subtitle={t.sections.wellbeing.subtitle} />
          <Wellbeing />
        </section>
      </main>

      <footer className="max-w-5xl mx-auto px-container-padding mt-stack-lg pt-stack-lg border-t border-surface-container text-center text-sm text-on-surface-variant">
        © {new Date().getFullYear()} {t.footer}
      </footer>
    </div>
  );
}

function SectionHeading({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <div>
      <h2 className="font-heading text-2xl font-bold text-on-surface">{title}</h2>
      <p className="text-on-surface-variant">{subtitle}</p>
    </div>
  );
}
