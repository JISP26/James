// Browser-safe Supabase client. Uses the anon key only — never the service role key.
import { createBrowserClient } from "@supabase/ssr";

export function createSupabaseBrowserClient(url: string, anonKey: string) {
  return createBrowserClient(url, anonKey);
}
