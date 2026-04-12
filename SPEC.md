# E-Commerce Platform — Technical Specification

**Version:** 2.0
**Date:** April 2026
**Author:** Mohamed Ghaly
**Status:** Active Reference

---

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [Tech Stack](#2-tech-stack)
3. [System Architecture](#3-system-architecture)
4. [User Roles & Permissions](#4-user-roles--permissions)
5. [Authentication & Auth Flow](#5-authentication--auth-flow)
6. [Client Storefront — Pages & Features](#6-client-storefront--pages--features)
7. [Admin Dashboard — Pages & Features](#7-admin-dashboard--pages--features)
8. [Database Schema](#8-database-schema)
9. [API Design](#9-api-design)
10. [Anonymous Checkout Flow](#10-anonymous-checkout-flow)
11. [Payment Integration — Stripe](#11-payment-integration--stripe)
12. [Media Storage — Cloudinary](#12-media-storage--cloudinary)
13. [Email System — Resend](#13-email-system--resend)
14. [URL State Management — nuqs](#14-url-state-management--nuqs)
15. [Project Structure](#15-project-structure)
16. [Environment Variables](#16-environment-variables)
17. [Deployment](#17-deployment)
18. [Development Conventions](#18-development-conventions)
19. [Build Phases & Roadmap](#19-build-phases--roadmap)

---

## 1. Project Overview

A full-stack e-commerce web application built with Next.js. It serves two audiences from the same codebase:

- **Client storefront** — public-facing product catalog, cart, checkout (registered and anonymous), and account management.
- **Admin dashboard** — internal protected area for managing products, orders, customers, coupons, and analytics.

The Next.js app is the entire backend. There is no separate API service. Data mutations happen via Server Actions, initial data loads happen in Server Components, and a set of REST API route handlers is built alongside the web app to serve a React Native Expo mobile app in a future phase.

### Key Design Goals

- No dedicated backend service — Next.js handles everything via Server Components, Server Actions, and API Route Handlers.
- Anonymous (guest) checkout is a first-class feature — users can complete a purchase with just an email address, no account required.
- API route handlers are built from day one alongside every web feature so the mobile app can be added later without any backend changes.
- Role-based access control enforced at the proxy level before any page or handler runs.
- URL state (filters, pagination, sort) lives in the URL via nuqs — shareable, bookmarkable, and readable server-side without a client round-trip.

### Future Mobile App

The mobile app will be built as a separate React Native Expo project after the web app is complete and stable. It will consume the same API route handlers already built into this Next.js app. No backend changes will be required.

Planned mobile stack: React Native + Expo (managed workflow), TypeScript, Expo Router, `@clerk/expo`, NativeWind, TanStack Query.

---

## 2. Tech Stack

| Layer                     | Technology              | Notes                            |
| ------------------------- | ----------------------- | -------------------------------- |
| Framework                 | Next.js 16 (App Router) |                                  |
| Language                  | TypeScript              | strict mode                      |
| Runtime / Package manager | Bun                     | Never use npm or npx             |
| Styling                   | Tailwind CSS v4         |                                  |
| Component library         | shadcn/ui               | Radix UI primitives              |
| URL state                 | nuqs                    | Type-safe URL search params      |
| Authentication            | Clerk                   | `@clerk/nextjs`                  |
| ORM                       | Prisma                  |                                  |
| Database                  | PostgreSQL via Supabase |                                  |
| Payments                  | Stripe                  | Payment Intents + Webhooks       |
| Media storage             | Cloudinary              | Images, transforms, CDN delivery |
| Email                     | Resend                  | React Email templates            |
| Hosting                   | Vercel                  |                                  |

---

## 3. System Architecture

```
Browser
  │
  │  Cookie (Clerk session)
  ▼
┌─────────────────────────────────────────────────────┐
│              Next.js 16 — Vercel                    │
│                                                     │
│  proxy.ts      Clerk auth + role guard         │
│                     Runs before every request       │
│                                                     │
│  app/(storefront)   Server Components + Actions     │
│                     Client storefront pages         │
│                                                     │
│  app/admin          Server Components + Actions     │
│                     Protected admin dashboard       │
│                                                     │
│  app/api            REST Route Handlers             │
│                     Built now, consumed by mobile   │
│                     app in a future phase           │
└────────────┬────────────────────────────────────────┘
             │
     ┌───────┼──────────────┬──────────────┐
     ▼       ▼              ▼              ▼
 Supabase  Clerk        Cloudinary      Stripe
 Postgres  (identity)   (media + CDN)   (payments)
     │
 Prisma ORM
 (server-side only)
```

### Architectural Rules

- **Server Components** fetch data directly via Prisma — no client-side fetch waterfalls on initial page load.
- **Server Actions** handle all web mutations — no API endpoints needed for the web app itself.
- **API Route Handlers** are thin wrappers around the same service functions used by Server Actions. Built alongside every feature for future mobile consumption.
- **Prisma** is server-only. `DATABASE_URL` is never exposed to the client bundle.
- **Clerk proxy** verifies every request before it reaches any page or handler. Role checks happen here.
- **Users table** is a lightweight Clerk mirror synced via webhooks. Clerk owns identity; the DB owns app data (orders, addresses, cart, etc.).

---

## 4. User Roles & Permissions

Roles are stored in Clerk `publicMetadata.role` and mirrored to the local `users` table via webhook.

| Role      | Description                                                                             |
| --------- | --------------------------------------------------------------------------------------- |
| `USER`    | Default role. Browse, purchase, manage own profile and orders.                          |
| `MANAGER` | Manage products, orders, and view customers. Cannot access settings or role assignment. |
| `ADMIN`   | Full access to all admin features including settings and role management.               |

### Route Protection Matrix

| Route             | Anonymous    | USER | MANAGER      | ADMIN |
| ----------------- | ------------ | ---- | ------------ | ----- |
| `/`               | ✅           | ✅   | ✅           | ✅    |
| `/products/*`     | ✅           | ✅   | ✅           | ✅    |
| `/cart`           | ✅ (session) | ✅   | ✅           | ✅    |
| `/checkout`       | ✅ (guest)   | ✅   | ✅           | ✅    |
| `/account/*`      | ❌           | ✅   | ✅           | ✅    |
| `/admin/*`        | ❌           | ❌   | ✅ (partial) | ✅    |
| `/admin/settings` | ❌           | ❌   | ❌           | ✅    |
| `/admin/users`    | ❌           | ❌   | ❌           | ✅    |

### Role Assignment

- All new signups receive `USER` role automatically via the `user.created` Clerk webhook.
- `MANAGER` and `ADMIN` roles are assigned manually in the Admin Dashboard or Clerk Dashboard.
- There is no public signup path for `ADMIN` — admin accounts are invite-only.

---

## 5. Authentication & Auth Flow

**Package:** `@clerk/nextjs`

### Supported Methods

- Email + password
- Magic link (passwordless email)
- Google OAuth
- Apple OAuth (added when mobile ships)

### How Auth Works

Clerk manages all identity. The local `users` table is a mirror — it exists so that other tables (`orders`, `reviews`, `cart`, etc.) have a FK target with proper relational integrity. The `users.id` column stores the Clerk user ID string (e.g. `user_2abc...`), not a generated cuid. This means `auth()` returns a `userId` that can be used directly as a FK in any Prisma query.

```
Request arrives
      │
      ▼
proxy.ts
  → auth() from @clerk/nextjs/server
  → if protected route and no session → redirect /sign-in
  → if admin route and role !== ADMIN/MANAGER → redirect /
      │
      ▼
Server Component / Server Action
  → const { userId } = await auth()
  → userId used directly as FK in Prisma queries
```

### Clerk Webhook Sync

Endpoint: `POST /api/webhooks/clerk`
Signature verified with the `svix` package.

| Event          | Action                                                    |
| -------------- | --------------------------------------------------------- |
| `user.created` | `prisma.user.create` — id = Clerk ID, role = USER         |
| `user.updated` | `prisma.user.update` — sync name, email, phone            |
| `user.deleted` | `prisma.user.update` — set `active = false` (soft delete) |

```typescript
// app/api/webhooks/clerk/route.ts
import { Webhook } from "svix";
import { headers } from "next/headers";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  const body = await req.text();
  const headersList = await headers();

  const wh = new Webhook(process.env.CLERK_WEBHOOK_SECRET!);

  let event: WebhookEvent;
  try {
    event = wh.verify(body, {
      "svix-id": headersList.get("svix-id")!,
      "svix-timestamp": headersList.get("svix-timestamp")!,
      "svix-signature": headersList.get("svix-signature")!,
    }) as WebhookEvent;
  } catch {
    return new Response("Invalid signature", { status: 400 });
  }

  const { type, data } = event;

  if (type === "user.created") {
    await prisma.user.create({
      data: {
        id: data.id,
        email: data.email_addresses[0].email_address,
        name: `${data.first_name ?? ""} ${data.last_name ?? ""}`.trim() || null,
        phone: data.phone_numbers[0]?.phone_number ?? null,
      },
    });
  }

  if (type === "user.updated") {
    await prisma.user.update({
      where: { id: data.id },
      data: {
        email: data.email_addresses[0].email_address,
        name: `${data.first_name ?? ""} ${data.last_name ?? ""}`.trim() || null,
        phone: data.phone_numbers[0]?.phone_number ?? null,
      },
    });
  }

  if (type === "user.deleted") {
    await prisma.user.update({
      where: { id: data.id },
      data: { active: false },
    });
  }

  return new Response("OK", { status: 200 });
}
```

---

## 6. Client Storefront — Pages & Features

### Route Map

| Route                  | Feature component        | Description                             |
| ---------------------- | ------------------------ | --------------------------------------- |
| `/`                    | `HomeFeature`            | Hero, featured products, category grid  |
| `/products`            | `ProductsFeature`        | Full catalog, filters, sort, pagination |
| `/products/[slug]`     | `ProductDetailFeature`   | Gallery, variants, add to cart, reviews |
| `/categories/[slug]`   | `CategoryFeature`        | Category-filtered product listing       |
| `/search`              | `SearchFeature`          | Full-text search results                |
| `/cart`                | `CartFeature`            | Cart page (drawer also available)       |
| `/checkout`            | `CheckoutFeature`        | Registered + anonymous checkout         |
| `/checkout/success`    | `CheckoutSuccessFeature` | Order confirmation                      |
| `/account`             | `AccountOverviewFeature` | Profile summary                         |
| `/account/orders`      | `OrdersFeature`          | Order history list                      |
| `/account/orders/[id]` | `OrderDetailFeature`     | Order detail + status timeline          |
| `/account/addresses`   | `AddressesFeature`       | Address book CRUD                       |
| `/account/wishlist`    | `WishlistFeature`        | Saved products                          |
| `/sign-in/[[...rest]]` | Clerk hosted UI          |                                         |
| `/sign-up/[[...rest]]` | Clerk hosted UI          |                                         |

### Product Catalog

- Grid / list view toggle
- Filter by: category, subcategory, brand, price range, color, size, rating — all via nuqs URL params
- Sort by: newest, price asc/desc, best rated, most sold
- Full-text search via PostgreSQL `tsvector` (Supabase built-in)
- Cursor-based pagination
- Product card: image, name, price, discount badge, star rating, quick-add to cart

### Product Detail Page

- Image gallery: main image + scrollable thumbnails
- Variant selectors: size, color — stock indicator per selection
- Price: original + discounted price side by side when discount > 0
- Add to cart, add to wishlist
- Customer reviews: aggregate rating breakdown + individual reviews (post-purchase only, verified buyers)
- Related products (same category)

### Cart

- Persistent for registered users — stored in DB, survives browser close
- Session-based for anonymous users — DB row keyed by `sessionToken` cookie, 7-day expiry
- Cart drawer (slide-in panel) available on all pages
- Full cart page at `/cart`
- On sign-in: anonymous cart merges into user cart (same product+variant → sum quantities, otherwise append)
- Shows per item: image, name, variant, quantity stepper, unit price, line total, remove
- Shows totals: subtotal, shipping estimate, coupon code input, grand total

### Account Area (authenticated, USER+)

- **Profile:** Edit name, phone. Avatar managed by Clerk.
- **Orders:** Paginated history with status badge and date. Click through to detail.
- **Order detail:** Line items, quantities, price snapshots, shipping address, status timeline, invoice download link.
- **Addresses:** Add / edit / delete / set default. Supports Egyptian address structure (governorate, area).
- **Wishlist:** Saved products with quick-add to cart or remove.

---

## 7. Admin Dashboard — Pages & Features

All routes under `/admin/*`. Requires `MANAGER` or `ADMIN` role. Has its own layout with sidebar navigation and top bar, separate from the storefront layout.

### Route Map

| Route                   | Feature component            | Access         |
| ----------------------- | ---------------------------- | -------------- |
| `/admin`                | `AdminDashboardFeature`      | MANAGER, ADMIN |
| `/admin/orders`         | `AdminOrdersFeature`         | MANAGER, ADMIN |
| `/admin/orders/[id]`    | `AdminOrderDetailFeature`    | MANAGER, ADMIN |
| `/admin/products`       | `AdminProductsFeature`       | MANAGER, ADMIN |
| `/admin/products/new`   | `AdminProductFormFeature`    | MANAGER, ADMIN |
| `/admin/products/[id]`  | `AdminProductFormFeature`    | MANAGER, ADMIN |
| `/admin/categories`     | `AdminCategoriesFeature`     | MANAGER, ADMIN |
| `/admin/brands`         | `AdminBrandsFeature`         | MANAGER, ADMIN |
| `/admin/customers`      | `AdminCustomersFeature`      | MANAGER, ADMIN |
| `/admin/customers/[id]` | `AdminCustomerDetailFeature` | MANAGER, ADMIN |
| `/admin/coupons`        | `AdminCouponsFeature`        | MANAGER, ADMIN |
| `/admin/analytics`      | `AdminAnalyticsFeature`      | MANAGER, ADMIN |
| `/admin/settings`       | `AdminSettingsFeature`       | ADMIN only     |
| `/admin/users`          | `AdminUsersFeature`          | ADMIN only     |

### Dashboard Home

- Revenue summary cards: today / this week / this month
- Orders by status chart
- Recent orders table (last 10)
- Low stock alerts (products below threshold)
- Top 5 products by revenue

### Orders Management

- Table with nuqs-powered filters: status, date range, payment method
- Search by order ID, customer name, or email
- Order detail: line items, customer info, shipping address, payment status, timeline
- Status transitions: `PENDING → PROCESSING → SHIPPED → DELIVERED`
- Cancel with optional reason; triggers Stripe refund if already paid
- Manual order creation on behalf of a customer

### Products Management

- Searchable, filterable table (status, category, brand)
- Create / edit form:
  - Name, slug (auto-generated, editable), description
  - Category (required), subcategories (multi-select), brand (optional)
  - Main image + gallery via Cloudinary Upload Widget
  - Sizes array, colors array
  - Price, discount %, price after discount (auto-computed on save)
  - Stock quantity, status: DRAFT / ACTIVE / ARCHIVED
- Bulk actions: publish, archive, delete

### Categories & Subcategories

- Full CRUD for categories (name, slug, cover image via Cloudinary)
- Full CRUD for subcategories nested under a parent category

### Brands

- Full CRUD (name, slug, logo image via Cloudinary)

### Customers

- Table: name, email, order count, lifetime value, joined date
- Detail: profile info, full order history, saved addresses, activity log
- Role assignment (ADMIN only): promote to MANAGER, demote to USER

### Coupons

- Create: code (uppercase), discount %, expiry date, max usage limit (0 = unlimited)
- List: active / expired toggle, usage count vs limit bar
- Deactivate / delete

### Analytics

- Revenue: daily / weekly / monthly line chart — date range via nuqs
- Orders: total count, average order value, cancellation rate
- Products: top sellers by revenue and by units
- Customers: new vs returning ratio
- Payments: CASH vs CARD split

### Settings (ADMIN only)

- Store info: name, currency, timezone, support email
- Shipping zones and flat rates
- Tax configuration (per country / region)

### Users (ADMIN only)

- All registered users with current roles
- Change role: USER ↔ MANAGER ↔ ADMIN
- Deactivate / reactivate accounts

---

## 8. Database Schema

**Database:** PostgreSQL via Supabase
**ORM:** Prisma
**Schema file:** `prisma/schema.prisma`

### Connection

Two URLs are required by Supabase. The pooler URL goes through pgBouncer and is used at runtime. The direct URL bypasses the pooler and is only used by Prisma for migrations.

```env
DATABASE_URL  = "postgresql://..."   # pooler (port 6543) — runtime
DIRECT_URL    = "postgresql://..."   # direct (port 5432) — migrations only
```

### Design Decisions

**`User.id` is the Clerk user ID string** (e.g. `user_2abc...`), not a generated cuid. This means `auth()` from `@clerk/nextjs/server` returns a `userId` that is used directly as a FK in Prisma queries — no lookup or mapping step.

**`users` table is a mirror, not a source of truth.** Clerk owns identity. The local table exists only so that `orders`, `reviews`, `cart`, etc. have a valid FK target with proper cascades and join support.

**Price snapshots on `CartItem` and `OrderItem`.** The `price` field is captured at the moment of add/order. Product price changes never retroactively affect existing carts or orders.

**Anonymous support via nullable FKs.** `Cart.userId` and `Order.userId` are nullable. Anonymous carts are keyed by a `sessionToken` cookie. Anonymous orders carry flat `anon_*` columns for contact and shipping info instead of FK references to the `users` and `addresses` tables.

**`humanOrderId` via PostgreSQL sequence.** Generates readable `ORD-000001` style order IDs. Run once after the first migration:

```sql
CREATE SEQUENCE order_human_id_seq START 1;
```

Generate in the Server Action that creates an order:

```typescript
const result = await prisma.$queryRaw<[{ id: string }]>`
  SELECT 'ORD-' || LPAD(nextval('order_human_id_seq')::text, 6, '0') AS id
`;
const humanOrderId = result[0].id; // "ORD-000001"
```

**Ratings recomputed in the application layer.** After any review insert / update / delete, the `reviews.service.ts` calls a Prisma aggregate query to recompute `Product.ratingsAverage` and `Product.ratingsQuantity`.

---

### Full Prisma Schema

```prisma
// ─────────────────────────────────────────────────────────────
// schema.prisma
// ─────────────────────────────────────────────────────────────

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider  = "postgresql"
  url       = env("DATABASE_URL")
  directUrl = env("DIRECT_URL")
}

// ─────────────────────────────────────────
// ENUMS
// ─────────────────────────────────────────

enum Role {
  USER
  MANAGER
  ADMIN
}

enum OrderStatus {
  PENDING
  PROCESSING
  SHIPPED
  DELIVERED
  CANCELLED
  REFUNDED
}

enum PaymentMethod {
  CASH
  CARD
}

enum ProductStatus {
  DRAFT
  ACTIVE
  ARCHIVED
}

// ─────────────────────────────────────────
// USER
// id = Clerk user ID string — NOT a generated cuid.
// This table is a mirror of Clerk, synced via webhooks.
// Clerk owns identity. This table owns app-level relations.
// ─────────────────────────────────────────

model User {
  id        String   @id
  email     String   @unique
  name      String?
  phone     String?  @unique
  role      Role     @default(USER)
  active    Boolean  @default(true)
  createdAt DateTime @default(now()) @map("created_at")
  updatedAt DateTime @updatedAt      @map("updated_at")

  addresses     Address[]
  orders        Order[]
  reviews       Review[]
  cart          Cart?
  wishlist      UserWishlist[]
  notifications Notification[]

  @@map("users")
}

// ─────────────────────────────────────────
// ADDRESS
// ─────────────────────────────────────────

model Address {
  id           String  @id @default(cuid())
  alias        String
  country      String
  governorate  String
  city         String
  area         String
  phone        String
  addressLine1 String  @map("address_line1")
  details      String
  postalCode   Int?    @map("postal_code")
  latitude     Float?
  longitude    Float?
  isDefault    Boolean @default(false) @map("is_default")

  userId String @map("user_id")
  user   User   @relation(fields: [userId], references: [id], onDelete: Cascade)

  orders Order[]

  createdAt DateTime @default(now()) @map("created_at")
  updatedAt DateTime @updatedAt      @map("updated_at")

  @@map("addresses")
}

// ─────────────────────────────────────────
// BRAND
// ─────────────────────────────────────────

model Brand {
  id        String    @id @default(cuid())
  name      String    @unique
  slug      String    @unique
  imageId   String?   @map("image_id")
  imageUrl  String?   @map("image_url")
  products  Product[]
  createdAt DateTime  @default(now()) @map("created_at")
  updatedAt DateTime  @updatedAt      @map("updated_at")

  @@map("brands")
}

// ─────────────────────────────────────────
// CATEGORY & SUB-CATEGORY
// ─────────────────────────────────────────

model Category {
  id            String        @id @default(cuid())
  name          String        @unique
  slug          String        @unique
  imageId       String?       @map("image_id")
  imageUrl      String?       @map("image_url")
  subCategories SubCategory[]
  products      Product[]
  createdAt     DateTime      @default(now()) @map("created_at")
  updatedAt     DateTime      @updatedAt      @map("updated_at")

  @@map("categories")
}

model SubCategory {
  id         String               @id @default(cuid())
  name       String               @unique
  slug       String               @unique
  categoryId String               @map("category_id")
  category   Category             @relation(fields: [categoryId], references: [id], onDelete: Restrict)
  products   ProductSubCategory[]
  createdAt  DateTime             @default(now()) @map("created_at")
  updatedAt  DateTime             @updatedAt      @map("updated_at")

  @@map("sub_categories")
}

// ─────────────────────────────────────────
// PRODUCT
// ─────────────────────────────────────────

model Product {
  id                 String        @id @default(cuid())
  name               String
  slug               String        @unique
  description        String
  quantity           Int
  sold               Int           @default(0)
  price              Decimal       @db.Decimal(10, 2)
  discount           Decimal       @default(0) @db.Decimal(5, 2)
  priceAfterDiscount Decimal       @default(0) @db.Decimal(10, 2) @map("price_after_discount")
  sizes              String[]
  colors             String[]
  imageId            String        @map("image_id")
  imageUrl           String        @map("image_url")
  ratingsAverage     Decimal?      @db.Decimal(2, 1) @map("ratings_average")
  ratingsQuantity    Int           @default(0)       @map("ratings_quantity")
  status             ProductStatus @default(DRAFT)
  featured           Boolean       @default(false)

  categoryId String   @map("category_id")
  category   Category @relation(fields: [categoryId], references: [id], onDelete: Restrict)

  brandId String? @map("brand_id")
  brand   Brand?  @relation(fields: [brandId], references: [id], onDelete: SetNull)

  images        ProductImage[]
  subCategories ProductSubCategory[]
  reviews       Review[]
  cartItems     CartItem[]
  orderItems    OrderItem[]
  wishlistedBy  UserWishlist[]

  createdAt DateTime @default(now()) @map("created_at")
  updatedAt DateTime @updatedAt      @map("updated_at")

  @@map("products")
}

// Product additional images (Cloudinary)
model ProductImage {
  id        String  @id @default(cuid())
  imageId   String? @map("image_id")
  imageUrl  String? @map("image_url")
  sortOrder Int     @default(0) @map("sort_order")

  productId String  @map("product_id")
  product   Product @relation(fields: [productId], references: [id], onDelete: Cascade)

  @@map("product_images")
}

// Product ↔ SubCategory  (many-to-many)
model ProductSubCategory {
  productId     String      @map("product_id")
  subCategoryId String      @map("sub_category_id")
  product       Product     @relation(fields: [productId],     references: [id], onDelete: Cascade)
  subCategory   SubCategory @relation(fields: [subCategoryId], references: [id], onDelete: Cascade)

  @@id([productId, subCategoryId])
  @@map("product_subcategories")
}

// ─────────────────────────────────────────
// WISHLIST  (User ↔ Product many-to-many)
// ─────────────────────────────────────────

model UserWishlist {
  userId    String   @map("user_id")
  productId String   @map("product_id")
  user      User     @relation(fields: [userId],    references: [id], onDelete: Cascade)
  product   Product  @relation(fields: [productId], references: [id], onDelete: Cascade)
  addedAt   DateTime @default(now()) @map("added_at")

  @@id([userId, productId])
  @@map("user_wishlist")
}

// ─────────────────────────────────────────
// REVIEW
// One review per user per product — enforced by @@unique.
// ratingsAverage / ratingsQuantity on Product are recomputed
// in reviews.service.ts after every insert / update / delete.
// ─────────────────────────────────────────

model Review {
  id      String  @id @default(cuid())
  title   String  @default("")
  ratings Decimal @db.Decimal(2, 1)

  userId String @map("user_id")
  user   User   @relation(fields: [userId],    references: [id], onDelete: Cascade)

  productId String  @map("product_id")
  product   Product @relation(fields: [productId], references: [id], onDelete: Cascade)

  createdAt DateTime @default(now()) @map("created_at")
  updatedAt DateTime @updatedAt      @map("updated_at")

  @@unique([userId, productId])
  @@map("reviews")
}

// ─────────────────────────────────────────
// CART
// Registered:  userId set, sessionToken null, no expiry
// Anonymous:   userId null, sessionToken set (cookie), expiresAt set (7 days)
// ─────────────────────────────────────────

model Cart {
  id                      String    @id @default(cuid())
  totalCartPrice          Decimal?  @db.Decimal(10, 2) @map("total_cart_price")
  totalPriceAfterDiscount Decimal?  @db.Decimal(10, 2) @map("total_price_after_discount")
  expiresAt               DateTime? @map("expires_at")

  userId       String? @unique @map("user_id")
  user         User?   @relation(fields: [userId], references: [id], onDelete: Cascade)

  sessionToken String? @unique @map("session_token")

  items     CartItem[]
  createdAt DateTime   @default(now()) @map("created_at")
  updatedAt DateTime   @updatedAt      @map("updated_at")

  @@map("carts")
}

model CartItem {
  id       String   @id @default(cuid())
  quantity Int      @default(1)
  color    String?
  size     String?
  price    Decimal? @db.Decimal(10, 2)  // price snapshot at time of adding

  cartId String @map("cart_id")
  cart   Cart   @relation(fields: [cartId], references: [id], onDelete: Cascade)

  productId String  @map("product_id")
  product   Product @relation(fields: [productId], references: [id], onDelete: Restrict)

  @@map("cart_items")
}

// ─────────────────────────────────────────
// COUPON
// discount = percentage (1–70)
// maxUsage = 0 means unlimited
// ─────────────────────────────────────────

model Coupon {
  id        String   @id @default(cuid())
  name      String   @unique  // uppercase e.g. "SAVE20"
  discount  Decimal  @db.Decimal(5, 2)
  usedCount Int      @default(0) @map("used_count")
  maxUsage  Int      @default(0) @map("max_usage")
  expire    DateTime
  createdAt DateTime @default(now()) @map("created_at")
  updatedAt DateTime @updatedAt      @map("updated_at")

  orders Order[]

  @@map("coupons")
}

// ─────────────────────────────────────────
// ORDER
//
// Registered checkout:
//   userId set, shippingAddressId set. All anon_* fields null.
//
// Anonymous checkout:
//   userId null, shippingAddressId null.
//   anonName / anonPhone / anonEmail set (contact info).
//   anonCountry / anonCity / ... set (shipping info).
//   guestToken set — sent in confirmation email for order claiming.
//
// CARD: stripePaymentIntentId set, isPaid flipped by Stripe webhook.
// CASH: stripePaymentIntentId null, isPaid flipped manually by admin.
// ─────────────────────────────────────────

model Order {
  id              String        @id @default(cuid())
  humanOrderId    String        @unique @map("human_order_id")  // ORD-000001
  status          OrderStatus   @default(PENDING)
  paymentMethod   PaymentMethod @default(CASH)  @map("payment_method")
  shippingFees    Decimal       @default(0)     @db.Decimal(10, 2) @map("shipping_fees")
  totalOrderPrice Decimal?      @db.Decimal(10, 2) @map("total_order_price")
  isPaid          Boolean       @default(false) @map("is_paid")
  paidAt          DateTime?     @map("paid_at")
  isDelivered     Boolean       @default(false) @map("is_delivered")
  deliveredAt     DateTime?     @map("delivered_at")
  notes           String?

  stripePaymentIntentId String? @unique @map("stripe_payment_intent_id")

  // Registered user
  userId            String?  @map("user_id")
  user              User?    @relation(fields: [userId], references: [id], onDelete: SetNull)

  shippingAddressId String?  @map("shipping_address_id")
  shippingAddress   Address? @relation(fields: [shippingAddressId], references: [id], onDelete: SetNull)

  // Coupon
  couponId        String?  @map("coupon_id")
  coupon          Coupon?  @relation(fields: [couponId], references: [id], onDelete: SetNull)
  discountApplied Decimal? @db.Decimal(10, 2) @map("discount_applied")

  // Anonymous contact
  anonName  String? @map("anon_name")
  anonPhone String? @map("anon_phone")
  anonEmail String? @map("anon_email")

  // Anonymous shipping address
  anonCountry       String? @map("anon_country")
  anonGovernorate   String? @map("anon_governorate")
  anonCity          String? @map("anon_city")
  anonArea          String? @map("anon_area")
  anonShippingPhone String? @map("anon_shipping_phone")
  anonAddressLine1  String? @map("anon_address_line1")
  anonDetails       String? @map("anon_details")
  anonPostalCode    Int?    @map("anon_postal_code")
  anonLatitude      Float?  @map("anon_latitude")
  anonLongitude     Float?  @map("anon_longitude")

  // Guest order claiming
  guestToken          String?   @unique @map("guest_token")
  guestTokenExpiresAt DateTime? @map("guest_token_expires_at")
  claimedByUserId     String?   @map("claimed_by_user_id")

  items     OrderItem[]
  createdAt DateTime    @default(now()) @map("created_at")
  updatedAt DateTime    @updatedAt      @map("updated_at")

  @@map("orders")
}

model OrderItem {
  id       String   @id @default(cuid())
  quantity Int      @default(1)
  color    String?
  size     String?
  price    Decimal? @db.Decimal(10, 2)  // price snapshot at time of order

  orderId String @map("order_id")
  order   Order  @relation(fields: [orderId], references: [id], onDelete: Cascade)

  productId String  @map("product_id")
  product   Product @relation(fields: [productId], references: [id], onDelete: Restrict)

  @@map("order_items")
}

// ─────────────────────────────────────────
// NOTIFICATION
// ─────────────────────────────────────────

model Notification {
  id       String  @id @default(cuid())
  type     String  // "ORDER_SHIPPED" | "ORDER_DELIVERED" | "PROMO" etc.
  title    String
  body     String
  read     Boolean @default(false)
  metadata Json?

  userId String @map("user_id")
  user   User   @relation(fields: [userId], references: [id], onDelete: Cascade)

  createdAt DateTime @default(now()) @map("created_at")

  @@index([userId, read])
  @@map("notifications")
}
```

### Entity Relationships

```
users ──1:many──► addresses
users ──1:1────► carts ──1:many──► cart_items ──many:1──► products
users ──1:many──► orders
users ──1:many──► reviews ──many:1──► products
users ──many:many──► (user_wishlist) ──► products

categories ──1:many──► sub_categories
categories ──1:many──► products
brands     ──1:many──► products
products   ──1:many──► product_images
products   ──many:many──► (product_subcategories) ──► sub_categories

orders ──many:1──► users       (nullable — anonymous checkout)
orders ──many:1──► addresses   (nullable — anonymous checkout)
orders ──many:1──► coupons     (nullable)
orders ──1:many──► order_items ──many:1──► products
```

### Enum Reference

| Enum            | Values                                                                        |
| --------------- | ----------------------------------------------------------------------------- |
| `Role`          | `USER` · `MANAGER` · `ADMIN`                                                  |
| `OrderStatus`   | `PENDING` · `PROCESSING` · `SHIPPED` · `DELIVERED` · `CANCELLED` · `REFUNDED` |
| `PaymentMethod` | `CASH` · `CARD`                                                               |
| `ProductStatus` | `DRAFT` · `ACTIVE` · `ARCHIVED`                                               |

---

## 9. API Design

API route handlers live under `app/api/`. They are built alongside every web feature and designed to be consumed by the React Native Expo mobile app in a future phase. The web app itself uses Server Actions for mutations and Server Components for data fetching — it does not call these API routes.

### Route Map

```
app/api/
├── webhooks/
│   ├── clerk/route.ts              POST  — Clerk user lifecycle sync
│   └── stripe/route.ts             POST  — Stripe payment events
│
├── products/
│   ├── route.ts                    GET   — paginated list with filters
│   └── [slug]/route.ts             GET   — single product by slug
│
├── categories/
│   └── route.ts                    GET   — all categories with subcategories
│
├── brands/
│   └── route.ts                    GET   — all brands
│
├── cart/
│   ├── route.ts                    GET   — current cart
│   │                               POST  — add item to cart
│   └── [itemId]/route.ts           PATCH — update item quantity
│                                   DELETE — remove item
│
├── orders/
│   ├── route.ts                    GET   — user order list (auth required)
│   │                               POST  — create order
│   └── [id]/route.ts               GET   — single order detail
│
├── account/
│   ├── profile/route.ts            GET   — profile | PATCH — update
│   ├── addresses/
│   │   ├── route.ts                GET   — list | POST — create
│   │   └── [id]/route.ts           PATCH — update | DELETE — remove
│   └── wishlist/
│       ├── route.ts                GET   — list | POST — add product
│       └── [productId]/route.ts    DELETE — remove product
│
└── checkout/route.ts               POST  — create order + Stripe PaymentIntent
```

### Response Envelope

Every route returns the same shape:

```typescript
// Success
{ success: true, data: T }

// Error
{ success: false, error: { code: string, message: string } }
```

### Auth Pattern in Route Handlers

```typescript
import { auth } from "@clerk/nextjs/server";

export async function GET() {
  const { userId } = await auth();
  if (!userId) {
    return Response.json(
      {
        success: false,
        error: { code: "UNAUTHORIZED", message: "Authentication required" },
      },
      { status: 401 },
    );
  }
  // ...
}
```

### Input Validation

All request bodies validated with Zod before reaching service functions:

```typescript
import { z } from "zod";

export const AddToCartSchema = z.object({
  productId: z.string().cuid(),
  quantity: z.number().int().min(1).max(100),
  color: z.string().optional(),
  size: z.string().optional(),
});
```

### Service Layer — No Logic Duplication

Route handlers never contain business logic. They call the same service functions used by Server Actions:

```typescript
// features/cart/services/cart.service.ts
export async function addToCart(
  userId: string | null,
  sessionToken: string | null,
  input: AddToCartInput,
) {
  // business logic lives here — called by both the Server Action and the API route
}

// features/cart/actions/cart.actions.ts  (web — Server Action)
("use server");
export async function addToCartAction(
  input: unknown,
): Promise<ActionResult<Cart>> {
  const { userId } = await auth();
  const parsed = AddToCartSchema.safeParse(input);
  if (!parsed.success) return { success: false, error: "Invalid input" };
  return addToCart(userId, null, parsed.data);
}

// app/api/cart/route.ts  (mobile API)
export async function POST(req: Request) {
  const { userId } = await auth();
  const body = await req.json();
  const parsed = AddToCartSchema.safeParse(body);
  if (!parsed.success) {
    return Response.json(
      {
        success: false,
        error: { code: "INVALID_INPUT", message: "Invalid input" },
      },
      { status: 400 },
    );
  }
  const result = await addToCart(userId, null, parsed.data);
  return Response.json(result);
}
```

---

## 10. Anonymous Checkout Flow

Guest checkout requires only a name, email, phone, and shipping address — no account needed. This is a core feature that reduces purchase friction for new visitors.

### Full Flow

```
1. Guest visits site
   └─ No session. sessionToken cookie set on first cart interaction.
   └─ Cart row created in DB keyed by sessionToken.

2. Guest adds items to cart
   └─ CartItems linked to the sessionToken cart row.

3. Guest navigates to /checkout
   └─ No authentication required.

4. Guest fills in:
   ├─ Contact:  name, email, phone
   ├─ Shipping: country, governorate, city, area, address line, details
   ├─ Payment:  CASH or CARD
   └─ Optional: coupon code

5. Order created in DB:
   ├─ Order.userId              = null
   ├─ Order.shippingAddressId   = null
   ├─ Order.anonName/Phone/Email = contact fields
   ├─ Order.anonCountry/City/... = shipping fields
   ├─ Order.guestToken          = crypto.randomUUID()
   └─ Order.guestTokenExpiresAt = now + 7 days

6. Confirmation email sent to anonEmail:
   ├─ Full order summary
   └─ Claim link: /orders/claim?token=<guestToken>

7. Guest clicks claim link (within 7 days):
   ├─ Prompted to create account or sign in
   └─ On successful auth:
      ├─ Order.userId          = userId
      ├─ Order.claimedByUserId = userId
      └─ Order appears in /account/orders
```

### Cart Merge on Sign-In

When a guest signs in while they have an active session cart:

1. Read `sessionToken` from cookie.
2. Load the session cart and the user's existing DB cart (if any).
3. For each session cart item: if same `productId + color + size` exists in user cart → sum quantities. Otherwise append as a new item.
4. Delete the session cart row. Recalculate and save user cart totals.
5. Clear the `sessionToken` cookie.

---

## 11. Payment Integration — Stripe

### CARD Flow (Payment Intents)

```
1. POST /checkout (Server Action or API route)
   → Create Order row (status: PENDING, isPaid: false)
   → stripe.paymentIntents.create({ amount, currency, metadata: { orderId } })
   → Return { orderId, clientSecret }

2. Client: Stripe.js Elements confirms payment using clientSecret

3. POST /api/webhooks/stripe  (event: payment_intent.succeeded)
   → Verify Stripe-Signature header
   → Find Order by stripePaymentIntentId
   → Order.isPaid = true, Order.paidAt = now, Order.status = PROCESSING
   → Send order confirmation email via Resend

4. Client → redirected to /checkout/success?orderId=...
```

### CASH Flow

```
1. POST /checkout
   → Create Order (status: PENDING, isPaid: false, paymentMethod: CASH)
   → Send confirmation email immediately
   → Return { orderId }

2. Redirect to /checkout/success

3. Admin marks isPaid = true manually when cash is collected on delivery
```

### Refund Flow

```
Admin clicks Refund in order detail
→ Server Action: stripe.refunds.create({ payment_intent: order.stripePaymentIntentId })
→ On success:
   → Order.status = REFUNDED
   → Order.isPaid = false
   → In-app notification sent to customer
```

### Stripe Webhook Events

| Event                           | Action                                              |
| ------------------------------- | --------------------------------------------------- |
| `payment_intent.succeeded`      | Mark order paid, set status PROCESSING, send email  |
| `payment_intent.payment_failed` | Set status back to PENDING, notify customer         |
| `charge.dispute.created`        | Flag order for admin review via in-app notification |

---

## 12. Media Storage — Cloudinary

All product images, category images, and brand logos are stored in Cloudinary. The database stores only `imageId` (Cloudinary public ID) and `imageUrl` (delivery URL). No image binary data passes through the Next.js server.

### Upload Flow

The Cloudinary Upload Widget uploads directly from the admin's browser to Cloudinary. The widget callback returns the public ID and URL, which are saved to the database via a Server Action.

```typescript
window.cloudinary.createUploadWidget(
  {
    cloudName: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
    uploadPreset: "ecommerce_products", // unsigned preset, set in Cloudinary dashboard
    folder: "products",
    maxFiles: 10,
  },
  (error, result) => {
    if (result.event === "success") {
      // result.info.public_id  → imageId
      // result.info.secure_url → imageUrl
    }
  },
);
```

### Image Delivery Transforms

| Use case       | URL pattern                                             |
| -------------- | ------------------------------------------------------- |
| Product card   | `.../upload/w_400,h_400,c_fill,f_webp,q_auto/{imageId}` |
| Product detail | `.../upload/w_900,f_webp,q_auto/{imageId}`              |
| Thumbnail      | `.../upload/w_80,h_80,c_fill,f_webp,q_auto/{imageId}`   |
| Category cover | `.../upload/w_600,h_400,c_fill,f_webp,q_auto/{imageId}` |

### Folder Structure in Cloudinary

```
ecommerce/
├── products/      # Main images + gallery images
├── categories/    # Category cover images
└── brands/        # Brand logos
```

When a product, category, or brand is deleted, the service function calls `cloudinary.uploader.destroy(imageId)` to remove the asset.

---

## 13. Email System — Resend

**Package:** `resend`
**Templates:** React Email components in `emails/`

### Transactional Emails

| Trigger                   | Template                 | Recipient                         |
| ------------------------- | ------------------------ | --------------------------------- |
| Order placed (registered) | `OrderConfirmation`      | User email                        |
| Order placed (anonymous)  | `GuestOrderConfirmation` | `anonEmail` — includes claim link |
| Order shipped             | `OrderShipped`           | User email or `anonEmail`         |
| Order delivered           | `OrderDelivered`         | User email or `anonEmail`         |
| Order cancelled           | `OrderCancelled`         | User email or `anonEmail`         |
| Refund processed          | `RefundProcessed`        | User email or `anonEmail`         |
| New user welcome          | `Welcome`                | New user (triggered by webhook)   |

### Sending Pattern

```typescript
// lib/resend.ts
import { Resend } from "resend";
export const resend = new Resend(process.env.RESEND_API_KEY);

// In a service function:
import { resend } from "@/lib/resend";
import { OrderConfirmationEmail } from "@/emails/OrderConfirmation";

await resend.emails.send({
  from: "orders@yourdomain.com",
  to: order.user?.email ?? order.anonEmail!,
  subject: `Order ${order.humanOrderId} confirmed`,
  react: OrderConfirmationEmail({ order }),
});
```

---

## 14. URL State Management — nuqs

`nuqs` manages all URL-based state: filters, sort order, pagination, search queries, and date ranges. State lives in the URL — shareable, bookmarkable, and readable server-side without a client round-trip.

### Pattern

Define a params schema once per feature in `hooks/use<Feature>Params.ts`. The same schema serves both server-side cache parsing and client-side reading/writing.

```typescript
// features/products/hooks/useProductParams.ts
import {
  createSearchParamsCache,
  parseAsString,
  parseAsInteger,
  parseAsFloat,
} from "nuqs/server";
import { useQueryStates } from "nuqs";

const productParams = {
  category: parseAsString.withDefault(""),
  brand: parseAsString.withDefault(""),
  minPrice: parseAsFloat.withDefault(0),
  maxPrice: parseAsFloat.withDefault(100000),
  size: parseAsString.withDefault(""),
  color: parseAsString.withDefault(""),
  sort: parseAsString.withDefault("newest"),
  page: parseAsInteger.withDefault(1),
};

// Server Component: parse URL params on the server
export const loadProductParams = createSearchParamsCache(productParams);

// Client Component: read and write URL params
export function useProductParams() {
  return useQueryStates(productParams);
}
```

### Server reads, client writes

```typescript
// features/products/index.tsx — Server Component
export default async function ProductsFeature({ searchParams }: Props) {
  const params = await loadProductParams(searchParams)  // fully typed
  const data = await getProducts(params)
  return <ProductGrid products={data.products} total={data.total} />
}

// features/products/components/ProductSort.tsx — Client Component
'use client'
export function ProductSort() {
  const [{ sort }, setParams] = useProductParams()
  return (
    <select value={sort} onChange={e => setParams({ sort: e.target.value, page: 1 })}>
      <option value="newest">Newest</option>
      <option value="price_asc">Price: Low to High</option>
      <option value="price_desc">Price: High to Low</option>
    </select>
  )
}
```

Changing the sort pushes `?sort=price_asc&page=1` to the URL, which triggers a server re-render of `ProductsFeature` with the new params — no client-side data fetch needed.

### nuqs Params by Feature

| Feature                    | Params                                                                       |
| -------------------------- | ---------------------------------------------------------------------------- |
| Products catalog           | `category`, `brand`, `minPrice`, `maxPrice`, `size`, `color`, `sort`, `page` |
| Search                     | `q`, `sort`, `page`                                                          |
| Account orders             | `status`, `page`                                                             |
| Admin / orders             | `status`, `search`, `paymentMethod`, `from`, `to`, `page`                    |
| Admin / products           | `status`, `category`, `search`, `page`                                       |
| Admin / customers          | `search`, `role`, `page`                                                     |
| Admin / analytics          | `range` (7d / 30d / 90d / custom), `from`, `to`                              |

---

## 15. Project Structure

No `src/` folder. All source lives at the project root.

```
/                                     ← project root
│
├── app/
│   ├── (storefront)/                 # Client-facing pages — shared nav/footer layout
│   │   ├── layout.tsx
│   │   ├── page.tsx                  # → <HomeFeature />
│   │   ├── products/
│   │   │   ├── page.tsx              # → <ProductsFeature searchParams={...} />
│   │   │   └── [slug]/page.tsx       # → <ProductDetailFeature slug={slug} />
│   │   ├── categories/
│   │   │   └── [slug]/page.tsx       # → <CategoryFeature slug={slug} searchParams={...} />
│   │   ├── search/page.tsx           # → <SearchFeature searchParams={...} />
│   │   ├── cart/page.tsx             # → <CartFeature />
│   │   ├── checkout/
│   │   │   ├── page.tsx              # → <CheckoutFeature />
│   │   │   └── success/page.tsx      # → <CheckoutSuccessFeature orderId={...} />
│   │   └── account/
│   │       ├── page.tsx              # → <AccountOverviewFeature />
│   │       ├── orders/
│   │       │   ├── page.tsx          # → <OrdersFeature searchParams={...} />
│   │       │   └── [id]/page.tsx     # → <OrderDetailFeature id={id} />
│   │       ├── addresses/page.tsx    # → <AddressesFeature />
│   │       └── wishlist/page.tsx     # → <WishlistFeature />
│   │
│   ├── (auth)/
│   │   ├── sign-in/[[...sign-in]]/page.tsx
│   │   └── sign-up/[[...sign-up]]/page.tsx
│   │
│   ├── admin/                        # Admin dashboard — own layout
│   │   ├── layout.tsx                # Sidebar + topbar shell
│   │   ├── page.tsx                  # → <AdminDashboardFeature />
│   │   ├── orders/
│   │   │   ├── page.tsx              # → <AdminOrdersFeature searchParams={...} />
│   │   │   └── [id]/page.tsx         # → <AdminOrderDetailFeature id={id} />
│   │   ├── products/
│   │   │   ├── page.tsx              # → <AdminProductsFeature searchParams={...} />
│   │   │   ├── new/page.tsx          # → <AdminProductFormFeature />
│   │   │   └── [id]/page.tsx         # → <AdminProductFormFeature id={id} />
│   │   ├── categories/page.tsx       # → <AdminCategoriesFeature />
│   │   ├── brands/page.tsx           # → <AdminBrandsFeature />
│   │   ├── customers/
│   │   │   ├── page.tsx              # → <AdminCustomersFeature searchParams={...} />
│   │   │   └── [id]/page.tsx         # → <AdminCustomerDetailFeature id={id} />
│   │   ├── coupons/page.tsx          # → <AdminCouponsFeature />
│   │   ├── analytics/page.tsx        # → <AdminAnalyticsFeature searchParams={...} />
│   │   ├── settings/page.tsx         # → <AdminSettingsFeature />
│   │   └── users/page.tsx            # → <AdminUsersFeature />
│   │
│   └── api/
│       ├── webhooks/
│       │   ├── clerk/route.ts
│       │   └── stripe/route.ts
│       ├── products/
│       │   ├── route.ts
│       │   └── [slug]/route.ts
│       ├── categories/route.ts
│       ├── brands/route.ts
│       ├── cart/
│       │   ├── route.ts
│       │   └── [itemId]/route.ts
│       ├── orders/
│       │   ├── route.ts
│       │   └── [id]/route.ts
│       ├── account/
│       │   ├── profile/route.ts
│       │   ├── addresses/
│       │   │   ├── route.ts
│       │   │   └── [id]/route.ts
│       │   └── wishlist/
│       │       ├── route.ts
│       │       └── [productId]/route.ts
│       └── checkout/route.ts
│
├── features/                         # ← Core of the codebase
│   │
│   ├── home/
│   │   ├── components/
│   │   │   ├── HeroBanner.tsx
│   │   │   ├── FeaturedProducts.tsx
│   │   │   └── CategoryGrid.tsx
│   │   └── index.tsx                 # export default HomeFeature
│   │
│   ├── products/
│   │   ├── components/
│   │   │   ├── ProductCard.tsx
│   │   │   ├── ProductGrid.tsx
│   │   │   ├── ProductFilters.tsx    # 'use client' — writes nuqs params
│   │   │   ├── ProductSort.tsx       # 'use client' — writes nuqs params
│   │   │   └── ProductPagination.tsx
│   │   ├── hooks/
│   │   │   └── useProductParams.ts   # nuqs schema (server cache + client hook)
│   │   ├── actions/
│   │   │   └── products.actions.ts
│   │   ├── services/
│   │   │   └── products.service.ts
│   │   ├── types/
│   │   │   └── index.ts
│   │   └── index.tsx                 # export default ProductsFeature
│   │
│   ├── product-detail/
│   │   ├── components/
│   │   │   ├── ImageGallery.tsx
│   │   │   ├── VariantSelector.tsx
│   │   │   ├── AddToCartButton.tsx
│   │   │   └── ReviewsList.tsx
│   │   ├── actions/
│   │   │   └── product-detail.actions.ts
│   │   ├── services/
│   │   │   └── product-detail.service.ts
│   │   └── index.tsx
│   │
│   ├── cart/
│   │   ├── components/
│   │   │   ├── CartDrawer.tsx
│   │   │   ├── CartItem.tsx
│   │   │   └── CartSummary.tsx
│   │   ├── hooks/
│   │   │   └── useCart.ts
│   │   ├── actions/
│   │   │   └── cart.actions.ts
│   │   ├── services/
│   │   │   └── cart.service.ts
│   │   └── index.tsx
│   │
│   ├── checkout/
│   │   ├── components/
│   │   │   ├── CheckoutForm.tsx
│   │   │   ├── AnonContactForm.tsx
│   │   │   ├── ShippingForm.tsx
│   │   │   ├── PaymentForm.tsx
│   │   │   └── OrderSummary.tsx
│   │   ├── actions/
│   │   │   └── checkout.actions.ts
│   │   ├── services/
│   │   │   └── checkout.service.ts
│   │   └── index.tsx
│   │
│   ├── account/
│   │   ├── components/
│   │   │   ├── ProfileForm.tsx
│   │   │   ├── AddressList.tsx
│   │   │   ├── AddressForm.tsx
│   │   │   ├── OrderList.tsx
│   │   │   └── WishlistGrid.tsx
│   │   ├── hooks/
│   │   │   └── useOrderParams.ts
│   │   ├── actions/
│   │   │   └── account.actions.ts
│   │   ├── services/
│   │   │   └── account.service.ts
│   │   └── index.tsx
│   │
│   └── admin/
│       ├── dashboard/
│       │   ├── components/
│       │   │   ├── StatsCards.tsx
│       │   │   ├── RecentOrdersTable.tsx
│       │   │   └── LowStockAlert.tsx
│       │   ├── services/
│       │   │   └── dashboard.service.ts
│       │   └── index.tsx
│       │
│       ├── orders/
│       │   ├── components/
│       │   │   ├── OrdersTable.tsx
│       │   │   ├── OrderFilters.tsx
│       │   │   ├── OrderStatusBadge.tsx
│       │   │   └── OrderDetailPanel.tsx
│       │   ├── hooks/
│       │   │   └── useOrderParams.ts
│       │   ├── actions/
│       │   │   └── orders.actions.ts
│       │   ├── services/
│       │   │   └── orders.service.ts
│       │   └── index.tsx
│       │
│       ├── products/
│       │   ├── components/
│       │   │   ├── ProductsTable.tsx
│       │   │   ├── ProductForm.tsx
│       │   │   ├── ImageUploader.tsx
│       │   │   └── VariantFields.tsx
│       │   ├── hooks/
│       │   │   └── useProductParams.ts
│       │   ├── actions/
│       │   │   └── products.actions.ts
│       │   ├── services/
│       │   │   └── products.service.ts
│       │   └── index.tsx
│       │
│       ├── categories/
│       ├── brands/
│       ├── customers/
│       ├── coupons/
│       ├── analytics/
│       ├── settings/
│       └── users/
│
├── components/
│   └── ui/                           # shadcn/ui primitives only
│       ├── button.tsx
│       ├── input.tsx
│       ├── dialog.tsx
│       └── ...
│
├── lib/
│   ├── prisma.ts                     # Prisma singleton
│   ├── stripe.ts                     # Stripe client
│   ├── cloudinary.ts                 # Cloudinary helpers
│   └── resend.ts                     # Resend client
│
├── emails/                           # React Email templates
│   ├── OrderConfirmation.tsx
│   ├── GuestOrderConfirmation.tsx
│   ├── OrderShipped.tsx
│   ├── OrderCancelled.tsx
│   ├── RefundProcessed.tsx
│   └── Welcome.tsx
│
├── types/
│   └── index.ts                      # Global types: ActionResult<T>, etc.
│
├── proxy.ts                     # Clerk auth + role guard
├── next.config.ts
├── tailwind.config.ts
├── tsconfig.json
└── package.json
```

### Feature Architecture Contract

Every feature exports one thing from `index.tsx`. Pages are thin wrappers.

```typescript
// Page — no logic, just renders the feature
// app/(storefront)/products/page.tsx
import { ProductsFeature } from '@/features/products'
import type { SearchParams } from 'nuqs/server'

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>
}) {
  return <ProductsFeature searchParams={searchParams} />
}

// Feature index — owns data fetching and component wiring
// features/products/index.tsx  (Server Component)
import { loadProductParams } from './hooks/useProductParams'
import { getProducts }       from './services/products.service'
import { ProductGrid }       from './components/ProductGrid'
import { ProductFilters }    from './components/ProductFilters'

export default async function ProductsFeature({ searchParams }: Props) {
  const params = await loadProductParams(searchParams)
  const data   = await getProducts(params)

  return (
    <div className="flex gap-8">
      <ProductFilters />
      <ProductGrid products={data.products} total={data.total} />
    </div>
  )
}
```

---

## 16. Environment Variables

```env
# ── Database (Supabase) ───────────────────────────────────────
DATABASE_URL="postgresql://postgres.[ref]:[pw]@aws-0-[region].pooler.supabase.com:6543/postgres"
DIRECT_URL="postgresql://postgres.[ref]:[pw]@aws-0-[region].supabase.com:5432/postgres"

# ── Clerk ─────────────────────────────────────────────────────
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY="pk_..."
CLERK_SECRET_KEY="sk_..."
CLERK_WEBHOOK_SECRET="whsec_..."
NEXT_PUBLIC_CLERK_SIGN_IN_URL="/sign-in"
NEXT_PUBLIC_CLERK_SIGN_UP_URL="/sign-up"
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL="/"
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL="/"

# ── Stripe ────────────────────────────────────────────────────
STRIPE_SECRET_KEY="sk_..."
STRIPE_WEBHOOK_SECRET="whsec_..."
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_..."

# ── Cloudinary ────────────────────────────────────────────────
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME="..."
CLOUDINARY_API_KEY="..."
CLOUDINARY_API_SECRET="..."

# ── Resend ────────────────────────────────────────────────────
RESEND_API_KEY="re_..."

# ── App ───────────────────────────────────────────────────────
NEXT_PUBLIC_APP_URL="https://yourdomain.com"
```

---

## 17. Deployment

### Vercel

```json
// package.json
{
  "scripts": {
    "dev": "next dev",
    "build": "bunx prisma generate && next build",
    "start": "next start"
  }
}
```

- All environment variables set in Vercel project settings.
- `DATABASE_URL` uses the Supabase pooler URL (port 6543). `DIRECT_URL` uses the direct URL (port 5432) — Prisma uses it only during `prisma migrate deploy`.
- Clerk and Stripe webhook URLs must be registered in their dashboards pointing to the production domain.

### Database Migrations

```bash
# Development — create and apply a new migration
bunx prisma migrate dev --name <descriptive_name>

# After any schema change — regenerate the Prisma client
bunx prisma generate

# Production — apply all pending migrations (runs in Vercel build or CI)
bunx prisma migrate deploy

# One-time: create the humanOrderId sequence after first migration
# Run in Supabase SQL editor:
# CREATE SEQUENCE order_human_id_seq START 1;

# Open Prisma Studio (local DB browser)
bunx prisma studio
```

---

## 18. Development Conventions

### Package Manager

Bun only. Never use `npm` or `npx`.

```bash
bun install              # install all deps
bun add <package>        # add a dependency
bun add -d <package>     # add a dev dependency
bun remove <package>     # remove a dependency
bun run dev              # start Next.js dev server
bunx prisma <command>    # run any Prisma CLI command
```

### TypeScript

- `strict: true` everywhere.
- No `any`. Use `unknown` and narrow with Zod or type guards.
- Infer all Prisma model types — never manually duplicate model shapes.

### Naming Conventions

| Thing                  | Convention              | Example               |
| ---------------------- | ----------------------- | --------------------- |
| Non-component files    | `kebab-case`            | `cart.service.ts`     |
| Component files        | `PascalCase`            | `ProductCard.tsx`     |
| Feature default export | `<Name>Feature`         | `ProductsFeature`     |
| Server Action files    | `<name>.actions.ts`     | `cart.actions.ts`     |
| Service files          | `<name>.service.ts`     | `cart.service.ts`     |
| nuqs hook files        | `use<Name>Params.ts`    | `useProductParams.ts` |
| DB columns             | `snake_case` via `@map` | `created_at`          |
| TypeScript fields      | `camelCase`             | `createdAt`           |
| API routes             | Plural nouns            | `/api/products`       |

### Feature Rules

- Each feature has exactly **one public export** from `index.tsx`.
- Nothing outside a feature imports from inside it (except the page file importing the feature's `index.tsx`).
- `index.tsx` is always a Server Component. Client interactivity lives in leaf components inside `components/`.
- URL state is always `nuqs`. Never use `useState` for filter / sort / pagination state.
- Page files contain zero logic — just an import and a render of the feature.

### ActionResult Pattern

Every Server Action and Route Handler returns this shape. Never throw out of a Server Action.

```typescript
// types/index.ts
export type ActionResult<T> =
  | { success: true; data: T }
  | { success: false; error: string };

// Usage in a Server Action:
export async function createOrderAction(
  input: unknown,
): Promise<ActionResult<Order>> {
  try {
    const { userId } = await auth();
    if (!userId) return { success: false, error: "Unauthorized" };

    const parsed = CreateOrderSchema.safeParse(input);
    if (!parsed.success) return { success: false, error: "Invalid input" };

    const order = await createOrder(userId, parsed.data);
    return { success: true, data: order };
  } catch {
    return { success: false, error: "Something went wrong" };
  }
}
```

### Prisma Singleton

```typescript
// lib/prisma.ts
import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

export const prisma = globalForPrisma.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
```

---

## 19. Build Phases & Roadmap

### Phase 1 — Foundation

- Next.js project setup (Bun, Tailwind CSS v4, shadcn/ui, Clerk)
- Prisma schema + Supabase connection + first migration
- PostgreSQL sequence for `humanOrderId`
- Clerk webhook endpoint — user sync
- proxy route guards
- Product catalog — read-only (Server Components + Prisma)
- Category and brand pages

### Phase 2 — Commerce Core

- Cart (registered + anonymous session)
- Anonymous cart merge on sign-in
- Anonymous checkout flow (CASH + CARD)
- Stripe Payment Intents + webhook handler
- Order creation — Server Action + API route
- Order confirmation emails (Resend)
- Guest order claiming flow

### Phase 3 — Registered Account

- User profile page
- Order history + order detail page
- Address book (CRUD)
- Wishlist
- In-app notifications

### Phase 4 — Admin Dashboard

- Admin layout (sidebar, topbar, role-based nav)
- Product CRUD with Cloudinary upload
- Category + subcategory + brand management
- Order management — status transitions, cancellation, refunds
- Customer list + detail + role assignment
- Coupon management

### Phase 5 — Growth Features

- Product reviews (post-purchase, verified buyers, ratings recompute)
- Analytics dashboard (revenue, orders, top products, customer stats)
- Promotional banners (admin-managed content)
- Low-stock alerts and notifications

### Phase 6 — Mobile App (separate Expo project)

- React Native + Expo scaffold (Expo Router, NativeWind, TanStack Query)
- `@clerk/expo` auth with `expo-secure-store`
- Consume existing `/api/*` route handlers — zero backend changes needed
- Product catalog, search, filters
- Cart (synced with server)
- Checkout for registered users
- Order history and tracking
- Push notifications (Expo Notifications)

---

_End of Technical Specification — v2.0_
