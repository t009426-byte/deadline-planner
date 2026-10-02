import { NextResponse } from "next/server";
import { readStorage } from "@/app/lib/calendar-storage";

export async function GET() {
  const storage = readStorage();
  return NextResponse.json({
    connected: storage.provider !== null,
    provider: storage.provider,
  });
}
