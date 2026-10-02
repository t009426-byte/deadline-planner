"use client";

import { useState } from "react";
import { useLanguage } from "../lib/i18n";
import { ENTRY_TYPES, fromDateKey, memberLabel, toDateKey, useFamily } from "../lib/family";

interface Task {
  id: string;
  label: string;
  note?: string;
  urgent?: boolean;
}

const MY_TASKS: Task[] = [
  { id: "study", label: "Study block", note: "9–11 AM · Thesis Ch. 3", urgent: true },
  { id: "mindful", label: "Morning mindfulness", note: "10 min" },
  { id: "emails", label: "Work emails", note: "30 min" },
  { id: "readings", label: "Research readings", note: "Due this week" },
];

const typeMeta = Object.fromEntries(ENTRY_TYPES.map((t) => [t.id, t]));

export default function Routines() {
  const { locale } = useLanguage();
  const isAr = locale === "ar";
  const { members, entries, toggleEntry } = useFamily();

  const [myDone, setMyDone] = useState<Record<string, boolean>>({});
  const myCompleted = Object.values(myDone).filter(Boolean).length;

  const memberById = Object.fromEntries(members.map((m) => [m.id, m]));
  const todayKey = toDateKey(new Date());
  const horizon = new Date();
  horizon.setDate(horizon.getDate() + 7);
  const horizonKey = toDateKey(horizon);
  const upcoming = entries
    .filter((e) => memberById[e.memberId] && e.date >= todayKey && e.date <= horizonKey)
    .sort((a, b) => a.date.localeCompare(b.date));

  function dueLabel(key: string) {
    if (key === todayKey) return isAr ? "اليوم" : "Today";
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    if (key === toDateKey(tomorrow)) return isAr ? "غداً" : "Tmrw";
    return fromDateKey(key).toLocaleDateString(isAr ? "ar" : "en", { weekday: "short" });
  }

  return (
    <div className="space-y-4">
      {/* Section label */}
      <div className="flex items-center gap-1.5">
        <span className="material-symbols-outlined text-outline text-[16px]">checklist</span>
        <span className="text-xs font-semibold uppercase tracking-wide text-outline">
          {isAr ? "مهام اليوم" : "Today's Tasks"}
        </span>
      </div>

      {/* My tasks */}
      <div className="bg-surface-container-lowest rounded-xl border border-surface-container overflow-hidden">
        <div className="flex items-center justify-between px-4 py-3 border-b border-surface-container">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-primary text-[18px]" style={{ fontVariationSettings: "'FILL' 1" }}>
              school
            </span>
            <span className="font-semibold text-sm text-on-surface">
              {isAr ? "يومي" : "My Day"}
            </span>
          </div>
          <span className="text-xs text-outline">
            {myCompleted}/{MY_TASKS.length}
          </span>
        </div>
        <ul>
          {MY_TASKS.map((task, i) => {
            const done = !!myDone[task.id];
            return (
              <li
                key={task.id}
                className={`flex items-center gap-3 px-4 py-3 cursor-pointer hover:bg-surface-container transition-colors ${
                  i < MY_TASKS.length - 1 ? "border-b border-surface-container" : ""
                }`}
                onClick={() => setMyDone((d) => ({ ...d, [task.id]: !d[task.id] }))}
              >
                <button
                  className={`w-5 h-5 rounded border-2 flex items-center justify-center shrink-0 transition-colors ${
                    done
                      ? "bg-primary border-primary"
                      : task.urgent
                      ? "border-primary"
                      : "border-outline-variant"
                  }`}
                >
                  {done && (
                    <span className="material-symbols-outlined text-white text-[13px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                      check
                    </span>
                  )}
                </button>
                <div className="flex-1 min-w-0">
                  <span className={`text-sm font-medium leading-tight block ${done ? "line-through text-outline" : "text-on-surface"}`}>
                    {task.label}
                    {task.urgent && !done && (
                      <span className="ms-1.5 text-[10px] font-bold text-primary align-middle">●</span>
                    )}
                  </span>
                  {task.note && (
                    <span className="text-xs text-outline">{task.note}</span>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      </div>

      {/* Next 7 days from the family calendar */}
      <div className="bg-surface-container-lowest rounded-xl border border-surface-container overflow-hidden">
        <div className="flex items-center justify-between px-4 py-3 border-b border-surface-container">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[18px] text-secondary" style={{ fontVariationSettings: "'FILL' 1" }}>
              event_upcoming
            </span>
            <span className="font-semibold text-sm text-on-surface">
              {isAr ? "الأيام السبعة القادمة" : "Next 7 days"}
            </span>
          </div>
          <span className="text-xs text-outline">{upcoming.filter((e) => !e.done).length}</span>
        </div>
        {upcoming.length === 0 ? (
          <p className="px-4 py-4 text-sm text-outline">
            {isAr ? "لا شيء بعد — أضيفي من التقويم أعلاه." : "Nothing yet — add items from the calendar above."}
          </p>
        ) : (
          <ul>
            {upcoming.map((e, i) => {
              const m = memberById[e.memberId];
              const t = typeMeta[e.type];
              return (
                <li
                  key={e.id}
                  onClick={() => toggleEntry(e.id)}
                  className={`flex items-center gap-3 px-4 py-3 cursor-pointer hover:bg-surface-container transition-colors ${
                    i < upcoming.length - 1 ? "border-b border-surface-container" : ""
                  }`}
                >
                  <span
                    className="w-5 h-5 rounded border-2 flex items-center justify-center shrink-0"
                    style={{ borderColor: m.color, backgroundColor: e.done ? m.color : "transparent" }}
                  >
                    {e.done && <span className="material-symbols-outlined text-white text-[13px]">check</span>}
                  </span>
                  <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-surface-container text-outline shrink-0 w-12 text-center">
                    {dueLabel(e.date)}
                  </span>
                  <span className={`flex-1 min-w-0 text-sm truncate ${e.done ? "line-through text-outline" : "text-on-surface"}`}>
                    <span className="font-medium">{isAr ? t.ar : t.en}</span>
                    {e.title && <span className="text-on-surface-variant"> · {e.title}</span>}
                  </span>
                  <span
                    className="text-[10px] font-bold px-1.5 py-0.5 rounded shrink-0"
                    style={{ color: m.color, backgroundColor: `${m.color}1a` }}
                  >
                    {memberLabel(m, isAr)}
                  </span>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}
