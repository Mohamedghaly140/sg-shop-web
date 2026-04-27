# 01 — Project Overview

## What we're building

A full-stack e-commerce web application built with Next.js 16. It serves two audiences from the same codebase:

- **Client storefront** — public-facing product catalog, cart, checkout (registered and anonymous), and account management.
- **Admin dashboard** — internal protected area for managing products, orders, customers, coupons, and analytics.

The Next.js app **is the entire backend**. There is no separate API service.

- Data mutations happen via **Server Actions**.
- Initial data loads happen in **Server Components**.
- A set of **REST API route handlers** is built alongside every web feature to serve a future React Native Expo mobile app.

## Key design goals

- **No dedicated backend service.** Next.js handles everything via Server Components, Server Actions, and API Route Handlers.
- **Anonymous (guest) checkout is a first-class feature.** Users can complete a purchase with just an email address — no account required.
- **API route handlers are built from day one** alongside every web feature, so the mobile app can be added later without any backend changes.
- **Role-based access control** enforced at the proxy level before any page or handler runs.
- **URL state** (filters, pagination, sort) lives in the URL via `nuqs` — shareable, bookmarkable, and readable server-side without a client round-trip.

## Future mobile app

The mobile app will be built as a **separate** React Native Expo project after the web app is complete and stable. It will consume the same API route handlers already built into this Next.js app. **No backend changes required.**

Planned mobile stack:

- React Native + Expo (managed workflow)
- TypeScript
- Expo Router
- `@clerk/expo` (auth)
- NativeWind (styling)
- TanStack Query (data fetching/caching)

Phase 6 covers the mobile app. See `phases/phase-6-mobile-app.md`.
