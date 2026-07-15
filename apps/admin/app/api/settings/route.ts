import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/supabase-server";

export async function PATCH(req: NextRequest) {
  const auth = await requireAdmin();
  if (!auth.authorized) return NextResponse.json({ error: auth.error }, { status: auth.status });

  const body = await req.json();
  const updates: Record<string, any> = {};
  const mapping: Record<string, string> = {
    heroImageUrl: "hero_image_url",
    heroTitle: "hero_title",
    heroSubtitle: "hero_subtitle",
    heroButtonText: "hero_button_text",
    featuredCollectionId: "featured_collection_id",
    brandStory: "brand_story",
    aboutContent: "about_content",
    instagramUrl: "instagram_url",
    whatsappUrl: "whatsapp_url",
    contactEmail: "contact_email",
    shippingInformation: "shipping_information",
    returnsInformation: "returns_information",
    footerContent: "footer_content",
  };
  for (const [key, column] of Object.entries(mapping)) {
    if (key in body) updates[column] = body[key];
  }

  const { data: existing } = await auth.supabase.from("site_settings").select("id").limit(1).maybeSingle();

  let result;
  if (existing) {
    result = await auth.supabase.from("site_settings").update(updates).eq("id", existing.id).select().single();
  } else {
    result = await auth.supabase.from("site_settings").insert(updates).select().single();
  }

  if (result.error) return NextResponse.json({ error: result.error.message }, { status: 400 });
  return NextResponse.json({ settings: result.data });
}
