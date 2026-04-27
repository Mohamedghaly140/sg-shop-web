# E-Commerce Platform — Documentation

**Version:** 2.0
**Status:** Active Reference
**Audience:** Claude Code & human contributors

This directory is the single source of truth for the e-commerce platform spec, organized for execution. Each document is scoped, focused, and small enough to load into a Claude Code context window without dragging in unrelated material.

---

## How to use this documentation

- **Starting a new phase?** Open `phases/phase-<N>-<name>.md`. Each phase doc has an explicit checklist, dependencies, deliverables, and acceptance criteria.
- **Implementing a storefront feature?** Open `storefront/<feature>.md`. Covers routes, UI, data, and behavior for a single user-facing area.
- **Implementing an admin feature?** Open `admin/<feature>.md`. Same structure as storefront, scoped to the admin dashboard.
- **Need cross-cutting context** (DB schema, auth, conventions, project layout)? See `architecture/`.
- **Wiring an external service** (Stripe, Cloudinary, Resend, Clerk webhooks)? See `integrations/`.

When working on a phase, treat the phase doc as the **plan of record**. It links into the storefront/admin/architecture/integrations docs that contain the detail.

---

## Directory map

```
docs/
├── README.md                       ← you are here
│
├── architecture/                   ← cross-cutting context
│   ├── 01-overview.md              project goals, audiences, future mobile
│   ├── 02-tech-stack.md            framework, libs, runtime
│   ├── 03-system-architecture.md   request flow, layers, architectural rules
│   ├── 04-roles-and-permissions.md USER / MANAGER / ADMIN, route protection
│   ├── 05-database-schema.md       full Prisma schema + relationships
│   ├── 06-api-design.md            route handlers, envelope, service layer
│   ├── 07-project-structure.md     folder layout + feature contract
│   ├── 08-conventions.md           naming, TS, Server Actions, ActionResult
│   └── 09-environment-and-deploy.md env vars, Vercel, Prisma migrations
│
├── storefront/                     ← public-facing features
│   ├── 00-overview.md              route map, layout, shared concerns
│   ├── 01-home.md                  HomeFeature
│   ├── 02-product-catalog.md       ProductsFeature, filters, sort, pagination
│   ├── 03-product-detail.md        ProductDetailFeature, gallery, variants
│   ├── 04-cart.md                  CartFeature, drawer, anon vs registered
│   ├── 05-checkout.md              CheckoutFeature, registered + guest flow
│   ├── 06-account.md               profile, addresses, wishlist
│   ├── 07-account-orders.md        order history + detail
│   └── 08-anonymous-checkout.md    full guest flow + claim link
│
├── admin/                          ← internal dashboard features
│   ├── 00-overview.md              route map, layout, shared concerns
│   ├── 01-dashboard.md             stats cards, recent orders, low stock
│   ├── 02-orders.md                AdminOrdersFeature, transitions, refunds
│   ├── 03-products.md              AdminProductsFeature, CRUD, bulk actions
│   ├── 04-categories-and-brands.md categories, subcategories, brands
│   ├── 05-customers.md             customer table, detail, role assignment
│   ├── 06-coupons.md               coupon CRUD, usage tracking
│   ├── 07-analytics.md             revenue, orders, products, customers
│   ├── 08-settings.md              store info, shipping, tax (ADMIN only)
│   └── 09-users.md                 user management (ADMIN only)
│
├── integrations/                   ← external services
│   ├── 01-clerk-auth.md            sign-in, sign-up, webhook sync
│   ├── 02-stripe-payments.md       PaymentIntents, webhooks, refunds
│   ├── 03-cloudinary-media.md      upload widget, transforms, folders
│   ├── 04-resend-email.md          transactional emails, React Email
│   └── 05-nuqs-url-state.md        URL params per feature, server reads
│
└── phases/                         ← execution plans (the build order)
    ├── README.md                   phase overview + dependency graph
    ├── phase-1-foundation.md       project setup, schema, auth, catalog
    ├── phase-2-commerce-core.md    cart, checkout, Stripe, guest flow
    ├── phase-3-registered-account.md profile, orders, addresses, wishlist
    ├── phase-4-admin-dashboard.md  layout, products, orders, customers, coupons
    ├── phase-5-growth-features.md  reviews, analytics, banners, alerts
    └── phase-6-mobile-app.md       Expo app consuming existing API routes
```

---

## Reading order for a new contributor (or fresh Claude Code session)

1. `architecture/01-overview.md` — what we're building and why.
2. `architecture/03-system-architecture.md` — request flow.
3. `architecture/05-database-schema.md` — data model.
4. `architecture/07-project-structure.md` — where code lives.
5. `architecture/08-conventions.md` — how code is written.
6. `phases/README.md` — current status and what to build next.
7. The relevant phase doc for the current phase.

---

## Document conventions

- Every feature doc has the same skeleton: **Overview → Routes → Data → UI → Behavior → Edge cases → Acceptance criteria**.
- Every phase doc has: **Goal → Dependencies → Deliverables → Tasks (checklist) → Acceptance criteria → Linked docs**.
- Code samples are illustrative. The Prisma schema in `architecture/05-database-schema.md` is the canonical source for data shapes.
- "USER+" means USER, MANAGER, or ADMIN. "MANAGER+" means MANAGER or ADMIN.
