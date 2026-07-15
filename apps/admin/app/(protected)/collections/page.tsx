"use client";

import { useEffect, useState, useCallback } from "react";
import { Button, Input, Textarea, FormField, ConfirmDialog, PageLoading, useToast } from "@jisp/ui";
import { ImageUploader, type UploadedImage } from "@/components/ImageUploader";

interface Collection {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  cover_image_url: string | null;
  sort_order: number;
  is_visible: boolean;
}

const emptyForm = { id: "", name: "", slug: "", description: "", sortOrder: "0", isVisible: true };

export default function CollectionsPage() {
  const [collections, setCollections] = useState<Collection[] | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [cover, setCover] = useState<UploadedImage[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const { showToast } = useToast();

  const load = useCallback(async () => {
    const res = await fetch("/api/collections");
    const data = await res.json();
    if (res.ok) setCollections(data.collections);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  function startEdit(c: Collection) {
    setEditingId(c.id);
    setForm({
      id: c.id,
      name: c.name,
      slug: c.slug,
      description: c.description ?? "",
      sortOrder: String(c.sort_order),
      isVisible: c.is_visible,
    });
    setCover(c.cover_image_url ? [{ url: c.cover_image_url, isMain: true }] : []);
  }

  function resetForm() {
    setEditingId(null);
    setForm(emptyForm);
    setCover([]);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name.trim()) {
      showToast("Collection name is required.", "error");
      return;
    }
    setSaving(true);
    const payload = {
      name: form.name,
      slug: form.slug || undefined,
      description: form.description,
      coverImageUrl: cover[0]?.url ?? null,
      sortOrder: Number(form.sortOrder) || 0,
      isVisible: form.isVisible,
    };
    const res = await fetch(editingId ? `/api/collections/${editingId}` : "/api/collections", {
      method: editingId ? "PATCH" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    setSaving(false);
    if (!res.ok) {
      showToast(data.error || "Failed to save collection.", "error");
      return;
    }
    showToast("Collection saved.", "success");
    resetForm();
    load();
  }

  async function toggleVisible(c: Collection) {
    await fetch(`/api/collections/${c.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isVisible: !c.is_visible }),
    });
    load();
  }

  async function handleDelete() {
    if (!confirmDeleteId) return;
    const res = await fetch(`/api/collections/${confirmDeleteId}`, { method: "DELETE" });
    setConfirmDeleteId(null);
    if (res.ok) {
      showToast("Collection deleted.", "success");
      load();
    } else {
      showToast("Failed to delete collection.", "error");
    }
  }

  return (
    <div className="flex flex-col gap-8">
      <h1>Collections</h1>

      <form onSubmit={handleSubmit} className="bg-jisp-white border border-jisp-light p-6 flex flex-col gap-4 max-w-xl">
        <h3>{editingId ? "Edit Collection" : "New Collection"}</h3>
        <FormField label="Name" htmlFor="col-name" required>
          <Input id="col-name" value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} />
        </FormField>
        <FormField label="Slug" htmlFor="col-slug" hint="Leave blank to auto-generate">
          <Input id="col-slug" value={form.slug} onChange={(e) => setForm((f) => ({ ...f, slug: e.target.value }))} />
        </FormField>
        <FormField label="Description" htmlFor="col-desc">
          <Textarea id="col-desc" rows={2} value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} />
        </FormField>
        <ImageUploader images={cover} onChange={setCover} folder="collections" label="Cover Image" />
        <FormField label="Sort Order" htmlFor="col-sort">
          <Input id="col-sort" type="number" value={form.sortOrder} onChange={(e) => setForm((f) => ({ ...f, sortOrder: e.target.value }))} />
        </FormField>
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={form.isVisible} onChange={(e) => setForm((f) => ({ ...f, isVisible: e.target.checked }))} />
          Visible on Storefront
        </label>
        <div className="flex gap-3">
          <Button type="submit" variant="primary" isLoading={saving}>
            {editingId ? "Save Changes" : "Create Collection"}
          </Button>
          {editingId && (
            <Button type="button" variant="ghost" onClick={resetForm}>Cancel</Button>
          )}
        </div>
      </form>

      {collections === null && <PageLoading label="Loading collections" />}
      {collections && (
        <div className="bg-jisp-white border border-jisp-light overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs uppercase tracking-wider text-jisp-grey border-b border-jisp-light">
                <th className="p-3">Name</th>
                <th className="p-3">Slug</th>
                <th className="p-3">Order</th>
                <th className="p-3">Visible</th>
                <th className="p-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {collections.map((c) => (
                <tr key={c.id} className="border-b border-jisp-light last:border-0 hover:bg-jisp-blue-hover">
                  <td className="p-3">{c.name}</td>
                  <td className="p-3">{c.slug}</td>
                  <td className="p-3">{c.sort_order}</td>
                  <td className="p-3">
                    <button
                      onClick={() => toggleVisible(c)}
                      className={`text-xs px-2 py-1 ${c.is_visible ? "bg-jisp-black text-white" : "bg-jisp-light text-jisp-grey"}`}
                    >
                      {c.is_visible ? "Visible" : "Hidden"}
                    </button>
                  </td>
                  <td className="p-3">
                    <div className="flex gap-3 text-xs">
                      <button onClick={() => startEdit(c)} className="underline underline-offset-4 hover:text-jisp-blue">Edit</button>
                      <button onClick={() => setConfirmDeleteId(c.id)} className="underline underline-offset-4 hover:text-red-600">Delete</button>
                    </div>
                  </td>
                </tr>
              ))}
              {collections.length === 0 && (
                <tr><td colSpan={5} className="p-6 text-center text-jisp-grey">No collections yet.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      <ConfirmDialog
        open={!!confirmDeleteId}
        title="Delete Collection"
        description="Products in this collection will be unlinked, not deleted."
        confirmLabel="Delete"
        destructive
        onConfirm={handleDelete}
        onCancel={() => setConfirmDeleteId(null)}
      />
    </div>
  );
}
