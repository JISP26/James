import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/supabase-server";

export async function POST(_req: NextRequest, { params }: { params: { id: string } }) {
  const auth = await requireAdmin();
  if (!auth.authorized) return NextResponse.json({ error: auth.error }, { status: auth.status });

  const { data: original, error } = await auth.supabase
    .from("products")
    .select("*, images:product_images(*)")
    .eq("id", params.id)
    .maybeSingle();
  if (error || !original) {
    return NextResponse.json({ error: "Product not found." }, { status: 404 });
  }

  const timestamp = Date.now();
  const { images, id, created_at, updated_at, ...rest } = original;

  const { data: copy, error: insertError } = await auth.supabase
    .from("products")
    .insert({
      ...rest,
      name: `${original.name} (Copy)`,
      slug: `${original.slug}-copy-${timestamp}`,
      sku: `${original.sku}-COPY-${timestamp}`,
      is_published: false,
    })
    .select()
    .single();

  if (insertError) return NextResponse.json({ error: insertError.message }, { status: 400 });

  if (images?.length) {
    await auth.supabase.from("product_images").insert(
      images.map((img: any) => ({
        product_id: copy.id,
        url: img.url,
        sort_order: img.sort_order,
        is_main: img.is_main,
      }))
    );
  }

  return NextResponse.json({ product: copy });
}
