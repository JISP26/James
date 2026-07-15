# Deploying JISP

JISP deploys as **two separate Vercel projects** from the same monorepo,
both pointed at the same Supabase project.

## 1. Supabase (one-time)

1. Create a project at supabase.com.
2. SQL Editor → run `supabase/migrations/0001_init.sql`, then
   `supabase/migrations/0002_storage.sql`, then (optional) `supabase/seed.sql`.
3. Authentication → Users → Add User → create your admin login.
4. Run `supabase/BOOTSTRAP_ADMIN.sql` (edit the UUID/email/name first) to
   grant that user Admin access.
5. Note down, from Project Settings → API:
   - Project URL
   - `anon` public key
   - `service_role` secret key (keep this one out of the browser, always)

## 2. Storefront → Vercel project #1

- Import the repo into Vercel, set **Root Directory** to `apps/storefront`.
- Framework preset: Next.js (auto-detected).
- Environment variables (Project Settings → Environment Variables):
  - `NEXT_PUBLIC_SUPABASE_URL`
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
  - `SUPABASE_SERVICE_ROLE_KEY` (used only inside `app/api/checkout` and
    the order-success Server Component — never exposed to the browser)
  - `NEXT_PUBLIC_SITE_URL` = your production storefront URL
  - `PAYMENT_GATEWAY_PROVIDER` / `PAYMENT_GATEWAY_SECRET_KEY` /
    `PAYMENT_GATEWAY_PUBLIC_KEY` — leave blank until you integrate a real
    gateway
- Assign the domain: `www.jisp.com` or `shop.jisp.com`.
- Deploy.

## 3. Admin → Vercel project #2

- Import the **same repo** again as a second Vercel project, Root
  Directory `apps/admin`.
- Environment variables:
  - `NEXT_PUBLIC_SUPABASE_URL`
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
  - `SUPABASE_SERVICE_ROLE_KEY`
  - `NEXT_PUBLIC_SITE_URL` = your production admin URL
  - `NEXT_PUBLIC_STOREFRONT_URL` = your production storefront URL
- Assign the domain: `admin.jisp.com`.
- **Recommended:** in Vercel → Deployment Protection, additionally restrict
  the Admin project (e.g. Vercel Authentication / IP allowlist) as
  defense-in-depth on top of the app's own Supabase-Auth login gate.
- Deploy.

## 4. Verify after deploy

- Visit the Storefront: Home loads, Shop filters work, add a product to
  cart, complete checkout with each of the three active payment methods,
  confirm the order lands in Admin → Orders with status "New Order".
- Visit the Admin domain directly while logged out — you should be
  redirected to `/login`, never see a protected page.
- Log in, publish/unpublish a product, confirm it appears/disappears on
  the Storefront (may take up to the page's `revalidate` window, 30–60s,
  or a hard refresh).
- Upload a product image from Admin → Products and confirm it renders on
  the Storefront via the `jisp-media` Storage bucket.

## Rotating keys / security notes

- If `SUPABASE_SERVICE_ROLE_KEY` is ever exposed, rotate it immediately in
  Supabase → Project Settings → API, then update it in both Vercel
  projects' environment variables and redeploy.
- The service role key must only ever appear in Vercel environment
  variables and `.env.local` (git-ignored) — never commit it, never log
  it, never send it to the browser.
