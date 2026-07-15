import { getSupabaseServerSessionClient } from "@/lib/supabase-server";
import { ProductForm, emptyProductForm } from "@/components/ProductForm";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Add Product" };
export const dynamic = "force-dynamic";

export default async function NewProductPage() {
  const supabase = getSupabaseServerSessionClient();
  const { data: collections } = await supabase.from("collections").select("id, name").order("sort_order");

  return (
    <div className="flex flex-col gap-6">
      <h1>Add Product</h1>
      <ProductForm initial={emptyProductForm} collections={collections ?? []} mode="create" />
    </div>
  );
}
