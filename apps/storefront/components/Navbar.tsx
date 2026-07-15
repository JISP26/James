"use client";

import Link from "next/link";
import { useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useCartStore } from "@/lib/cart-store";
import { MobileMenu } from "./MobileMenu";

const NAV_LINKS = [
  { href: "/shop", label: "Shop" },
  { href: "/collections", label: "Collections" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
];

export function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchValue, setSearchValue] = useState("");
  const pathname = usePathname();
  const router = useRouter();
  const itemCount = useCartStore((s) =>
    s.lines.reduce((sum, l) => sum + l.quantity, 0)
  );

  function submitSearch(e: React.FormEvent) {
    e.preventDefault();
    if (searchValue.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchValue.trim())}`);
      setSearchOpen(false);
    }
  }

  return (
    <header className="sticky top-0 z-50 bg-jisp-white border-b border-jisp-light">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 md:px-8">
        <button
          className="md:hidden p-2 -ml-2"
          aria-label="Open menu"
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen(true)}
        >
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
            <path d="M2 5h16M2 10h16M2 15h16" stroke="#111111" strokeWidth="1.5" />
          </svg>
        </button>

        <Link href="/" className="font-display text-xl tracking-[0.15em]" aria-label="JISP home">
          JISP
        </Link>

        <nav className="hidden md:flex items-center gap-8" aria-label="Main navigation">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`text-xs uppercase tracking-wider font-body hover:text-jisp-blue ${
                pathname?.startsWith(link.href) ? "text-jisp-blue" : "text-jisp-black"
              }`}
              aria-current={pathname?.startsWith(link.href) ? "page" : undefined}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <button
            aria-label="Search"
            className="p-2"
            onClick={() => setSearchOpen((v) => !v)}
          >
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
              <circle cx="8" cy="8" r="6" stroke="#111111" strokeWidth="1.5" />
              <path d="M16 16l-3.5-3.5" stroke="#111111" strokeWidth="1.5" />
            </svg>
          </button>
          <Link href="/cart" className="relative p-2" aria-label={`Cart, ${itemCount} items`}>
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
              <path d="M4 6h10l-1 9H5L4 6Z" stroke="#111111" strokeWidth="1.5" />
              <path d="M6.5 6V4.5a2.5 2.5 0 0 1 5 0V6" stroke="#111111" strokeWidth="1.5" />
            </svg>
            {itemCount > 0 && (
              <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-jisp-black text-[9px] text-white">
                {itemCount}
              </span>
            )}
          </Link>
        </div>
      </div>

      {searchOpen && (
        <div className="border-t border-jisp-light px-4 py-3 md:px-8">
          <form onSubmit={submitSearch} role="search" className="mx-auto max-w-2xl flex gap-2">
            <label htmlFor="nav-search" className="sr-only">
              Search products
            </label>
            <input
              id="nav-search"
              type="search"
              autoFocus
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              placeholder="Search products..."
              className="flex-1 border border-jisp-light px-4 py-2 text-sm focus:outline-none focus:border-jisp-blue"
            />
            <button
              type="submit"
              className="bg-jisp-black text-white px-4 py-2 text-xs uppercase tracking-wider"
            >
              Search
            </button>
          </form>
        </div>
      )}

      <MobileMenu open={menuOpen} onClose={() => setMenuOpen(false)} links={NAV_LINKS} />
    </header>
  );
}
