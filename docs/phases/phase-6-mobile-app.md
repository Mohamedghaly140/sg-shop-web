# Phase 6 — Mobile App

## Goal

Ship a React Native + Expo mobile app that consumes the **existing** API route handlers built throughout Phases 1–5. **Zero backend changes required** — if a backend change is needed, it indicates the API route was missed in an earlier phase.

This is a **separate Expo project**. It does not live in the Next.js repo.

## Dependencies

- All previous phases complete.
- All `/api/*` route handlers verified working from a non-browser HTTP client (Postman, `bun --bun curl`, etc.).
- Apple/Google developer accounts (when shipping to stores).

## Deliverables

- React Native + Expo app (managed workflow) with TypeScript.
- Auth via `@clerk/expo` with `expo-secure-store`.
- Storefront browsing: catalog, search, filters, product detail.
- Cart synced with the server.
- Checkout for registered users (anonymous checkout deferred unless prioritized — guests rarely use a mobile app).
- Order history and tracking.
- Push notifications via Expo Notifications.

## Stack

- React Native + Expo (managed workflow)
- TypeScript
- Expo Router (file-based routing)
- `@clerk/expo` (auth)
- NativeWind (Tailwind-like styling)
- TanStack Query (data fetching, caching, mutations)
- `expo-secure-store` (token storage)
- `expo-notifications` (push)

## Tasks

### 1. Project scaffold

- [ ] `bunx create-expo-app` with TypeScript template + Expo Router.
- [ ] Add NativeWind, configure Tailwind.
- [ ] Add TanStack Query and a global `QueryClientProvider`.
- [ ] Add `@clerk/expo` and configure `expo-secure-store` token cache.
- [ ] Set base API URL from env: `EXPO_PUBLIC_API_URL=https://yourdomain.com/api`.

### 2. Auth

- [ ] Add Apple OAuth to Clerk (now is the time — see `integrations/01-clerk-auth.md`).
- [ ] Sign-in / sign-up screens using Clerk's React Native components.
- [ ] Auth-aware route guard at the Expo Router level.
- [ ] Send Clerk session token in every API request (`Authorization: Bearer <token>` or however the route handlers verify — Clerk's middleware should handle this when the token is in the header).

### 3. API client

- [ ] `lib/api.ts` — typed fetch wrapper that:
  - Reads the Clerk session token.
  - Adds `Authorization` header.
  - Parses the response envelope.
  - Throws on `success: false` so TanStack Query can catch it.
- [ ] One TanStack Query hook per endpoint, mirroring the route map in `architecture/06-api-design.md`.

### 4. Storefront features

- [ ] Home screen — hero, featured products, category grid (consume `/api/products?featured=true` or similar).
- [ ] Catalog screen — list with filters and sort. Mobile filter UX: bottom sheet.
- [ ] Search screen — `/api/products?q=...`.
- [ ] Product detail screen — gallery, variants, add to cart.
- [ ] Categories screen — `/api/categories`, drill into a category.

### 5. Cart

- [ ] Cart screen — fetch via `/api/cart`.
- [ ] Add/update/remove using the existing `/api/cart/*` routes.
- [ ] No anonymous cart on mobile (require sign-in to add to cart) — simplifies the v1.

### 6. Checkout (registered)

- [ ] Pick from saved addresses (`/api/account/addresses`) or add a new one.
- [ ] Payment: Stripe Mobile SDK with Payment Sheet.
  - Server creates the PaymentIntent via `/api/checkout`.
  - Client presents the Payment Sheet using `clientSecret`.
  - Webhook server-side flips `isPaid` (already wired in Phase 2).

### 7. Orders

- [ ] Order history — `/api/orders`.
- [ ] Order detail — `/api/orders/[id]`.

### 8. Push notifications

- [ ] Register the device with Expo Notifications; get the push token.
- [ ] Add API route `/api/account/devices` (POST) on the Next.js app to store the push token against the user.
- [ ] Server-side: when an in-app notification is created (Phase 3 wiring), also send a push notification via Expo Push API to the user's registered devices.
- [ ] Tap action: deep-link into the relevant screen (order detail, etc.).

### 9. Build & ship

- [ ] EAS Build for iOS and Android.
- [ ] TestFlight + internal Play track.
- [ ] App Store / Play Store listings.

## Acceptance criteria

### App shell

- [ ] App boots and authenticates via Clerk.
- [ ] Session persists across app restarts (secure store).
- [ ] All API requests carry the Clerk token; route handlers accept them.

### Storefront

- [ ] Home, catalog, search, product detail all consume the existing API route handlers — no new server endpoints written.
- [ ] Filters and sort behave like the web app (URL state isn't relevant on mobile, but functional behavior matches).

### Cart & checkout

- [ ] Add/update/remove cart items work end-to-end against the live API.
- [ ] Stripe Payment Sheet completes successfully; the server webhook still flips `isPaid`.

### Orders

- [ ] Order history and detail render correctly.
- [ ] Order data shape matches the web app (because they share the service layer).

### Push notifications

- [ ] Device token is registered with the server.
- [ ] Push arrives on order events.
- [ ] Tap deep-link opens the right screen.

### Definition of "no backend changes required"

- [ ] The mobile app is delivered without merging any change to the Next.js repo other than:
  - Adding `/api/account/devices` (push token registration).
  - Wiring server-side push send from the existing notification creation paths.
- [ ] Anything more than that = a missed API in an earlier phase. Add it in the appropriate phase doc as a follow-up note.
