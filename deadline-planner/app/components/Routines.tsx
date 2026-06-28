"use client";

import { useState } from "react";
import { useLanguage } from "../lib/i18n";

const DAYS = ["M", "T", "W", "T", "F", "S", "S"];

const meta = [
  { id: "morning-mindfulness", streak: 12, streakKind: "dayStreak" as const, accent: "var(--color-primary)", activeDays: [true, true, true, true, true, false, false], done: false },
  { id: "deep-work", streak: 5, streakKind: "dayStreak" as const, accent: "var(--color-primary)", activeDays: [true, true, true, true, true, false, false], done: true },
  { id: "teeth-face", streak: 22, streakKind: "starStreak" as const, accent: "var(--color-tertiary)", activeDays: [true, true, true, true, true, true, true], icon: "brush", done: false },
  { id: "reading-time", streak: 8, streakKind: "starStreak" as const, accent: "var(--color-secondary)", activeDays: [true, true, true, true, true, true, true], icon: "menu_book", done: true },
];

const weeklyMeta = [
  { icon: "shopping_basket", accent: "var(--color-primary)" },
  { icon: "local_library", accent: "var(--color-tertiary)" },
];

export default function Routines() {
  const { t } = useLanguage();
  const c = t.routinesCard;
  const [done, setDone] = useState<Record<string, boolean>>(
    Object.fromEntries(meta.map((m) => [m.id, m.done]))
  );

  function toggle(id: string) {
    setDone((d) => ({ ...d, [id]: !d[id] }));
  }

  const routines = c.routines.map((r, i) => ({ ...r, ...meta[i] }));
  const mine = routines.filter((r) => !("owner" in r) || !r.owner);
  const kids = routines.filter((r) => "owner" in r && r.owner);

  function RoutineCard({ routine }: { routine: (typeof routines)[number] }) {
    const isDone = done[routine.id];
    const streakLabel = routine.streakKind === "starStreak" ? c.starStreak : c.dayStreak;
    return (
      <div className="bg-surface-container-lowest p-6 rounded-xl shadow-[0_4px_20px_rgba(42,111,125,0.08)] flex flex-col justify-between h-full">
        <div className="space-y-2">
          <div className="flex justify-between items-start gap-3">
            <div className="flex items-start gap-3">
              {routine.icon && (
                <div
                  className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0"
                  style={{ backgroundColor: `${routine.accent}1f` }}
                >
                  <span className="material-symbols-outlined" style={{ color: routine.accent }}>
                    {routine.icon}
                  </span>
                </div>
              )}
              <div>
                <h4
                  className="font-heading text-lg font-semibold"
                  style={{ color: routine.icon ? "var(--color-on-surface)" : routine.accent }}
                >
                  {routine.title}
                </h4>
                <p className="text-sm text-on-surface-variant">{routine.subtitle}</p>
              </div>
            </div>
            <div
              className="flex items-center gap-1 px-3 py-1 rounded-full shrink-0"
              style={{ backgroundColor: `${routine.accent}30` }}
            >
              <span
                className="material-symbols-outlined text-[16px]"
                style={{ color: routine.accent, fontVariationSettings: "'FILL' 1" }}
              >
                {routine.streakKind === "starStreak" ? "star" : "local_fire_department"}
              </span>
              <span className="text-xs font-semibold" style={{ color: routine.accent }}>
                {routine.streak} {streakLabel}
              </span>
            </div>
          </div>
          <div className="flex gap-2 pt-2">
            {DAYS.map((d, i) => (
              <span
                key={i}
                className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold"
                style={
                  routine.activeDays[i]
                    ? { backgroundColor: routine.accent, color: "white" }
                    : { backgroundColor: "var(--color-surface-container-high)", color: "var(--color-on-surface-variant)" }
                }
              >
                {d}
              </span>
            ))}
          </div>
        </div>
        <div className="mt-4 flex items-center justify-between border-t border-outline-variant pt-3">
          <span className="text-sm text-on-surface-variant italic">
            {"owner" in routine && routine.owner ? routine.owner : c.resetsDaily}
          </span>
          <button
            onClick={() => toggle(routine.id)}
            className="w-8 h-8 rounded-lg border-2 flex items-center justify-center transition-all"
            style={
              isDone
                ? { backgroundColor: routine.accent, borderColor: routine.accent }
                : { borderColor: "var(--color-outline-variant)" }
            }
          >
            <span className={`material-symbols-outlined text-[18px] text-white ${isDone ? "opacity-100" : "opacity-0"}`}>
              check
            </span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-stack-lg">
      <div>
        <h3 className="font-heading text-2xl font-bold text-primary">{c.title}</h3>
        <p className="text-on-surface-variant text-lg">{c.subtitle}</p>
      </div>

      <div className="space-y-stack-md">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-primary">person</span>
            <h4 className="font-heading text-xl font-semibold text-on-surface">{c.myRoutines}</h4>
          </div>
          <button className="bg-primary-container text-on-primary-container px-4 py-2 rounded-lg text-xs font-semibold flex items-center gap-2 hover:opacity-90 transition-all">
            <span className="material-symbols-outlined text-[18px]">add</span> {c.addNew}
          </button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-gutter">
          {mine.map((r) => (
            <RoutineCard key={r.id} routine={r} />
          ))}
        </div>
      </div>

      <div className="space-y-stack-md pt-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-tertiary">family_restroom</span>
            <h4 className="font-heading text-xl font-semibold text-on-surface">{c.kidsRoutines}</h4>
          </div>
          <div className="flex gap-2">
            <span className="px-3 py-1 rounded-full bg-tertiary-fixed text-on-tertiary-fixed-variant text-xs font-semibold">
              {c.kidTags[0]}
            </span>
            <span className="px-3 py-1 rounded-full bg-secondary-fixed text-on-secondary-fixed-variant text-xs font-semibold">
              {c.kidTags[1]}
            </span>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-gutter">
          {kids.map((r) => (
            <RoutineCard key={r.id} routine={r} />
          ))}
        </div>
      </div>

      <div className="space-y-stack-md pt-2">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-primary">event_repeat</span>
          <h4 className="font-heading text-xl font-semibold text-on-surface">{c.weeklyMilestones}</h4>
        </div>
        <div className="bg-surface-container p-6 rounded-2xl space-y-4">
          {c.weeklyItems.map((w, i) => (
            <div
              key={w.title}
              className="flex items-center gap-4 bg-surface-container-lowest p-4 rounded-xl shadow-sm border-s-4"
              style={{ borderColor: weeklyMeta[i].accent }}
            >
              <div
                className="shrink-0 w-12 h-12 rounded-full flex items-center justify-center"
                style={{ backgroundColor: `${weeklyMeta[i].accent}1f` }}
              >
                <span className="material-symbols-outlined" style={{ color: weeklyMeta[i].accent }}>
                  {weeklyMeta[i].icon}
                </span>
              </div>
              <div className="flex-grow">
                <h5 className="font-heading text-lg font-semibold text-on-surface">{w.title}</h5>
                <p className="text-sm text-on-surface-variant">{w.subtitle}</p>
              </div>
              <span
                className="text-xs font-semibold px-2 py-0.5 rounded"
                style={{ color: weeklyMeta[i].accent, backgroundColor: `${weeklyMeta[i].accent}1f` }}
              >
                {w.tag}
              </span>
            </div>
          ))}
        </div>
        <p className="text-center text-sm text-on-surface-variant italic pt-2">{c.weeklyFooter}</p>
      </div>
    </div>
  );
}
