"use client";

import { createContext, useContext, useSyncExternalStore, type ReactNode } from "react";

export type EntryType =
  | "assignment"
  | "homework"
  | "project"
  | "meeting"
  | "appointment"
  | "quiz"
  | "test";

export const ENTRY_TYPES: { id: EntryType; icon: string; en: string; ar: string }[] = [
  { id: "assignment", icon: "assignment", en: "Assignment", ar: "تكليف" },
  { id: "homework", icon: "menu_book", en: "Homework", ar: "واجب منزلي" },
  { id: "project", icon: "lightbulb", en: "Project", ar: "مشروع" },
  { id: "meeting", icon: "groups", en: "Meeting", ar: "اجتماع" },
  { id: "appointment", icon: "event_available", en: "Appointment", ar: "موعد" },
  { id: "quiz", icon: "quiz", en: "Quiz", ar: "اختبار قصير" },
  { id: "test", icon: "fact_check", en: "Test", ar: "امتحان" },
];

export const PALETTE = [
  "#005764",
  "#c2410c",
  "#7c3aed",
  "#15803d",
  "#db2777",
  "#2563eb",
  "#b45309",
  "#b91c1c",
];

export interface Member {
  id: string;
  name: string;
  color: string;
  role: "admin" | "kid";
}

export interface Entry {
  id: string;
  type: EntryType;
  date: string; // YYYY-MM-DD, local
  memberId: string;
  title?: string;
  done?: boolean;
}

interface FamilyState {
  members: Member[];
  entries: Entry[];
}

const STORAGE_KEY = "family-hub:v1";

const DEFAULT_STATE: FamilyState = {
  members: [{ id: "admin", name: "", color: PALETTE[0], role: "admin" }],
  entries: [],
};

export function toDateKey(d: Date) {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

export function fromDateKey(key: string) {
  const [y, m, d] = key.split("-").map(Number);
  return new Date(y, m - 1, d);
}

export function memberLabel(m: Member, isAr: boolean) {
  if (m.name.trim()) return m.name.trim();
  if (m.role === "admin") return isAr ? "أمي" : "Mom";
  return isAr ? "طفل" : "Child";
}

let current: FamilyState | null = null;
let isNew = false;
const listeners = new Set<() => void>();
const SERVER_STATE: FamilyState = DEFAULT_STATE;

function load(): FamilyState {
  if (current) return current;
  current = { ...DEFAULT_STATE };
  isNew = true;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as FamilyState;
      if (Array.isArray(parsed.members) && parsed.members.some((m) => m.role === "admin")) {
        current = { members: parsed.members, entries: parsed.entries ?? [] };
        isNew = false;
      }
    }
  } catch {}
  return current;
}

function update(fn: (s: FamilyState) => FamilyState) {
  current = fn(load());
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(current));
  } catch {}
  listeners.forEach((l) => l());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

type FamilyContextValue = {
  ready: boolean;
  isNew: boolean;
  members: Member[];
  admin: Member;
  kids: Member[];
  entries: Entry[];
  updateMember: (id: string, patch: Partial<Pick<Member, "name" | "color">>) => void;
  addKid: () => void;
  removeMember: (id: string) => void;
  addEntry: (entry: Omit<Entry, "id">) => void;
  removeEntry: (id: string) => void;
  toggleEntry: (id: string) => void;
};

const FamilyContext = createContext<FamilyContextValue | null>(null);

export function FamilyProvider({ children }: { children: ReactNode }) {
  const state = useSyncExternalStore(subscribe, load, () => SERVER_STATE);
  const ready = state !== SERVER_STATE;
  const setState = update;

  const admin = state.members.find((m) => m.role === "admin")!;
  const kids = state.members.filter((m) => m.role === "kid");

  const value: FamilyContextValue = {
    ready,
    isNew: ready && isNew,
    members: state.members,
    admin,
    kids,
    entries: state.entries,
    updateMember: (id, patch) =>
      setState((s) => ({
        ...s,
        members: s.members.map((m) => (m.id === id ? { ...m, ...patch } : m)),
      })),
    addKid: () =>
      setState((s) => {
        const used = new Set(s.members.map((m) => m.color));
        const color = PALETTE.find((c) => !used.has(c)) ?? PALETTE[s.members.length % PALETTE.length];
        return {
          ...s,
          members: [...s.members, { id: crypto.randomUUID(), name: "", color, role: "kid" }],
        };
      }),
    removeMember: (id) =>
      setState((s) => ({
        members: s.members.filter((m) => m.id !== id || m.role === "admin"),
        entries: s.entries.filter((e) => e.memberId !== id),
      })),
    addEntry: (entry) =>
      setState((s) => ({ ...s, entries: [...s.entries, { ...entry, id: crypto.randomUUID() }] })),
    removeEntry: (id) => setState((s) => ({ ...s, entries: s.entries.filter((e) => e.id !== id) })),
    toggleEntry: (id) =>
      setState((s) => ({
        ...s,
        entries: s.entries.map((e) => (e.id === id ? { ...e, done: !e.done } : e)),
      })),
  };

  return <FamilyContext.Provider value={value}>{children}</FamilyContext.Provider>;
}

export function useFamily() {
  const ctx = useContext(FamilyContext);
  if (!ctx) throw new Error("useFamily must be used within a FamilyProvider");
  return ctx;
}
