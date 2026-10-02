import { NextRequest, NextResponse } from "next/server";
import { google } from "googleapis";
import { readStorage, writeStorage } from "@/app/lib/calendar-storage";

export async function GET(req: NextRequest) {
  const code = req.nextUrl.searchParams.get("code");
  const error = req.nextUrl.searchParams.get("error");

  if (error || !code) {
    return NextResponse.redirect(new URL("/?calendar=error", req.url));
  }

  try {
    const oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      process.env.GOOGLE_REDIRECT_URI ??
        `${req.nextUrl.origin}/api/calendar/callback`
    );

    const { tokens } = await oauth2Client.getToken(code);
    const existing = readStorage();
    writeStorage({
      ...existing,
      provider: "google",
      google: {
        access_token: tokens.access_token!,
        refresh_token: tokens.refresh_token ?? existing.google?.refresh_token,
        expiry_date: tokens.expiry_date ?? undefined,
      },
    });

    return NextResponse.redirect(new URL("/?calendar=connected", req.url));
  } catch (err) {
    console.error("Google OAuth callback error:", err);
    return NextResponse.redirect(new URL("/?calendar=error", req.url));
  }
}
