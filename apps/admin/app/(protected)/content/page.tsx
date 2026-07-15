import { getSupabaseServerSessionClient } from "@/lib/supabase-server";
import { ContentForm, type ContentFormValues } from "@/components/ContentForm";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Website Content" };
export const dynamic = "force-dynamic";

export default async function ContentPage() {
  const supabase = getSupabaseServerSessionClient();

  const [{ data: settings }, { data: collections }] = await Promise.all([
    supabase.from("site_settings").select("*").limit(1).maybeSingle(),
    supabase.from("collections").select("id, name").order("sort_order"),
  ]);

  const initial: ContentFormValues = {
    heroImageUrl: settings?.hero_image_url ?? "",
    heroTitle: settings?.hero_title ?? "Journey in Sculpture",
    heroSubtitle: settings?.hero_subtitle ?? "Sculpted for the Journey.",
    heroButtonText: settings?.hero_button_text ?? "Shop Collection",
    featuredCollectionId: settings?.featured_collection_id ?? "",
    brandStory: settings?.brand_story ?? "",
    aboutContent: settings?.about_content ?? "",
    instagramUrl: settings?.instagram_url ?? "",
    whatsappUrl: settings?.whatsapp_url ?? "",
    contactEmail: settings?.contact_email ?? "",
    shippingInformation: settings?.shipping_information ?? "",
    returnsInformation: settings?.returns_information ?? "",
    footerContent: settings?.footer_content ?? "",
  };

  return (
    <div className="flex flex-col gap-6">
      <h1>Website Content</h1>
      <ContentForm initial={initial} collections={collections ?? []} />
    </div>
  );
}
