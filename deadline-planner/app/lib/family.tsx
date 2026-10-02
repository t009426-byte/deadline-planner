"use client";

import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from "react";
import type { PostgrestError, Session } from "@supabase/supabase-js";
import { supabase } from "./supabase";

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

export interface Task {
  id: string;
  label: string;
  note?: string;
  done?: boolean;
}

interface FamilyState {
  members: Member[];
  entries: Entry[];
  tasks: Task[];
}

const LEGACY_STORAGE_KEY = "family-hub:v1";

const DEFAULT_TASKS: Omit<Task, "id">[] = [
  { label: "Study block", note: "9–11 AM" },
  { label: "Morning mindfulness", note: "10 min" },
  { label: "Work emails", note: "30 min" },
];

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

async function fetchFamily(): Promise<FamilyState> {
  const [m, e, t] = await Promise.all([
    supabase.from("members").select("id,name,color,role").order("created_at"),
    supabase.from("entries").select("id,type,date,member_id,title,done").order("created_at"),
    supabase.from("tasks").select("id,label,note,done").order("created_at"),
  ]);
  const error = m.error ?? e.error ?? t.error;
  if (error) throw error;
  return {
    members: (m.data ?? []) as Member[],
    entries: (e.data ?? []).map((r) => ({
      id: r.id,
      type: r.type as EntryType,
      date: r.date,
      memberId: r.member_id,
      title: r.title ?? undefined,
      done: r.done,
    })),
    tasks: (t.data ?? []).map((r) => ({ id: r.id, label: r.label, note: r.note ?? undefined, done: r.done })),
  };
}

function readLegacyLocal(): Partial<FamilyState> | null {
  try {
    const raw = localStorage.getItem(LEGACY_STORAGE_KEY);
    const parsed = raw ? (JSON.parse(raw) as Partial<FamilyState>) : null;
    return parsed?.members?.some((m) => m.role === "admin") ? parsed : null;
  } catch {
    return null;
  }
}

// First sign-in: import anything saved in this browser before Supabase, otherwise seed an empty family.
async function bootstrap(): Promise<{ data: FamilyState; isNew: boolean }> {
  const existing = await fetchFamily();
  if (existing.members.some((m) => m.role === "admin")) return { data: existing, isNew: false };

  const local = readLegacyLocal();
  const idMap = new Map<string, string>();
  const members = (local?.members ?? [{ id: "admin", name: "", color: PALETTE[0], role: "admin" as const }]).map(
    (m) => {
      const id = crypto.randomUUID();
      idMap.set(m.id, id);
      return { id, name: m.name, color: m.color, role: m.role };
    }
  );
  const { error } = await supabase.from("members").insert(members);
  if (error && error.code !== "23505") throw error;
  if (!error) {
    const entries = (local?.entries ?? [])
      .filter((e) => idMap.has(e.memberId))
      .map((e) => ({
        member_id: idMap.get(e.memberId)!,
        type: e.type,
        date: e.date,
        title: e.title ?? null,
        done: !!e.done,
      }));
    const tasks = (local?.tasks ?? DEFAULT_TASKS).map((t) => ({
      label: t.label,
      note: t.note ?? null,
      done: !!t.done,
    }));
    const results = await Promise.all([
      entries.length ? supabase.from("entries").insert(entries) : null,
      tasks.length ? supabase.from("tasks").insert(tasks) : null,
    ]);
    const insertError = results.find((r) => r?.error)?.error;
    if (insertError) throw insertError;
    if (local) {
      try {
        localStorage.removeItem(LEGACY_STORAGE_KEY);
      } catch {}
    }
  }
  return { data: await fetchFamily(), isNew: !local };
}

const bootstraps = new Map<string, ReturnType<typeof bootstrap>>();

function bootstrapOnce(userId: string) {
  let p = bootstraps.get(userId);
  if (!p) {
    p = bootstrap().finally(() => bootstraps.delete(userId));
    bootstraps.set(userId, p);
  }
  return p;
}

type FamilyContextValue = {
  authReady: boolean;
  session: Session | null;
  signOut: () => Promise<void>;
  ready: boolean;
  loadError: string | null;
  syncError: string | null;
  isNew: boolean;
  members: Member[];
  admin: Member;
  kids: Member[];
  entries: Entry[];
  tasks: Task[];
  updateMember: (id: string, patch: Partial<Pick<Member, "name" | "color">>) => void;
  addKid: () => void;
  removeMember: (id: string) => void;
  addEntry: (entry: Omit<Entry, "id">) => void;
  removeEntry: (id: string) => void;
  toggleEntry: (id: string) => void;
  addTask: (label: string, note?: string) => void;
  removeTask: (id: string) => void;
  toggleTask: (id: string) => void;
  calendarsVersion: number;
  refreshCalendars: () => void;
};

const PLACEHOLDER_ADMIN: Member = { id: "", name: "", color: PALETTE[0], role: "admin" };

const FamilyContext = createContext<FamilyContextValue | null>(null);

export function FamilyProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [authReady, setAuthReady] = useState(false);
  const [loaded, setLoaded] = useState<{ userId: string; data: FamilyState; isNew: boolean } | null>(null);
  const [loadError, setLoadError] = useState<{ userId: string; message: string } | null>(null);
  const [syncError, setSyncError] = useState<string | null>(null);
  const [calendarsVersion, setCalendarsVersion] = useState(0);
  const nameTimers = useRef(new Map<string, ReturnType<typeof setTimeout>>());

  useEffect(() => {
    const { data } = supabase.auth.onAuthStateChange((_event, s) => {
      setSession(s);
      setAuthReady(true);
    });
    return () => data.subscription.unsubscribe();
  }, []);

  const userId = session?.user.id;

  useEffect(() => {
    if (!userId) return;
    let cancelled = false;
    bootstrapOnce(userId)
      .then((r) => !cancelled && setLoaded({ userId, ...r }))
      .catch((err: PostgrestError | Error) => !cancelled && setLoadError({ userId, message: err.message }));
    return () => {
      cancelled = true;
    };
  }, [userId]);

  const current = loaded && loaded.userId === userId ? loaded : null;
  const data = current?.data ?? null;

  function apply(fn: (s: FamilyState) => FamilyState) {
    setLoaded((l) => (l ? { ...l, data: fn(l.data) } : l));
  }

  function remote(op: PromiseLike<{ error: PostgrestError | null }>) {
    Promise.resolve(op).then(({ error }) => {
      if (!error) return;
      setSyncError(error.message);
      fetchFamily()
        .then((fresh) => setLoaded((l) => (l && l.userId === userId ? { ...l, data: fresh } : l)))
        .catch(() => {});
    });
  }

  const members = data?.members ?? [];
  const admin = members.find((m) => m.role === "admin") ?? PLACEHOLDER_ADMIN;

  const value: FamilyContextValue = {
    authReady,
    session,
    signOut: async () => {
      await supabase.auth.signOut();
    },
    ready: !!data,
    loadError: loadError && loadError.userId === userId ? loadError.message : null,
    syncError,
    isNew: !!current?.isNew,
    members,
    admin,
    kids: members.filter((m) => m.role === "kid"),
    entries: data?.entries ?? [],
    tasks: data?.tasks ?? [],

    updateMember: (id, patch) => {
      apply((s) => ({ ...s, members: s.members.map((m) => (m.id === id ? { ...m, ...patch } : m)) }));
      if (patch.color) remote(supabase.from("members").update({ color: patch.color }).eq("id", id));
      if (patch.name !== undefined) {
        const timers = nameTimers.current;
        clearTimeout(timers.get(id));
        timers.set(
          id,
          setTimeout(() => remote(supabase.from("members").update({ name: patch.name }).eq("id", id)), 400)
        );
      }
    },
    addKid: () => {
      const used = new Set(members.map((m) => m.color));
      const kid: Member = {
        id: crypto.randomUUID(),
        name: "",
        color: PALETTE.find((c) => !used.has(c)) ?? PALETTE[members.length % PALETTE.length],
        role: "kid",
      };
      apply((s) => ({ ...s, members: [...s.members, kid] }));
      remote(supabase.from("members").insert(kid));
    },
    removeMember: (id) => {
      apply((s) => ({
        ...s,
        members: s.members.filter((m) => m.id !== id || m.role === "admin"),
        entries: s.entries.filter((e) => e.memberId !== id),
      }));
      remote(supabase.from("members").delete().eq("id", id).eq("role", "kid"));
    },

    addEntry: (entry) => {
      const id = crypto.randomUUID();
      apply((s) => ({ ...s, entries: [...s.entries, { ...entry, id }] }));
      remote(
        supabase.from("entries").insert({
          id,
          member_id: entry.memberId,
          type: entry.type,
          date: entry.date,
          title: entry.title ?? null,
          done: !!entry.done,
        })
      );
    },
    removeEntry: (id) => {
      apply((s) => ({ ...s, entries: s.entries.filter((e) => e.id !== id) }));
      remote(supabase.from("entries").delete().eq("id", id));
    },
    toggleEntry: (id) => {
      const done = !data?.entries.find((e) => e.id === id)?.done;
      apply((s) => ({ ...s, entries: s.entries.map((e) => (e.id === id ? { ...e, done } : e)) }));
      remote(supabase.from("entries").update({ done }).eq("id", id));
    },

    addTask: (label, note) => {
      const id = crypto.randomUUID();
      apply((s) => ({ ...s, tasks: [...s.tasks, { id, label, note }] }));
      remote(supabase.from("tasks").insert({ id, label, note: note ?? null }));
    },
    removeTask: (id) => {
      apply((s) => ({ ...s, tasks: s.tasks.filter((t) => t.id !== id) }));
      remote(supabase.from("tasks").delete().eq("id", id));
    },
    toggleTask: (id) => {
      const done = !data?.tasks.find((t) => t.id === id)?.done;
      apply((s) => ({ ...s, tasks: s.tasks.map((t) => (t.id === id ? { ...t, done } : t)) }));
      remote(supabase.from("tasks").update({ done }).eq("id", id));
    },

    calendarsVersion,
    refreshCalendars: () => setCalendarsVersion((v) => v + 1),
  };

  return <FamilyContext.Provider value={value}>{children}</FamilyContext.Provider>;
}

export function useFamily() {
  const ctx = useContext(FamilyContext);
  if (!ctx) throw new Error("useFamily must be used within a FamilyProvider");
  return ctx;
}
