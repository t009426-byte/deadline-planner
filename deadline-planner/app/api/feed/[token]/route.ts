import { anonClient } from "@/app/lib/supabase-server";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const TYPE_LABELS: Record<string, string> = {
  assignment: "Assignment",
  homework: "Homework",
  project: "Project",
  meeting: "Meeting",
  appointment: "Appointment",
  quiz: "Quiz",
  test: "Test",
  college: "College",
};

function escapeText(s: string) {
  return s.replace(/\\/g, "\\\\").replace(/;/g, "\\;").replace(/,/g, "\\,").replace(/\r?\n/g, "\\n");
}

function fold(line: string) {
  const out: string[] = [];
  while (line.length > 74) {
    out.push(line.slice(0, 74));
    line = " " + line.slice(74);
  }
  out.push(line);
  return out.join("\r\n");
}

function compactDate(isoDate: string) {
  return isoDate.replace(/-/g, "");
}

function nextDay(isoDate: string) {
  const d = new Date(`${isoDate}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + 1);
  return d.toISOString().slice(0, 10).replace(/-/g, "");
}

export async function GET(_req: Request, { params }: { params: Promise<{ token: string }> }) {
  const token = (await params).token.replace(/\.ics$/i, "");
  if (!UUID.test(token)) return new Response("Not found", { status: 404 });

  const { data, error } = await anonClient().rpc("family_feed", { token });
  if (error) return new Response("Unavailable", { status: 503 });

  const rows = data as {
    id: string;
    date: string;
    type: string;
    title: string | null;
    done: boolean;
    member_name: string;
    member_role: string;
  }[];

  const stamp = new Date().toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Family Command Hub//EN",
    "CALSCALE:GREGORIAN",
    "X-WR-CALNAME:Family Hub",
    "REFRESH-INTERVAL;VALUE=DURATION:PT1H",
    "X-PUBLISHED-TTL:PT1H",
  ];
  for (const r of rows) {
    // The subscriber is the admin, so only kids' entries need a name.
    const who = r.member_role === "admin" ? "" : r.member_name?.trim() || "Child";
    const type = TYPE_LABELS[r.type] ?? r.type;
    // Phone month views truncate hard, so lead with the most specific text.
    const summary = `${r.done ? "✓ " : ""}${r.title ? `${r.title} · ${type}` : type}${who ? ` · ${who}` : ""}`;
    lines.push(
      "BEGIN:VEVENT",
      `UID:${r.id}@family-hub`,
      `DTSTAMP:${stamp}`,
      `DTSTART;VALUE=DATE:${compactDate(r.date)}`,
      `DTEND;VALUE=DATE:${nextDay(r.date)}`,
      fold(`SUMMARY:${escapeText(summary)}`),
      fold(`DESCRIPTION:${escapeText(who ? `${type} — ${who}` : type)}`),
      "TRANSP:TRANSPARENT",
      "END:VEVENT"
    );
  }
  lines.push("END:VCALENDAR");

  return new Response(lines.join("\r\n") + "\r\n", {
    headers: {
      "Content-Type": "text/calendar; charset=utf-8",
      "Content-Disposition": 'inline; filename="family-hub.ics"',
      "Cache-Control": "no-store",
    },
  });
}
