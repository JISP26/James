# JISP — Journey in Sculpture

Full-stack e-commerce MVP: a public **Storefront** and a separate **Admin**
app, sharing one Supabase (Postgres + Auth + Storage) database.

Brand: **JISP (Journey in Sculpture)** — *Wear Your Journey. Sculpted for
the Journey.*

## Monorepo structure

```
jisp/
├─ apps/
│  ├─ storefront/        # Public store — shop.jisp.com (or www.jisp.com)
│  │  ├─ app/            # Home, Shop, Collections, Search, Product, Cart,
│  │  │                  # Checkout, Order Success, About, Shipping &
│  │  │                  # Returns, Contact, /api/checkout, /api/contact
│  │  ├─ components/     # Navbar, MobileMenu, Footer, ProductCard, etc.
│  │  └─ lib/            # Supabase clients, cart store (Zustand + localStorage)
│  └─ admin/             # Admin back office — admin.jisp.com
│     ├─ app/
│     │  ├─ login/
│     │  ├─ (protected)/ # dashboard, products, collections, orders,
│     │  │               # customers, content, settings — all behind
│     │  │               # middleware.ts auth guard
│     │  └─ api/         # products, collections, orders, settings, upload
│     ├─ components/
│     └─ lib/
├─ packages/
│  ├─ ui/                # Shared Tailwind design tokens + React components
│  └─ database/          # Shared Supabase clients, TS types, query helpers
└─ supabase/
   ├─ migrations/0001_init.sql     # Full schema + RLS policies
   ├─ migrations/0002_storage.sql  # Storage bucket + policies
   ├─ seed.sql                     # 4 demo products + collections + site settings
   └─ BOOTSTRAP_ADMIN.sql          # One-time: promote an auth user to admin
```

## Tech stack

Next.js 14 (App Router) · TypeScript · Tailwind CSS · Supabase (Postgres,
Auth, Storage) · Zustand (cart) · deployable to Vercel as two separate
projects pointed at the same Supabase project.

## Getting started

### 1. Create a Supabase project

Create a project at supabase.com, then in the SQL Editor run, in order:

1. `supabase/migrations/0001_init.sql`
2. `supabase/migrations/0002_storage.sql`
3. `supabase/seed.sql` (optional — demo products)

### 2. Create your first admin login

In Supabase Dashboard → Authentication → Users → **Add User**, create an
email + password. Copy that user's UUID, then edit and run
`supabase/BOOTSTRAP_ADMIN.sql` with your real UUID/email/name. Only rows in
`admin_users` can sign in to the Admin app — creating an Auth user alone is
not enough (see the RLS notes at the bottom of `0001_init.sql`).

### 3. Install dependencies

```bash
npm install
```

(This installs both apps and both packages via npm workspaces from the
repo root — no need to install separately in each folder.)

### 4. Configure environment variables

Copy the example files and fill in your Supabase project's URL/keys:

```bash
cp apps/storefront/.env.example apps/storefront/.env.local
cp apps/admin/.env.example apps/admin/.env.local
```

`SUPABASE_SERVICE_ROLE_KEY` is server-only in both apps — it is never
prefixed with `NEXT_PUBLIC_` and is only read inside `app/api/**/route.ts`
handlers (plus one Server Component, the order-success page, which needs
elevated read access because guests can't `SELECT` orders under RLS).

### 5. Run locally

```bash
npm run dev:storefront   # http://localhost:3000
npm run dev:admin        # http://localhost:3001
```

Log in to Admin with the email/password you created in step 2.

## Key architectural decisions

- **Two independent Next.js apps, one database.** Storefront and Admin
  each have their own `package.json`, `next.config.js`, and deploy
  target, but both import `@jisp/database` and talk to the same Supabase
  project — no data duplication.
- **Guest checkout, no customer accounts.** Anyone can browse and check
  out. `customers` rows are created/updated by email as a side effect of
  checkout, purely for the Admin's Customers view and order history.
- **Server-side price/stock validation.** `apps/storefront/app/api/checkout/route.ts`
  re-fetches every product from the database, checks published status,
  required size/color selection, and available stock, and recomputes
  subtotal/delivery fee/grand total itself — the browser's numbers are
  never trusted. See `packages/database/src/queries/orders.ts`.
- **RLS is the real security boundary**, not app-layer checks alone:
  visitors can only `SELECT` published products/visible collections;
  only rows in `admin_users` (linked to `auth.users`) can read/write
  everything else. See the RLS section of `0001_init.sql`.
- **Images never accept a pasted URL.** Admin's `ImageUploader` component
  uploads directly to the `jisp-media` Storage bucket via
  `/api/upload`, which is itself admin-gated.
- **Payment gateway is a placeholder by design** (per the brief). Bank
  Transfer, DuitNow, and Cash on Delivery are fully wired end-to-end;
  `payment_method` also accepts `'Payment Gateway'` in the schema, and
  `apps/storefront/.env.example` reserves `PAYMENT_GATEWAY_*` variables
  for when you connect a real provider (Stripe, Billplz, ToyyibMall,
  etc.) — no schema migration will be needed to add it later.

## Known MVP limitations (documented, not hidden)

- Contact form (`/contact` + `/api/contact`) validates and logs
  submissions but doesn't persist them to a table or send an email yet —
  wire it to Resend/Postmark or a `contact_messages` table when needed.
- Variant-level stock (`product_variants`) is used for server-side
  checkout validation, but the storefront PDP shows the product-level
  `inventory_quantity` for simplicity. For true per-size/color stock
  display, extend `ProductDetailClient` to look up the matching variant.
- Inventory decrement on order creation is best-effort (sequential
  updates), not wrapped in a single DB transaction/stored procedure —
  fine for an MVP's order volume, but worth moving to a Postgres
  function (`FOR UPDATE` + single transaction) before high-concurrency
  production use.
- No automated test suite yet (no CI configured either).

## Deployment

See `DEPLOYMENT.md`.
