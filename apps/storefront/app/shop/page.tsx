import { Suspense } from "react";
import { getSupabaseServerReadClient } from "@/lib/supabase";
import { fetchPublishedProducts, fetchCollections } from "@jisp/database";
import { ProductGrid } from "@/components/ProductGrid";
import { ShopFilters } from "@/components/ShopFilters";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Shop" };
export const revalidate = 30;

export default async function ShopPage({
  searchParams,
}: {
  searchParams: Record<string, string | undefined>;
}) {
  const supabase = getSupabaseServerReadClient();

  const [{ products, total }, collections] = await Promise.all([
    fetchPublishedProducts(supabase, {
      category: searchParams.category,
      collectionSlug: searchParams.collection,
      minPrice: searchParams.minPrice ? Number(searchParams.minPrice) : undefined,
      maxPrice: searchParams.maxPrice ? Number(searchParams.maxPrice) : undefined,
      size: searchParams.size,
      color: searchParams.color,
      inStockOnly: searchParams.inStock === "1",
      sort: (searchParams.sort as any) || "newest",
      pageSize: 48,
    }),
    fetchCollections(supabase),
  ]);

  return (
    <div className="mx-auto max-w-7xl px-4 md:px-8 py-12">
      <div className="mb-8">
        <h1>Shop</h1>
        <p className="text-sm text-jisp-grey mt-2">{total} products</p>
      </div>
      <Suspense fallback={null}>
        <ShopFilters collections={collections as any} />
      </Suspense>
      <ProductGrid products={products as any} />
    </div>
  );
}
