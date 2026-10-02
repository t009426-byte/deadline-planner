"use client";

import { useState } from "react";
import { useLanguage } from "../lib/i18n";

const MOOD_ICONS = [
  "sentiment_extremely_dissatisfied",
  "sentiment_dissatisfied",
  "sentiment_neutral",
  "sentiment_satisfied",
  "sentiment_very_satisfied",
];

const MOOD_LABELS_EN = ["Exhausted", "Stressed", "Neutral", "Calm", "Energized"];
const MOOD_LABELS_AR = ["مستنزفة", "متوترة", "عادية", "هادئة", "نشيطة"];

const CARE_ITEMS = [
  { id: "vitamins", icon: "pill", labelEn: "Vitamins", labelAr: "فيتامينات" },
  { id: "water", icon: "water_drop", labelEn: "Water 2L", labelAr: "ماء 2L" },
  { id: "sleep", icon: "bedtime", labelEn: "Sleep 7h", labelAr: "نوم 7ساعات" },
];

export default function Wellbeing() {
  const { t, locale } = useLanguage();
  const c = t.wellbeingCard;
  const isAr = locale === "ar";

  const [mood, setMood] = useState<number | null>(null);
  const [energy, setEnergy] = useState(5);
  const [care, setCare] = useState<Record<string, boolean>>({});
  const [submitted, setSubmitted] = useState(false);
  const moodLabels = isAr ? MOOD_LABELS_AR : MOOD_LABELS_EN;

  return (
    <div className="space-y-4">
      {/* Section label */}
      <div className="flex items-center gap-1.5">
        <span className="material-symbols-outlined text-outline text-[16px]">favorite</span>
        <span className="text-xs font-semibold uppercase tracking-wide text-outline">
          {isAr ? "تسجيل الحالة" : "Daily Check-in"}
        </span>
      </div>

      <div className="bg-surface-container-lowest rounded-xl border border-surface-container overflow-hidden">
        {/* Mood row */}
        <div className="px-4 py-4 border-b border-surface-container">
          <p className="text-xs font-semibold text-outline mb-3">
            {isAr ? "الحالة المزاجية" : "Mood"}
          </p>
          <div className="flex justify-between">
            {MOOD_ICONS.map((icon, i) => (
              <button
                key={icon}
                onClick={() => setMood(i)}
                className={`flex flex-col items-center gap-1 py-1 px-2 rounded-lg transition-colors ${
                  mood === i ? "bg-primary/10" : "hover:bg-surface-container"
                }`}
              >
                <span
                  className="material-symbols-outlined text-3xl transition-colors"
                  style={{
                    color: mood === i ? "var(--color-primary)" : "var(--color-outline-variant)",
                    fontVariationSettings: mood === i ? "'FILL' 1" : "'FILL' 0",
                  }}
                >
                  {icon}
                </span>
                <span className={`text-[10px] font-semibold transition-opacity ${mood === i ? "opacity-100 text-primary" : "opacity-0"}`}>
                  {moodLabels[i]}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Energy row */}
        <div className="px-4 py-4 border-b border-surface-container">
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs font-semibold text-outline">
              {isAr ? "مستوى الطاقة" : "Energy"}
            </p>
            <span className="text-xs font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-full">
              {energy}/10
            </span>
          </div>
          <input
            className="w-full h-2 bg-surface-container-high rounded-full appearance-none cursor-pointer accent-primary"
            type="range"
            min={1}
            max={10}
            value={energy}
            onChange={(e) => setEnergy(Number(e.target.value))}
          />
          <div className="flex justify-between text-[10px] text-outline mt-1">
            <span>{isAr ? "منخفضة" : "Low"}</span>
            <span>{isAr ? "عالية" : "High"}</span>
          </div>
        </div>

        {/* Self-care quick log */}
        <div className="px-4 py-4 border-b border-surface-container">
          <p className="text-xs font-semibold text-outline mb-3">
            {isAr ? "العناية الذاتية" : "Self-care"}
          </p>
          <div className="flex gap-2">
            {CARE_ITEMS.map((item) => {
              const done = !!care[item.id];
              return (
                <button
                  key={item.id}
                  onClick={() => setCare((c) => ({ ...c, [item.id]: !c[item.id] }))}
                  className={`flex-1 flex flex-col items-center gap-1.5 py-3 rounded-xl border-2 transition-colors ${
                    done
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-surface-container text-on-surface-variant hover:border-primary/30"
                  }`}
                >
                  <span
                    className="material-symbols-outlined text-[22px]"
                    style={{ fontVariationSettings: done ? "'FILL' 1" : "'FILL' 0" }}
                  >
                    {item.icon}
                  </span>
                  <span className="text-[10px] font-semibold">
                    {isAr ? item.labelAr : item.labelEn}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* What's on your mind */}
        <div className="px-4 py-4 border-b border-surface-container">
          <textarea
            className="w-full text-sm bg-surface-container rounded-lg px-3 py-2.5 text-on-surface placeholder:text-on-surface-variant/40 outline-none focus:ring-2 focus:ring-primary/20 resize-none transition-all"
            rows={2}
            placeholder={isAr ? "ما الذي يشغل بالك؟" : "Any wins or worries today?"}
          />
        </div>

        {/* Submit */}
        <div className="px-4 py-3">
          {!submitted ? (
            <button
              onClick={() => setSubmitted(true)}
              disabled={mood === null}
              className="w-full py-2.5 bg-primary text-white text-sm font-semibold rounded-lg disabled:opacity-40 hover:opacity-90 transition-opacity"
            >
              {isAr ? "إكمال تسجيل اليوم" : c.submit}
            </button>
          ) : (
            <div className="flex items-center justify-center gap-2 py-1.5 text-sm font-semibold text-primary">
              <span className="material-symbols-outlined text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                check_circle
              </span>
              {isAr ? "تم حفظ تسجيل اليوم" : "Check-in saved"}
            </div>
          )}
        </div>
      </div>

      {/* Workload snapshot */}
      <div className="bg-surface-container-lowest rounded-xl border border-surface-container p-4">
        <div className="flex items-center justify-between mb-3">
          <p className="text-xs font-semibold text-outline">
            {isAr ? "حِمل هذا الأسبوع" : "This Week's Load"}
          </p>
          <span className="text-xs text-primary font-semibold">26 / 30h</span>
        </div>
        <div className="w-full h-2 bg-surface-container-high rounded-full overflow-hidden">
          <div className="h-full bg-primary rounded-full transition-all" style={{ width: "87%" }} />
        </div>
        <div className="flex items-center justify-between mt-2">
          <p className="text-xs text-outline">{isAr ? "مشغولة هذا الأسبوع" : "Busy week — protect your study hours"}</p>
          <span className="text-xs font-bold text-primary">87%</span>
        </div>

        {/* Today's priorities */}
        <div className="mt-4 space-y-2">
          {c.priorities.map((p, i) => (
            <div key={p.title} className="flex items-center gap-3 py-1">
              <span
                className="material-symbols-outlined text-[16px] shrink-0"
                style={{
                  color: i === 0 ? "var(--color-primary)" : "var(--color-outline-variant)",
                  fontVariationSettings: i === 0 ? "'FILL' 1" : "'FILL' 0",
                }}
              >
                {i === 0 ? "check_circle" : "radio_button_unchecked"}
              </span>
              <div className="flex-1 min-w-0">
                <p className={`text-sm font-medium leading-tight ${i === 0 ? "line-through text-outline" : "text-on-surface"}`}>
                  {p.title}
                </p>
                <p className="text-xs text-outline">{p.subtitle}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
