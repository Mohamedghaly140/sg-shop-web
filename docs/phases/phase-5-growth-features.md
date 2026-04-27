# Phase 5 — Growth Features

## Goal

Layer in features that drive retention and decision-making: product reviews, the analytics dashboard, promotional banners, and proactive low-stock alerts.

## Dependencies

- Phase 1 complete.
- Phase 2 complete (orders exist; reviews need DELIVERED orders).
- Phase 3 complete (registered users; reviews require auth).
- Phase 4 complete (admin dashboard for analytics + banners).

## Deliverables

- Product reviews (post-purchase, verified buyers, ratings recompute).
- Admin analytics dashboard with date-range driven charts.
- Promotional banners (admin-managed content).
- Proactive low-stock alerts (notifications/email when products cross threshold).
- Expo push delivery for registered mobile devices.

## Linked docs

- `architecture/05-database-schema.md` (Review model)
- `admin/07-analytics.md`
- `storefront/03-product-detail.md` (reviews section)
- `integrations/04-resend-email.md`

## Tasks

### 1. Product reviews

#### Storefront

- [ ] `features/reviews/services/reviews.service.ts`:
  - `getReviewsForProduct(productId, params)` — paginated.
  - `canUserReview(userId, productId)` — checks the user has at least one DELIVERED order containing this product, and no existing review for the product.
  - `createReview(userId, productId, input)` — insert; then **recompute** `Product.ratingsAverage` and `Product.ratingsQuantity` via a Prisma aggregate.
  - `updateReview(userId, reviewId, input)` — owner-only; recompute aggregates.
  - `deleteReview(userId, reviewId)` — owner-only; recompute aggregates.
- [ ] Components in `features/product-detail/components/`:
  - `ReviewsList` (already scaffolded in Phase 1) — render reviews + aggregate breakdown bar chart.
  - `ReviewForm` — only rendered if `canUserReview` is true. Title, ratings (1–5 in 0.5 steps), submit.
- [ ] Actions (one file per action):
  - `features/reviews/actions/createReview.ts`
  - `features/reviews/actions/updateReview.ts`
  - `features/reviews/actions/deleteReview.ts`

#### Admin

- [ ] (Optional) Reviews moderation panel — list reviews with delete capability for offensive content. Out of scope unless prioritized.

#### API route handlers

- [ ] `/api/products/[slug]/reviews` — GET paginated reviews.
- [ ] `/api/reviews` — POST create.
- [ ] `/api/reviews/[id]` — PATCH update, DELETE remove.

### 2. Analytics dashboard

- [ ] `features/admin/analytics/` per `admin/07-analytics.md`.
- [ ] nuqs hook: `{ range: "30d", from: "", to: "" }`.
- [ ] Services (one per chart, all called via `Promise.all`):
  - `get-revenue.ts` — daily/weekly/monthly aggregate.
  - `get-orders-stats.ts` — total, AOV, cancellation rate.
  - `get-top-products.ts` — top 10 by revenue (with units).
  - `get-customer-split.ts` — new vs returning.
  - `get-payment-split.ts` — CASH vs CARD.
- [ ] Components: `DateRangePicker` (client), `RevenueChart`, `OrdersStatsCards`, `TopProductsTable`, `CustomerSplitChart`, `PaymentMethodSplit`.
- [ ] Add granularity logic: range ≤ 30d → daily, ≤ 90d → weekly, > 90d → monthly.

### 3. Promotional banners (admin-managed content)

- [ ] Schema: add `Banner` model:
  - `id`, `title`, `subtitle`, `imageId`, `imageUrl`, `linkUrl`, `position` (HOME_HERO / HOME_BELOW_GRID / etc.), `active`, `startsAt`, `endsAt`, `sortOrder`.
- [ ] Migration: `bunx prisma migrate dev --name add_banners`.
- [ ] Admin: `features/admin/banners/` — CRUD with Cloudinary image upload.
- [ ] Storefront: render active banners on `/` (and other configured positions). Filter by `active = true AND startsAt <= now() <= endsAt`.

### 4. Proactive low-stock alerts

- [ ] Service: `lowStockService.ts` with `getLowStockProducts(threshold)`.
- [ ] Trigger: a daily scheduled job. Options:
  - **Vercel cron** — add a route `/api/cron/low-stock` and configure `vercel.json` cron.
  - **External** — Supabase scheduled function or GitHub Actions on a schedule.
- [ ] On low-stock detected for a product:
  - Send an email to the support email (configured in admin settings).
  - Create an in-app notification for all ADMIN users.
- [ ] Threshold is configurable in admin settings (default 5).

### 5. Expo push notification delivery

- [ ] Add Expo Push API integration for tokens registered through `/api/account/devices` from Phase 3.
- [ ] When an in-app notification is created, also enqueue/send a push notification to the user's active devices.
- [ ] Handle invalid push tickets/receipts by deleting stale `UserDevice` rows.
- [ ] Push payload includes a stable deep-link target in `data` (order detail, account notifications, etc.).
- [ ] Push send failures are logged but never block the primary order/review/admin mutation.

### 6. Wire ratings into the storefront

- [ ] Product cards already render `ratingsAverage` and `ratingsQuantity` from Phase 1; verify the recompute on review changes is reflected after page revalidate.

## Acceptance criteria

### Reviews

- [ ] Only users who have a DELIVERED order containing the product can review.
- [ ] One review per user per product (DB unique constraint enforced).
- [ ] After insert/update/delete, `Product.ratingsAverage` and `Product.ratingsQuantity` are recomputed correctly.
- [ ] Aggregate ratings breakdown shows correct counts per star.
- [ ] Owner can update or delete their own review; nobody else can.

### Analytics

- [ ] Date range picker drives all charts via nuqs.
- [ ] All queries run in parallel.
- [ ] Revenue counts only paid orders.
- [ ] New vs returning logic is correct.
- [ ] CASH vs CARD split sums correctly.

### Banners

- [ ] Admin CRUD works with Cloudinary upload.
- [ ] Storefront renders only banners that are active and within their schedule.

### Low-stock alerts

- [ ] Scheduled job fires once a day.
- [ ] Email sends to support address; in-app notifications and push notifications appear for ADMIN users.
- [ ] Threshold respects admin settings.

### Push notifications

- [ ] Push notifications are sent for order lifecycle notifications to registered user devices.
- [ ] Invalid Expo push tokens are cleaned up after failed delivery receipts.
- [ ] Push failures do not block the primary mutation.

## What is **not** in this phase

- Mobile app → Phase 6.
