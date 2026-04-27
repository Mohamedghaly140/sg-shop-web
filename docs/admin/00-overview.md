# Admin Dashboard — Overview

The admin dashboard is the internal protected area for managing the store. All routes live under `/admin/*` and require `MANAGER` or `ADMIN` role. It has its **own layout** with sidebar navigation and top bar — separate from the storefront layout.

## Layout

`app/admin/layout.tsx`:

- Left sidebar with grouped navigation (Operations, Catalog, Customers, Marketing, Insights, Settings).
- Top bar: breadcrumb, search, notifications, user menu.
- The sidebar **filters items by role**: `/admin/settings` and `/admin/users` only render their nav links for ADMIN.

## Route map

| Route                   | Feature component            | Access         |
| ----------------------- | ---------------------------- | -------------- |
| `/admin`                | `AdminDashboardFeature`      | MANAGER, ADMIN |
| `/admin/orders`         | `AdminOrdersFeature`         | MANAGER, ADMIN |
| `/admin/orders/[id]`    | `AdminOrderDetailFeature`    | MANAGER, ADMIN |
| `/admin/products`       | `AdminProductsFeature`       | MANAGER, ADMIN |
| `/admin/products/new`   | `AdminProductFormFeature`    | MANAGER, ADMIN |
| `/admin/products/[id]`  | `AdminProductFormFeature`    | MANAGER, ADMIN |
| `/admin/categories`     | `AdminCategoriesFeature`     | MANAGER, ADMIN |
| `/admin/brands`         | `AdminBrandsFeature`         | MANAGER, ADMIN |
| `/admin/customers`      | `AdminCustomersFeature`      | MANAGER, ADMIN |
| `/admin/customers/[id]` | `AdminCustomerDetailFeature` | MANAGER, ADMIN |
| `/admin/coupons`        | `AdminCouponsFeature`        | MANAGER, ADMIN |
| `/admin/analytics`      | `AdminAnalyticsFeature`      | MANAGER, ADMIN |
| `/admin/settings`       | `AdminSettingsFeature`       | ADMIN only     |
| `/admin/users`          | `AdminUsersFeature`          | ADMIN only     |

## Cross-cutting concerns

- **Role enforcement** happens in three places: `proxy.ts` (gate the page), the Server Action (gate the mutation), the UI (hide the button). The middle one is the security gate; the others are UX.
- **All admin tables use nuqs** for filters/pagination — no client-side state for these.
- **Mutations follow the one-file-per-action pattern** (see `architecture/08-conventions.md`). Admin features tend to have many actions and benefit most from this.
- **Audit-logging is out of scope** for the initial build but should be designed-around — service functions are the right place to add it later.

## Per-feature documents

| Feature             | Doc                                  |
| ------------------- | ------------------------------------ |
| Dashboard home      | `01-dashboard.md`                    |
| Orders              | `02-orders.md`                       |
| Products            | `03-products.md`                     |
| Categories & Brands | `04-categories-and-brands.md`        |
| Customers           | `05-customers.md`                    |
| Coupons             | `06-coupons.md`                      |
| Analytics           | `07-analytics.md`                    |
| Settings (ADMIN)    | `08-settings.md`                     |
| Users (ADMIN)       | `09-users.md`                        |
