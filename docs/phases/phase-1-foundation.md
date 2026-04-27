# Phase 1 — Foundation

## Goal

Stand up the project shell, the database schema, authentication, and a read-only product catalog. By the end of this phase the app should:

- Run locally and deploy to Vercel.
- Authenticate users via Clerk.
- Show products, categories, and brands on the storefront.
- Have one matching API route handler for every web feature shipped.

## Dependencies

None — this is the starting phase.

## Deliverables

- Next.js 16 + Bun + Tailwind CSS v4 + shadcn/ui project running.
- Prisma schema applied to a Supabase Postgres.
- `humanOrderId` sequence created.
- Clerk wired up: sign-in, sign-up, proxy guard.
- Clerk webhook → user sync.
- Storefront pages: `/`, `/products`, `/products/[slug]`, `/categories/[slug]`.
- API route handlers: `/api/products`, `/api/products/[slug]`, `/api/categories`, `/api/brands`, `/api/webhooks/clerk`.

## Linked docs

- `architecture/01-overview.md`
- `architecture/02-tech-stack.md`
- `architecture/03-system-architecture.md`
- `architecture/05-database-schema.md`
- `architecture/07-project-structure.md`
- `architecture/08-conventions.md`
- `architecture/09-environment-and-deploy.md`
- `integrations/01-clerk-auth.md`
- `integrations/05-nuqs-url-state.md`
- `storefront/00-overview.md`
- `storefront/01-home.md`
- `storefront/02-product-catalog.md`
- `storefront/03-product-detail.md`

## Tasks

### 1. Project shell

- [ ] `bun create next-app@latest` with TypeScript, Tailwind, App Router, no `src/`.
- [ ] Set up `tailwind.config.ts` for v4 and shadcn/ui.
- [ ] Install shadcn/ui and add base components (button, input, dialog, sheet, badge, table, dropdown-menu).
- [ ] Configure `tsconfig.json` with `strict: true`, no `any`.
- [ ] Add `package.json` scripts using `bunx` (no `npx`).
- [ ] Set up the project directory layout per `architecture/07-project-structure.md`. Create empty `features/`, `lib/`, `emails/`, `types/` directories with placeholder `.gitkeep` files where empty.

### 2. Database & Prisma

- [ ] Create a Supabase project. Note both pooler and direct URLs.
- [ ] Set `DATABASE_URL` (pooler) and `DIRECT_URL` in `.env.local`.
- [ ] Add `prisma/schema.prisma` with the full schema from `architecture/05-database-schema.md`.
- [ ] Run `bunx prisma migrate dev --name init`.
- [ ] Run `bunx prisma generate`.
- [ ] In Supabase SQL editor, run: `CREATE SEQUENCE order_human_id_seq START 1;`.
- [ ] Add `lib/prisma.ts` Prisma singleton.
- [ ] Seed minimal data: a few categories, subcategories, brands, and ~20 products. Provide a `prisma/seed.ts`.

### 3. Clerk authentication

- [ ] Create a Clerk application. Configure email + password and Google OAuth as sign-in methods.
- [ ] Add `@clerk/nextjs` and configure the provider in `app/layout.tsx`.
- [ ] Add Clerk env vars from `architecture/09-environment-and-deploy.md`.
- [ ] Add Clerk hosted sign-in/sign-up pages at `app/(auth)/sign-in/[[...sign-in]]/page.tsx` and `app/(auth)/sign-up/[[...sign-up]]/page.tsx`.
- [ ] Implement `proxy.ts` (Next.js middleware) per `integrations/01-clerk-auth.md`:
  - Redirect unauthenticated users from protected routes.
  - Redirect non-MANAGER/ADMIN users from `/admin/*`.
  - Redirect non-ADMIN users from `/admin/settings` and `/admin/users`.
- [ ] Implement Clerk webhook at `app/api/webhooks/clerk/route.ts`:
  - Verify signature with `svix`.
  - Handle `user.created`, `user.updated`, `user.deleted`.
- [ ] Test locally with a tunnel (ngrok or Cloudflare Tunnel).

### 4. nuqs setup

- [ ] Install `nuqs`.
- [ ] Wrap the app in `<NuqsAdapter>` in `app/layout.tsx`.
- [ ] Add `features/products/hooks/useProductParams.ts` per `integrations/05-nuqs-url-state.md`.

### 5. Storefront — read-only catalog

- [ ] Build `app/(storefront)/layout.tsx` with shared nav and footer.
- [ ] `features/home/` — `HomeFeature` per `storefront/01-home.md`. Featured products, category grid, hero.
- [ ] `features/products/` — `ProductsFeature` per `storefront/02-product-catalog.md`. Filters, sort, pagination via nuqs. Service `getProducts(params)`.
- [ ] `features/product-detail/` — `ProductDetailFeature` per `storefront/03-product-detail.md`. Gallery, variants, description, related products. **Skip add-to-cart and reviews for now** — those land in Phase 2 / Phase 5.
- [ ] `features/category/` — `CategoryFeature` (slim wrapper around `getProducts` with category filter).
- [ ] `features/search/` — `SearchFeature` using PostgreSQL full-text search.

### 6. API route handlers (mirror every read above)

- [ ] `app/api/products/route.ts` — GET paginated list with filters (calls the same `getProducts` service).
- [ ] `app/api/products/[slug]/route.ts` — GET single product.
- [ ] `app/api/categories/route.ts` — GET all categories with subcategories.
- [ ] `app/api/brands/route.ts` — GET all brands.
- [ ] All routes use the response envelope from `architecture/06-api-design.md`.

### 7. Vercel deployment

- [ ] Create the Vercel project and link the repo.
- [ ] Add all env vars to Vercel.
- [ ] Configure the build command (`bunx prisma generate && next build`).
- [ ] Set up production Clerk webhook to point at `https://yourdomain.com/api/webhooks/clerk`.
- [ ] First production deploy.

## Acceptance criteria

- [ ] `bun run dev` starts the app cleanly.
- [ ] `bunx prisma migrate dev` and `bunx prisma generate` both succeed.
- [ ] `CREATE SEQUENCE order_human_id_seq` ran (verify in SQL editor).
- [ ] Sign-up creates a row in `users` with role = USER (Clerk webhook verified locally).
- [ ] Sign-out works.
- [ ] `/`, `/products`, `/products/[slug]`, `/categories/[slug]`, `/search` all render.
- [ ] Filters and sort change the URL via nuqs and re-render the server component with new data.
- [ ] `/admin/*` redirects to `/` for USER role and to `/sign-in` when unauthenticated.
- [ ] All API routes return the standard envelope and correct status codes.
- [ ] Production deploy on Vercel works.
- [ ] Production Clerk webhook fires on real sign-ups.

## What is **not** in this phase

- Cart, checkout, payments → Phase 2.
- Account area, addresses, wishlist → Phase 3.
- Admin dashboard → Phase 4.
- Reviews, analytics, banners → Phase 5.
- Mobile app → Phase 6.
