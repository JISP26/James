// Server-only Supabase helpers. The service-role client must NEVER be imported
// into any client component or bundled into the browser. Only use inside
// Route Handlers / Server Components / Server Actions.
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { createServerClient, type CookieOptions } from "@supabase/ssr";

export function createSupabaseServiceRoleClient(
  url: string,
  serviceRoleKey: string
): SupabaseClient {
  return createClient(url, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

// For SSR pages that need the logged-in admin's session (cookie based).
export function createSupabaseServerClient(
  url: string,
  anonKey: string,
  cookieStore: {
    get(name: string): { value: string } | undefined;
    set(name: string, value: string, options: CookieOptions): void;
  }
) {
  return createServerClient(url, anonKey, {
    cookies: {
      get(name: string) {
        return cookieStore.get(name)?.value;
      },
      set(name: string, value: string, options: CookieOptions) {
        cookieStore.set(name, value, options);
      },
      remove(name: string, options: CookieOptions) {
        cookieStore.set(name, "", { ...options, maxAge: 0 });
      },
    },
  });
}
