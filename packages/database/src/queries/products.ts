import type { SupabaseClient } from "@supabase/supabase-js";

export interface ProductFilters {
  search?: string;
  category?: string;
  collectionSlug?: string;
  minPrice?: number;
  maxPrice?: number;
  size?: string;
  color?: string;
  inStockOnly?: boolean;
  sort?: "newest" | "price_asc" | "price_desc" | "featured";
  page?: number;
  pageSize?: number;
}

const PRODUCT_SELECT = `
  *,
  images:product_images(*),
  variants:product_variants(*),
  collections:product_collections(collection:collections(*))
`;

function normalizeProduct(row: any) {
  return {
    ...row,
    collections: (row.collections ?? []).map((pc: any) => pc.collection),
  };
}

export async function fetchPublishedProducts(
  supabase: SupabaseClient,
  filters: ProductFilters = {}
) {
  const {
    search,
    category,
    collectionSlug,
    minPrice,
    maxPrice,
    size,
    color,
    inStockOnly,
    sort = "newest",
    page = 1,
    pageSize = 24,
  } = filters;

  let query = supabase
    .from("products")
    .select(PRODUCT_SELECT, { count: "exact" })
    .eq("is_published", true);

  if (search) {
    query = query.or(
      `name.ilike.%${search}%,short_description.ilike.%${search}%,category.ilike.%${search}%`
    );
  }
  if (category) query = query.eq("category", category);
  if (typeof minPrice === "number")
    query = query.gte("regular_price", minPrice);
  if (typeof maxPrice === "number")
    query = query.lte("regular_price", maxPrice);
  if (size) query = query.contains("sizes", [size]);
  if (color) query = query.contains("colors", [color]);
  if (inStockOnly) query = query.gt("inventory_quantity", 0);

  switch (sort) {
    case "price_asc":
      query = query.order("regular_price", { ascending: true });
      break;
    case "price_desc":
      query = query.order("regular_price", { ascending: false });
      break;
    case "featured":
      query = query.order("is_featured", { ascending: false });
      break;
    default:
      query = query.order("created_at", { ascending: false });
  }

  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;
  query = query.range(from, to);

  const { data, error, count } = await query;
  if (error) throw error;

  let rows = (data ?? []).map(normalizeProduct);

  if (collectionSlug) {
    rows = rows.filter((p: any) =>
      p.collections?.some((c: any) => c?.slug === collectionSlug)
    );
  }

  return { products: rows, total: count ?? rows.length };
}

export async function fetchProductBySlug(
  supabase: SupabaseClient,
  slug: string
) {
  const { data, error } = await supabase
    .from("products")
    .select(PRODUCT_SELECT)
    .eq("slug", slug)
    .eq("is_published", true)
    .maybeSingle();
  if (error) throw error;
  return data ? normalizeProduct(data) : null;
}

export async function fetchRelatedProducts(
  supabase: SupabaseClient,
  category: string | null,
  excludeId: string
) {
  let query = supabase
    .from("products")
    .select(PRODUCT_SELECT)
    .eq("is_published", true)
    .neq("id", excludeId)
    .limit(4);
  if (category) query = query.eq("category", category);
  const { data, error } = await query;
  if (error) throw error;
  return (data ?? []).map(normalizeProduct);
}

export async function fetchCollections(supabase: SupabaseClient) {
  const { data, error } = await supabase
    .from("collections")
    .select("*")
    .eq("is_visible", true)
    .order("sort_order", { ascending: true });
  if (error) throw error;
  return data ?? [];
}

export async function fetchCollectionBySlug(
  supabase: SupabaseClient,
  slug: string
) {
  const { data, error } = await supabase
    .from("collections")
    .select("*")
    .eq("slug", slug)
    .eq("is_visible", true)
    .maybeSingle();
  if (error) throw error;
  return data;
}
