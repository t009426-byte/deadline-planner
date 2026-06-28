"use client";

import { useState } from "react";
import { useLanguage } from "../lib/i18n";

const moodIcons = [
  "sentiment_extremely_dissatisfied",
  "sentiment_dissatisfied",
  "sentiment_neutral",
  "sentiment_satisfied",
  "sentiment_very_satisfied",
];

const priorityAccents = ["var(--color-primary-fixed-dim)", "var(--color-secondary-container)", "var(--color-tertiary-container)"];

export default function Wellbeing() {
  const { t } = useLanguage();
  const c = t.wellbeingCard;
  const [mood, setMood] = useState<string | null>(null);
  const [energy, setEnergy] = useState(5);
  const [submitted, setSubmitted] = useState(false);

  const hours = 26;
  const cap = 30;
  const pct = (hours / cap) * 100;
  const circumference = 502.6;
  const offset = circumference - (pct / 100) * circumference;
  const high = pct >= 80;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-gutter">
      <div className="lg:col-span-7 space-y-stack-lg">
        <div className="flex justify-between items-end flex-wrap gap-4">
          <div>
            <h3 className="font-heading text-3xl font-bold text-primary">{c.greeting}</h3>
            <p className="text-on-surface-variant text-lg">{c.subtitle}</p>
          </div>
          <div className="flex flex-col items-center bg-surface-container-low p-4 rounded-xl border border-white shadow-sm">
            <span className="material-symbols-outlined text-secondary text-4xl" style={{ fontVariationSettings: "'FILL' 1" }}>
              local_fire_department
            </span>
            <span className="font-heading text-secondary text-lg font-semibold">7</span>
            <span className="text-[10px] font-semibold text-on-surface-variant">{c.dayStreak}</span>
          </div>
        </div>

        <section className="bg-surface-container-lowest p-6 rounded-xl shadow-sm border border-white">
          <h4 className="font-heading text-lg text-primary mb-4">{c.currentMood}</h4>
          <div className="flex justify-between md:justify-around items-center">
            {c.moods.map((m, i) => (
              <button
                key={m.key}
                onClick={() => setMood(m.key)}
                className={`flex flex-col items-center gap-2 p-2 rounded-lg transition-colors ${
                  mood === m.key ? "bg-primary-container/20" : "hover:bg-surface-container-low"
                }`}
              >
                <span
                  className="material-symbols-outlined text-4xl transition-colors"
                  style={{
                    color: mood === m.key ? "var(--color-primary)" : "var(--color-outline-variant)",
                    fontVariationSettings: mood === m.key ? "'FILL' 1" : "'FILL' 0",
                  }}
                >
                  {moodIcons[i]}
                </span>
                <span className={`text-xs font-semibold ${mood === m.key ? "opacity-100" : "opacity-0"}`}>
                  {m.label}
                </span>
              </button>
            ))}
          </div>
        </section>

        <section className="bg-surface-container-lowest p-6 rounded-xl shadow-sm border border-white">
          <div className="flex justify-between items-center mb-6">
            <h4 className="font-heading text-lg text-primary">{c.energyLevel}</h4>
            <span className="font-heading text-xl text-primary bg-primary-container/20 px-3 py-1 rounded-lg">
              {energy}
            </span>
          </div>
          <div className="px-2">
            <input
              className="w-full h-3 bg-surface-container-high rounded-lg appearance-none cursor-pointer accent-primary"
              max={10}
              min={1}
              type="range"
              value={energy}
              onChange={(e) => setEnergy(Number(e.target.value))}
            />
            <div className="flex justify-between mt-3 text-on-surface-variant text-xs font-semibold">
              <span>{c.lowBattery}</span>
              <span>{c.fullyCharged}</span>
            </div>
          </div>
        </section>

        <section className="bg-surface-container-lowest p-6 rounded-xl shadow-sm border border-white">
          <h4 className="font-heading text-lg text-primary mb-4">{c.mindPrompt}</h4>
          <textarea
            className="w-full min-h-[120px] p-4 bg-surface-container-low border-none rounded-xl focus:ring-2 focus:ring-primary-container outline-none"
            placeholder={c.mindPlaceholder}
          />
        </section>

        {!submitted ? (
          <button
            onClick={() => setSubmitted(true)}
            className="w-full py-4 bg-primary text-white font-heading font-semibold rounded-xl shadow-lg hover:opacity-90 active:scale-95 transition-all"
          >
            {c.submit}
          </button>
        ) : (
          <section>
            <div className="bg-gradient-to-br from-primary-container to-primary-fixed-dim p-0.5 rounded-2xl shadow-xl">
              <div className="bg-surface-container-lowest p-6 rounded-[1.4rem]">
                <div className="flex items-center gap-3 mb-4">
                  <div className="bg-primary p-2 rounded-lg">
                    <span className="material-symbols-outlined text-white" style={{ fontVariationSettings: "'FILL' 1" }}>
                      psychology_alt
                    </span>
                  </div>
                  <h4 className="font-heading text-lg text-primary">{c.coachTitle}</h4>
                </div>
                <p className="text-lg text-on-surface leading-relaxed">{c.coachText}</p>
                <div className="p-4 bg-surface-container-low rounded-xl border-s-4 border-primary mt-4">
                  <p className="text-xs font-semibold text-primary mb-1">{c.groundingTip}</p>
                  <p className="text-sm italic text-on-surface-variant">{c.groundingText}</p>
                </div>
              </div>
            </div>
          </section>
        )}
      </div>

      <div className="lg:col-span-5 space-y-stack-lg">
        <section className="bg-surface-container-lowest p-6 rounded-xl shadow-sm border border-white relative overflow-hidden">
          <h4 className="font-heading text-lg text-primary mb-4">{c.familyWorkload}</h4>
          <div className="flex flex-col items-center justify-center py-4">
            <div className="relative w-48 h-48 flex items-center justify-center">
              <svg className="w-full h-full -rotate-90">
                <circle
                  cx="96"
                  cy="96"
                  fill="transparent"
                  r="80"
                  stroke="var(--color-surface-container-high)"
                  strokeWidth="12"
                />
                <circle
                  cx="96"
                  cy="96"
                  fill="transparent"
                  r="80"
                  stroke={high ? "var(--color-error)" : "var(--color-primary)"}
                  strokeWidth="12"
                  strokeDasharray={circumference}
                  strokeDashoffset={offset}
                  className="transition-all duration-1000 ease-out"
                />
              </svg>
              <div className="absolute flex flex-col items-center">
                <span className="font-heading text-4xl font-bold">{hours}</span>
                <span className="text-xs font-semibold text-on-surface-variant">
                  {c.ofCap.replace("{cap}", String(cap))}
                </span>
              </div>
            </div>
          </div>
          <div className={`mt-4 p-4 rounded-xl ${high ? "bg-error-container" : ""}`}>
            <div className="flex items-center gap-2 mb-2">
              <span
                className="material-symbols-outlined"
                style={{ color: high ? "var(--color-error)" : "var(--color-primary)" }}
              >
                {high ? "warning" : "check_circle"}
              </span>
              <span
                className="font-heading text-lg font-semibold"
                style={{ color: high ? "var(--color-error)" : "var(--color-primary)" }}
              >
                {high ? c.high : c.balanced}
              </span>
            </div>
            <div className="w-full bg-black/5 rounded-full h-1.5 mb-2">
              <div
                className="h-1.5 rounded-full"
                style={{ width: `${pct}%`, backgroundColor: high ? "var(--color-error)" : "var(--color-primary)" }}
              />
            </div>
            <p className="text-sm text-on-surface-variant">{c.capacityText.replace("{pct}", String(Math.round(pct)))}</p>
          </div>
        </section>

        <section className="bg-surface-container-lowest p-6 rounded-xl shadow-sm border border-white">
          <h4 className="font-heading text-lg text-primary mb-4">{c.todaysBalance}</h4>
          <div className="space-y-3">
            {c.priorities.map((p, i) => (
              <div key={p.title} className="flex items-center gap-4 p-3 hover:bg-surface-container-low rounded-lg transition-colors">
                <div className="w-1.5 h-10 rounded-full" style={{ backgroundColor: priorityAccents[i] }} />
                <div className="flex-1">
                  <p className="font-heading font-semibold" style={{ color: i === 0 ? "var(--color-primary)" : "var(--color-on-surface)" }}>
                    {p.title}
                  </p>
                  <p className="text-sm text-on-surface-variant">{p.subtitle}</p>
                </div>
                <span
                  className="material-symbols-outlined"
                  style={{ color: i === 0 ? "var(--color-primary)" : "var(--color-outline)", fontVariationSettings: i === 0 ? "'FILL' 1" : "'FILL' 0" }}
                >
                  {i === 0 ? "check_circle" : "radio_button_unchecked"}
                </span>
              </div>
            ))}
          </div>
        </section>

        <section className="bg-surface-container-lowest p-6 rounded-xl shadow-sm border border-white">
          <h4 className="font-heading text-lg text-primary mb-2">{c.selfCareLog}</h4>
          <div className="divide-y divide-surface-container-highest">
            <div className="py-3 flex justify-between items-center">
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-primary">pill</span>
                <span>{c.vitamins}</span>
              </div>
              <span className="text-xs font-semibold px-2 py-0.5 rounded bg-primary-fixed text-on-primary-fixed">{c.yes}</span>
            </div>
            <div className="py-3 flex justify-between items-center">
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-primary">water_drop</span>
                <span>{c.water}</span>
              </div>
              <span className="text-xs font-semibold text-on-surface-variant">{c.waterDone}</span>
            </div>
            <div className="py-3 flex justify-between items-center">
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-primary">spa</span>
                <span>{c.meditation}</span>
              </div>
              <button className="text-xs font-semibold text-primary border border-primary px-3 py-1 rounded-lg hover:bg-primary hover:text-white transition-all">
                {c.logNow}
              </button>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
