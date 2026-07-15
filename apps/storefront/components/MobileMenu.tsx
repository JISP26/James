"use client";

import Link from "next/link";
import { useEffect } from "react";

export function MobileMenu({
  open,
  onClose,
  links,
}: {
  open: boolean;
  onClose: () => void;
  links: { href: string; label: string }[];
}) {
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    if (open) {
      document.addEventListener("keydown", onKey);
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[60] md:hidden" role="dialog" aria-modal="true" aria-label="Mobile navigation">
      <div className="absolute inset-0 bg-jisp-black/50" onClick={onClose} />
      <div className="absolute left-0 top-0 h-full w-72 max-w-[80vw] bg-jisp-white p-6 flex flex-col gap-6 shadow-lg">
        <div className="flex items-center justify-between">
          <span className="font-display text-lg tracking-[0.15em]">JISP</span>
          <button onClick={onClose} aria-label="Close menu" className="p-1">
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
              <path d="M2 2l14 14M16 2L2 16" stroke="#111111" strokeWidth="1.5" />
            </svg>
          </button>
        </div>
        <nav className="flex flex-col gap-4" aria-label="Mobile navigation links">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={onClose}
              className="text-sm uppercase tracking-wider font-body text-jisp-black hover:text-jisp-blue"
            >
              {link.label}
            </Link>
          ))}
        </nav>
      </div>
    </div>
  );
}
