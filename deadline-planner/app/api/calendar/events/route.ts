import { NextResponse } from "next/server";
import { google } from "googleapis";
import { createDAVClient } from "tsdav";
import ICAL from "ical.js";
import { readStorage, writeStorage } from "@/app/lib/calendar-storage";

export interface CalendarEvent {
  id: string;
  title: string;
  start: string;
  end: string;
  calendarId: string;
  calendarName: string;
  color: string;
}

export interface CalendarMember {
  id: string;
  name: string;
  color: string;
}

const MEMBER_COLORS = ["#005764", "#8e4e14", "#8e2e15", "#1f6775"];

function getWeekBounds() {
  const now = new Date();
  const day = now.getDay();
  const monday = new Date(now);
  monday.setDate(now.getDate() - (day === 0 ? 6 : day - 1));
  monday.setHours(0, 0, 0, 0);
  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);
  sunday.setHours(23, 59, 59, 999);
  return { weekStart: monday, weekEnd: sunday };
}

async function fetchGoogleEvents(weekStart: Date, weekEnd: Date) {
  const storage = readStorage();
  if (!storage.google?.access_token) throw new Error("No Google tokens stored");

  const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_REDIRECT_URI
  );
  oauth2Client.setCredentials(storage.google);

  oauth2Client.on("tokens", (tokens) => {
    const current = readStorage();
    writeStorage({
      ...current,
      google: {
        ...current.google!,
        ...(tokens.access_token ? { access_token: tokens.access_token } : {}),
        ...(tokens.refresh_token ? { refresh_token: tokens.refresh_token } : {}),
        ...(tokens.expiry_date != null ? { expiry_date: tokens.expiry_date } : {}),
      },
    });
  });

  const cal = google.calendar({ version: "v3", auth: oauth2Client });
  const listRes = await cal.calendarList.list();
  const calItems = (listRes.data.items ?? [])
    .filter((c) => c.selected !== false)
    .slice(0, 4);

  const members: CalendarMember[] = calItems.map((item, i) => ({
    id: item.id!,
    name: item.summary ?? `Calendar ${i + 1}`,
    color: MEMBER_COLORS[i],
  }));

  const events: CalendarEvent[] = [];
  for (const member of members) {
    const res = await cal.events.list({
      calendarId: member.id,
      timeMin: weekStart.toISOString(),
      timeMax: weekEnd.toISOString(),
      singleEvents: true,
      orderBy: "startTime",
      maxResults: 50,
    });
    (res.data.items ?? []).forEach((ev) => {
      events.push({
        id: ev.id!,
        title: ev.summary ?? "(No title)",
        start: (ev.start?.dateTime ?? ev.start?.date)!,
        end: (ev.end?.dateTime ?? ev.end?.date)!,
        calendarId: member.id,
        calendarName: member.name,
        color: member.color,
      });
    });
  }

  return { members, events };
}

async function fetchAppleEvents(weekStart: Date, weekEnd: Date) {
  const storage = readStorage();
  if (!storage.apple) throw new Error("No Apple credentials stored");

  const client = await createDAVClient({
    serverUrl: "https://caldav.icloud.com",
    credentials: storage.apple,
    authMethod: "Basic",
    defaultAccountType: "caldav",
  });

  const calendars = await client.fetchCalendars();
  const topCals = calendars.slice(0, 4);

  const members: CalendarMember[] = topCals.map((cal, i) => ({
    id: cal.url,
    name: typeof cal.displayName === "string" ? cal.displayName : `Calendar ${i + 1}`,
    color: MEMBER_COLORS[i],
  }));

  const events: CalendarEvent[] = [];

  for (let i = 0; i < topCals.length; i++) {
    const member = members[i];
    const objects = await client.fetchCalendarObjects({
      calendar: topCals[i],
      timeRange: {
        start: weekStart.toISOString(),
        end: weekEnd.toISOString(),
      },
    });

    for (const obj of objects) {
      if (!obj.data) continue;
      try {
        const jcal = ICAL.parse(obj.data as string);
        const comp = new ICAL.Component(jcal);
        comp.getAllSubcomponents("vevent").forEach((vevent: ICAL.Component) => {
          const ev = new ICAL.Event(vevent);
          events.push({
            id: ev.uid,
            title: ev.summary ?? "(No title)",
            start: ev.startDate.toJSDate().toISOString(),
            end: ev.endDate.toJSDate().toISOString(),
            calendarId: member.id,
            calendarName: member.name,
            color: member.color,
          });
        });
      } catch {
        // skip malformed iCal entries
      }
    }
  }

  return { members, events };
}

export async function GET() {
  const storage = readStorage();
  if (!storage.provider) {
    return NextResponse.json({ connected: false, members: [], events: [] });
  }

  try {
    const { weekStart, weekEnd } = getWeekBounds();
    const result =
      storage.provider === "google"
        ? await fetchGoogleEvents(weekStart, weekEnd)
        : await fetchAppleEvents(weekStart, weekEnd);

    return NextResponse.json({
      connected: true,
      provider: storage.provider,
      ...result,
    });
  } catch (err) {
    console.error("Calendar events error:", err);
    return NextResponse.json({
      connected: true,
      provider: storage.provider,
      members: [],
      events: [],
      error: "Failed to fetch events — check your credentials or re-connect.",
    });
  }
}
