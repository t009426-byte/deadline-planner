"use client";

import { useLanguage } from "../lib/i18n";

const memberColors = ["#005764", "#8e4e14", "#8e2e15", "#1f6775"];

const dayConfig = [
  { dots: ["#005764", "#8e2e15"], date: 21 },
  { dots: ["#005764", "#8e4e14", "#1f6775"], date: 22 },
  { dots: ["#8e4e14", "#8e2e15"], date: 23, clash: true },
  { dots: [], date: 24, today: true },
  { dots: ["#8e4e14", "#005764"], date: 25 },
  { dots: ["#8e2e15", "#1f6775", "#005764"], date: 26 },
  { dots: ["#005764"], date: 27 },
];

export default function FamilyCalendar() {
  const { t } = useLanguage();
  const c = t.calendarCard;

  return (
    <div className="space-y-stack-lg">
      <div className="flex items-center justify-between">
        <h3 className="font-heading text-xl font-semibold text-on-surface">{c.familyMembers}</h3>
        <div className="flex gap-2">
          <button className="p-2 rounded-lg bg-surface-container hover:bg-surface-container-high transition-colors">
            <span className="material-symbols-outlined text-primary">chevron_left</span>
          </button>
          <button className="p-2 rounded-lg bg-surface-container hover:bg-surface-container-high transition-colors">
            <span className="material-symbols-outlined text-primary">chevron_right</span>
          </button>
        </div>
      </div>

      <div className="flex flex-wrap gap-3">
        {c.members.map((name, i) => (
          <div
            key={name}
            className="flex items-center gap-2 px-3 py-1.5 rounded-full border"
            style={{ backgroundColor: `${memberColors[i]}15`, borderColor: `${memberColors[i]}30` }}
          >
            <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: memberColors[i] }} />
            <span className="text-xs font-semibold" style={{ color: memberColors[i] }}>
              {name}
            </span>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
        {c.days.map((label, i) => {
          const d = dayConfig[i];
          return (
            <div
              key={label}
              className={`rounded-xl p-4 min-h-[140px] flex flex-col justify-between cursor-pointer hover:shadow-lg transition-all relative ${
                d.today
                  ? "bg-primary-container shadow-md"
                  : d.clash
                  ? "bg-surface-container-lowest border-2 border-secondary-container shadow-[0_0_12px_rgba(255,171,105,0.3)]"
                  : "bg-surface-container-lowest border border-transparent"
              }`}
            >
              {d.clash && (
                <span className="material-symbols-outlined text-secondary text-sm absolute top-2 end-2">
                  warning
                </span>
              )}
              <div className="text-center">
                <p
                  className={`text-[10px] font-semibold uppercase tracking-wide ${
                    d.today ? "text-on-primary-container opacity-80" : "text-outline"
                  }`}
                >
                  {label}
                </p>
                <p
                  className={`font-heading text-2xl font-semibold ${
                    d.today ? "text-on-primary-container" : "text-on-surface"
                  }`}
                >
                  {d.date}
                </p>
              </div>
              <div className="flex flex-wrap justify-center gap-1.5 mt-4">
                {d.today ? (
                  <span className="w-2.5 h-2.5 rounded-full bg-on-primary-container" />
                ) : (
                  d.dots.map((color, j) => (
                    <span key={j} className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: color }} />
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>

      <div className="bg-secondary-fixed text-on-secondary-fixed rounded-2xl p-6 shadow-sm relative overflow-hidden">
        <div className="flex items-start gap-4 relative z-10">
          <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center shrink-0 shadow-sm">
            <span className="material-symbols-outlined text-secondary" style={{ fontVariationSettings: "'FILL' 1" }}>
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
    </div>
  );
}
