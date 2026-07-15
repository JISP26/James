import Link from "next/link";
import Image from "next/image";
import { getSupabaseServerReadClient } from "@/lib/supabase";
import { fetchCollections } from "@jisp/database";
import { EmptyState } from "@jisp/ui";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Collections" };
export const revalidate = 30;

export default async function CollectionsPage() {
  const supabase = getSupabaseServerReadClient();
  const collections = await fetchCollections(supabase);

  return (
    <div className="mx-auto max-w-7xl px-4 md:px-8 py-12">
      <h1 className="mb-8">Collections</h1>
      {collections.length === 0 ? (
        <EmptyState title="No collections yet" description="Check back soon." />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {collections.map((c: any) => (
            <Link
              key={c.id}
              href={`/collections/${c.slug}`}
              className="group relative aspect-[16/10] overflow-hidden bg-jisp-light"
            >
              {c.cover_image_url && (
                <Image
                  src={c.cover_image_url}
                  alt={c.name}
                  fill
                  className="object-cover transition-transform duration-300 group-hover:scale-105"
                />
              )}
              <div className="absolute inset-0 bg-jisp-black/20 flex flex-col justify-end p-8">
                <span className="text-white text-2xl font-display">{c.name}</span>
                {c.description && (
                  <span className="text-white/80 text-sm mt-1 max-w-md">{c.description}</span>
                )}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
