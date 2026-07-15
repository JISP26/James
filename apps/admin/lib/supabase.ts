import { createSupabaseBrowserClient } from "@jisp/database";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// Browser client used for Supabase Auth (login/logout) and session-bound reads.
export function getSupabaseBrowserClient() {
  return createSupabaseBrowserClient(url, anonKey);
}
