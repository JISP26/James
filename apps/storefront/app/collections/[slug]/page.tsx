import { Suspense } from "react";
import { notFound } from "next/navigation";
import { getSupabaseServerReadClient } from "@/lib/supabase";
import { fetchCollectionBySlug, fetchPublishedProducts } from "@jisp/database";
import { ProductGrid } from "@/components/ProductGrid";
import { ShopFilters } from "@/components/ShopFilters";
import type { Metadata } from "next";

export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Promise<Metadata> {
  const supabase = getSupabaseServerReadClient();
  const collection = await fetchCollectionBySlug(supabase, params.slug);
  return { title: collection?.name || "Collection" };
}

export default async function CollectionDetailPage({
  params,
  searchParams,
}: {
  params: { slug: string };
  searchParams: Record<string, string | undefined>;
}) {
  const supabase = getSupabaseServerReadClient();
  const collection = await fetchCollectionBySlug(supabase, params.slug);
  if (!collection) notFound();

  const { products, total } = await fetchPublishedProducts(supabase, {
    collectionSlug: params.slug,
    sort: (searchParams.sort as any) || "newest",
    size: searchParams.size,
    color: searchParams.color,
    minPrice: searchParams.minPrice ? Number(searchParams.minPrice) : undefined,
    maxPrice: searchParams.maxPrice ? Number(searchParams.maxPrice) : undefined,
    inStockOnly: searchParams.inStock === "1",
    pageSize: 48,
  });

  return (
    <div className="mx-auto max-w-7xl px-4 md:px-8 py-12">
      <div className="mb-8">
        <h1>{collection.name}</h1>
        {collection.description && (
          <p className="text-sm text-jisp-grey mt-2 max-w-xl">{collection.description}</p>
        )}
        <p className="text-sm text-jisp-grey mt-2">{total} products</p>
      </div>
      <Suspense fallback={null}>
        <ShopFilters />
      </Suspense>
      <ProductGrid products={products as any} />
    </div>
  );
}
