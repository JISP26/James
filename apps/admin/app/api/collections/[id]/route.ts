import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/supabase-server";

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const auth = await requireAdmin();
  if (!auth.authorized) return NextResponse.json({ error: auth.error }, { status: auth.status });

  const body = await req.json();
  const updates: Record<string, any> = {};
  const mapping: Record<string, string> = {
    name: "name",
    slug: "slug",
    description: "description",
    coverImageUrl: "cover_image_url",
    sortOrder: "sort_order",
    isVisible: "is_visible",
  };
  for (const [key, column] of Object.entries(mapping)) {
    if (key in body) updates[column] = body[key];
  }

  const { data, error } = await auth.supabase
    .from("collections")
    .update(updates)
    .eq("id", params.id)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ collection: data });
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  const auth = await requireAdmin();
  if (!auth.authorized) return NextResponse.json({ error: auth.error }, { status: auth.status });

  const { error } = await auth.supabase.from("collections").delete().eq("id", params.id);
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ ok: true });
}
