# Admin — Orders Management

## Overview

The order operations hub. Search, filter, view detail, transition statuses, cancel/refund.

## Routes

| Route                | Feature                   | Access         |
| -------------------- | ------------------------- | -------------- |
| `/admin/orders`      | `AdminOrdersFeature`      | MANAGER, ADMIN |
| `/admin/orders/[id]` | `AdminOrderDetailFeature` | MANAGER, ADMIN |

## Feature paths

```
features/admin/orders/                     # list view
├── components/
│   ├── OrdersTable.tsx
│   ├── OrderFilters.tsx
│   ├── OrderStatusBadge.tsx
│   └── OrderDetailPanel.tsx
├── hooks/
│   └── useOrderParams.ts
├── services/
│   └── get-orders.ts
└── index.tsx

features/admin/order-detail/               # single order
├── components/
│   ├── OrderInfoCard.tsx
│   ├── OrderStatusStepper.tsx
│   ├── UpdateOrderStatusDialog.tsx
│   └── …
├── actions/                               # one file per action
│   ├── updateOrderStatus.ts
│   ├── togglePaid.ts
│   ├── cancelOrder.ts
│   └── refundOrder.ts
├── services/
│   └── get-order.ts
└── index.tsx
```

## URL state (nuqs)

For `/admin/orders`:

```typescript
{ status: "", search: "", paymentMethod: "", from: "", to: "", page: 1 }
```

## List view (`/admin/orders`)

- Table with nuqs-powered filters: status, date range (from/to), payment method.
- Search by order ID (`humanOrderId`), customer name, or email.
- Per row: `humanOrderId`, customer (name + email), total, status badge, payment status, payment method, created at, click-through.
- Pagination via nuqs `page`.

### Search behavior

The search box matches across:

- `Order.humanOrderId` (e.g. "ORD-000123")
- Registered: `User.name`, `User.email`
- Anonymous: `Order.anonName`, `Order.anonEmail`

Use Postgres ILIKE with trigram or a `tsvector` if needed for performance.

## Detail view (`/admin/orders/[id]`)

- Header card: `humanOrderId`, status, payment status, paid at, delivered at, created at.
- Customer info: registered (link to `/admin/customers/[id]`) or anonymous (echo anon fields with a "Guest" tag and a "this order can be claimed" indicator if `guestToken` is unclaimed).
- Shipping address: from `Address` (registered) or `anon*` fields (anonymous).
- Line items: image, name, variant, quantity, snapshot price, line total.
- Totals: subtotal, shipping fees, coupon discount, grand total.
- Status timeline (stepper).
- Actions:
  - **Update status** — dialog with allowed transitions.
  - **Toggle paid** — for CASH orders. Records `paidAt`.
  - **Cancel** — with optional reason. If `paymentMethod = CARD` and `isPaid = true`, also issue a Stripe refund.
  - **Refund** — issues a Stripe refund for paid CARD orders. See `integrations/02-stripe-payments.md`.

## Status transitions

Allowed transitions:

```
PENDING → PROCESSING → SHIPPED → DELIVERED
   ↓           ↓           ↓
CANCELLED   CANCELLED   CANCELLED          (REFUNDED is terminal)
```

Enforce these in `updateOrderStatus.ts` — reject illegal transitions.

## Manual order creation

A "+ Create order" CTA on the list view opens a multi-step dialog/form to create an order on behalf of a customer (in-store sales, phone orders). Re-uses the checkout service with admin-only flags:

- Pick or create a customer (or mark as anonymous).
- Add line items by product search.
- Choose payment method, mark as paid if applicable.
- Skip Stripe — admin-created CARD orders are recorded as paid externally.

## Mutations (one file per action)

| File                  | Effect                                                                 |
| --------------------- | ---------------------------------------------------------------------- |
| `updateOrderStatus.ts` | Validate transition; update status; set `deliveredAt` on DELIVERED; revalidate paths |
| `togglePaid.ts`        | CASH only; flip `isPaid`, set/clear `paidAt`                            |
| `cancelOrder.ts`       | Status → CANCELLED; if paid CARD → trigger refund flow                 |
| `refundOrder.ts`       | Stripe refund + status REFUNDED + send email + notification            |
| `createOrderAdmin.ts`  | Admin-created order (skip Stripe; mark paid if requested)              |

## Acceptance criteria

- [ ] Filters and search work via nuqs.
- [ ] Pagination via nuqs.
- [ ] Detail page shows correct info for both registered and anonymous orders.
- [ ] Status transitions reject illegal transitions.
- [ ] Cancel on a paid CARD order triggers refund.
- [ ] Refund updates the order to REFUNDED, sends a customer email, creates an in-app notification (for registered users).
- [ ] CASH "Toggle paid" sets `paidAt` correctly.
- [ ] Manual order creation works for both registered and anon flows.
