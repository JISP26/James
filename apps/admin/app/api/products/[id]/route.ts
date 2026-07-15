import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/supabase-server";

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const auth = await requireAdmin();
  if (!auth.authorized) return NextResponse.json({ error: auth.error }, { status: auth.status });

  const { data, error } = await auth.supabase
    .from("products")
    .select("*, images:product_images(*), variants:product_variants(*), collections:product_collections(collection_id)")
    .eq("id", params.id)
    .maybeSingle();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  if (!data) return NextResponse.json({ error: "Product not found." }, { status: 404 });
  return NextResponse.json({ product: data });
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const auth = await requireAdmin();
  if (!auth.authorized) return NextResponse.json({ error: auth.error }, { status: auth.status });

  const body = await req.json();

  if (body.regularPrice != null && Number(body.regularPrice) < 0) {
    return NextResponse.json({ error: "Regular price cannot be negative." }, { status: 400 });
  }
  if (body.salePrice != null && body.regularPrice != null && Number(body.salePrice) > Number(body.regularPrice)) {
    return NextResponse.json({ error: "Sale price cannot exceed regular price." }, { status: 400 });
  }

  const updates: Record<string, any> = {};
  const mapping: Record<string, string> = {
    name: "name",
    slug: "slug",
    shortDescription: "short_description",
    fullDescription: "full_description",
    positioning: "positioning",
    category: "category",
    tags: "tags",
    regularPrice: "regular_price",
    salePrice: "sale_price",
    costPrice: "cost_price",
    sku: "sku",
    sizes: "sizes",
    colors: "colors",
    inventoryQuantity: "inventory_quantity",
    lowStockThreshold: "low_stock_threshold",
    material: "material",
    careInstructions: "care_instructions",
    sizeGuide: "size_guide",
    shippingInformation: "shipping_information",
    isFeatured: "is_featured",
    isNewArrival: "is_new_arrival",
    isLimitedEdition: "is_limited_edition",
    isPublished: "is_published",
  };
  for (const [key, column] of Object.entries(mapping)) {
    if (key in body) updates[column] = body[key];
  }

  const { data: product, error } = await auth.supabase
    .from("products")
    .update(updates)
    .eq("id", params.id)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });

  if (Array.isArray(body.images)) {
    await auth.supabase.from("product_images").delete().eq("product_id", params.id);
    if (body.images.length) {
      await auth.supabase.from("product_images").insert(
        body.images.map((img: any, idx: number) => ({
          product_id: params.id,
          url: img.url,
          sort_order: idx,
          is_main: img.isMain ?? idx === 0,
        }))
      );
    }
  }

  if (Array.isArray(body.collectionIds)) {
    await auth.supabase.from("product_collections").delete().eq("product_id", params.id);
    if (body.collectionIds.length) {
      await auth.supabase.from("product_collections").insert(
        body.collectionIds.map((cid: string) => ({ product_id: params.id, collection_id: cid }))
      );
    }
  }

  return NextResponse.json({ product });
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  const auth = await requireAdmin();
  if (!auth.authorized) return NextResponse.json({ error: auth.error }, { status: auth.status });

  const { error } = await auth.supabase.from("products").delete().eq("id", params.id);
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ ok: true });
}
