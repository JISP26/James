import Link from "next/link";
import Image from "next/image";
import { getSupabaseServerReadClient } from "@/lib/supabase";
import {
  fetchPublishedProducts,
  fetchCollections,
  fetchSiteSettings,
} from "@jisp/database";
import { ProductGrid } from "@/components/ProductGrid";

export const revalidate = 30;

export default async function HomePage() {
  const supabase = getSupabaseServerReadClient();

  const [settings, newArrivals, featured, collections] = await Promise.all([
    fetchSiteSettings(supabase).catch(() => null),
    fetchPublishedProducts(supabase, { sort: "newest", pageSize: 4 }).catch(() => ({ products: [] })),
    fetchPublishedProducts(supabase, { sort: "featured", pageSize: 4 }).catch(() => ({ products: [] })),
    fetchCollections(supabase).catch(() => []),
  ]);

  return (
    <div>
      {/* Hero */}
      <section className="relative h-[85vh] min-h-[520px] w-full overflow-hidden bg-jisp-black">
        {settings?.hero_image_url && (
          <Image
            src={settings.hero_image_url}
            alt=""
            fill
            priority
            className="object-cover opacity-70"
          />
        )}
        <div className="relative z-10 flex h-full flex-col items-center justify-center gap-6 px-4 text-center text-white">
          <p className="text-xs uppercase tracking-[0.3em]">Journey in Sculpture</p>
          <h1 className="max-w-2xl">{settings?.hero_title || "Journey in Sculpture"}</h1>
          <p className="text-sm md:text-base uppercase tracking-[0.2em]">
            {settings?.hero_subtitle || "Sculpted for the Journey."}
          </p>
          <Link
            href="/shop"
            className="mt-4 bg-jisp-white text-jisp-black px-8 py-4 text-xs uppercase tracking-wider hover:bg-jisp-blue-hover"
          >
            {settings?.hero_button_text || "Shop Collection"}
          </Link>
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-4 md:px-8">
        {/* New Arrivals */}
        <section className="py-16 md:py-24">
          <div className="flex items-end justify-between mb-8">
            <h2>New Arrivals</h2>
            <Link href="/shop?sort=newest" className="text-xs uppercase tracking-wider hover:text-jisp-blue">
              View All
            </Link>
          </div>
          <ProductGrid products={newArrivals.products as any} />
        </section>

        {/* Featured Products */}
        <section className="py-16 md:py-24 border-t border-jisp-light">
          <div className="flex items-end justify-between mb-8">
            <h2>Featured Products</h2>
            <Link href="/shop?sort=featured" className="text-xs uppercase tracking-wider hover:text-jisp-blue">
              View All
            </Link>
          </div>
          <ProductGrid products={featured.products as any} />
        </section>

        {/* Collections */}
        {collections.length > 0 && (
          <section className="py-16 md:py-24 border-t border-jisp-light">
            <h2 className="mb-8">Collections</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {collections.map((c: any) => (
                <Link
                  key={c.id}
                  href={`/collections/${c.slug}`}
                  className="group relative aspect-[4/5] overflow-hidden bg-jisp-light"
                >
                  {c.cover_image_url && (
                    <Image
                      src={c.cover_image_url}
                      alt={c.name}
                      fill
                      className="object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                  )}
                  <div className="absolute inset-0 bg-jisp-black/20 flex items-end p-6">
                    <span className="text-white text-lg font-display">{c.name}</span>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* Brand Story */}
        <section className="py-16 md:py-24 border-t border-jisp-light grid md:grid-cols-2 gap-10 items-center">
          <div>
            <h2 className="mb-4">Journey in Sculpture</h2>
            <p className="text-sm text-jisp-grey leading-relaxed max-w-lg">
              {settings?.brand_story ||
                "Every product is a piece that gets shaped through the journeys of the person wearing it."}
            </p>
            <Link href="/about" className="inline-block mt-6 text-xs uppercase tracking-wider underline underline-offset-4 hover:text-jisp-blue">
              About JISP
            </Link>
          </div>
          <div className="relative aspect-[4/3] bg-jisp-light overflow-hidden">
            {settings?.hero_image_url && (
              <Image src={settings.hero_image_url} alt="" fill className="object-cover" />
            )}
          </div>
        </section>

        {/* Instagram / Social */}
        {settings?.instagram_url && (
          <section className="py-16 md:py-24 border-t border-jisp-light text-center">
            <h2 className="mb-4">Follow the Journey</h2>
            <a
              href={settings.instagram_url}
              target="_blank"
              rel="noreferrer"
              className="text-xs uppercase tracking-wider underline underline-offset-4 hover:text-jisp-blue"
            >
              @jisp on Instagram
            </a>
          </section>
        )}
      </div>
    </div>
  );
}
