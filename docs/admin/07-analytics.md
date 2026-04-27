# Admin — Analytics

## Overview

Read-only analytics dashboards for revenue, orders, products, customers, and payments. Charts driven by URL-state date ranges.

## Route

| Route              | Feature                 | Access         |
| ------------------ | ----------------------- | -------------- |
| `/admin/analytics` | `AdminAnalyticsFeature` | MANAGER, ADMIN |

## Feature path

`features/admin/analytics/`

```
features/admin/analytics/
├── components/
│   ├── DateRangePicker.tsx       # 'use client' — writes nuqs params
│   ├── RevenueChart.tsx
│   ├── OrdersStatsCards.tsx
│   ├── TopProductsTable.tsx
│   ├── CustomerSplitChart.tsx
│   └── PaymentMethodSplit.tsx
├── hooks/
│   └── useAnalyticsParams.ts
├── services/
│   ├── get-revenue.ts
│   ├── get-orders-stats.ts
│   ├── get-top-products.ts
│   ├── get-customer-split.ts
│   └── get-payment-split.ts
└── index.tsx
```

## URL state (nuqs)

```typescript
{ range: "30d", from: "", to: "" }
```

`range` is a preset shortcut: `7d` / `30d` / `90d` / `custom`. When `range = custom`, `from` and `to` are honored. Otherwise they're computed from `range`.

## Sections

### Revenue

- Line chart with daily / weekly / monthly granularity (granularity auto-derived from range length: ≤ 30d daily, ≤ 90d weekly, > 90d monthly).
- Y-axis: revenue from paid orders.
- X-axis: date bucket.

`get-revenue.ts` runs an aggregate Prisma query (group by `date_trunc`) over `Order` rows where `isPaid = true` and `createdAt` in range.

### Orders stats cards

- Total orders (count).
- Average order value (`SUM(totalOrderPrice) / COUNT(orders)` for paid orders).
- Cancellation rate (`COUNT(CANCELLED) / COUNT(*)`).

### Top products

- Table: product name, units sold, revenue.
- Sortable by revenue or units.
- Defaults to revenue desc, top 10.

`get-top-products.ts` joins `OrderItem` with `Order` (filter `isPaid = true`, in range), groups by `productId`, sums quantity and `quantity * price`.

### Customers

- Donut: new vs returning ratio in the date range.
  - **New** = customer's first order is in range.
  - **Returning** = customer has a prior order before this range.

### Payments

- Donut or bar: CASH vs CARD split (count and revenue) for paid orders in the range.

## Performance considerations

All five service functions should be called in `Promise.all` from `index.tsx`. Heavy aggregates may benefit from materialized views or a small in-memory cache later — out of scope for v1.

## Acceptance criteria

- [ ] Date range picker writes to nuqs and triggers server re-render with new data.
- [ ] All charts honor the date range.
- [ ] Revenue counts only include paid orders.
- [ ] Top products are sorted by revenue desc by default.
- [ ] New vs returning logic is correct.
- [ ] CASH vs CARD split sums to total paid orders.
- [ ] All data fetched in parallel; no waterfalls.
