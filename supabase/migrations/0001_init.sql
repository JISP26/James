-- ============================================================================
-- JISP (Journey in Sculpture) — Initial schema
-- Run against a Supabase Postgres project (SQL Editor or `supabase db push`)
-- ============================================================================

create extension if not exists "pgcrypto";

-- ----------------------------------------------------------------------------
-- updated_at trigger helper
-- ----------------------------------------------------------------------------
create or replace function set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- ----------------------------------------------------------------------------
-- admin_users
-- Maps Supabase Auth users (auth.users) to admin roles. A row here is what
-- grants access to the Admin app — creating an auth user alone is not enough.
-- ----------------------------------------------------------------------------
create table if not exists admin_users (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null,
  email text not null unique,
  role text not null default 'admin' check (role in ('admin', 'staff')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create trigger trg_admin_users_updated_at before update on admin_users
  for each row execute function set_updated_at();

-- ----------------------------------------------------------------------------
-- collections
-- ----------------------------------------------------------------------------
create table if not exists collections (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  description text,
  cover_image_url text,
  sort_order integer not null default 0,
  is_visible boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists idx_collections_sort_order on collections(sort_order);
create trigger trg_collections_updated_at before update on collections
  for each row execute function set_updated_at();

-- ----------------------------------------------------------------------------
-- products
-- ----------------------------------------------------------------------------
create table if not exists products (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  short_description text,
  full_description text,
  positioning text,
  category text,
  tags text[] default '{}',
  regular_price numeric(10,2) not null check (regular_price >= 0),
  sale_price numeric(10,2) check (sale_price is null or sale_price >= 0),
  cost_price numeric(10,2) check (cost_price is null or cost_price >= 0), -- admin only
  sku text not null unique,
  sizes text[] default '{}',
  colors text[] default '{}',
  inventory_quantity integer not null default 0 check (inventory_quantity >= 0),
  low_stock_threshold integer not null default 5,
  material text,
  care_instructions text,
  size_guide text,
  shipping_information text,
  is_featured boolean not null default false,
  is_new_arrival boolean not null default false,
  is_limited_edition boolean not null default false,
  is_published boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint sale_price_lower check (sale_price is null or sale_price <= regular_price)
);
create index if not exists idx_products_published on products(is_published);
create index if not exists idx_products_category on products(category);
create index if not exists idx_products_featured on products(is_featured) where is_featured;
create index if not exists idx_products_new_arrival on products(is_new_arrival) where is_new_arrival;
create index if not exists idx_products_created_at on products(created_at desc);
create index if not exists idx_products_name_trgm on products using gin (to_tsvector('english', name));
create trigger trg_products_updated_at before update on products
  for each row execute function set_updated_at();

-- ----------------------------------------------------------------------------
-- product_images
-- ----------------------------------------------------------------------------
create table if not exists product_images (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references products(id) on delete cascade,
  url text not null,
  sort_order integer not null default 0,
  is_main boolean not null default false,
  created_at timestamptz not null default now()
);
create index if not exists idx_product_images_product on product_images(product_id);

-- ----------------------------------------------------------------------------
-- product_variants (size/color specific stock, optional — falls back to
-- products.inventory_quantity when a product has no variant rows)
-- ----------------------------------------------------------------------------
create table if not exists product_variants (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references products(id) on delete cascade,
  size text,
  color text,
  sku_suffix text,
  inventory_quantity integer not null default 0 check (inventory_quantity >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (product_id, size, color)
);
create index if not exists idx_product_variants_product on product_variants(product_id);
create trigger trg_product_variants_updated_at before update on product_variants
  for each row execute function set_updated_at();

-- ----------------------------------------------------------------------------
-- product_collections (many-to-many)
-- ----------------------------------------------------------------------------
create table if not exists product_collections (
  product_id uuid not null references products(id) on delete cascade,
  collection_id uuid not null references collections(id) on delete cascade,
  primary key (product_id, collection_id)
);
create index if not exists idx_product_collections_collection on product_collections(collection_id);

-- ----------------------------------------------------------------------------
-- customers (created/updated from guest checkout — no auth account required)
-- ----------------------------------------------------------------------------
create table if not exists customers (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null unique,
  phone text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists idx_customers_email on customers(email);
create trigger trg_customers_updated_at before update on customers
  for each row execute function set_updated_at();

-- ----------------------------------------------------------------------------
-- addresses
-- ----------------------------------------------------------------------------
create table if not exists addresses (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid references customers(id) on delete set null,
  order_id uuid,
  line1 text not null,
  line2 text,
  city text not null,
  state text not null,
  postcode text not null,
  country text not null default 'Malaysia',
  created_at timestamptz not null default now()
);
create index if not exists idx_addresses_customer on addresses(customer_id);
create index if not exists idx_addresses_order on addresses(order_id);

-- ----------------------------------------------------------------------------
-- orders
-- ----------------------------------------------------------------------------
create table if not exists orders (
  id uuid primary key default gen_random_uuid(),
  order_number text not null unique,
  customer_id uuid not null references customers(id) on delete restrict,
  customer_name text not null,
  customer_email text not null,
  customer_phone text not null,
  delivery_method text not null default 'Standard Delivery',
  payment_method text not null check (payment_method in ('Bank Transfer', 'DuitNow', 'Cash on Delivery', 'Payment Gateway')),
  payment_status text not null default 'Unpaid' check (payment_status in ('Unpaid', 'Paid', 'Refunded')),
  status text not null default 'New Order' check (status in ('New Order', 'Pending Payment', 'Paid', 'Processing', 'Shipped', 'Completed', 'Cancelled')),
  subtotal numeric(10,2) not null check (subtotal >= 0),
  delivery_fee numeric(10,2) not null default 0 check (delivery_fee >= 0),
  grand_total numeric(10,2) not null check (grand_total >= 0),
  customer_note text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists idx_orders_customer on orders(customer_id);
create index if not exists idx_orders_status on orders(status);
create index if not exists idx_orders_created_at on orders(created_at desc);
create index if not exists idx_orders_order_number on orders(order_number);
create trigger trg_orders_updated_at before update on orders
  for each row execute function set_updated_at();

alter table addresses
  add constraint fk_addresses_order foreign key (order_id) references orders(id) on delete cascade;

-- ----------------------------------------------------------------------------
-- order_items (snapshot of product/price at time of purchase)
-- ----------------------------------------------------------------------------
create table if not exists order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references orders(id) on delete cascade,
  product_id uuid references products(id) on delete set null,
  product_name text not null,
  product_image_url text,
  sku text not null,
  size text,
  color text,
  unit_price numeric(10,2) not null check (unit_price >= 0),
  quantity integer not null check (quantity > 0),
  line_total numeric(10,2) not null check (line_total >= 0),
  created_at timestamptz not null default now()
);
create index if not exists idx_order_items_order on order_items(order_id);
create index if not exists idx_order_items_product on order_items(product_id);

-- ----------------------------------------------------------------------------
-- site_settings (single row, editable from Admin > Website Content)
-- ----------------------------------------------------------------------------
create table if not exists site_settings (
  id uuid primary key default gen_random_uuid(),
  hero_image_url text,
  hero_title text not null default 'Journey in Sculpture',
  hero_subtitle text not null default 'Sculpted for the Journey.',
  hero_button_text text not null default 'Shop Collection',
  featured_collection_id uuid references collections(id) on delete set null,
  brand_story text not null default '',
  about_content text not null default '',
  instagram_url text,
  whatsapp_url text,
  contact_email text,
  shipping_information text not null default '',
  returns_information text not null default '',
  footer_content text not null default '',
  updated_at timestamptz not null default now()
);
create trigger trg_site_settings_updated_at before update on site_settings
  for each row execute function set_updated_at();

-- ============================================================================
-- ROW LEVEL SECURITY
-- ============================================================================

alter table admin_users enable row level security;
alter table products enable row level security;
alter table product_images enable row level security;
alter table product_variants enable row level security;
alter table collections enable row level security;
alter table product_collections enable row level security;
alter table customers enable row level security;
alter table addresses enable row level security;
alter table orders enable row level security;
alter table order_items enable row level security;
alter table site_settings enable row level security;

-- Helper: is the current auth user a row in admin_users?
create or replace function is_admin()
returns boolean as $$
  select exists (
    select 1 from admin_users where id = auth.uid()
  );
$$ language sql stable security definer;

-- ---- products: public can read only published rows; admins can do anything
create policy "Public can read published products" on products
  for select using (is_published = true or is_admin());
create policy "Admins manage products" on products
  for all using (is_admin()) with check (is_admin());

-- ---- product_images / product_variants: readable if parent product is
-- published (or caller is admin); writable only by admin
create policy "Public can read images of published products" on product_images
  for select using (
    is_admin() or exists (
      select 1 from products p where p.id = product_images.product_id and p.is_published
    )
  );
create policy "Admins manage product images" on product_images
  for all using (is_admin()) with check (is_admin());

create policy "Public can read variants of published products" on product_variants
  for select using (
    is_admin() or exists (
      select 1 from products p where p.id = product_variants.product_id and p.is_published
    )
  );
create policy "Admins manage product variants" on product_variants
  for all using (is_admin()) with check (is_admin());

-- ---- collections: public reads visible collections; admin manages all
create policy "Public can read visible collections" on collections
  for select using (is_visible = true or is_admin());
create policy "Admins manage collections" on collections
  for all using (is_admin()) with check (is_admin());

create policy "Public can read product_collections of visible items" on product_collections
  for select using (
    is_admin() or exists (
      select 1 from collections c where c.id = product_collections.collection_id and c.is_visible
    )
  );
create policy "Admins manage product_collections" on product_collections
  for all using (is_admin()) with check (is_admin());

-- ---- customers: guests may insert their own record (checkout) but cannot
-- read/update/delete any customer data; only admins can read/manage
create policy "Guests can create a customer record" on customers
  for insert with check (true);
create policy "Admins can read customers" on customers
  for select using (is_admin());
create policy "Admins can update customers" on customers
  for update using (is_admin()) with check (is_admin());
create policy "Admins can delete customers" on customers
  for delete using (is_admin());

-- ---- addresses: guests may insert (checkout); only admins may read/manage
create policy "Guests can create an address" on addresses
  for insert with check (true);
create policy "Admins can read addresses" on addresses
  for select using (is_admin());
create policy "Admins manage addresses" on addresses
  for all using (is_admin()) with check (is_admin());

-- ---- orders: guests may insert (submit order) but cannot read any order
-- back (order confirmation page is served via a server-side service-role
-- lookup, not directly from the browser); admins have full access
create policy "Guests can create an order" on orders
  for insert with check (status = 'New Order' and payment_status = 'Unpaid');
create policy "Admins can read orders" on orders
  for select using (is_admin());
create policy "Admins manage orders" on orders
  for update using (is_admin()) with check (is_admin());
create policy "Admins can delete orders" on orders
  for delete using (is_admin());

-- ---- order_items: guests may insert as part of checkout; only admins read
create policy "Guests can create order items" on order_items
  for insert with check (true);
create policy "Admins can read order items" on order_items
  for select using (is_admin());
create policy "Admins manage order items" on order_items
  for all using (is_admin()) with check (is_admin());

-- ---- site_settings: publicly readable (drives storefront content), only
-- admins can write
create policy "Public can read site settings" on site_settings
  for select using (true);
create policy "Admins manage site settings" on site_settings
  for all using (is_admin()) with check (is_admin());

-- ---- admin_users: an admin can read their own row (used to gate the Admin
-- app after login); only existing admins can manage other admin rows
create policy "Admin can read own row" on admin_users
  for select using (id = auth.uid() or is_admin());
create policy "Admins manage admin_users" on admin_users
  for all using (is_admin()) with check (is_admin());

-- ============================================================================
-- NOTES
-- ============================================================================
-- 1. Checkout inserts (customers/addresses/orders/order_items) are performed
--    from the Storefront's server-side route handler (app/api/checkout) using
--    the SERVICE ROLE key so that price/stock validation happens server-side
--    and totals are never trusted from the browser. The RLS "Guests can..."
--    policies above are a defense-in-depth fallback in case the anon key is
--    ever used directly for a checkout-style insert.
-- 2. cost_price is selected by @jisp/database queries only inside the Admin
--    app; the storefront's PublicProduct type omits it entirely at the
--    TypeScript layer as an additional safeguard.
-- 3. To promote a Supabase Auth user to admin, sign them up (Supabase
--    Dashboard > Authentication) then insert a matching row into
--    admin_users with that auth user's id.
