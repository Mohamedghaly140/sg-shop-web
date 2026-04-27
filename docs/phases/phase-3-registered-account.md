# Phase 3 — Registered Account

## Goal

Build the authenticated user's account experience: profile, order history, addresses, wishlist, and in-app notifications.

## Dependencies

- Phase 1 complete (auth, schema).
- Phase 2 complete (orders exist; checkout writes them).

## Deliverables

- `/account` overview with profile editing.
- `/account/orders` list + `/account/orders/[id]` detail with status timeline.
- `/account/addresses` full CRUD with default address.
- `/account/wishlist` add/remove/quick-add-to-cart.
- In-app notifications for order events.
- API route handlers for every web feature shipped here.

## Linked docs

- `architecture/06-api-design.md`
- `storefront/06-account.md`
- `storefront/07-account-orders.md`
- `integrations/05-nuqs-url-state.md`

## Tasks

### 1. Account layout

- [ ] `app/(storefront)/account/layout.tsx` with side nav: Overview · Orders · Addresses · Wishlist · Sign out.
- [ ] Side nav highlights the active route.
- [ ] All `/account/*` routes already protected by `proxy.ts` from Phase 1 — verify.

### 2. Profile (`/account`)

- [ ] `features/account/index.tsx` → `AccountOverviewFeature`. Greeting, summary card, profile form.
- [ ] `features/account/components/ProfileForm.tsx` — edit name and phone.
- [ ] `features/account/actions/updateProfile.ts` — Zod-validate, update local `User`. (Email is managed by Clerk; do not edit here.)
- [ ] `features/account/services/account.service.ts` — `getProfile(userId)`, `getProfileStats(userId)` (orders count, lifetime spent).

### 3. Orders (`/account/orders`)

- [ ] `features/account/components/OrderList.tsx` — table, status filter via nuqs, click-through to detail.
- [ ] `features/account/hooks/useOrderParams.ts` — `{ status: "", page: 1 }`.
- [ ] `features/account/services/get-orders-for-user.ts`.
- [ ] `app/(storefront)/account/orders/page.tsx` thin wrapper.

### 4. Order detail (`/account/orders/[id]`)

- [ ] `features/order-detail/index.tsx` (or `features/account/order-detail/`) — header card, status timeline (stepper), line items, shipping address, totals.
- [ ] Authorization: 404 if `order.userId !== auth().userId` (do not leak existence with 403).
- [ ] All prices read from `OrderItem.price` snapshot — never recomputed from `Product.price`.

### 5. Addresses (`/account/addresses`)

- [ ] `features/account/components/AddressList.tsx` — cards with edit/delete/default badge.
- [ ] `features/account/components/AddressForm.tsx` — dialog. Egyptian address structure (country, governorate, city, area, addressLine1, details, phone, optional postal code, optional lat/long).
- [ ] Actions (one file per action):
  - `features/account/actions/createAddress.ts`
  - `features/account/actions/updateAddress.ts`
  - `features/account/actions/deleteAddress.ts`
  - `features/account/actions/setDefaultAddress.ts` — flips `isDefault` for chosen, clears for others (single transaction).

### 6. Wishlist (`/account/wishlist`)

- [ ] `features/account/components/WishlistGrid.tsx` — `ProductCard` instances with remove + quick-add.
- [ ] Actions:
  - `features/account/actions/addToWishlist.ts` — upsert into `UserWishlist`.
  - `features/account/actions/removeFromWishlist.ts`.
- [ ] Wire the wishlist toggle button on the product detail page (built in Phase 1 as a placeholder; activate here).

### 7. In-app notifications

- [ ] Render a notifications dropdown in the storefront top nav (registered users only).
- [ ] `features/notifications/services/notifications.service.ts`:
  - `getNotifications(userId, params)` — paginated.
  - `markAsRead(notificationId, userId)`.
  - `markAllAsRead(userId)`.
- [ ] Emit notifications from the order lifecycle:
  - On `payment_intent.succeeded` → `ORDER_CONFIRMED`.
  - On status → SHIPPED → `ORDER_SHIPPED`.
  - On status → DELIVERED → `ORDER_DELIVERED`.
  - On refund → `REFUND_PROCESSED`.
- [ ] Polling: simple SWR-like client poll every 60s, OR rely on revalidate after action. (Real-time push is out of scope for v1.)

### 8. API route handlers

- [ ] `/api/account/profile` — GET, PATCH.
- [ ] `/api/account/addresses` — GET list, POST create.
- [ ] `/api/account/addresses/[id]` — PATCH update, DELETE remove.
- [ ] `/api/account/wishlist` — GET list, POST add.
- [ ] `/api/account/wishlist/[productId]` — DELETE remove.
- [ ] `/api/orders` — GET user's order list (auth required).
- [ ] `/api/orders/[id]` — GET single order.

All routes call the same service functions used by Server Actions.

## Acceptance criteria

### Profile

- [ ] Profile form updates `User.name` and `User.phone`.
- [ ] Avatar links out to Clerk's user profile component.
- [ ] Stats cards show correct order count and lifetime spent.

### Orders

- [ ] List view filters by status via nuqs.
- [ ] List shows only orders belonging to the signed-in user.
- [ ] Detail view 404s for orders not owned by the signed-in user.
- [ ] Status timeline reflects actual order transitions.
- [ ] Prices come from `OrderItem.price` snapshots.

### Addresses

- [ ] Full CRUD works.
- [ ] Setting an address as default unsets it on every other address (single transaction).
- [ ] Egyptian address structure renders correctly in checkout.

### Wishlist

- [ ] Add and remove work from both the wishlist page and the product detail page.
- [ ] Quick-add to cart works from the wishlist.

### Notifications

- [ ] Notifications appear in the dropdown for the right user.
- [ ] Mark as read / mark all as read work.
- [ ] Notifications are emitted from order lifecycle events.

### Code quality

- [ ] Every Server Action has a matching API route handler.
- [ ] Service functions are shared between actions and routes — no duplication.
- [ ] No `useState` for filters/pagination.

## What is **not** in this phase

- Admin dashboard → Phase 4.
- Reviews → Phase 5.
- Mobile app → Phase 6.
