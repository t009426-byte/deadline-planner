"use client";

import { useState } from "react";
import { useLanguage } from "../lib/i18n";

interface Task {
  id: string;
  label: string;
  note?: string;
  urgent?: boolean;
}

interface KidTask {
  id: string;
  name: string;
  label: string;
  note?: string;
  color: string;
}

const MY_TASKS: Task[] = [
  { id: "study", label: "Study block", note: "9–11 AM · Thesis Ch. 3", urgent: true },
  { id: "mindful", label: "Morning mindfulness", note: "10 min" },
  { id: "emails", label: "Work emails", note: "30 min" },
  { id: "readings", label: "Research readings", note: "Due this week" },
];

const KID_TASKS: KidTask[] = [
  { id: "oliver", name: "Oliver", label: "Soccer practice", note: "4:00 PM", color: "#005764" },
  { id: "maya", name: "Maya", label: "Violin lesson", note: "5:00 PM", color: "#8e4e14" },
  { id: "leo", name: "Leo", label: "Homework review", note: "After school", color: "#8e2e15" },
];

const WEEKLY: Array<{ label: string; due: string; urgent?: boolean }> = [
  { label: "Submit literature review", due: "Thu", urgent: true },
  { label: "Parent-teacher meeting", due: "Fri" },
  { label: "Grocery + meal prep", due: "Sun" },
];

export default function Routines() {
  const { locale } = useLanguage();
  const isAr = locale === "ar";

  const [myDone, setMyDone] = useState<Record<string, boolean>>({});
  const [kidDone, setKidDone] = useState<Record<string, boolean>>({});

  const myCompleted = Object.values(myDone).filter(Boolean).length;
  const kidCompleted = Object.values(kidDone).filter(Boolean).length;

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

      {/* Kids tasks */}
      <div className="bg-surface-container-lowest rounded-xl border border-surface-container overflow-hidden">
        <div className="flex items-center justify-between px-4 py-3 border-b border-surface-container">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[18px]" style={{ color: "#8e4e14", fontVariationSettings: "'FILL' 1" }}>
              family_restroom
            </span>
            <span className="font-semibold text-sm text-on-surface">
              {isAr ? "الأطفال" : "Kids"}
            </span>
          </div>
          <span className="text-xs text-outline">
            {kidCompleted}/{KID_TASKS.length}
          </span>
        </div>
        <ul>
          {KID_TASKS.map((task, i) => {
            const done = !!kidDone[task.id];
            return (
              <li
                key={task.id}
                className={`flex items-center gap-3 px-4 py-3 cursor-pointer hover:bg-surface-container transition-colors ${
                  i < KID_TASKS.length - 1 ? "border-b border-surface-container" : ""
                }`}
                onClick={() => setKidDone((d) => ({ ...d, [task.id]: !d[task.id] }))}
              >
                <button
                  className={`w-5 h-5 rounded border-2 flex items-center justify-center shrink-0 transition-colors ${
                    done ? "border-[color:var(--c)] bg-[color:var(--c)]" : "border-outline-variant"
                  }`}
                  style={{ "--c": task.color } as React.CSSProperties}
                >
                  {done && (
                    <span className="material-symbols-outlined text-white text-[13px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                      check
                    </span>
                  )}
                </button>
                <div className="flex-1 min-w-0 flex items-baseline gap-2">
                  <span
                    className="text-[10px] font-bold px-1.5 py-0.5 rounded shrink-0"
                    style={{ color: task.color, backgroundColor: `${task.color}15` }}
                  >
                    {task.name}
                  </span>
                  <span className={`text-sm font-medium ${done ? "line-through text-outline" : "text-on-surface"}`}>
                    {task.label}
                  </span>
                  {task.note && (
                    <span className="text-xs text-outline ms-auto shrink-0">{task.note}</span>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      </div>

      {/* Weekly upcoming */}
      <div className="bg-surface-container-lowest rounded-xl border border-surface-container overflow-hidden">
        <div className="px-4 py-3 border-b border-surface-container">
          <span className="font-semibold text-sm text-on-surface">
            {isAr ? "هذا الأسبوع" : "Coming up"}
          </span>
        </div>
        <ul>
          {WEEKLY.map((item, i) => (
            <li
              key={item.label}
              className={`flex items-center gap-3 px-4 py-3 ${i < WEEKLY.length - 1 ? "border-b border-surface-container" : ""}`}
            >
              <span
                className={`text-xs font-bold px-2 py-0.5 rounded shrink-0 ${
                  item.urgent
                    ? "bg-primary/10 text-primary"
                    : "bg-surface-container text-outline"
                }`}
              >
                {item.due}
              </span>
              <span className={`text-sm ${item.urgent ? "font-semibold text-on-surface" : "text-on-surface-variant"}`}>
                {item.label}
              </span>
              {item.urgent && (
                <span className="ms-auto material-symbols-outlined text-primary text-[16px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                  priority_high
                </span>
              )}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
