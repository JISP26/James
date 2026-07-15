import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/supabase-server";

function slugify(input: string) {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export async function GET(req: NextRequest) {
  const auth = await requireAdmin();
  if (!auth.authorized) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }
  const { searchParams } = new URL(req.url);
  const search = searchParams.get("search");
  const category = searchParams.get("category");
  const status = searchParams.get("status"); // published | draft
  const stock = searchParams.get("stock"); // in-stock | low-stock | out-of-stock

  let query = auth.supabase
    .from("products")
    .select("*, images:product_images(*), variants:product_variants(*)")
    .order("created_at", { ascending: false });

  if (search) query = query.ilike("name", `%${search}%`);
  if (category) query = query.eq("category", category);
  if (status === "published") query = query.eq("is_published", true);
  if (status === "draft") query = query.eq("is_published", false);
  if (stock === "out-of-stock") query = query.eq("inventory_quantity", 0);
  if (stock === "in-stock") query = query.gt("inventory_quantity", 0);

  const { data, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  let rows = data ?? [];
  if (stock === "low-stock") {
    rows = rows.filter((p: any) => p.inventory_quantity > 0 && p.inventory_quantity <= p.low_stock_threshold);
  }

  return NextResponse.json({ products: rows });
}

export async function POST(req: NextRequest) {
  const auth = await requireAdmin();
  if (!auth.authorized) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }
  const body = await req.json();

  if (!body.name?.trim()) {
    return NextResponse.json({ error: "Product name is required." }, { status: 400 });
  }
  if (!body.sku?.trim()) {
    return NextResponse.json({ error: "SKU is required." }, { status: 400 });
  }
  if (typeof body.regularPrice !== "number" || body.regularPrice < 0) {
    return NextResponse.json({ error: "Regular price must be a valid non-negative number." }, { status: 400 });
  }
  if (body.salePrice != null && Number(body.salePrice) > Number(body.regularPrice)) {
    return NextResponse.json({ error: "Sale price cannot exceed regular price." }, { status: 400 });
  }

  const slug = body.slug?.trim() ? slugify(body.slug) : slugify(body.name);

  const { data: product, error } = await auth.supabase
    .from("products")
    .insert({
      name: body.name,
      slug,
      short_description: body.shortDescription ?? null,
      full_description: body.fullDescription ?? null,
      positioning: body.positioning ?? null,
      category: body.category ?? null,
      tags: body.tags ?? [],
      regular_price: body.regularPrice,
      sale_price: body.salePrice ?? null,
      cost_price: body.costPrice ?? null,
      sku: body.sku,
      sizes: body.sizes ?? [],
      colors: body.colors ?? [],
      inventory_quantity: body.inventoryQuantity ?? 0,
      low_stock_threshold: body.lowStockThreshold ?? 5,
      material: body.material ?? null,
      care_instructions: body.careInstructions ?? null,
      size_guide: body.sizeGuide ?? null,
      shipping_information: body.shippingInformation ?? null,
      is_featured: !!body.isFeatured,
      is_new_arrival: !!body.isNewArrival,
      is_limited_edition: !!body.isLimitedEdition,
      is_published: !!body.isPublished,
    })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });

  if (Array.isArray(body.images) && body.images.length) {
    await auth.supabase.from("product_images").insert(
      body.images.map((img: any, idx: number) => ({
        product_id: product.id,
        url: img.url,
        sort_order: idx,
        is_main: img.isMain ?? idx === 0,
      }))
    );
  }

  if (Array.isArray(body.collectionIds) && body.collectionIds.length) {
    await auth.supabase.from("product_collections").insert(
      body.collectionIds.map((cid: string) => ({ product_id: product.id, collection_id: cid }))
    );
  }

  return NextResponse.json({ product });
}
