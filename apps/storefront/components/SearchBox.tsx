"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function SearchBox({ initialQuery = "" }: { initialQuery?: string }) {
  const [value, setValue] = useState(initialQuery);
  const router = useRouter();

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    router.push(`/search?q=${encodeURIComponent(value.trim())}`);
  }

  return (
    <form onSubmit={onSubmit} role="search" className="flex gap-2 max-w-xl">
      <label htmlFor="search-box" className="sr-only">Search products</label>
      <input
        id="search-box"
        type="search"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="Search products..."
        className="flex-1 border border-jisp-light px-4 py-3 text-sm focus:outline-none focus:border-jisp-blue"
      />
      <button type="submit" className="bg-jisp-black text-white px-6 py-3 text-xs uppercase tracking-wider">
        Search
      </button>
    </form>
  );
}
