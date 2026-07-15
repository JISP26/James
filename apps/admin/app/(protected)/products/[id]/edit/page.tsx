import { notFound } from "next/navigation";
import { getSupabaseServerSessionClient } from "@/lib/supabase-server";
import { ProductForm, type ProductFormValues } from "@/components/ProductForm";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Edit Product" };
export const dynamic = "force-dynamic";

export default async function EditProductPage({ params }: { params: { id: string } }) {
  const supabase = getSupabaseServerSessionClient();

  const [{ data: product }, { data: collections }, { data: links }] = await Promise.all([
    supabase.from("products").select("*, images:product_images(*)").eq("id", params.id).maybeSingle(),
    supabase.from("collections").select("id, name").order("sort_order"),
    supabase.from("product_collections").select("collection_id").eq("product_id", params.id),
  ]);

  if (!product) notFound();

  const initial: ProductFormValues = {
    id: product.id,
    name: product.name,
    slug: product.slug,
    shortDescription: product.short_description ?? "",
    fullDescription: product.full_description ?? "",
    positioning: product.positioning ?? "",
    category: product.category ?? "",
    tags: product.tags ?? [],
    regularPrice: String(product.regular_price ?? ""),
    salePrice: product.sale_price != null ? String(product.sale_price) : "",
    costPrice: product.cost_price != null ? String(product.cost_price) : "",
    sku: product.sku,
    sizes: product.sizes ?? [],
    colors: product.colors ?? [],
    inventoryQuantity: String(product.inventory_quantity ?? 0),
    lowStockThreshold: String(product.low_stock_threshold ?? 5),
    material: product.material ?? "",
    careInstructions: product.care_instructions ?? "",
    sizeGuide: product.size_guide ?? "",
    shippingInformation: product.shipping_information ?? "",
    isFeatured: product.is_featured,
    isNewArrival: product.is_new_arrival,
    isLimitedEdition: product.is_limited_edition,
    isPublished: product.is_published,
    images: (product.images ?? [])
      .sort((a: any, b: any) => a.sort_order - b.sort_order)
      .map((img: any) => ({ url: img.url, isMain: img.is_main })),
    collectionIds: (links ?? []).map((l: any) => l.collection_id),
  };

  return (
    <div className="flex flex-col gap-6">
      <h1>Edit Product</h1>
      <ProductForm initial={initial} collections={collections ?? []} mode="edit" />
    </div>
  );
}
