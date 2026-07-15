"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { getSupabaseBrowserClient } from "@/lib/supabase";

const LINKS = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/products", label: "Products" },
  { href: "/collections", label: "Collections" },
  { href: "/orders", label: "Orders" },
  { href: "/customers", label: "Customers" },
  { href: "/content", label: "Website Content" },
  { href: "/settings", label: "Settings" },
];

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);

  async function handleLogout() {
    const supabase = getSupabaseBrowserClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  const nav = (
    <nav className="flex flex-col gap-1" aria-label="Admin navigation">
      {LINKS.map((link) => {
        const active = pathname?.startsWith(link.href);
        return (
          <Link
            key={link.href}
            href={link.href}
            onClick={() => setOpen(false)}
            aria-current={active ? "page" : undefined}
            className={`px-4 py-2.5 text-sm rounded-none ${
              active ? "bg-jisp-black text-white" : "text-jisp-black hover:bg-jisp-blue-hover"
            }`}
          >
            {link.label}
          </Link>
        );
      })}
    </nav>
  );

  return (
    <>
      <div className="md:hidden flex items-center justify-between bg-jisp-white border-b border-jisp-light px-4 h-14">
        <span className="font-display tracking-[0.15em]">JISP Admin</span>
        <button onClick={() => setOpen((v) => !v)} aria-label="Toggle menu" aria-expanded={open} className="p-2">
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
            <path d="M2 5h16M2 10h16M2 15h16" stroke="#111111" strokeWidth="1.5" />
          </svg>
        </button>
      </div>
      {open && (
        <div className="md:hidden bg-jisp-white border-b border-jisp-light p-4">
          {nav}
          <button onClick={handleLogout} className="mt-2 w-full text-left px-4 py-2.5 text-sm text-jisp-grey hover:text-red-600">
            Log Out
          </button>
        </div>
      )}
      <aside className="hidden md:flex md:flex-col md:w-60 md:shrink-0 border-r border-jisp-light bg-jisp-white h-screen sticky top-0 p-4">
        <span className="font-display tracking-[0.15em] px-4 py-4">JISP Admin</span>
        {nav}
        <button onClick={handleLogout} className="mt-auto text-left px-4 py-2.5 text-sm text-jisp-grey hover:text-red-600">
          Log Out
        </button>
      </aside>
    </>
  );
}
