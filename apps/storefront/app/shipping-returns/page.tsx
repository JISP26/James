import { getSupabaseServerReadClient } from "@/lib/supabase";
import { fetchSiteSettings } from "@jisp/database";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Shipping and Returns" };
export const revalidate = 60;

export default async function ShippingReturnsPage() {
  const supabase = getSupabaseServerReadClient();
  const settings = await fetchSiteSettings(supabase).catch(() => null);

  return (
    <div className="mx-auto max-w-3xl px-4 md:px-8 py-16 flex flex-col gap-12">
      <div>
        <h1 className="mb-4">Shipping</h1>
        <p className="text-sm text-jisp-grey leading-relaxed">
          {settings?.shipping_information ||
            "We ship nationwide within Malaysia and internationally. Delivery timelines vary by destination."}
        </p>
      </div>
      <div>
        <h2 className="mb-4">Returns</h2>
        <p className="text-sm text-jisp-grey leading-relaxed">
          {settings?.returns_information ||
            "Unworn items with tags attached can be returned within 14 days of delivery."}
        </p>
      </div>
    </div>
  );
}
