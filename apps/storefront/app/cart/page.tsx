"use client";

import Link from "next/link";
import Image from "next/image";
import { useCartStore, computeDeliveryFee } from "@/lib/cart-store";
import { formatRM } from "@/lib/format";
import { Button, EmptyState } from "@jisp/ui";

export default function CartPage() {
  const lines = useCartStore((s) => s.lines);
  const updateQuantity = useCartStore((s) => s.updateQuantity);
  const removeLine = useCartStore((s) => s.removeLine);

  const subtotal = lines.reduce((sum, l) => sum + l.unitPrice * l.quantity, 0);
  const deliveryFee = computeDeliveryFee(subtotal);
  const grandTotal = subtotal + deliveryFee;

  if (lines.length === 0) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-12">
        <h1 className="mb-8">Cart</h1>
        <EmptyState
          title="Your cart is empty"
          description="Browse the shop and add pieces to your cart."
          action={
            <Link href="/shop">
              <Button variant="primary">Shop Now</Button>
            </Link>
          }
        />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl px-4 md:px-8 py-12">
      <h1 className="mb-8">Cart</h1>
      <div className="grid md:grid-cols-3 gap-10">
        <div className="md:col-span-2 flex flex-col gap-6">
          {lines.map((line) => (
            <div key={line.id} className="flex gap-4 border-b border-jisp-light pb-6">
              <div className="relative h-28 w-24 flex-shrink-0 bg-jisp-light overflow-hidden">
                {line.imageUrl && (
                  <Image src={line.imageUrl} alt={line.name} fill className="object-cover" />
                )}
              </div>
              <div className="flex flex-1 flex-col justify-between">
                <div>
                  <Link href={`/product/${line.slug}`} className="text-sm font-body hover:text-jisp-blue">
                    {line.name}
                  </Link>
                  <p className="text-xs text-jisp-grey mt-1">
                    {[line.size, line.color].filter(Boolean).join(" / ")}
                  </p>
                  <p className="text-sm mt-1">{formatRM(line.unitPrice)}</p>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center border border-jisp-light w-fit">
                    <button
                      aria-label={`Decrease quantity of ${line.name}`}
                      className="px-3 py-1.5"
                      onClick={() => updateQuantity(line.id, line.quantity - 1)}
                    >
                      −
                    </button>
                    <span className="px-3 text-sm">{line.quantity}</span>
                    <button
                      aria-label={`Increase quantity of ${line.name}`}
                      className="px-3 py-1.5"
                      onClick={() => updateQuantity(line.id, line.quantity + 1)}
                    >
                      +
                    </button>
                  </div>
                  <button
                    onClick={() => removeLine(line.id)}
                    className="text-xs uppercase tracking-wider text-jisp-grey underline underline-offset-4 hover:text-red-600"
                  >
                    Remove
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="border border-jisp-light p-6 h-fit flex flex-col gap-4">
          <h3>Order Summary</h3>
          <div className="flex justify-between text-sm">
            <span>Subtotal</span>
            <span>{formatRM(subtotal)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span>Delivery Fee</span>
            <span>{deliveryFee === 0 ? "Free" : formatRM(deliveryFee)}</span>
          </div>
          <div className="flex justify-between text-sm font-medium border-t border-jisp-light pt-4">
            <span>Grand Total</span>
            <span>{formatRM(grandTotal)}</span>
          </div>
          <Link href="/checkout">
            <Button variant="primary" fullWidth size="lg">
              Proceed to Checkout
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
