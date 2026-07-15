import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/supabase-server";

export async function GET(req: NextRequest) {
  const auth = await requireAdmin();
  if (!auth.authorized) return NextResponse.json({ error: auth.error }, { status: auth.status });

  const { searchParams } = new URL(req.url);
  const search = searchParams.get("search");
  const status = searchParams.get("status");

  let query = auth.supabase.from("orders").select("*").order("created_at", { ascending: false });
  if (search) {
    query = query.or(`order_number.ilike.%${search}%,customer_name.ilike.%${search}%,customer_phone.ilike.%${search}%`);
  }
  if (status) query = query.eq("status", status);

  const { data, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ orders: data });
}
