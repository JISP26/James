"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button, Input, Select, Textarea, FormField, useToast } from "@jisp/ui";
import { ImageUploader, type UploadedImage } from "./ImageUploader";
import { TagInput } from "./TagInput";

const CATEGORIES = ["Tops", "Bottoms", "Outerwear", "Accessories"];

export interface ProductFormValues {
  id?: string;
  name: string;
  slug: string;
  shortDescription: string;
  fullDescription: string;
  positioning: string;
  category: string;
  tags: string[];
  regularPrice: string;
  salePrice: string;
  costPrice: string;
  sku: string;
  sizes: string[];
  colors: string[];
  inventoryQuantity: string;
  lowStockThreshold: string;
  material: string;
  careInstructions: string;
  sizeGuide: string;
  shippingInformation: string;
  isFeatured: boolean;
  isNewArrival: boolean;
  isLimitedEdition: boolean;
  isPublished: boolean;
  images: UploadedImage[];
  collectionIds: string[];
}

export const emptyProductForm: ProductFormValues = {
  name: "",
  slug: "",
  shortDescription: "",
  fullDescription: "",
  positioning: "",
  category: "",
  tags: [],
  regularPrice: "",
  salePrice: "",
  costPrice: "",
  sku: "",
  sizes: [],
  colors: [],
  inventoryQuantity: "0",
  lowStockThreshold: "5",
  material: "",
  careInstructions: "",
  sizeGuide: "",
  shippingInformation: "",
  isFeatured: false,
  isNewArrival: false,
  isLimitedEdition: false,
  isPublished: false,
  images: [],
  collectionIds: [],
};

export function ProductForm({
  initial,
  collections,
  mode,
}: {
  initial: ProductFormValues;
  collections: { id: string; name: string }[];
  mode: "create" | "edit";
}) {
  const [form, setForm] = useState<ProductFormValues>(initial);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const router = useRouter();
  const { showToast } = useToast();

  function update<K extends keyof ProductFormValues>(key: K, value: ProductFormValues[K]) {
    setForm((f) => ({ ...f, [key]: value }));
    setErrors((e) => ({ ...e, [key]: "" }));
  }

  function validate(): boolean {
    const next: Record<string, string> = {};
    if (!form.name.trim()) next.name = "Product name is required.";
    if (!form.sku.trim()) next.sku = "SKU is required.";
    const regular = Number(form.regularPrice);
    if (!form.regularPrice || isNaN(regular) || regular < 0) next.regularPrice = "Enter a valid regular price.";
    if (form.salePrice) {
      const sale = Number(form.salePrice);
      if (isNaN(sale) || sale < 0) next.salePrice = "Enter a valid sale price.";
      else if (sale > regular) next.salePrice = "Sale price cannot exceed regular price.";
    }
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) {
      showToast("Please fix the errors below.", "error");
      return;
    }
    setSaving(true);
    const payload = {
      name: form.name,
      slug: form.slug,
      shortDescription: form.shortDescription,
      fullDescription: form.fullDescription,
      positioning: form.positioning,
      category: form.category,
      tags: form.tags,
      regularPrice: Number(form.regularPrice),
      salePrice: form.salePrice ? Number(form.salePrice) : null,
      costPrice: form.costPrice ? Number(form.costPrice) : null,
      sku: form.sku,
      sizes: form.sizes,
      colors: form.colors,
      inventoryQuantity: Number(form.inventoryQuantity) || 0,
      lowStockThreshold: Number(form.lowStockThreshold) || 5,
      material: form.material,
      careInstructions: form.careInstructions,
      sizeGuide: form.sizeGuide,
      shippingInformation: form.shippingInformation,
      isFeatured: form.isFeatured,
      isNewArrival: form.isNewArrival,
      isLimitedEdition: form.isLimitedEdition,
      isPublished: form.isPublished,
      images: form.images.map((i) => ({ url: i.url, isMain: i.isMain })),
      collectionIds: form.collectionIds,
    };

    try {
      const res = await fetch(mode === "create" ? "/api/products" : `/api/products/${form.id}`, {
        method: mode === "create" ? "POST" : "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) {
        showToast(data.error || "Failed to save product.", "error");
        setSaving(false);
        return;
      }
      showToast("Product saved.", "success");
      router.push("/products");
      router.refresh();
    } catch {
      showToast("Network error. Please try again.", "error");
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-8 max-w-3xl">
      <section className="bg-jisp-white border border-jisp-light p-6 flex flex-col gap-4">
        <h3>Basics</h3>
        <FormField label="Product Name" htmlFor="name" required error={errors.name}>
          <Input id="name" value={form.name} onChange={(e) => update("name", e.target.value)} error={errors.name} />
        </FormField>
        <FormField label="Product Slug" htmlFor="slug" hint="Leave blank to auto-generate from name">
          <Input id="slug" value={form.slug} onChange={(e) => update("slug", e.target.value)} />
        </FormField>
        <FormField label="Short Description" htmlFor="shortDescription">
          <Textarea id="shortDescription" rows={2} value={form.shortDescription} onChange={(e) => update("shortDescription", e.target.value)} />
        </FormField>
        <FormField label="Full Description" htmlFor="fullDescription">
          <Textarea id="fullDescription" rows={5} value={form.fullDescription} onChange={(e) => update("fullDescription", e.target.value)} />
        </FormField>
        <FormField label="Product Positioning" htmlFor="positioning" hint="One-line brand positioning statement">
          <Input id="positioning" value={form.positioning} onChange={(e) => update("positioning", e.target.value)} />
        </FormField>
        <div className="grid sm:grid-cols-2 gap-4">
          <FormField label="Category" htmlFor="category">
            <Select id="category" value={form.category} onChange={(e) => update("category", e.target.value)}>
              <option value="">Select Category</option>
              {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
            </Select>
          </FormField>
          <FormField label="Tags" htmlFor="tags">
            <TagInput values={form.tags} onChange={(v) => update("tags", v)} />
          </FormField>
        </div>
        <FormField label="Collections" htmlFor="collections">
          <div className="flex flex-wrap gap-2">
            {collections.map((c) => {
              const active = form.collectionIds.includes(c.id);
              return (
                <button
                  key={c.id}
                  type="button"
                  onClick={() =>
                    update(
                      "collectionIds",
                      active ? form.collectionIds.filter((id) => id !== c.id) : [...form.collectionIds, c.id]
                    )
                  }
                  className={`px-3 py-1.5 text-xs border ${active ? "bg-jisp-black text-white border-jisp-black" : "border-jisp-light"}`}
                >
                  {c.name}
                </button>
              );
            })}
            {collections.length === 0 && <span className="text-xs text-jisp-grey">No collections yet.</span>}
          </div>
        </FormField>
      </section>

      <section className="bg-jisp-white border border-jisp-light p-6 flex flex-col gap-4">
        <h3>Images</h3>
        <ImageUploader images={form.images} onChange={(imgs) => update("images", imgs)} />
      </section>

      <section className="bg-jisp-white border border-jisp-light p-6 flex flex-col gap-4">
        <h3>Pricing &amp; Inventory</h3>
        <div className="grid sm:grid-cols-3 gap-4">
          <FormField label="Regular Price (RM)" htmlFor="regularPrice" required error={errors.regularPrice}>
            <Input id="regularPrice" type="number" step="0.01" value={form.regularPrice} onChange={(e) => update("regularPrice", e.target.value)} error={errors.regularPrice} />
          </FormField>
          <FormField label="Sale Price (RM)" htmlFor="salePrice" error={errors.salePrice}>
            <Input id="salePrice" type="number" step="0.01" value={form.salePrice} onChange={(e) => update("salePrice", e.target.value)} error={errors.salePrice} />
          </FormField>
          <FormField label="Cost Price (RM)" htmlFor="costPrice" hint="Admin only — never shown to customers">
            <Input id="costPrice" type="number" step="0.01" value={form.costPrice} onChange={(e) => update("costPrice", e.target.value)} />
          </FormField>
        </div>
        <FormField label="SKU" htmlFor="sku" required error={errors.sku}>
          <Input id="sku" value={form.sku} onChange={(e) => update("sku", e.target.value)} error={errors.sku} />
        </FormField>
        <div className="grid sm:grid-cols-2 gap-4">
          <FormField label="Inventory Quantity" htmlFor="inventoryQuantity">
            <Input id="inventoryQuantity" type="number" min={0} value={form.inventoryQuantity} onChange={(e) => update("inventoryQuantity", e.target.value)} />
          </FormField>
          <FormField label="Low Stock Warning" htmlFor="lowStockThreshold" hint="Alert threshold">
            <Input id="lowStockThreshold" type="number" min={0} value={form.lowStockThreshold} onChange={(e) => update("lowStockThreshold", e.target.value)} />
          </FormField>
        </div>
        <div className="grid sm:grid-cols-2 gap-4">
          <FormField label="Sizes" htmlFor="sizes">
            <TagInput values={form.sizes} onChange={(v) => update("sizes", v)} placeholder="e.g. S, M, L" />
          </FormField>
          <FormField label="Colors" htmlFor="colors">
            <TagInput values={form.colors} onChange={(v) => update("colors", v)} placeholder="e.g. Black, White" />
          </FormField>
        </div>
      </section>

      <section className="bg-jisp-white border border-jisp-light p-6 flex flex-col gap-4">
        <h3>Product Details</h3>
        <FormField label="Material" htmlFor="material">
          <Input id="material" value={form.material} onChange={(e) => update("material", e.target.value)} />
        </FormField>
        <FormField label="Care Instructions" htmlFor="careInstructions">
          <Textarea id="careInstructions" rows={2} value={form.careInstructions} onChange={(e) => update("careInstructions", e.target.value)} />
        </FormField>
        <FormField label="Size Guide" htmlFor="sizeGuide">
          <Textarea id="sizeGuide" rows={2} value={form.sizeGuide} onChange={(e) => update("sizeGuide", e.target.value)} />
        </FormField>
        <FormField label="Shipping Information" htmlFor="shippingInformation">
          <Textarea id="shippingInformation" rows={2} value={form.shippingInformation} onChange={(e) => update("shippingInformation", e.target.value)} />
        </FormField>
      </section>

      <section className="bg-jisp-white border border-jisp-light p-6 flex flex-col gap-3">
        <h3>Flags &amp; Status</h3>
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={form.isFeatured} onChange={(e) => update("isFeatured", e.target.checked)} />
          Featured Product
        </label>
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={form.isNewArrival} onChange={(e) => update("isNewArrival", e.target.checked)} />
          New Arrival
        </label>
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={form.isLimitedEdition} onChange={(e) => update("isLimitedEdition", e.target.checked)} />
          Limited Edition
        </label>
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={form.isPublished} onChange={(e) => update("isPublished", e.target.checked)} />
          Published (visible on Storefront)
        </label>
      </section>

      <div className="flex gap-3">
        <Button type="submit" variant="primary" size="lg" isLoading={saving}>
          {mode === "create" ? "Create Product" : "Save Changes"}
        </Button>
        <Button type="button" variant="ghost" size="lg" onClick={() => router.push("/products")}>
          Cancel
        </Button>
      </div>
    </form>
  );
}
