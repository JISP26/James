import Link from "next/link";
import Image from "next/image";
import { Badge } from "@jisp/ui";
import { formatRM } from "@/lib/format";
import type { PublicProduct } from "@jisp/database";

export function ProductCard({ product }: { product: PublicProduct }) {
  const mainImage =
    product.images?.find((img) => img.is_main)?.url ?? product.images?.[0]?.url;
  const isSoldOut = (product.inventory_quantity ?? 0) <= 0;
  const onSale = product.sale_price != null && product.sale_price < product.regular_price;

  return (
    <Link
      href={`/product/${product.slug}`}
      className="group flex flex-col gap-3"
      aria-label={`View ${product.name}`}
    >
      <div className="relative aspect-[3/4] w-full overflow-hidden bg-jisp-light">
        {mainImage ? (
          <Image
            src={mainImage}
            alt={product.name}
            fill
            sizes="(max-width: 768px) 50vw, 25vw"
            className={`object-cover transition-transform duration-300 group-hover:scale-[1.03] ${isSoldOut ? "opacity-60" : ""}`}
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-jisp-grey text-xs">
            No Image
          </div>
        )}
        <div className="absolute left-2 top-2 flex flex-col gap-1">
          {product.is_new_arrival && <Badge tone="new">New</Badge>}
          {product.is_limited_edition && <Badge tone="limited">Limited</Badge>}
          {isSoldOut && <Badge tone="soldout">Sold Out</Badge>}
        </div>
        <span className="absolute bottom-2 right-2 hidden group-hover:inline-block bg-jisp-white px-3 py-1.5 text-[11px] uppercase tracking-wider">
          View Product
        </span>
      </div>
      <div className="flex flex-col gap-0.5">
        {product.category && (
          <span className="text-[11px] uppercase tracking-wider text-jisp-grey">
            {product.category}
          </span>
        )}
        <span className="text-sm font-body text-jisp-black">{product.name}</span>
        <div className="flex items-center gap-2">
          {onSale ? (
            <>
              <span className="text-sm text-jisp-grey line-through">
                {formatRM(product.regular_price)}
              </span>
              <span className="text-sm text-jisp-black">
                {formatRM(product.sale_price as number)}
              </span>
            </>
          ) : (
            <span className="text-sm text-jisp-black">{formatRM(product.regular_price)}</span>
          )}
        </div>
      </div>
    </Link>
  );
}
