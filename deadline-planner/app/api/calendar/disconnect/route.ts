import { NextResponse } from "next/server";
import { writeStorage } from "@/app/lib/calendar-storage";

export async function DELETE() {
  writeStorage({ provider: null });
  return NextResponse.json({ success: true });
}
