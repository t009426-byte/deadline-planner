import { NextRequest, NextResponse } from "next/server";
import { createDAVClient } from "tsdav";
import { readStorage, writeStorage } from "@/app/lib/calendar-storage";

export async function POST(req: NextRequest) {
  let body: { username?: string; password?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const { username, password } = body;
  if (!username || !password) {
    return NextResponse.json(
      { error: "Username and password are required" },
      { status: 400 }
    );
  }

  try {
    const client = await createDAVClient({
      serverUrl: "https://caldav.icloud.com",
      credentials: { username, password },
      authMethod: "Basic",
      defaultAccountType: "caldav",
    });
    await client.fetchCalendars();

    const existing = readStorage();
    writeStorage({ ...existing, provider: "apple", apple: { username, password } });
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Apple CalDAV connection error:", err);
    return NextResponse.json(
      {
        error:
          "Connection failed. Check your Apple ID email and app-specific password (not your regular Apple password).",
      },
      { status: 401 }
    );
  }
}
