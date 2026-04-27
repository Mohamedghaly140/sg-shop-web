# 03 — System Architecture

## Request flow

```
Browser
  │
  │  Cookie (Clerk session)
  ▼
┌─────────────────────────────────────────────────────┐
│              Next.js 16 — Vercel                    │
│                                                     │
│  proxy.ts           Clerk auth + role guard         │
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

## Architectural rules

These are non-negotiable. Treat any code that violates them as a defect.

- **Server Components fetch data directly via Prisma.** No client-side fetch waterfalls on initial page load.
- **Server Actions handle all web mutations.** No API endpoints needed for the web app itself.
- **API Route Handlers are thin wrappers** around the same service functions used by Server Actions. They are built alongside every feature for future mobile consumption.
- **Prisma is server-only.** `DATABASE_URL` is never exposed to the client bundle.
- **Clerk proxy verifies every request** before it reaches any page or handler. Role checks happen here.
- **Users table is a lightweight Clerk mirror** synced via webhooks. Clerk owns identity; the DB owns app data (orders, addresses, cart, etc.).

## The three call paths

A given mutation has up to three callers, all funneling into the same service function:

```
┌──────────────────┐   ┌──────────────────┐   ┌──────────────────┐
│  Server Action   │   │  Route Handler   │   │  Webhook Handler │
│  (web mutations) │   │  (mobile API)    │   │  (Clerk/Stripe)  │
└────────┬─────────┘   └────────┬─────────┘   └────────┬─────────┘
         │                      │                      │
         └──────────┬───────────┴──────────┬───────────┘
                    ▼                      ▼
             ┌──────────────────────────────────┐
             │  Service function                │
             │  features/<f>/services/*.ts      │
             │  (business logic lives here)     │
             └─────────────┬────────────────────┘
                           ▼
                    ┌─────────────┐
                    │   Prisma    │
                    └─────────────┘
```

The action/route/webhook layer is responsible for: auth, input validation (Zod), wrapping the result in the response envelope. The service layer owns business logic.

See `06-api-design.md` for an end-to-end "add to cart" example showing all three layers.

## Why Server Components + Server Actions for the web

- **No initial-load fetch waterfalls.** The page renders with data already in place.
- **No public API surface for the web app.** Reduces attack surface — there's no `/api/admin/*` to harden.
- **Type-safe end-to-end.** The Server Action signature is the contract; both sides see the same TypeScript types.

## Why API route handlers anyway

- **Mobile app (Phase 6) needs them.** Building them now alongside each feature means zero backend work when the mobile app starts.
- **They share service functions** with Server Actions, so there's no logic duplication — only thin auth/validation/envelope wrappers.
