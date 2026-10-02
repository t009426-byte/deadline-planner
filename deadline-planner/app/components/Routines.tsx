"use client";

import { useState } from "react";
import { useLanguage } from "../lib/i18n";
import { ENTRY_TYPES, fromDateKey, memberLabel, toDateKey, useFamily } from "../lib/family";

const typeMeta = Object.fromEntries(ENTRY_TYPES.map((t) => [t.id, t]));

export default function Routines() {
  const { locale } = useLanguage();
  const isAr = locale === "ar";
  const { members, entries, toggleEntry, tasks, addTask, removeTask, toggleTask } = useFamily();

  const [newLabel, setNewLabel] = useState("");
  const [newNote, setNewNote] = useState("");
  const myCompleted = tasks.filter((t) => t.done).length;

  function submitTask(e: React.FormEvent) {
    e.preventDefault();
    if (!newLabel.trim()) return;
    addTask(newLabel.trim(), newNote.trim() || undefined);
    setNewLabel("");
    setNewNote("");
  }

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
            {myCompleted}/{tasks.length}
          </span>
        </div>
        <ul>
          {tasks.map((task) => (
            <li
              key={task.id}
              className="group flex items-center gap-3 ps-4 pe-2 py-3 cursor-pointer hover:bg-surface-container transition-colors border-b border-surface-container"
              onClick={() => toggleTask(task.id)}
            >
              <span
                className={`w-5 h-5 rounded border-2 flex items-center justify-center shrink-0 transition-colors ${
                  task.done ? "bg-primary border-primary" : "border-outline-variant"
                }`}
              >
                {task.done && (
                  <span className="material-symbols-outlined text-white text-[13px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                    check
                  </span>
                )}
              </span>
              <div className="flex-1 min-w-0">
                <span className={`text-sm font-medium leading-tight block ${task.done ? "line-through text-outline" : "text-on-surface"}`}>
                  {task.label}
                </span>
                {task.note && <span className="text-xs text-outline">{task.note}</span>}
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  removeTask(task.id);
                }}
                aria-label={isAr ? "حذف المهمة" : "Delete task"}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-outline hover:text-error hover:bg-error-container/50 shrink-0 md:opacity-0 md:group-hover:opacity-100 focus:opacity-100 transition-opacity"
              >
                <span className="material-symbols-outlined text-[18px]">delete</span>
              </button>
            </li>
          ))}
        </ul>
        <form onSubmit={submitTask} className="flex items-center gap-2 p-2">
          <input
            value={newLabel}
            onChange={(e) => setNewLabel(e.target.value)}
            placeholder={isAr ? "أضيفي مهمة…" : "Add a task…"}
            className="flex-1 min-w-0 bg-surface-container rounded-lg px-3 py-2 text-sm text-on-surface placeholder:text-on-surface-variant/50 outline-none focus:ring-2 focus:ring-primary/20"
          />
          <input
            value={newNote}
            onChange={(e) => setNewNote(e.target.value)}
            placeholder={isAr ? "الوقت" : "Time/note"}
            className="w-24 bg-surface-container rounded-lg px-3 py-2 text-sm text-on-surface placeholder:text-on-surface-variant/50 outline-none focus:ring-2 focus:ring-primary/20"
          />
          <button
            type="submit"
            disabled={!newLabel.trim()}
            aria-label={isAr ? "إضافة مهمة" : "Add task"}
            className="w-9 h-9 rounded-lg bg-primary text-white flex items-center justify-center shrink-0 disabled:opacity-40 hover:opacity-90 transition-opacity"
          >
            <span className="material-symbols-outlined text-[20px]">add</span>
          </button>
        </form>
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
