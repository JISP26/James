import Link from "next/link";

export function Footer({
  instagramUrl,
  whatsappUrl,
  contactEmail,
  footerContent,
}: {
  instagramUrl?: string | null;
  whatsappUrl?: string | null;
  contactEmail?: string | null;
  footerContent?: string | null;
}) {
  return (
    <footer className="border-t border-jisp-light bg-jisp-white mt-24">
      <div className="mx-auto max-w-7xl px-4 md:px-8 py-12 grid grid-cols-2 md:grid-cols-4 gap-8">
        <div className="col-span-2 md:col-span-1">
          <p className="font-display text-lg tracking-[0.15em]">JISP</p>
          <p className="mt-2 text-xs text-jisp-grey font-body max-w-xs">
            {footerContent || "Journey in Sculpture. Wear Your Journey."}
          </p>
        </div>
        <div className="flex flex-col gap-2">
          <span className="text-xs uppercase tracking-wider text-jisp-grey">Shop</span>
          <Link href="/shop" className="text-sm hover:text-jisp-blue">All Products</Link>
          <Link href="/collections" className="text-sm hover:text-jisp-blue">Collections</Link>
        </div>
        <div className="flex flex-col gap-2">
          <span className="text-xs uppercase tracking-wider text-jisp-grey">Help</span>
          <Link href="/shipping-returns" className="text-sm hover:text-jisp-blue">Shipping &amp; Returns</Link>
          <Link href="/contact" className="text-sm hover:text-jisp-blue">Contact</Link>
          <Link href="/about" className="text-sm hover:text-jisp-blue">About JISP</Link>
        </div>
        <div className="flex flex-col gap-2">
          <span className="text-xs uppercase tracking-wider text-jisp-grey">Connect</span>
          {contactEmail && (
            <a href={`mailto:${contactEmail}`} className="text-sm hover:text-jisp-blue">
              {contactEmail}
            </a>
          )}
          {instagramUrl && (
            <a href={instagramUrl} target="_blank" rel="noreferrer" className="text-sm hover:text-jisp-blue">
              Instagram
            </a>
          )}
          {whatsappUrl && (
            <a href={whatsappUrl} target="_blank" rel="noreferrer" className="text-sm hover:text-jisp-blue">
              WhatsApp
            </a>
          )}
        </div>
      </div>
      <div className="border-t border-jisp-light py-4 text-center text-[11px] text-jisp-grey font-body">
        © {new Date().getFullYear()} JISP — Journey in Sculpture. All rights reserved.
      </div>
    </footer>
  );
}
