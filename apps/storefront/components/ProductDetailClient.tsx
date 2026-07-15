"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button, useToast } from "@jisp/ui";
import { formatRM } from "@/lib/format";
import { useCartStore } from "@/lib/cart-store";
import { ProductGallery } from "./ProductGallery";
import type { PublicProduct } from "@jisp/database";

export function ProductDetailClient({ product }: { product: PublicProduct }) {
  const [size, setSize] = useState<string | null>(null);
  const [color, setColor] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [error, setError] = useState<string | null>(null);
  const addLine = useCartStore((s) => s.addLine);
  const { showToast } = useToast();
  const router = useRouter();

  const isSoldOut = (product.inventory_quantity ?? 0) <= 0;
  const onSale = product.sale_price != null && product.sale_price < product.regular_price;
  const price = product.sale_price ?? product.regular_price;
  const mainImage = product.images?.find((i) => i.is_main)?.url ?? product.images?.[0]?.url ?? null;

  function validate(): boolean {
    if (product.sizes?.length && !size) {
      setError("Please select a size before adding to cart.");
      return false;
    }
    if (product.colors?.length && !color) {
      setError("Please select a color before adding to cart.");
      return false;
    }
    setError(null);
    return true;
  }

  function handleAddToCart() {
    if (isSoldOut) return;
    if (!validate()) return;
    addLine({
      productId: product.id,
      name: product.name,
      slug: product.slug,
      imageUrl: mainImage,
      unitPrice: price,
      size,
      color,
      quantity,
      maxQuantity: product.inventory_quantity,
    });
    showToast(`${product.name} added to cart`, "success");
  }

  function handleBuyNow() {
    if (isSoldOut) return;
    if (!validate()) return;
    handleAddToCart();
    router.push("/cart");
  }

  return (
    <div className="mx-auto max-w-7xl px-4 md:px-8 py-12 grid md:grid-cols-2 gap-10">
      <ProductGallery images={product.images ?? []} productName={product.name} />

      <div className="flex flex-col gap-6 max-w-lg">
        <div>
          {product.category && (
            <span className="text-[11px] uppercase tracking-wider text-jisp-grey">
              {product.category}
            </span>
          )}
          <h1 className="mt-1">{product.name}</h1>
          {product.positioning && (
            <p className="text-sm text-jisp-grey mt-2 italic">{product.positioning}</p>
          )}
        </div>

        <div className="flex items-center gap-3">
          {onSale ? (
            <>
              <span className="text-jisp-grey line-through">{formatRM(product.regular_price)}</span>
              <span className="text-lg">{formatRM(product.sale_price as number)}</span>
            </>
          ) : (
            <span className="text-lg">{formatRM(product.regular_price)}</span>
          )}
        </div>

        {product.short_description && (
          <p className="text-sm text-jisp-black">{product.short_description}</p>
        )}

        {/* Size */}
        {product.sizes && product.sizes.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs uppercase tracking-wider">Size</span>
              <button className="text-xs underline underline-offset-4 text-jisp-grey hover:text-jisp-blue">
                Size Guide
              </button>
            </div>
            <div className="flex flex-wrap gap-2" role="radiogroup" aria-label="Select size">
              {product.sizes.map((s) => (
                <button
                  key={s}
                  role="radio"
                  aria-checked={size === s}
                  onClick={() => { setSize(s); setError(null); }}
                  className={`px-4 py-2 text-sm border ${size === s ? "border-jisp-black bg-jisp-black text-white" : "border-jisp-light hover:border-jisp-blue"}`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Color */}
        {product.colors && product.colors.length > 0 && (
          <div>
            <span className="text-xs uppercase tracking-wider mb-2 block">Color</span>
            <div className="flex flex-wrap gap-2" role="radiogroup" aria-label="Select color">
              {product.colors.map((c) => (
                <button
                  key={c}
                  role="radio"
                  aria-checked={color === c}
                  onClick={() => { setColor(c); setError(null); }}
                  className={`px-4 py-2 text-sm border ${color === c ? "border-jisp-black bg-jisp-black text-white" : "border-jisp-light hover:border-jisp-blue"}`}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Quantity */}
        <div>
          <span className="text-xs uppercase tracking-wider mb-2 block">Quantity</span>
          <div className="flex items-center border border-jisp-light w-fit">
            <button
              aria-label="Decrease quantity"
              className="px-3 py-2"
              onClick={() => setQuantity((q) => Math.max(1, q - 1))}
            >
              −
            </button>
            <span className="px-4 text-sm" aria-live="polite">{quantity}</span>
            <button
              aria-label="Increase quantity"
              className="px-3 py-2"
              onClick={() => setQuantity((q) => Math.min(product.inventory_quantity || 1, q + 1))}
            >
              +
            </button>
          </div>
        </div>

        {/* Stock status */}
        <p className="text-xs text-jisp-grey">
          {isSoldOut
            ? "Sold Out"
            : product.inventory_quantity <= product.low_stock_threshold
            ? `Low Stock — only ${product.inventory_quantity} left`
            : "In Stock"}
        </p>
        <p className="text-xs text-jisp-grey">SKU: {product.sku}</p>

        {error && (
          <p role="alert" className="text-xs text-red-600">{error}</p>
        )}

        <div className="flex flex-col sm:flex-row gap-3">
          <Button
            variant="primary"
            size="lg"
            fullWidth
            disabled={isSoldOut}
            onClick={handleAddToCart}
          >
            {isSoldOut ? "Sold Out" : "Add to Cart"}
          </Button>
          <Button
            variant="outline"
            size="lg"
            fullWidth
            disabled={isSoldOut}
            onClick={handleBuyNow}
          >
            Buy Now
          </Button>
        </div>

        <div className="border-t border-jisp-light pt-6 flex flex-col gap-4 text-sm">
          {product.full_description && (
            <details open className="group">
              <summary className="cursor-pointer text-xs uppercase tracking-wider mb-2">Description</summary>
              <p className="text-jisp-grey">{product.full_description}</p>
            </details>
          )}
          {product.material && (
            <details>
              <summary className="cursor-pointer text-xs uppercase tracking-wider mb-2">Material</summary>
              <p className="text-jisp-grey">{product.material}</p>
            </details>
          )}
          {product.care_instructions && (
            <details>
              <summary className="cursor-pointer text-xs uppercase tracking-wider mb-2">Care Instructions</summary>
              <p className="text-jisp-grey">{product.care_instructions}</p>
            </details>
          )}
          {product.size_guide && (
            <details>
              <summary className="cursor-pointer text-xs uppercase tracking-wider mb-2">Size Guide</summary>
              <p className="text-jisp-grey">{product.size_guide}</p>
            </details>
          )}
          {product.shipping_information && (
            <details>
              <summary className="cursor-pointer text-xs uppercase tracking-wider mb-2">Shipping Information</summary>
              <p className="text-jisp-grey">{product.shipping_information}</p>
            </details>
          )}
        </div>
      </div>
    </div>
  );
}
