import { notFound } from "next/navigation";
import { getSupabaseServerReadClient } from "@/lib/supabase";
import { fetchProductBySlug, fetchRelatedProducts } from "@jisp/database";
import { ProductDetailClient } from "@/components/ProductDetailClient";
import { ProductGrid } from "@/components/ProductGrid";
import type { Metadata } from "next";

export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Promise<Metadata> {
  const supabase = getSupabaseServerReadClient();
  const product = await fetchProductBySlug(supabase, params.slug);
  if (!product) return { title: "Product Not Found" };
  return {
    title: product.name,
    description: product.short_description || undefined,
    openGraph: {
      title: product.name,
      description: product.short_description || undefined,
      images: product.images?.[0]?.url ? [product.images[0].url] : undefined,
    },
  };
}

export default async function ProductDetailPage({
  params,
}: {
  params: { slug: string };
}) {
  const supabase = getSupabaseServerReadClient();
  const product = await fetchProductBySlug(supabase, params.slug);
  if (!product) notFound();

  const related = await fetchRelatedProducts(supabase, product.category, product.id);

  return (
    <div>
      <ProductDetailClient product={product as any} />
      {related.length > 0 && (
        <div className="mx-auto max-w-7xl px-4 md:px-8 py-16 border-t border-jisp-light">
          <h2 className="mb-8">Related Products</h2>
          <ProductGrid products={related as any} />
        </div>
      )}
    </div>
  );
}
