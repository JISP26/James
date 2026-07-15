import "server-only";
import { createSupabaseServiceRoleClient } from "@jisp/database";

// SERVICE ROLE — only for trusted server-side code: app/api/**/route.ts
// (checkout price/stock validation + order writes) and the order-success
// Server Component (guests can't SELECT orders under RLS, so that page
// looks the order up with elevated access instead). The `server-only`
// import above makes Next.js fail the build if this module is ever pulled
// into a client bundle.
export function getSupabaseServiceRoleClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
  return createSupabaseServiceRoleClient(url, serviceRoleKey);
}
