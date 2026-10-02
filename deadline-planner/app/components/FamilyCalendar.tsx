"use client";

import { useEffect, useState } from "react";
import { useLanguage } from "../lib/i18n";
import { authFetch } from "../lib/supabase";
import type { ExternalEvent } from "../lib/external-calendars";
import {
  ENTRY_TYPES,
  fromDateKey,
  memberLabel,
  toDateKey,
  useFamily,
  type Entry,
  type EntryType,
  type Member,
} from "../lib/family";

function startOfWeek(d: Date) {
  const s = new Date(d.getFullYear(), d.getMonth(), d.getDate());
  s.setDate(s.getDate() - s.getDay());
  return s;
}

function addDays(d: Date, n: number) {
  const r = new Date(d);
  r.setDate(r.getDate() + n);
  return r;
}

const typeMeta = Object.fromEntries(ENTRY_TYPES.map((t) => [t.id, t])) as Record<
  EntryType,
  (typeof ENTRY_TYPES)[number]
>;

type View = "month" | "week";

export default function FamilyCalendar({ onOpenProfile }: { onOpenProfile: () => void }) {
  const { locale } = useLanguage();
  const isAr = locale === "ar";
  const dateLocale = isAr ? "ar" : "en";
  const { members, kids, admin, entries, addEntry, removeEntry, toggleEntry, calendarsVersion } = useFamily();

  const todayKey = toDateKey(new Date());
  const [view, setView] = useState<View>("month");
  const [anchor, setAnchor] = useState(() => new Date());
  const [type, setType] = useState<EntryType>("homework");
  const [date, setDate] = useState(todayKey);
  const [memberId, setMemberId] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [filter, setFilter] = useState<string | null>(null);

  const selectedMember = members.find((m) => m.id === memberId) ?? null;
  const memberById = Object.fromEntries(members.map((m) => [m.id, m]));

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedMember || !date) return;
    addEntry({ type, date, memberId: selectedMember.id, title: title.trim() || undefined });
    setTitle("");
    setAnchor(fromDateKey(date));
  }

  function shift(dir: 1 | -1) {
    setAnchor(
      view === "week"
        ? addDays(anchor, 7 * dir)
        : new Date(anchor.getFullYear(), anchor.getMonth() + dir, 1)
    );
  }

  function goToday() {
    setAnchor(new Date());
    setDate(todayKey);
  }

  const visible = entries.filter((e) => memberById[e.memberId] && (!filter || e.memberId === filter));
  const entriesOn = (key: string) => visible.filter((e) => e.date === key);

  const weekStart = startOfWeek(anchor);
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

  const monthFirst = new Date(anchor.getFullYear(), anchor.getMonth(), 1);
  const monthLast = new Date(anchor.getFullYear(), anchor.getMonth() + 1, 0);
  const gridStart = startOfWeek(monthFirst);
  const gridDays = Math.ceil((monthFirst.getDay() + monthLast.getDate()) / 7) * 7;
  const monthDays = Array.from({ length: gridDays }, (_, i) => addDays(gridStart, i));

  const periodLabel =
    view === "month"
      ? monthFirst.toLocaleDateString(dateLocale, { month: "long", year: "numeric" })
      : `${weekStart.toLocaleDateString(dateLocale, { month: "short", day: "numeric" })} – ${weekDays[6].toLocaleDateString(dateLocale, { month: "short", day: "numeric" })}`;

  const selectedEntries = entriesOn(date);

  const rangeFrom = toDateKey(view === "month" ? monthDays[0] : weekDays[0]);
  const rangeTo = toDateKey(view === "month" ? monthDays[monthDays.length - 1] : weekDays[6]);
  const rangeKey = `${rangeFrom}|${rangeTo}|${calendarsVersion}`;
  const [external, setExternal] = useState<{
    key: string;
    events: ExternalEvent[];
    errors: Record<string, string>;
  } | null>(null);

  useEffect(() => {
    let cancelled = false;
    authFetch(`/api/calendar/external?from=${rangeFrom}&to=${rangeTo}`)
      .then((r) => (r.ok ? r.json() : { events: [], errors: {} }))
      .then((json) => !cancelled && setExternal({ key: rangeKey, events: json.events ?? [], errors: json.errors ?? {} }))
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [rangeKey, rangeFrom, rangeTo]);

  const showExternal = !filter || filter === admin.id;
  const externalByDay = new Map<string, ExternalEvent[]>();
  if (showExternal && external) {
    for (const ev of external.events) {
      for (const k of externalDayKeys(ev)) {
        const list = externalByDay.get(k) ?? [];
        list.push(ev);
        externalByDay.set(k, list);
      }
    }
    for (const list of externalByDay.values()) list.sort((a, b) => a.start.localeCompare(b.start));
  }
  const externalOn = (key: string) => externalByDay.get(key) ?? [];
  const externalErrors = external ? Object.values(external.errors) : [];

  return (
    <div className="space-y-4">
      {/* Add entry */}
      <form
        onSubmit={submit}
        className="bg-surface-container-lowest rounded-xl border border-surface-container p-4 space-y-4"
      >
        <Field label={isAr ? "النوع" : "What"}>
          <div className="flex gap-2 overflow-x-auto -mx-1 px-1 [scrollbar-width:none] md:flex-wrap md:overflow-visible">
            {ENTRY_TYPES.map((t) => (
              <button
                type="button"
                key={t.id}
                onClick={() => setType(t.id)}
                className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap border transition-colors ${
                  type === t.id
                    ? "bg-on-surface text-background border-on-surface"
                    : "border-surface-container-high text-on-surface-variant hover:bg-surface-container"
                }`}
              >
                <span className="material-symbols-outlined text-[16px]">{t.icon}</span>
                {isAr ? t.ar : t.en}
              </button>
            ))}
          </div>
        </Field>

        <Field label={isAr ? "لمن" : "Who"}>
          <div className="flex flex-wrap gap-2">
            {members.map((m) => {
              const active = memberId === m.id;
              return (
                <button
                  type="button"
                  key={m.id}
                  onClick={() => setMemberId(m.id)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border-2 transition-colors"
                  style={{
                    borderColor: m.color,
                    backgroundColor: active ? m.color : "transparent",
                    color: active ? "#fff" : m.color,
                  }}
                >
                  <span
                    className="w-2 h-2 rounded-full"
                    style={{ backgroundColor: active ? "#fff" : m.color }}
                  />
                  {memberLabel(m, isAr)}
                </button>
              );
            })}
            {kids.length === 0 && (
              <button
                type="button"
                onClick={onOpenProfile}
                className="flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-semibold border-2 border-dashed border-outline-variant text-on-surface-variant hover:border-primary hover:text-primary"
              >
                <span className="material-symbols-outlined text-[16px]">add</span>
                {isAr ? "أضيفي أطفالك" : "Add your kids"}
              </button>
            )}
          </div>
        </Field>

        <div className="flex flex-col sm:flex-row gap-2">
          <input
            type="date"
            value={date}
            onChange={(e) => {
              setDate(e.target.value);
              if (e.target.value) setAnchor(fromDateKey(e.target.value));
            }}
            required
            className="bg-surface-container rounded-lg px-3 py-2.5 text-sm text-on-surface outline-none focus:ring-2 focus:ring-primary/20"
          />
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder={isAr ? "تفاصيل (اختياري) — مثال: رياضيات ص 42" : "Details (optional) — e.g. Math p. 42"}
            className="flex-1 min-w-0 bg-surface-container rounded-lg px-3 py-2.5 text-sm text-on-surface placeholder:text-on-surface-variant/50 outline-none focus:ring-2 focus:ring-primary/20"
          />
          <button
            type="submit"
            disabled={!selectedMember || !date}
            className="flex items-center justify-center gap-1 px-4 py-2.5 rounded-lg text-sm font-semibold text-white disabled:opacity-40 transition-opacity hover:opacity-90"
            style={{ backgroundColor: selectedMember?.color ?? "var(--color-primary)" }}
          >
            <span className="material-symbols-outlined text-[18px]">add</span>
            {isAr ? "إضافة" : "Add"}
          </button>
        </div>
      </form>

      {/* Period header */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-1 min-w-0">
          <IconButton icon={isAr ? "chevron_right" : "chevron_left"} label="Previous" onClick={() => shift(-1)} />
          <IconButton icon={isAr ? "chevron_left" : "chevron_right"} label="Next" onClick={() => shift(1)} />
          <span className="text-sm font-semibold text-on-surface ms-1 truncate">{periodLabel}</span>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <div className="flex rounded-lg bg-surface-container p-0.5">
            {(["month", "week"] as const).map((v) => (
              <button
                key={v}
                onClick={() => setView(v)}
                className={`px-2.5 py-1 rounded-md text-xs font-semibold transition-colors ${
                  view === v ? "bg-surface-container-lowest text-on-surface shadow-sm" : "text-on-surface-variant"
                }`}
              >
                {v === "month" ? (isAr ? "شهر" : "Month") : isAr ? "أسبوع" : "Week"}
              </button>
            ))}
          </div>
          <button
            onClick={goToday}
            className="text-xs font-semibold px-3 py-1.5 rounded-lg border border-surface-container text-on-surface-variant hover:bg-surface-container"
          >
            {isAr ? "اليوم" : "Today"}
          </button>
        </div>
      </div>

      {/* Member filter / legend */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setFilter(null)}
          className={`px-3 py-1 rounded-full text-xs font-semibold border transition-colors ${
            filter === null
              ? "bg-on-surface text-background border-on-surface"
              : "border-surface-container-high text-on-surface-variant"
          }`}
        >
          {isAr ? "الكل" : "All"}
        </button>
        {members.map((m) => (
          <button
            key={m.id}
            onClick={() => setFilter(filter === m.id ? null : m.id)}
            className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold transition-opacity"
            style={{
              backgroundColor: `${m.color}1a`,
              color: m.color,
              opacity: filter && filter !== m.id ? 0.4 : 1,
            }}
          >
            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: m.color }} />
            {memberLabel(m, isAr)}
          </button>
        ))}
      </div>

      {view === "month" ? (
        <>
          {/* Month grid, Sunday first */}
          <div className="bg-surface-container-lowest rounded-xl border border-surface-container overflow-hidden">
            <div className="grid grid-cols-7 border-b border-surface-container">
              {weekDays.map((d) => (
                <div key={d.getDay()} className="py-2 text-center text-[10px] font-semibold uppercase tracking-wide text-outline">
                  {d.toLocaleDateString(dateLocale, { weekday: "short" })}
                </div>
              ))}
            </div>
            <div className="grid grid-cols-7">
              {monthDays.map((d, i) => {
                const key = toDateKey(d);
                const inMonth = d.getMonth() === monthFirst.getMonth();
                const isToday = key === todayKey;
                const isSelected = key === date;
                const dayEntries = entriesOn(key);
                const dayExternal = externalOn(key);
                const shown = dayEntries.slice(0, 3);
                const shownExternal = dayExternal.slice(0, Math.max(0, 3 - shown.length));
                const more = dayEntries.length + dayExternal.length - shown.length - shownExternal.length;
                return (
                  <button
                    key={key}
                    onClick={() => setDate(key)}
                    className={`min-h-[64px] md:min-h-[92px] p-1 md:p-1.5 flex flex-col items-stretch gap-0.5 text-start transition-colors ${
                      i % 7 !== 6 ? "border-e border-surface-container" : ""
                    } ${i < gridDays - 7 ? "border-b border-surface-container" : ""} ${
                      isSelected ? "bg-primary/10" : "hover:bg-surface-container"
                    } ${inMonth ? "" : "opacity-40"}`}
                  >
                    <span
                      className={`self-center md:self-start text-xs font-semibold w-6 h-6 flex items-center justify-center rounded-full ${
                        isToday ? "bg-primary text-white" : "text-on-surface"
                      }`}
                    >
                      {d.getDate()}
                    </span>
                    {shown.map((e) => {
                      const m = memberById[e.memberId];
                      const t = typeMeta[e.type];
                      return (
                        <span
                          key={e.id}
                          className={`flex items-center justify-center md:justify-start gap-0.5 rounded px-0.5 md:px-1 py-px text-[10px] font-semibold leading-tight truncate ${
                            e.done ? "opacity-40 line-through" : ""
                          }`}
                          style={{ backgroundColor: `${m.color}24`, color: m.color }}
                          title={`${isAr ? t.ar : t.en}${e.title ? ` · ${e.title}` : ""} — ${memberLabel(m, isAr)}`}
                        >
                          <span className="material-symbols-outlined text-[12px] shrink-0">{t.icon}</span>
                          <span className="hidden md:inline truncate">{memberLabel(m, isAr)}</span>
                        </span>
                      );
                    })}
                    {shownExternal.map((ev) => (
                      <span
                        key={ev.id}
                        className="flex items-center justify-center md:justify-start gap-0.5 rounded px-0.5 md:px-1 py-px text-[10px] font-semibold leading-tight truncate bg-surface-container-high text-on-surface-variant"
                        title={`${ev.title} — ${sourceLabel(ev.source, isAr)}`}
                      >
                        <span className="material-symbols-outlined text-[12px] shrink-0">{sourceIcon(ev.source)}</span>
                        <span className="hidden md:inline truncate">{ev.title}</span>
                      </span>
                    ))}
                    {more > 0 && (
                      <span className="text-[10px] font-semibold text-outline text-center md:text-start">+{more}</span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Selected day details */}
          <div className="bg-surface-container-lowest rounded-xl border border-surface-container p-3 space-y-2">
            <p className="text-xs font-semibold text-outline px-1">
              {fromDateKey(date).toLocaleDateString(dateLocale, { weekday: "long", month: "long", day: "numeric" })}
            </p>
            {externalOn(date).map((ev) => (
              <ExternalRow key={ev.id} event={ev} isAr={isAr} dateLocale={dateLocale} />
            ))}
            {selectedEntries.length === 0 && externalOn(date).length === 0 ? (
              <p className="text-sm text-outline px-1 pb-1">
                {isAr ? "لا شيء في هذا اليوم — أضيفي من الأعلى." : "Nothing on this day — add one above."}
              </p>
            ) : (
              selectedEntries.map((e) => (
                <EntryRow
                  key={e.id}
                  entry={e}
                  member={memberById[e.memberId]}
                  isAr={isAr}
                  onToggle={() => toggleEntry(e.id)}
                  onRemove={() => removeEntry(e.id)}
                />
              ))
            )}
          </div>
        </>
      ) : (
        /* Week agenda, Sunday first */
        <div className="bg-surface-container-lowest rounded-xl border border-surface-container overflow-hidden">
          {weekDays.map((d, i) => {
            const key = toDateKey(d);
            const isToday = key === todayKey;
            const dayEntries = entriesOn(key);
            const dayExternal = externalOn(key);
            return (
              <div
                key={key}
                className={`flex gap-3 px-3 py-3 ${i < 6 ? "border-b border-surface-container" : ""} ${
                  isToday ? "bg-primary/5" : ""
                }`}
              >
                <button onClick={() => setDate(key)} className="w-12 shrink-0 text-center">
                  <p className={`text-[10px] font-semibold uppercase tracking-wide ${isToday ? "text-primary" : "text-outline"}`}>
                    {d.toLocaleDateString(dateLocale, { weekday: "short" })}
                  </p>
                  <p
                    className={`font-heading text-lg font-semibold leading-tight mx-auto w-8 h-8 flex items-center justify-center rounded-full ${
                      isToday ? "bg-primary text-white" : "text-on-surface"
                    }`}
                  >
                    {d.getDate()}
                  </p>
                </button>
                <div className="flex-1 min-w-0 flex flex-col gap-1.5 justify-center">
                  {dayExternal.map((ev) => (
                    <ExternalRow key={ev.id} event={ev} isAr={isAr} dateLocale={dateLocale} />
                  ))}
                  {dayEntries.length === 0 && dayExternal.length === 0 ? (
                    <span className="text-xs text-outline-variant">—</span>
                  ) : (
                    dayEntries.map((e) => (
                      <EntryRow
                        key={e.id}
                        entry={e}
                        member={memberById[e.memberId]}
                        isAr={isAr}
                        onToggle={() => toggleEntry(e.id)}
                        onRemove={() => removeEntry(e.id)}
                      />
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {externalErrors.length > 0 && (
        <div className="text-xs text-on-error-container bg-error-container rounded-lg px-3 py-2 space-y-0.5">
          {externalErrors.map((m) => (
            <p key={m}>{m}</p>
          ))}
        </div>
      )}
    </div>
  );
}

function externalDayKeys(ev: ExternalEvent): string[] {
  const start = ev.allDay ? fromDateKey(ev.start) : new Date(ev.start);
  const lastKey = ev.allDay
    ? toDateKey(addDays(fromDateKey(ev.end), -1))
    : toDateKey(new Date(Math.max(new Date(ev.end).getTime() - 1, start.getTime())));
  const keys: string[] = [];
  let d = new Date(start.getFullYear(), start.getMonth(), start.getDate());
  while (toDateKey(d) <= lastKey && keys.length < 62) {
    keys.push(toDateKey(d));
    d = addDays(d, 1);
  }
  return keys.length ? keys : [toDateKey(start)];
}

function sourceIcon(source: ExternalEvent["source"]) {
  return source === "icloud" ? "phone_iphone" : "video_call";
}

function sourceLabel(source: ExternalEvent["source"], isAr: boolean) {
  if (source === "icloud") return isAr ? "آيفون" : "iPhone";
  return isAr ? "تيمز" : "Teams";
}

function ExternalRow({ event: ev, isAr, dateLocale }: { event: ExternalEvent; isAr: boolean; dateLocale: string }) {
  const time = ev.allDay
    ? isAr ? "طوال اليوم" : "All day"
    : new Date(ev.start).toLocaleTimeString(dateLocale, { hour: "numeric", minute: "2-digit" });
  return (
    <div className="flex items-center gap-2 rounded-lg ps-2 pe-2 py-1.5 border-s-4 border-outline-variant bg-surface-container">
      <span className="material-symbols-outlined text-[16px] shrink-0 text-on-surface-variant">{sourceIcon(ev.source)}</span>
      <span className="text-xs font-semibold text-outline shrink-0 w-14">{time}</span>
      <span className="flex-1 min-w-0 text-sm text-on-surface truncate">{ev.title}</span>
      <span className="text-[11px] font-bold text-outline shrink-0">{sourceLabel(ev.source, isAr)}</span>
    </div>
  );
}

function EntryRow({
  entry: e,
  member: m,
  isAr,
  onToggle,
  onRemove,
}: {
  entry: Entry;
  member: Member;
  isAr: boolean;
  onToggle: () => void;
  onRemove: () => void;
}) {
  const t = typeMeta[e.type];
  return (
    <div
      className="group flex items-center gap-2 rounded-lg ps-2 pe-1 py-1.5 border-s-4"
      style={{ backgroundColor: `${m.color}14`, borderColor: m.color }}
    >
      <button
        onClick={onToggle}
        aria-label={e.done ? "Mark not done" : "Mark done"}
        className="w-4 h-4 rounded border-2 flex items-center justify-center shrink-0"
        style={{ borderColor: m.color, backgroundColor: e.done ? m.color : "transparent" }}
      >
        {e.done && <span className="material-symbols-outlined text-white text-[12px]">check</span>}
      </button>
      <span className="material-symbols-outlined text-[16px] shrink-0" style={{ color: m.color }}>
        {t.icon}
      </span>
      <div className={`flex-1 min-w-0 text-sm leading-tight ${e.done ? "line-through opacity-50" : ""}`}>
        <span className="font-semibold text-on-surface">{isAr ? t.ar : t.en}</span>
        {e.title && <span className="text-on-surface-variant"> · {e.title}</span>}
      </div>
      <span className="text-[11px] font-bold shrink-0" style={{ color: m.color }}>
        {memberLabel(m, isAr)}
      </span>
      <button
        onClick={onRemove}
        aria-label="Delete"
        className="w-6 h-6 rounded flex items-center justify-center text-outline hover:text-error shrink-0 md:opacity-0 md:group-hover:opacity-100 transition-opacity"
      >
        <span className="material-symbols-outlined text-[16px]">close</span>
      </button>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <p className="text-xs font-semibold text-outline">{label}</p>
      {children}
    </div>
  );
}

function IconButton({ icon, label, onClick }: { icon: string; label: string; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      aria-label={label}
      className="w-8 h-8 rounded-lg flex items-center justify-center bg-surface-container hover:bg-surface-container-high transition-colors"
    >
      <span className="material-symbols-outlined text-primary text-[20px]">{icon}</span>
    </button>
  );
}
