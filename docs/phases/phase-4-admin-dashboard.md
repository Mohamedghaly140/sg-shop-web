# Phase 4 — Admin Dashboard

## Goal

Build the internal dashboard for managing the store: products, orders, customers, categories, brands, coupons. Settings and user management round it out for ADMIN.

## Dependencies

- Phase 1 complete (auth, schema, proxy enforces admin role).
- Phase 2 complete (orders, refunds — `refundOrder` service was built there; the UI lands here).
- Phase 3 is **not** required — admin can ship in parallel with the registered account area.

## Deliverables

- Admin layout with role-aware sidebar.
- Dashboard home with stats, recent orders, low stock.
- Orders management: list, detail, status transitions, cancel, refund, manual order creation.
- Products management: full CRUD, Cloudinary upload, bulk actions.
- Categories + subcategories + brands management.
- Customers list + detail, role assignment (ADMIN-only).
- Coupons CRUD.
- Settings (ADMIN-only): store info, shipping zones, tax config.
- Users (ADMIN-only): role + active state management.

## Linked docs

- `admin/00-overview.md` (route map, layout, conventions)
- `admin/01-dashboard.md`
- `admin/02-orders.md`
- `admin/03-products.md`
- `admin/04-categories-and-brands.md`
- `admin/05-customers.md`
- `admin/06-coupons.md`
- `admin/08-settings.md`
- `admin/09-users.md`
- `architecture/04-roles-and-permissions.md`
- `integrations/03-cloudinary-media.md`

(Analytics — `admin/07-analytics.md` — is Phase 5.)

## Tasks

### 1. Admin layout & navigation

- [ ] `app/admin/layout.tsx` — sidebar + topbar shell.
- [ ] Sidebar groups: Operations (Dashboard, Orders) · Catalog (Products, Categories, Brands) · Customers · Marketing (Coupons) · Settings (ADMIN only) · Users (ADMIN only).
- [ ] Hide ADMIN-only items from MANAGER role.
- [ ] Confirm `proxy.ts` enforces:
  - `/admin/*` → MANAGER+
  - `/admin/settings`, `/admin/users` → ADMIN only

### 2. Dashboard home

- [ ] `features/admin/dashboard/services/dashboard.service.ts` with all aggregate queries from `admin/01-dashboard.md`.
- [ ] `Promise.all` in `index.tsx` so all queries fan out in parallel.
- [ ] Components: `StatsCards`, `RecentOrdersTable`, `LowStockAlert`.

### 3. Orders management

- [ ] `features/admin/orders/` — list view with nuqs filters (status, search, paymentMethod, from, to, page).
- [ ] `features/admin/order-detail/` — detail page with status stepper.
- [ ] Actions (one file per action):
  - `updateOrderStatus.ts` — enforce legal transitions; set `deliveredAt` on DELIVERED; send shipped/delivered emails.
  - `togglePaid.ts` — CASH only.
  - `cancelOrder.ts` — if paid CARD → refund.
  - `refundOrder.ts` — Stripe refund + REFUNDED status + email + notification (the service function from Phase 2; wire to UI here).
  - `createOrderAdmin.ts` — manual order creation on behalf of a customer.

### 4. Products management

- [ ] `features/admin/products/` — list view with nuqs filters (status, category, search, page).
- [ ] `features/admin/products/components/ProductForm.tsx` — create/edit form covering all fields from `admin/03-products.md`.
- [ ] `ImageUploader.tsx` using Cloudinary Upload Widget per `integrations/03-cloudinary-media.md`.
- [ ] Actions (one file per action):
  - `createProduct.ts`
  - `updateProduct.ts`
  - `deleteProduct.ts` — falls back to archive if order items reference the product.
  - `updateProductStatus.ts`
  - `toggleFeatured.ts`
  - `deleteProductImage.ts`
  - `duplicateProduct.ts`
  - Plus any helpers in `productActionHelpers.ts`.
- [ ] Bulk actions: publish, archive, delete on selected rows.
- [ ] Cloudinary cleanup on image replace and product delete (with try/catch).

### 5. Categories, subcategories, brands

- [ ] `features/admin/categories/` — table + dialog form + subcategory side panel.
  - Actions: `createCategory`, `updateCategory`, `deleteCategory`, `createSubCategory`, `updateSubCategory`, `deleteSubCategory`.
  - Block category deletion if products reference it (FK Restrict).
- [ ] `features/admin/brands/` — table + dialog form.
  - Actions: `createBrand`, `updateBrand`, `deleteBrand`.
  - Brand deletion clears `Product.brandId` (FK SetNull); show a confirmation dialog explaining this.
- [ ] Cloudinary covers/logos upload + cleanup.

### 6. Customers

- [ ] `features/admin/customers/` — list view with nuqs filters (search, role, page).
- [ ] Detail view: info card + orders list + addresses (read-only) + role assignment (ADMIN only).
- [ ] Actions:
  - `toggleCustomerActive.ts` — flip `User.active`; sync to Clerk (ban/unban) — see `admin/05-customers.md`.
  - `changeCustomerRole.ts` — ADMIN only; Clerk first, then DB. Must not allow demoting the last ADMIN. Must not allow self-demotion.
- [ ] Aggregations (orders count, LTV) computed on demand.

### 7. Coupons

- [ ] `features/admin/coupons/` — table with active/expired toggle + dialog form.
- [ ] Actions:
  - `createCoupon.ts` — uppercase, no whitespace, unique.
  - `updateCoupon.ts` — refuse changes that would invalidate already-used coupons.
  - `deactivateCoupon.ts` — set `expire = now()`.
  - `deleteCoupon.ts` — hard delete only when `usedCount = 0`.

### 8. Settings (ADMIN only)

- [ ] Add migration for settings storage:
  - `StoreSettings` table (single-row pattern — name, currency, timezone, support email, tax config JSON).
  - `ShippingZone` table (name, list of countries/governorates, flat rate).
- [ ] `features/admin/settings/` — three panels: store info, shipping zones, tax config.
- [ ] Actions: `updateStoreInfo`, `upsertShippingZone`, `deleteShippingZone`, `updateTaxConfig`. All re-check ADMIN role.
- [ ] Wire shipping zones into `checkout.service.ts` to compute `Order.shippingFees`.
- [ ] Wire tax config into checkout totals.

### 9. Users (ADMIN only)

- [ ] `features/admin/users/` — list view with nuqs filters (search, role, active, page).
- [ ] Actions:
  - `changeUserRole.ts` — same constraints as customers' role change.
  - `toggleUserActive.ts` — same constraints; cannot deactivate self.

## Acceptance criteria

### Layout & access

- [ ] MANAGER cannot reach `/admin/settings` or `/admin/users` (proxy redirect).
- [ ] Sidebar hides ADMIN-only items from MANAGER.
- [ ] All admin actions re-check role server-side.

### Dashboard

- [ ] Stats, recent orders, low stock all render with correct data.
- [ ] All queries run in parallel (no waterfalls).

### Orders

- [ ] Filters & search work via nuqs.
- [ ] Status transitions reject illegal transitions.
- [ ] Cancel on a paid CARD order triggers refund.
- [ ] Refund updates the order, sends email, creates notification.
- [ ] CASH "toggle paid" sets `paidAt` correctly.
- [ ] Manual order creation works for both registered and anon customers.

### Products

- [ ] Full CRUD works.
- [ ] Cloudinary uploads happen browser → Cloudinary directly.
- [ ] `priceAfterDiscount` is computed on save.
- [ ] Subcategories filter by selected category.
- [ ] Bulk publish/archive/delete works.
- [ ] Featured toggle works inline from the list.

### Categories, brands, coupons

- [ ] Categories with products cannot be deleted.
- [ ] Brand deletion clears product references with a confirmation dialog.
- [ ] Coupons can't be deleted once used; can be deactivated.
- [ ] Coupon application at checkout respects expiry and usage limit.

### Customers & users

- [ ] Aggregations show correctly.
- [ ] Role change updates Clerk first, then DB.
- [ ] Cannot demote the last ADMIN.
- [ ] Cannot change/deactivate your own account.
- [ ] Inactive users cannot sign in.

### Settings

- [ ] Migration runs cleanly.
- [ ] Shipping zones drive checkout shipping fees.
- [ ] Tax config affects checkout totals when enabled.

### Code quality

- [ ] One file per action across all admin features.
- [ ] No business logic in admin pages — only feature components and services.
- [ ] Every action revalidates the relevant paths.
- [ ] No `any` and no `useState` for URL state.

## What is **not** in this phase

- Analytics dashboard → Phase 5.
- Reviews → Phase 5.
- Promotional banners → Phase 5.
- Low-stock notifications (proactive emails/notifications, not just the dashboard widget) → Phase 5.
- Mobile app → Phase 6.
