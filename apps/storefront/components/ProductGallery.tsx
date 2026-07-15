"use client";

import Image from "next/image";
import { useState } from "react";

export function ProductGallery({
  images,
  productName,
}: {
  images: { url: string; is_main: boolean }[];
  productName: string;
}) {
  const sorted = [...images].sort((a, b) => (b.is_main ? 1 : 0) - (a.is_main ? 1 : 0));
  const [active, setActive] = useState(0);

  if (sorted.length === 0) {
    return <div className="aspect-[3/4] bg-jisp-light" />;
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="relative aspect-[3/4] bg-jisp-light overflow-hidden">
        <Image
          src={sorted[active].url}
          alt={productName}
          fill
          priority
          className="object-cover"
        />
      </div>
      {sorted.length > 1 && (
        <div className="flex gap-2">
          {sorted.map((img, i) => (
            <button
              key={img.url}
              onClick={() => setActive(i)}
              aria-label={`View image ${i + 1} of ${productName}`}
              aria-current={active === i}
              className={`relative h-20 w-16 overflow-hidden bg-jisp-light border ${active === i ? "border-jisp-black" : "border-transparent"}`}
            >
              <Image src={img.url} alt="" fill className="object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
