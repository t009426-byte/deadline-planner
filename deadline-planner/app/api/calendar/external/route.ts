import { NextResponse } from "next/server";
import { userFromRequest } from "@/app/lib/supabase-server";
import { fetchIcloud, fetchOutlook, type ExternalEvent } from "@/app/lib/external-calendars";

const DAY = /^\d{4}-\d{2}-\d{2}$/;

export async function GET(req: Request) {
  const auth = await userFromRequest(req);
  if (!auth) return NextResponse.json({ error: "Not signed in" }, { status: 401 });

  const params = new URL(req.url).searchParams;
  const fromKey = params.get("from") ?? "";
  const toKey = params.get("to") ?? "";
  if (!DAY.test(fromKey) || !DAY.test(toKey)) {
    return NextResponse.json({ error: "from and to must be YYYY-MM-DD" }, { status: 400 });
  }
  // Pad a day each side so time zones never clip events at the edges of the range.
  const from = new Date(`${fromKey}T00:00:00Z`);
  from.setUTCDate(from.getUTCDate() - 1);
  const to = new Date(`${toKey}T23:59:59Z`);
  to.setUTCDate(to.getUTCDate() + 1);

  const { data, error } = await auth.client.rpc("get_my_calendar_credentials");
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  const creds = (data as { apple_username: string | null; apple_password: string | null; outlook_ics_url: string | null }[])[0];

  const events: ExternalEvent[] = [];
  const errors: Partial<Record<"icloud" | "outlook", string>> = {};

  await Promise.all([
    creds?.apple_username && creds.apple_password
      ? fetchIcloud(creds.apple_username, creds.apple_password, from, to)
          .then((e) => events.push(...e))
          .catch(() => (errors.icloud = "Couldn't load iCloud events. Reconnect your iPhone calendar."))
      : null,
    creds?.outlook_ics_url
      ? fetchOutlook(creds.outlook_ics_url, from, to)
          .then((e) => events.push(...e))
          .catch(() => (errors.outlook = "Couldn't load Teams/Outlook events. Check the published link."))
      : null,
  ]);

  return NextResponse.json({ events, errors });
}
