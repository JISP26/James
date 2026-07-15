import "server-only";
import { cookies } from "next/headers";
import { createSupabaseServerClient, createSupabaseServiceRoleClient } from "@jisp/database";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// Session-aware server client — used in Server Components / middleware to
// check "is this visitor a logged-in admin".
export function getSupabaseServerSessionClient() {
  const cookieStore = cookies();
  return createSupabaseServerClient(url, anonKey, cookieStore as any);
}

// SERVICE ROLE — only for app/api/**/route.ts privileged writes (product,
// collection, order, settings management, image upload signing). Never
// import this into a client component.
export function getSupabaseServiceRoleClient() {
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
  return createSupabaseServiceRoleClient(url, serviceRoleKey);
}

// Every app/api/**/route.ts handler that performs a privileged write MUST
// call this first. Middleware already blocks unauthenticated *page* loads,
// but Route Handlers are matched out of the middleware matcher (see
// middleware.ts), so API routes re-check the session + admin_users row
// themselves — defense in depth against a stolen/forged request.
export async function requireAdmin() {
  const sessionClient = getSupabaseServerSessionClient();
  const {
    data: { user },
  } = await sessionClient.auth.getUser();

  if (!user) {
    return { authorized: false as const, status: 401, error: "Not authenticated." };
  }

  const serviceClient = getSupabaseServiceRoleClient();
  const { data: adminRow } = await serviceClient
    .from("admin_users")
    .select("id")
    .eq("id", user.id)
    .maybeSingle();

  if (!adminRow) {
    return { authorized: false as const, status: 403, error: "Not authorized." };
  }

  return { authorized: true as const, userId: user.id, supabase: serviceClient };
}
