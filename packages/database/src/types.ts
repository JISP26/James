// Shared database types for JISP (Storefront + Admin).
// These mirror the Postgres schema in supabase/migrations/0001_init.sql

export type OrderStatus =
  | "New Order"
  | "Pending Payment"
  | "Paid"
  | "Processing"
  | "Shipped"
  | "Completed"
  | "Cancelled";

export type PaymentMethod =
  | "Bank Transfer"
  | "DuitNow"
  | "Cash on Delivery"
  | "Payment Gateway";

export type PaymentStatus = "Unpaid" | "Paid" | "Refunded";

export interface Collection {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  cover_image_url: string | null;
  sort_order: number;
  is_visible: boolean;
  created_at: string;
  updated_at: string;
}

export interface ProductImage {
  id: string;
  product_id: string;
  url: string;
  sort_order: number;
  is_main: boolean;
  created_at: string;
}

export interface ProductVariant {
  id: string;
  product_id: string;
  size: string | null;
  color: string | null;
  sku_suffix: string | null;
  inventory_quantity: number;
  created_at: string;
  updated_at: string;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  short_description: string | null;
  full_description: string | null;
  positioning: string | null;
  category: string | null;
  tags: string[] | null;
  regular_price: number;
  sale_price: number | null;
  cost_price: number | null; // admin only, never sent to storefront
  sku: string;
  sizes: string[] | null;
  colors: string[] | null;
  inventory_quantity: number;
  low_stock_threshold: number;
  material: string | null;
  care_instructions: string | null;
  size_guide: string | null;
  shipping_information: string | null;
  is_featured: boolean;
  is_new_arrival: boolean;
  is_limited_edition: boolean;
  is_published: boolean;
  created_at: string;
  updated_at: string;
  images?: ProductImage[];
  variants?: ProductVariant[];
  collections?: Collection[];
}

// Public-safe product (no cost_price) used on storefront
export type PublicProduct = Omit<Product, "cost_price">;

export interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  created_at: string;
  updated_at: string;
}

export interface Address {
  id: string;
  customer_id: string | null;
  order_id: string | null;
  line1: string;
  line2: string | null;
  city: string;
  state: string;
  postcode: string;
  country: string;
  created_at: string;
}

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string | null;
  product_name: string;
  product_image_url: string | null;
  sku: string;
  size: string | null;
  color: string | null;
  unit_price: number;
  quantity: number;
  line_total: number;
  created_at: string;
}

export interface Order {
  id: string;
  order_number: string;
  customer_id: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  delivery_method: string;
  payment_method: PaymentMethod;
  payment_status: PaymentStatus;
  status: OrderStatus;
  subtotal: number;
  delivery_fee: number;
  grand_total: number;
  customer_note: string | null;
  created_at: string;
  updated_at: string;
  items?: OrderItem[];
  address?: Address;
}

export interface SiteSettings {
  id: string;
  hero_image_url: string | null;
  hero_title: string;
  hero_subtitle: string;
  hero_button_text: string;
  featured_collection_id: string | null;
  brand_story: string;
  about_content: string;
  instagram_url: string | null;
  whatsapp_url: string | null;
  contact_email: string | null;
  shipping_information: string;
  returns_information: string;
  footer_content: string;
  updated_at: string;
}
