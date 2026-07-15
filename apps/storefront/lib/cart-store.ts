"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface CartLine {
  id: string; // client-side composite key: productId-size-color
  productId: string;
  name: string;
  slug: string;
  imageUrl: string | null;
  unitPrice: number; // price at time of adding (re-validated at checkout)
  size: string | null;
  color: string | null;
  quantity: number;
  maxQuantity: number;
}

interface CartState {
  lines: CartLine[];
  addLine: (line: Omit<CartLine, "id">) => void;
  updateQuantity: (id: string, quantity: number) => void;
  removeLine: (id: string) => void;
  clear: () => void;
  subtotal: () => number;
}

const DELIVERY_FEE_STANDARD = 12;
const FREE_DELIVERY_THRESHOLD = 250;

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      lines: [],
      addLine: (line) => {
        const id = `${line.productId}-${line.size ?? "nosize"}-${line.color ?? "nocolor"}`;
        set((state) => {
          const existing = state.lines.find((l) => l.id === id);
          if (existing) {
            return {
              lines: state.lines.map((l) =>
                l.id === id
                  ? {
                      ...l,
                      quantity: Math.min(
                        l.quantity + line.quantity,
                        l.maxQuantity
                      ),
                    }
                  : l
              ),
            };
          }
          return { lines: [...state.lines, { ...line, id }] };
        });
      },
      updateQuantity: (id, quantity) => {
        set((state) => ({
          lines: state.lines
            .map((l) =>
              l.id === id
                ? { ...l, quantity: Math.max(1, Math.min(quantity, l.maxQuantity)) }
                : l
            )
            .filter((l) => l.quantity > 0),
        }));
      },
      removeLine: (id) => {
        set((state) => ({ lines: state.lines.filter((l) => l.id !== id) }));
      },
      clear: () => set({ lines: [] }),
      subtotal: () => {
        return get().lines.reduce((sum, l) => sum + l.unitPrice * l.quantity, 0);
      },
    }),
    { name: "jisp-cart" }
  )
);

export function computeDeliveryFee(subtotal: number) {
  return subtotal >= FREE_DELIVERY_THRESHOLD ? 0 : DELIVERY_FEE_STANDARD;
}

export { DELIVERY_FEE_STANDARD, FREE_DELIVERY_THRESHOLD };
