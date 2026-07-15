import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/supabase-server";

function slugify(input: string) {
  return input.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

export async function GET() {
  const auth = await requireAdmin();
  if (!auth.authorized) return NextResponse.json({ error: auth.error }, { status: auth.status });

  const { data, error } = await auth.supabase
    .from("collections")
    .select("*")
    .order("sort_order", { ascending: true });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ collections: data });
}

export async function POST(req: NextRequest) {
  const auth = await requireAdmin();
  if (!auth.authorized) return NextResponse.json({ error: auth.error }, { status: auth.status });

  const body = await req.json();
  if (!body.name?.trim()) {
    return NextResponse.json({ error: "Collection name is required." }, { status: 400 });
  }
  const slug = body.slug?.trim() ? slugify(body.slug) : slugify(body.name);

  const { data, error } = await auth.supabase
    .from("collections")
    .insert({
      name: body.name,
      slug,
      description: body.description ?? null,
      cover_image_url: body.coverImageUrl ?? null,
      sort_order: body.sortOrder ?? 0,
      is_visible: body.isVisible ?? true,
    })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ collection: data });
}
