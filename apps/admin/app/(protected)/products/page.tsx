"use client";

import Link from "next/link";
import { useEffect, useState, useCallback } from "react";
import { Button, Input, Select, EmptyState, PageLoading, ErrorState, ConfirmDialog, useToast } from "@jisp/ui";

interface ProductRow {
  id: string;
  name: string;
  sku: string;
  category: string | null;
  regular_price: number;
  sale_price: number | null;
  inventory_quantity: number;
  low_stock_threshold: number;
  is_published: boolean;
  images: { url: string; is_main: boolean }[];
}

export default function ProductsPage() {
  const [products, setProducts] = useState<ProductRow[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [status, setStatus] = useState("");
  const [stock, setStock] = useState("");
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const { showToast } = useToast();

  const load = useCallback(async () => {
    setError(null);
    const params = new URLSearchParams();
    if (search) params.set("search", search);
    if (category) params.set("category", category);
    if (status) params.set("status", status);
    if (stock) params.set("stock", stock);
    try {
      const res = await fetch(`/api/products?${params.toString()}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to load products.");
      setProducts(data.products);
    } catch (e: any) {
      setError(e.message);
    }
  }, [search, category, status, stock]);

  useEffect(() => {
    load();
  }, [load]);

  async function togglePublish(id: string, current: boolean) {
    const res = await fetch(`/api/products/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isPublished: !current }),
    });
    if (res.ok) {
      showToast(!current ? "Product published." : "Product unpublished.", "success");
      load();
    } else {
      showToast("Failed to update product.", "error");
    }
  }

  async function duplicate(id: string) {
    const res = await fetch(`/api/products/${id}/duplicate`, { method: "POST" });
    if (res.ok) {
      showToast("Product duplicated.", "success");
      load();
    } else {
      showToast("Failed to duplicate product.", "error");
    }
  }

  async function handleDelete() {
    if (!confirmDeleteId) return;
    const res = await fetch(`/api/products/${confirmDeleteId}`, { method: "DELETE" });
    setConfirmDeleteId(null);
    if (res.ok) {
      showToast("Product deleted.", "success");
      load();
    } else {
      showToast("Failed to delete product.", "error");
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <h1>Products</h1>
        <Link href="/products/new">
          <Button variant="primary">+ Add Product</Button>
        </Link>
      </div>

      <div className="flex flex-wrap gap-3">
        <Input
          placeholder="Search products..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-xs"
          aria-label="Search products"
        />
        <Select value={category} onChange={(e) => setCategory(e.target.value)} className="max-w-[160px]" aria-label="Filter by category">
          <option value="">All Categories</option>
          <option value="Tops">Tops</option>
          <option value="Bottoms">Bottoms</option>
          <option value="Outerwear">Outerwear</option>
          <option value="Accessories">Accessories</option>
        </Select>
        <Select value={status} onChange={(e) => setStatus(e.target.value)} className="max-w-[160px]" aria-label="Filter by status">
          <option value="">All Status</option>
          <option value="published">Published</option>
          <option value="draft">Draft</option>
        </Select>
        <Select value={stock} onChange={(e) => setStock(e.target.value)} className="max-w-[160px]" aria-label="Filter by stock">
          <option value="">All Stock</option>
          <option value="in-stock">In Stock</option>
          <option value="low-stock">Low Stock</option>
          <option value="out-of-stock">Out of Stock</option>
        </Select>
      </div>

      {products === null && !error && <PageLoading label="Loading products" />}
      {error && <ErrorState description={error} onRetry={load} />}
      {products && products.length === 0 && (
        <EmptyState title="No products found" description="Try adjusting your filters, or add a new product." />
      )}
      {products && products.length > 0 && (
        <div className="bg-jisp-white border border-jisp-light overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs uppercase tracking-wider text-jisp-grey border-b border-jisp-light">
                <th className="p-3">Product</th>
                <th className="p-3">SKU</th>
                <th className="p-3">Category</th>
                <th className="p-3">Price</th>
                <th className="p-3">Stock</th>
                <th className="p-3">Status</th>
                <th className="p-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map((p) => {
                const main = p.images?.find((i) => i.is_main)?.url ?? p.images?.[0]?.url;
                const lowStock = p.inventory_quantity > 0 && p.inventory_quantity <= p.low_stock_threshold;
                return (
                  <tr key={p.id} className="border-b border-jisp-light last:border-0 hover:bg-jisp-blue-hover">
                    <td className="p-3">
                      <div className="flex items-center gap-3">
                        {main ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={main} alt="" className="h-10 w-8 object-cover" />
                        ) : (
                          <div className="h-10 w-8 bg-jisp-light" />
                        )}
                        <Link href={`/products/${p.id}/edit`} className="hover:text-jisp-blue">{p.name}</Link>
                      </div>
                    </td>
                    <td className="p-3">{p.sku}</td>
                    <td className="p-3">{p.category || "—"}</td>
                    <td className="p-3">
                      {p.sale_price ? (
                        <span>RM {p.sale_price.toFixed(2)} <span className="text-jisp-grey line-through">RM {p.regular_price.toFixed(2)}</span></span>
                      ) : (
                        <span>RM {p.regular_price.toFixed(2)}</span>
                      )}
                    </td>
                    <td className="p-3">
                      {p.inventory_quantity === 0 ? (
                        <span className="text-red-600">Out of Stock</span>
                      ) : lowStock ? (
                        <span className="text-amber-600">{p.inventory_quantity} (Low)</span>
                      ) : (
                        p.inventory_quantity
                      )}
                    </td>
                    <td className="p-3">
                      <button
                        onClick={() => togglePublish(p.id, p.is_published)}
                        className={`text-xs px-2 py-1 ${p.is_published ? "bg-jisp-black text-white" : "bg-jisp-light text-jisp-grey"}`}
                      >
                        {p.is_published ? "Published" : "Draft"}
                      </button>
                    </td>
                    <td className="p-3">
                      <div className="flex gap-3 text-xs">
                        <Link href={`/products/${p.id}/edit`} className="underline underline-offset-4 hover:text-jisp-blue">Edit</Link>
                        <button onClick={() => duplicate(p.id)} className="underline underline-offset-4 hover:text-jisp-blue">Duplicate</button>
                        <button onClick={() => setConfirmDeleteId(p.id)} className="underline underline-offset-4 hover:text-red-600">Delete</button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      <ConfirmDialog
        open={!!confirmDeleteId}
        title="Delete Product"
        description="This action cannot be undone. The product will be permanently removed."
        confirmLabel="Delete"
        destructive
        onConfirm={handleDelete}
        onCancel={() => setConfirmDeleteId(null)}
      />
    </div>
  );
}
