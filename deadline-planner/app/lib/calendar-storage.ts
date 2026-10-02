import fs from "fs";
import path from "path";

const STORAGE_PATH = path.join(process.cwd(), "data", "calendar.json");

export interface GoogleTokens {
  access_token: string;
  refresh_token?: string;
  expiry_date?: number;
}

export interface AppleCredentials {
  username: string;
  password: string;
}

export interface CalendarStorage {
  provider: "google" | "apple" | null;
  google?: GoogleTokens;
  apple?: AppleCredentials;
}

export function readStorage(): CalendarStorage {
  try {
    if (fs.existsSync(STORAGE_PATH)) {
      return JSON.parse(fs.readFileSync(STORAGE_PATH, "utf-8")) as CalendarStorage;
    }
  } catch {}
  return { provider: null };
}

export function writeStorage(data: CalendarStorage): void {
  const dir = path.dirname(STORAGE_PATH);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(STORAGE_PATH, JSON.stringify(data, null, 2));
}
