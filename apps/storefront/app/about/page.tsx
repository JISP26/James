import Image from "next/image";
import { getSupabaseServerReadClient } from "@/lib/supabase";
import { fetchSiteSettings } from "@jisp/database";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "About JISP" };
export const revalidate = 60;

export default async function AboutPage() {
  const supabase = getSupabaseServerReadClient();
  const settings = await fetchSiteSettings(supabase).catch(() => null);

  return (
    <div className="mx-auto max-w-3xl px-4 md:px-8 py-16">
      <p className="text-xs uppercase tracking-[0.3em] text-jisp-grey text-center mb-2">
        Journey in Sculpture
      </p>
      <h1 className="text-center mb-10">About JISP</h1>
      {settings?.hero_image_url && (
        <div className="relative aspect-[16/9] bg-jisp-light overflow-hidden mb-10">
          <Image src={settings.hero_image_url} alt="" fill className="object-cover" />
        </div>
      )}
      <div className="prose-jisp flex flex-col gap-6 text-sm leading-relaxed text-jisp-black">
        <p>
          {settings?.about_content ||
            "JISP (Journey in Sculpture) is a studio designing considered, structural clothing for people in motion."}
        </p>
        {settings?.brand_story && <p className="text-jisp-grey">{settings.brand_story}</p>}
      </div>
      <p className="text-center mt-16 text-xs uppercase tracking-[0.3em]">Wear Your Journey.</p>
    </div>
  );
}
