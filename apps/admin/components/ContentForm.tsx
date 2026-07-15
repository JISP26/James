"use client";

import { useState } from "react";
import { Button, Input, Textarea, FormField, useToast } from "@jisp/ui";
import { ImageUploader, type UploadedImage } from "./ImageUploader";

export interface ContentFormValues {
  heroImageUrl: string;
  heroTitle: string;
  heroSubtitle: string;
  heroButtonText: string;
  featuredCollectionId: string;
  brandStory: string;
  aboutContent: string;
  instagramUrl: string;
  whatsappUrl: string;
  contactEmail: string;
  shippingInformation: string;
  returnsInformation: string;
  footerContent: string;
}

export function ContentForm({
  initial,
  collections,
}: {
  initial: ContentFormValues;
  collections: { id: string; name: string }[];
}) {
  const [form, setForm] = useState(initial);
  const [heroImages, setHeroImages] = useState<UploadedImage[]>(
    initial.heroImageUrl ? [{ url: initial.heroImageUrl, isMain: true }] : []
  );
  const [saving, setSaving] = useState(false);
  const { showToast } = useToast();

  function update<K extends keyof ContentFormValues>(key: K, value: ContentFormValues[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    const res = await fetch("/api/settings", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, heroImageUrl: heroImages[0]?.url ?? null }),
    });
    const data = await res.json();
    setSaving(false);
    if (!res.ok) {
      showToast(data.error || "Failed to save content.", "error");
      return;
    }
    showToast("Website content updated.", "success");
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-8 max-w-2xl">
      <section className="bg-jisp-white border border-jisp-light p-6 flex flex-col gap-4">
        <h3>Home Hero</h3>
        <ImageUploader images={heroImages} onChange={setHeroImages} folder="site" label="Hero Image" />
        <FormField label="Hero Title" htmlFor="heroTitle">
          <Input id="heroTitle" value={form.heroTitle} onChange={(e) => update("heroTitle", e.target.value)} />
        </FormField>
        <FormField label="Hero Subtitle" htmlFor="heroSubtitle">
          <Input id="heroSubtitle" value={form.heroSubtitle} onChange={(e) => update("heroSubtitle", e.target.value)} />
        </FormField>
        <FormField label="Hero Button Text" htmlFor="heroButtonText">
          <Input id="heroButtonText" value={form.heroButtonText} onChange={(e) => update("heroButtonText", e.target.value)} />
        </FormField>
        <FormField label="Featured Collection" htmlFor="featuredCollectionId">
          <select
            id="featuredCollectionId"
            value={form.featuredCollectionId}
            onChange={(e) => update("featuredCollectionId", e.target.value)}
            className="w-full border border-jisp-light px-4 py-3 text-sm focus:outline-none focus:border-jisp-blue"
          >
            <option value="">None</option>
            {collections.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </FormField>
      </section>

      <section className="bg-jisp-white border border-jisp-light p-6 flex flex-col gap-4">
        <h3>Brand</h3>
        <FormField label="Brand Story" htmlFor="brandStory">
          <Textarea id="brandStory" rows={4} value={form.brandStory} onChange={(e) => update("brandStory", e.target.value)} />
        </FormField>
        <FormField label="About JISP Content" htmlFor="aboutContent">
          <Textarea id="aboutContent" rows={5} value={form.aboutContent} onChange={(e) => update("aboutContent", e.target.value)} />
        </FormField>
      </section>

      <section className="bg-jisp-white border border-jisp-light p-6 flex flex-col gap-4">
        <h3>Contact &amp; Social</h3>
        <FormField label="Instagram Link" htmlFor="instagramUrl">
          <Input id="instagramUrl" value={form.instagramUrl} onChange={(e) => update("instagramUrl", e.target.value)} />
        </FormField>
        <FormField label="WhatsApp Link" htmlFor="whatsappUrl">
          <Input id="whatsappUrl" value={form.whatsappUrl} onChange={(e) => update("whatsappUrl", e.target.value)} />
        </FormField>
        <FormField label="Contact Email" htmlFor="contactEmail">
          <Input id="contactEmail" type="email" value={form.contactEmail} onChange={(e) => update("contactEmail", e.target.value)} />
        </FormField>
      </section>

      <section className="bg-jisp-white border border-jisp-light p-6 flex flex-col gap-4">
        <h3>Policies</h3>
        <FormField label="Shipping Information" htmlFor="shippingInformation">
          <Textarea id="shippingInformation" rows={3} value={form.shippingInformation} onChange={(e) => update("shippingInformation", e.target.value)} />
        </FormField>
        <FormField label="Returns Information" htmlFor="returnsInformation">
          <Textarea id="returnsInformation" rows={3} value={form.returnsInformation} onChange={(e) => update("returnsInformation", e.target.value)} />
        </FormField>
        <FormField label="Footer Content" htmlFor="footerContent">
          <Textarea id="footerContent" rows={2} value={form.footerContent} onChange={(e) => update("footerContent", e.target.value)} />
        </FormField>
      </section>

      <Button type="submit" variant="primary" size="lg" isLoading={saving} className="w-fit">
        Save Website Content
      </Button>
    </form>
  );
}
