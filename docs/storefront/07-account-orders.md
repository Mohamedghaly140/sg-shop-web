# Storefront — Account Orders

## Overview

The customer's view of their own orders. List view with filters, plus a per-order detail page with a status timeline.

## Routes

| Route                  | Feature              | Access |
| ---------------------- | -------------------- | ------ |
| `/account/orders`      | `OrdersFeature`      | USER+  |
| `/account/orders/[id]` | `OrderDetailFeature` | USER+  |

## Feature path

Reuses `features/account/components/OrderList.tsx` for the list and a dedicated `OrderDetailFeature`. (Or keep these inside `features/account/` if you prefer — the boundary is up to the implementer.)

## URL state (nuqs)

For `/account/orders`:

```typescript
{ status: "", page: 1 }
```

## List view (`/account/orders`)

- Paginated table or list of the signed-in user's orders.
- Each row: `humanOrderId`, date, total, status badge, click-through to detail.
- Filter by status (PENDING / PROCESSING / SHIPPED / DELIVERED / CANCELLED / REFUNDED) via nuqs.

### Data

`getOrdersForUser(userId, params)` — orders where `userId = <signed-in user>`, optional status filter, paginated.

## Detail view (`/account/orders/[id]`)

- Order header: `humanOrderId`, status, payment method, payment status, placed at, delivered at.
- Status timeline: PENDING → PROCESSING → SHIPPED → DELIVERED, with timestamps where known. CANCELLED and REFUNDED render as terminal states.
- Line items: image, name, variant, quantity, unit price, line total — pulled from `OrderItem` snapshots.
- Shipping address: from `Address` for registered orders. (Anonymous orders won't appear in this user's account unless claimed — see `08-anonymous-checkout.md`.)
- Coupon used + discount applied.
- Totals: subtotal, shipping fees, discount, grand total.
- "Download invoice" link (PDF or HTML — out of scope for Phase 3 unless prioritized; gate this CTA on a feature flag).

### Authorization

The order **must** belong to the signed-in user (`Order.userId === auth().userId`). If not, return 404 (not 403 — don't leak existence).

### Status transitions visible to user

Only admins/managers transition status. The customer view is read-only.

## Edge cases

- Order in PENDING with CARD payment that hasn't completed: render with a "Payment in progress" notice. Allow retry of payment via Stripe Elements (out of scope for Phase 3 — record and revisit).
- Order REFUNDED: render the timeline up to PROCESSING, then a clear REFUNDED step with refund date and amount.
- Order CANCELLED before payment: render minimally with the cancellation reason if present.

## Acceptance criteria

- [ ] List view filters by status via nuqs.
- [ ] List view shows only orders belonging to the signed-in user.
- [ ] Detail view 404s for orders not owned by the signed-in user.
- [ ] Status timeline reflects the order's actual transition history.
- [ ] All prices are read from `OrderItem.price` (the snapshot) — never recomputed from `Product.price`.
