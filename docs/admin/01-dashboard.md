# Admin — Dashboard Home

## Overview

The default `/admin` landing. At-a-glance summary of revenue, orders, stock, and top sellers. **Read-only.**

## Route

| Route    | Feature                 | Access         |
| -------- | ----------------------- | -------------- |
| `/admin` | `AdminDashboardFeature` | MANAGER, ADMIN |

## Feature path

`features/admin/dashboard/`

```
features/admin/dashboard/
├── components/
│   ├── StatsCards.tsx
│   ├── RecentOrdersTable.tsx
│   └── LowStockAlert.tsx
├── services/
│   └── dashboard.service.ts
└── index.tsx
```

## Data

`AdminDashboardFeature` (Server Component) fetches in parallel:

- **Revenue summary** — sum of `Order.totalOrderPrice` where `isPaid = true` for: today, this week, this month.
- **Orders by status** — count grouped by `OrderStatus` over the last 30 days.
- **Recent orders** — last 10 orders, ordered by `createdAt DESC`.
- **Low stock alerts** — products with `quantity < threshold` (configurable, default 5) and `status = ACTIVE`.
- **Top 5 products by revenue** — last 30 days. Sum `OrderItem.price * OrderItem.quantity` where the parent order `isPaid = true`, grouped by `productId`.

All queries should run via `Promise.all` in the service — no waterfalls.

## UI

- **`StatsCards`** — three cards: Today / This Week / This Month revenue. Each card includes order count and a small trend indicator (vs previous period).
- **Orders by status chart** — bar or donut.
- **`RecentOrdersTable`** — `humanOrderId`, customer (name or anon name), total, status badge, click-through to `/admin/orders/[id]`.
- **`LowStockAlert`** — list of low-stock products with current quantity and "Edit" link.
- **Top 5 products** — list with rank, name, revenue, units sold.

## Edge cases

- New store with no orders: render zero-state cards with a helpful "No orders yet" empty state.
- Time zone: dashboard uses the store's configured timezone (from settings). For the first build, default to `Africa/Cairo`.

## Acceptance criteria

- [ ] All data fetched in parallel; page-load TTFB target < 500ms on warm cache.
- [ ] Revenue counts only include `isPaid = true` orders.
- [ ] Recent orders link to detail.
- [ ] Low stock alert respects the configured threshold.
- [ ] No client-side data fetching.
