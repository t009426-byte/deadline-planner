import { NextResponse } from "next/server";
import { userFromRequest } from "@/app/lib/supabase-server";
import { fetchOutlook, normalizeOutlookUrl } from "@/app/lib/external-calendars";

export async function POST(req: Request) {
  const auth = await userFromRequest(req);
  if (!auth) return NextResponse.json({ error: "Not signed in" }, { status: 401 });

  const { url } = await req.json().catch(() => ({}));
  const normalized = typeof url === "string" ? normalizeOutlookUrl(url) : null;
  if (!normalized) {
    return NextResponse.json(
      { error: "Paste the ICS link from Outlook → Settings → Calendar → Shared calendars → Publish a calendar." },
      { status: 400 }
    );
  }

  try {
    const now = new Date();
    await fetchOutlook(normalized, now, new Date(now.getTime() + 86400000));
  } catch {
    return NextResponse.json({ error: "Couldn't read that Outlook calendar link." }, { status: 400 });
  }

  const { error } = await auth.client.from("calendar_connections").upsert({
    user_id: auth.user.id,
    outlook_ics_url: normalized,
    updated_at: new Date().toISOString(),
  });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
