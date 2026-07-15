import type { SupabaseClient } from "@supabase/supabase-js";

export async function fetchSiteSettings(supabase: SupabaseClient) {
  const { data, error } = await supabase
    .from("site_settings")
    .select("*")
    .order("updated_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (error) throw error;
  return data;
}
