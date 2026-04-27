# Storefront — Cart

## Overview

The cart is a **first-class** part of the storefront. It's persistent for registered users and session-based for anonymous users. A drawer is available on every page; a full page exists at `/cart`.

## Routes

| Route   | Feature      | Access      |
| ------- | ------------ | ----------- |
| `/cart` | `CartFeature` | Public + anon |

## Feature path

`features/cart/`

```
features/cart/
├── components/
│   ├── CartDrawer.tsx
│   ├── CartItem.tsx
│   └── CartSummary.tsx
├── hooks/
│   └── useCart.ts
├── actions/
│   └── cart.actions.ts            # add / update / remove / merge
├── services/
│   └── cart.service.ts
└── index.tsx
```

## Cart identity

| Caller          | Key                                                  | Lifetime                  |
| --------------- | ---------------------------------------------------- | ------------------------- |
| Registered user | `Cart.userId = <Clerk userId>`                       | Permanent (until cleared) |
| Anonymous user  | `Cart.sessionToken = <cookie value>`, `expiresAt` set | 7 days                    |

The `sessionToken` cookie is set on the **first** cart interaction by an anonymous user. The `Cart` row is created at the same time.

## Data

`CartFeature` (Server Component) fetches the current cart:

- If `userId`: cart by `userId` with items, products (image, name, slug, sizes, colors, current price for "out of stock" check).
- If anonymous (cookie present): cart by `sessionToken`, same shape.
- If neither: render empty cart state.

Base totals are computed server-side and stored on the `Cart` row when the cart is mutated.

Coupon application is a separate Server Action and does **not** update the `Cart` row. `applyCouponAction` receives `cartId` and `code`, validates the coupon, and returns the same cart payload shape with computed `discountApplied` and `totalPriceAfterDiscount` values for the UI.

Checkout must receive the coupon code again if the user proceeds with the discount. It re-validates the coupon before order creation, then stores `couponId` and `discountApplied` on the `Order`.

## UI

- **`CartDrawer`** — slide-in panel, available on every page. Triggered from the nav cart icon.
- **`CartFeature`** (full page) — same item list as the drawer, but with more breathing room and a clearer summary block.
- **`CartItem`** — image, name, variant (size, color), quantity stepper, unit price, line total, remove button.
- **`CartSummary`** — subtotal, shipping estimate placeholder, coupon code input, grand total, "Checkout" CTA.

## Mutations (Server Actions)

| Action              | Effect                                                                 |
| ------------------- | ---------------------------------------------------------------------- |
| `addToCartAction`   | Insert or merge a `CartItem` (same productId+color+size → sum quantity); capture price snapshot |
| `updateQuantityAction` | Update `CartItem.quantity`; remove the item if quantity reaches 0     |
| `removeCartItemAction` | Delete the `CartItem`                                                |
| `applyCouponAction` | Validate coupon for `cartId`; return computed discount totals without writing to `Cart` |
| `clearCartAction`   | Delete all items                                                       |

After cart mutations, recompute and persist base cart totals. Coupon discounts are computed in the action response only.

## Cart merge on sign-in

When a guest signs in while they have an active session cart:

1. Read `sessionToken` from cookie.
2. Load the session cart and the user's existing DB cart (if any).
3. For each session cart item: if same `productId + color + size` exists in user cart → sum quantities. Otherwise append as a new item.
4. Delete the session cart row. Recalculate and save user cart totals.
5. Clear the `sessionToken` cookie.

This runs on the next request after sign-in (in the proxy or in a top-level Server Component on `/`).

## Edge cases

- Anonymous cart expiry: `expiresAt < now()` → treat as empty; lazy-cleanup runs in a cron or on-read.
- Product becomes `ARCHIVED` while in cart: keep the line, mark "no longer available", disable proceed-to-checkout for that line.
- Stock dropped below cart quantity: clamp the quantity to stock and show a warning.
- Coupon applied but expired by checkout time: drop the coupon, recompute totals, surface a notice.

## Acceptance criteria

- [ ] Anonymous users can add to cart without signing in.
- [ ] Cookie + `Cart` row are created on the first add.
- [ ] Drawer is available on every storefront page.
- [ ] Sign-in merges the session cart into the user cart, then clears the cookie.
- [ ] Same product+color+size always merges into one line.
- [ ] Price snapshot is preserved through later product price changes.
- [ ] Coupon validation runs server-side.
