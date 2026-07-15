import { getSupabaseServerReadClient } from "@/lib/supabase";
import { fetchPublishedProducts } from "@jisp/database";
import { ProductGrid } from "@/components/ProductGrid";
import { SearchBox } from "@/components/SearchBox";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Search Results" };

export default async function SearchPage({
  searchParams,
}: {
  searchParams: { q?: string };
}) {
  const query = searchParams.q?.trim() || "";
  const supabase = getSupabaseServerReadClient();

  const { products, total } = query
    ? await fetchPublishedProducts(supabase, { search: query, pageSize: 48 })
    : { products: [], total: 0 };

  return (
    <div className="mx-auto max-w-7xl px-4 md:px-8 py-12">
      <div className="mb-8">
        <h1>Search Results</h1>
        <div className="mt-4 mb-4">
          <SearchBox initialQuery={query} />
        </div>
        {query && (
          <p className="text-sm text-jisp-grey">
            {total} result{total === 1 ? "" : "s"} for &ldquo;{query}&rdquo;
          </p>
        )}
      </div>
      {query ? (
        <ProductGrid products={products as any} />
      ) : (
        <p className="text-sm text-jisp-grey">Enter a keyword to search JISP products.</p>
      )}
    </div>
  );
}
