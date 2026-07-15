"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useState } from "react";
import { Button, Select } from "@jisp/ui";

const CATEGORIES = ["Tops", "Bottoms", "Outerwear", "Accessories"];
const SIZES = ["XS", "S", "M", "L", "XL"];
const COLORS = ["Black", "White", "Dark Grey", "Stone Grey", "Olive", "Sand"];

export function ShopFilters({ collections }: { collections?: { name: string; slug: string }[] }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [open, setOpen] = useState(false);

  function updateParam(key: string, value: string | null) {
    const params = new URLSearchParams(searchParams.toString());
    if (value) params.set(key, value);
    else params.delete(key);
    router.push(`${pathname}?${params.toString()}`);
  }

  function clearAll() {
    router.push(pathname);
  }

  const active = searchParams.toString().length > 0;

  return (
    <div className="mb-8">
      <div className="flex items-center justify-between gap-4 md:hidden">
        <button
          onClick={() => setOpen((v) => !v)}
          className="text-xs uppercase tracking-wider border border-jisp-black px-4 py-2"
          aria-expanded={open}
        >
          Filters {active && "(active)"}
        </button>
        <Select
          aria-label="Sort products"
          value={searchParams.get("sort") ?? "newest"}
          onChange={(e) => updateParam("sort", e.target.value)}
          className="w-auto"
        >
          <option value="newest">Newest</option>
          <option value="price_asc">Price: Low to High</option>
          <option value="price_desc">Price: High to Low</option>
          <option value="featured">Recommended</option>
        </Select>
      </div>

      <div className={`${open ? "flex" : "hidden"} md:flex flex-col md:flex-row flex-wrap gap-3 mt-4 md:mt-0`}>
        <Select
          aria-label="Filter by category"
          value={searchParams.get("category") ?? ""}
          onChange={(e) => updateParam("category", e.target.value || null)}
          className="md:w-44"
        >
          <option value="">All Categories</option>
          {CATEGORIES.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </Select>

        {collections && collections.length > 0 && (
          <Select
            aria-label="Filter by collection"
            value={searchParams.get("collection") ?? ""}
            onChange={(e) => updateParam("collection", e.target.value || null)}
            className="md:w-48"
          >
            <option value="">All Collections</option>
            {collections.map((c) => (
              <option key={c.slug} value={c.slug}>{c.name}</option>
            ))}
          </Select>
        )}

        <Select
          aria-label="Filter by size"
          value={searchParams.get("size") ?? ""}
          onChange={(e) => updateParam("size", e.target.value || null)}
          className="md:w-32"
        >
          <option value="">All Sizes</option>
          {SIZES.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </Select>

        <Select
          aria-label="Filter by color"
          value={searchParams.get("color") ?? ""}
          onChange={(e) => updateParam("color", e.target.value || null)}
          className="md:w-36"
        >
          <option value="">All Colors</option>
          {COLORS.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </Select>

        <Select
          aria-label="Filter by price range"
          value={
            searchParams.get("minPrice") || searchParams.get("maxPrice")
              ? `${searchParams.get("minPrice") ?? ""}-${searchParams.get("maxPrice") ?? ""}`
              : ""
          }
          onChange={(e) => {
            const [min, max] = e.target.value.split("-");
            const params = new URLSearchParams(searchParams.toString());
            if (min) params.set("minPrice", min); else params.delete("minPrice");
            if (max) params.set("maxPrice", max); else params.delete("maxPrice");
            router.push(`${pathname}?${params.toString()}`);
          }}
          className="md:w-44"
        >
          <option value="">All Prices</option>
          <option value="0-150">Under RM150</option>
          <option value="150-300">RM150 - RM300</option>
          <option value="300-500">RM300 - RM500</option>
          <option value="500-">Above RM500</option>
        </Select>

        <label className="flex items-center gap-2 text-xs uppercase tracking-wider">
          <input
            type="checkbox"
            checked={searchParams.get("inStock") === "1"}
            onChange={(e) => updateParam("inStock", e.target.checked ? "1" : null)}
          />
          In Stock Only
        </label>

        <Select
          aria-label="Sort products"
          value={searchParams.get("sort") ?? "newest"}
          onChange={(e) => updateParam("sort", e.target.value)}
          className="hidden md:block md:w-52"
        >
          <option value="newest">Newest</option>
          <option value="price_asc">Price: Low to High</option>
          <option value="price_desc">Price: High to Low</option>
          <option value="featured">Recommended</option>
        </Select>

        {active && (
          <Button variant="ghost" onClick={clearAll} className="md:ml-auto">
            Clear All Filters
          </Button>
        )}
      </div>
    </div>
  );
}
