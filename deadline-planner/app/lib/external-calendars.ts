import ICAL from "ical.js";
import { createDAVClient } from "tsdav";

export type ExternalSource = "icloud" | "outlook";

export interface ExternalEvent {
  id: string;
  title: string;
  start: string; // ISO for timed events, YYYY-MM-DD for all-day
  end: string; // exclusive for all-day
  allDay: boolean;
  source: ExternalSource;
}

const MAX_OCCURRENCES = 5000;

function toItem(
  ev: ICAL.Event,
  start: ICAL.Time,
  end: ICAL.Time,
  source: ExternalSource,
  id: string
): ExternalEvent {
  const allDay = start.isDate;
  return {
    id,
    title: ev.summary || "(No title)",
    start: allDay ? start.toString() : start.toJSDate().toISOString(),
    end: allDay ? end.toString() : end.toJSDate().toISOString(),
    allDay,
    source,
  };
}

function isCancelled(ev: ICAL.Event) {
  return String(ev.component.getFirstPropertyValue("status") ?? "").toUpperCase() === "CANCELLED";
}

export function parseIcs(text: string, from: Date, to: Date, source: ExternalSource): ExternalEvent[] {
  const root = new ICAL.Component(ICAL.parse(text));
  const calendars = root.name === "vcalendar" ? [root] : root.getAllSubcomponents("vcalendar");

  const out: ExternalEvent[] = [];
  for (const cal of calendars) {
    for (const tz of cal.getAllSubcomponents("vtimezone")) {
      try {
        ICAL.TimezoneService.register(tz);
      } catch {}
    }

    const masters = new Map<string, ICAL.Event>();
    const exceptions: ICAL.Event[] = [];
    for (const v of cal.getAllSubcomponents("vevent")) {
      const ev = new ICAL.Event(v);
      if (ev.isRecurrenceException()) exceptions.push(ev);
      else masters.set(ev.uid, ev);
    }
    for (const ex of exceptions) {
      const master = masters.get(ex.uid);
      if (master) master.relateException(ex);
      else masters.set(`${ex.uid}:${ex.recurrenceId}`, ex);
    }

    for (const ev of masters.values()) {
      if (!ev.startDate) continue;
      if (!ev.isRecurring()) {
        if (isCancelled(ev)) continue;
        const end = ev.endDate ?? ev.startDate;
        if (ev.startDate.toJSDate() <= to && end.toJSDate() >= from) {
          out.push(toItem(ev, ev.startDate, end, source, ev.uid));
        }
        continue;
      }
      const it = ev.iterator();
      let next: ICAL.Time | null;
      let count = 0;
      while ((next = it.next()) && count++ < MAX_OCCURRENCES) {
        if (next.toJSDate() > to) break;
        const d = ev.getOccurrenceDetails(next);
        if (d.endDate.toJSDate() < from || isCancelled(d.item)) continue;
        out.push(toItem(d.item, d.startDate, d.endDate, source, `${ev.uid}:${d.startDate.toString()}`));
      }
    }
  }
  return out;
}

export async function testIcloud(username: string, password: string) {
  const client = await createDAVClient({
    serverUrl: "https://caldav.icloud.com",
    credentials: { username, password },
    authMethod: "Basic",
    defaultAccountType: "caldav",
  });
  await client.fetchCalendars();
}

export async function fetchIcloud(username: string, password: string, from: Date, to: Date) {
  const client = await createDAVClient({
    serverUrl: "https://caldav.icloud.com",
    credentials: { username, password },
    authMethod: "Basic",
    defaultAccountType: "caldav",
  });
  const calendars = (await client.fetchCalendars()).filter(
    (c) => !c.components || c.components.includes("VEVENT")
  );
  const results = await Promise.all(
    calendars.map((calendar) =>
      client.fetchCalendarObjects({
        calendar,
        timeRange: { start: from.toISOString(), end: to.toISOString() },
      })
    )
  );
  const events: ExternalEvent[] = [];
  for (const obj of results.flat()) {
    if (typeof obj.data !== "string") continue;
    try {
      events.push(...parseIcs(obj.data, from, to, "icloud"));
    } catch {}
  }
  return events;
}

const OUTLOOK_HOSTS = ["outlook.office365.com", "outlook.office.com", "outlook.live.com"];

export function normalizeOutlookUrl(raw: string): string | null {
  try {
    const url = new URL(raw.trim().replace(/^webcals?:\/\//i, "https://"));
    if (url.protocol !== "https:") return null;
    if (!OUTLOOK_HOSTS.includes(url.hostname.toLowerCase())) return null;
    return url.toString();
  } catch {
    return null;
  }
}

export async function fetchOutlook(rawUrl: string, from: Date, to: Date) {
  let url = normalizeOutlookUrl(rawUrl);
  for (let hop = 0; url && hop < 4; hop++) {
    const res = await fetch(url, { redirect: "manual", signal: AbortSignal.timeout(15000) });
    if (res.status >= 300 && res.status < 400) {
      const location = res.headers.get("location");
      url = location ? normalizeOutlookUrl(new URL(location, url).toString()) : null;
      continue;
    }
    if (!res.ok) throw new Error(`Outlook returned ${res.status}`);
    return parseIcs(await res.text(), from, to, "outlook");
  }
  throw new Error("Outlook link is not a published Outlook calendar");
}
