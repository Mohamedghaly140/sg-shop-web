# Storefront — Account (Profile, Addresses, Wishlist)

## Overview

The authenticated user's account area. Covers profile editing, address book, and wishlist. Order history has its own doc — see `07-account-orders.md`.

## Routes

| Route                | Feature                  | Access |
| -------------------- | ------------------------ | ------ |
| `/account`           | `AccountOverviewFeature` | USER+  |
| `/account/addresses` | `AddressesFeature`       | USER+  |
| `/account/wishlist`  | `WishlistFeature`        | USER+  |

All `/account/*` routes require auth — enforced in `proxy.ts`. Anonymous users are redirected to `/sign-in?redirect=...`.

## Feature path

`features/account/`

```
features/account/
├── components/
│   ├── ProfileForm.tsx
│   ├── AddressList.tsx
│   ├── AddressForm.tsx
│   ├── OrderList.tsx              # used by orders page (see 07-account-orders.md)
│   └── WishlistGrid.tsx
├── hooks/
│   └── useOrderParams.ts
├── actions/
│   └── account.actions.ts
├── services/
│   └── account.service.ts
└── index.tsx
```

## Layout

A shared `app/(storefront)/account/layout.tsx` with side nav: Overview · Orders · Addresses · Wishlist · Sign out.

## Profile (`/account` overview)

- Greeting + summary card (name, email, member since).
- Quick stats: total orders, lifetime spent.
- `ProfileForm` to edit **name** and **phone**.
- **Avatar is managed by Clerk** — link out to Clerk's user profile component for that.
- Email cannot be edited here (managed by Clerk).

### Mutations

- `updateProfileAction`: validates name, phone via Zod; updates the local `User` row. Clerk is the source of truth for email — name and phone are mirrored back via the `user.updated` Clerk webhook.

## Addresses (`/account/addresses`)

CRUD over the `Address` model. Supports Egyptian address structure (governorate, area).

- **`AddressList`** — cards for each address with default badge, edit, delete buttons. "Add address" CTA at the top.
- **`AddressForm`** (dialog) — alias, country, governorate, city, area, addressLine1, details, postal code, phone, lat/long (optional), `isDefault` checkbox.

### Mutations

- `createAddressAction`
- `updateAddressAction`
- `deleteAddressAction`
- `setDefaultAddressAction` — flips `isDefault` for the chosen address; clears `isDefault` on every other address for that user (in a single transaction).

### Edge cases

- Setting an address as default unsets it on every other address (single transaction).
- Deleting an address used by orders: the FK is `onDelete: SetNull` so historical orders keep the snapshot via the address fields they captured at order time. **However**, `Order.shippingAddress` is a relation; orders pre-deletion still keep the link until null. Confirm via test.

## Wishlist (`/account/wishlist`)

- **`WishlistGrid`** — `ProductCard` instances for each wishlisted product.
- Quick-add to cart from each card.
- Remove from wishlist button on each card.

### Mutations

- `addToWishlistAction(productId)` — upsert into `UserWishlist`.
- `removeFromWishlistAction(productId)` — delete from `UserWishlist`.

The wishlist toggle button on the product detail page reuses these actions.

## Acceptance criteria

- [ ] All `/account/*` routes redirect anonymous users to sign-in.
- [ ] Profile form updates `User.name` and `User.phone`.
- [ ] Address book supports full CRUD and a single default address per user.
- [ ] Wishlist supports add / remove / quick-add-to-cart.
- [ ] Layout side nav highlights the active route.
