import { createClient, type SupabaseClient, type User } from "@supabase/supabase-js";
import { SUPABASE_KEY as KEY, SUPABASE_URL as URL } from "./supabase-config";
const serverAuth = { persistSession: false, autoRefreshToken: false };

export function anonClient() {
  return createClient(URL, KEY, { auth: serverAuth });
}

export async function userFromRequest(
  req: Request
): Promise<{ client: SupabaseClient; user: User } | null> {
  const token = req.headers.get("authorization")?.replace(/^Bearer\s+/i, "");
  if (!token) return null;
  const client = createClient(URL, KEY, {
    auth: serverAuth,
    global: { headers: { Authorization: `Bearer ${token}` } },
  });
  const { data, error } = await client.auth.getUser(token);
  if (error || !data.user) return null;
  return { client, user: data.user };
}
