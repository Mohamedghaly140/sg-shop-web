# Storefront Status

Last updated: 2026-04-28

## Summary

All storefront page routes are wired up under `app/(storefront)/`, but every feature behind them is either a stub or partially implemented with static data. Admin (Phase 4) is nearly complete. Storefront (Phases 1–3) is the current focus.

---

## Feature Status

| Feature | Route | Status | Notes |
|---|---|---|---|
| `HomeFeature` | `/` | 🟡 In Progress | Hero, category grid, and "New Arrivals" section exist but use hardcoded data. No DB queries yet. |
| `ProductsFeature` | `/products` | 🔴 Stub | Returns `<p>Products</p>` |
| `ProductDetailFeature` | `/products/[slug]` | 🔴 Stub | Returns `<p>Product Detail</p>` |
| `CategoryFeature` | `/categories/[slug]` | 🔴 Stub | Returns `<p>Category</p>` (no page file exists yet) |
| `SearchFeature` | `/search` | 🔴 Stub | Returns `<p>Search</p>` |
| `CartFeature` | `/cart` | 🔴 Stub | Returns `<p>Cart</p>` |
| `CheckoutFeature` | `/checkout` | 🔴 Stub | Returns `<p>Checkout</p>` |
| `CheckoutSuccessFeature` | `/checkout/success` | 🔴 Stub | Returns `<p>Checkout Success</p>` |
| `AccountOverviewFeature` | `/account` | 🔴 Stub | Returns `<p>Account Overview</p>` |
| `OrdersFeature` | `/account/orders` | 🔴 Stub | Returns `<p>Orders</p>` |
| `OrderDetailFeature` | `/account/orders/[id]` | 🔴 Stub | Returns `<p>Order Detail</p>` |
| `AddressesFeature` | `/account/addresses` | 🔴 Stub | Returns `<p>Addresses</p>` |
| `WishlistFeature` | `/account/wishlist` | 🔴 Stub | Returns `<p>Wishlist</p>` |

---

## API Routes

| Route | Status | Notes |
|---|---|---|
| `POST /api/webhooks/clerk` | ✅ Done | User sync on create/update/delete |
| `POST /api/sign-cloudinary-params` | ✅ Done | Cloudinary upload signing |
| `GET /api/products` | 🔴 Missing | Phase 1 requirement |
| `GET /api/products/[slug]` | 🔴 Missing | Phase 1 requirement |
| `GET /api/categories` | 🔴 Missing | Phase 1 requirement |
| `GET /api/brands` | 🔴 Missing | Phase 1 requirement |

---

## Phase Alignment

| Phase | Title | Status |
|---|---|---|
| Phase 1 — Foundation | Project shell, schema, auth, read-only catalog | 🟡 Partially done (shell + auth + admin done; storefront catalog stubs only) |
| Phase 2 — Commerce Core | Cart, checkout, Stripe, guest flow | 🔴 Not started |
| Phase 3 — Registered Account | Profile, orders, addresses, wishlist | 🔴 Not started |
| Phase 4 — Admin Dashboard | Layout, products, orders, customers, categories, brands, coupons | 🟢 Nearly complete |
| Phase 5 — Growth Features | Reviews, analytics, banners, alerts | 🔴 Not started |
| Phase 6 — Mobile App | Expo app consuming existing API routes | 🔴 Not started |

---

## Build Order (Storefront)

Starting with Phase 1 read-only catalog:

1. **HomeFeature** — connect to real DB data (categories + featured products) ← current
2. **ProductsFeature** — filters, sort, pagination via nuqs + `getProducts` service
3. **ProductDetailFeature** — gallery, variants, description, related products (no cart yet)
4. **CategoryFeature** — slim wrapper around `getProducts` with category filter
5. **SearchFeature** — PostgreSQL full-text search
6. **API route handlers** — mirror every read above
