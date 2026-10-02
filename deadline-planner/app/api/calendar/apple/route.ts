import { NextResponse } from "next/server";
import { userFromRequest } from "@/app/lib/supabase-server";
import { testIcloud } from "@/app/lib/external-calendars";

export async function POST(req: Request) {
  const auth = await userFromRequest(req);
  if (!auth) return NextResponse.json({ error: "Not signed in" }, { status: 401 });

  const { username, password } = await req.json().catch(() => ({}));
  if (typeof username !== "string" || typeof password !== "string" || !username || !password) {
    return NextResponse.json({ error: "Apple ID and app-specific password are required" }, { status: 400 });
  }

  try {
    await testIcloud(username.trim(), password.trim());
  } catch {
    return NextResponse.json(
      { error: "iCloud rejected these details. Use an app-specific password, not your Apple ID password." },
      { status: 401 }
    );
  }

  const { error } = await auth.client.from("calendar_connections").upsert({
    user_id: auth.user.id,
    apple_username: username.trim(),
    apple_password: password.trim(),
    updated_at: new Date().toISOString(),
  });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
