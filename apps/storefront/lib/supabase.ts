import { createSupabaseBrowserClient } from "@jisp/database";
import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// Client-side singleton (anon key only, safe for the browser).
export function getSupabaseBrowserClient() {
  return createSupabaseBrowserClient(url, anonKey);
}

// Read-only server-side client for Server Components (anon key, subject to RLS —
// storefront visitors can only read published products/collections).
export function getSupabaseServerReadClient() {
  return createClient(url, anonKey, {
    auth: { persistSession: false },
  });
}
