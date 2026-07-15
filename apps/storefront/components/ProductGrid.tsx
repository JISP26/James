import { ProductCard } from "./ProductCard";
import { EmptyState } from "@jisp/ui";
import type { PublicProduct } from "@jisp/database";

export function ProductGrid({ products }: { products: PublicProduct[] }) {
  if (!products.length) {
    return (
      <EmptyState
        title="No products found"
        description="Try adjusting your filters or search terms."
      />
    );
  }
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-4 gap-y-8 md:gap-x-6 md:gap-y-12">
      {products.map((p) => (
        <ProductCard key={p.id} product={p} />
      ))}
    </div>
  );
}
