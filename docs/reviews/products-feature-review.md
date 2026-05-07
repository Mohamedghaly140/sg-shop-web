# Code Review: `features/products/` — Products Catalog Page

**Date:** 2026-05-02
**Reviewer:** Claude Code (automated multi-agent review)
**Branch:** main

---

## Strengths

- `index.tsx` is a proper Server Component with parallel `Promise.all` data fetching — the single most important acceptance criterion is met.
- The nuqs hook file (`use-product-params.ts`) correctly exports both `loadProductParams` for server use and `useProductParams` for client use from a single schema, which is exactly the pattern CLAUDE.md demands.
- `get-products.ts` correctly serializes all `Decimal` fields to strings before returning — the service boundary is clean and safe for Client Component consumption.
- All filter UI correctly resets `page` to `1` on every filter change. This is easy to miss and was consistently applied.
- The `MobileFiltersSheet` price inputs use debounced `useState` + `useRef` for timer management — a correct tradeoff that avoids hammering the URL on every keystroke. The timer is also properly cleared in `handleClearAll`, preventing stale updates after a reset.
- `ProductSort` correctly resets `page` on sort change; `ProductEmptyState` also resets `sort`, not just filters — both are correct.
- `ProductFilterBar`'s "clear all" handler uses a single `setParams` call, producing one URL push rather than six sequential ones.
- Lucide icons are consistently prefixed with `Lucide` throughout all new files, matching the project naming convention.

---

## Issues

### Critical

#### ~~1. Badge and "Sold Out" label overlap at `top-3 left-3`~~ ✅ Fixed

**File:** `features/products/components/product-card.tsx`

Both the `badge` (sale/new) and the sold-out label use `absolute top-3 left-3`. When a product has `quantity === 0` AND `discount > 0` (a sold-out sale item), both elements render at the same position and stack on top of each other. The spec explicitly says out-of-stock items still appear in the catalog. This is a visual bug that will be reproducible in production.

**Fix:** Give the sold-out badge a different position (e.g., `bottom-3 left-3`), noting the wishlist button already occupies `top-3 right-3`.

---

#### ~~2. `status` and `createdAt` manually re-declared in `StorefrontProductItem`~~ ✅ Fixed

**File:** `features/products/types/index.ts`

`status` and `createdAt` are added to `storefrontProductSelect` but then manually re-declared as overrides in `StorefrontProductItem` (`status: ProductStatus`, `createdAt: Date`) rather than letting them flow from `Prisma.ProductGetPayload`. If the schema changes these field types, the manual declarations will silently diverge from reality.

Additionally, `status` is unused in `ProductCard` (sold-out uses `quantity === 0`), so it fetches an extra column on every row with no benefit.

**Fix:** Remove the manual re-declarations and let Prisma's generated types carry the fields, or remove `status` from the select entirely.

---

### Important

#### ~~3. `actions/` directory is entirely absent~~ ✅ Fixed

**Spec requirement:** `features/products/actions/products.actions.ts`

~~Every "Add to Cart" button in both grid and list layouts of `ProductCard` is currently `disabled` with no `onClick` or Server Action wired. The feature structure contract in CLAUDE.md requires an `actions/` directory to exist in every feature. The directory should be created with a Server Action stub at minimum.~~

---

#### ~~4. Wishlist button is fully unwired~~ ✅ Fixed

**File:** `features/products/components/product-card.tsx`

~~The grid card renders a `<button>` for wishlist with an `inWishlist` prop, but no caller ever passes it. The button has no `onClick` handler. The `aria-label` will always read "Add to wishlist" regardless of actual state, which is misleading for screen readers.~~

Button marked `disabled`, `aria-label` set to `"Wishlist coming soon"`, `inWishlist` prop removed.

---

#### ~~5. `getFilterOptions` loads every active product into memory~~ ✅ Fixed

**File:** `features/products/services/get-filter-options.ts`

```ts
prisma.product.findMany({
  where: { status: ProductStatus.ACTIVE },
  select: { sizes: true, colors: true },
})
```

This loads every active product's `sizes` and `colors` arrays into Node memory just to deduplicate them in JS. With a large catalog this will be slow and memory-hungry.

**Fix:** Use `$queryRaw` with PostgreSQL's `UNNEST + DISTINCT`:

```sql
SELECT DISTINCT UNNEST(sizes) AS size FROM "Product" WHERE status = 'ACTIVE' ORDER BY size ASC;
SELECT DISTINCT UNNEST(colors) AS color FROM "Product" WHERE status = 'ACTIVE' ORDER BY color ASC;
```

---

#### ~~6. `activeFilterCount` computed twice from different sources~~ ✅ Fixed

**Files:** `features/products/index.tsx` (line 28–35), `features/products/components/product-filter-bar.tsx` (line 35–36)

The Server Component computes `activeFilterCount` and passes it only to `MobileFiltersSheet`. `ProductFilterBar` re-derives the same count from `useProductParams()` independently. Both counts should always agree via nuqs, but the duplication is fragile.

**Fix:** Extract the count derivation into a shared utility or compute it only in the client hook.

---

#### 7. Offset pagination instead of cursor-based

**File:** `features/products/services/get-products.ts`

The spec (`02-product-catalog.md`) states "Cursor-based pagination (page size 24)." The implementation uses `skip` + `take` (offset pagination). Offset pagination is natural for numbered page buttons, but cursor-based is strongly preferred for the future `/api/products` mobile route (infinite scroll). This deviation should be intentional and documented.

---

### Minor

#### ~~8. Ellipsis `key` uses array index~~ ✅ Fixed

**File:** `features/products/components/product-pagination.tsx`

When two ellipsis spans appear (e.g., `1 … 5 6 7 … 20`), both get `key="ellipsis-${i}"` using the array index. Prefer semantic keys like `"ellipsis-before"` and `"ellipsis-after"` to make intent clearer.

#### ~~9. Price display `"0"` is hard-coded inconsistently~~ ✅ Fixed

**File:** `features/products/components/product-filter-bar.tsx`

The price button label shows `"LE 0"` as a hard-coded string when `minPrice` is not set, rather than using `.toLocaleString()` uniformly like the rest of the codebase.

---

## Spec Compliance Summary

| Requirement | Status |
|---|---|
| `index.tsx` Server Component | Compliant |
| All filters/sort/view/page in URL (nuqs) | Compliant |
| No `useState` for filter state | Compliant (price debounce is correct local UI state) |
| `getProducts` shared with `/api/products` | Not met — no API route exists yet |
| `actions/` directory | Missing |
| Category single-select | Compliant |
| Subcategory multi-select | Missing |
| Brand **multi**-select | Deviated — single-select only |
| Price range **slider** | Deviated — text inputs instead |
| Size **chip multi**-select | Deviated — single-select only |
| Color **swatch multi**-select | Deviated — text chips, single-select, no swatch |
| Rating filter (1–5 stars) | Missing |
| Sort (all 5 options) | Compliant |
| Product card: image, name, price+discount, badge, stars, quick-add | Partially met — quick-add unwired |
| Cursor-based pagination | Deviated — offset pagination |
| Empty state with "Clear filters" | Compliant |
| Out-of-stock handling | Compliant |

> **Note on layout deviation:** The horizontal sticky filter bar replaces the spec's left sidebar (`lg:grid-cols-[280px_1fr]`). This is a coherent luxury-brand design choice (SSENSE/Farfetch pattern) and arguably a better UX — but it is an explicit departure from the written spec and should be confirmed before treating it as final.

---

## Immediate Blockers Before Shipping

1. ~~**Fix badge overlap** (#1) — sold-out sale items stack two labels at `top-3 left-3`~~ ✅ Fixed
2. ~~**Create `actions/` directory** (#3) — feature structure contract requires it; wire or stub the cart action~~ ✅ Fixed
3. ~~**Fix `getFilterOptions` scalability** (#5) — replace full-table in-memory deduplication with raw SQL `UNNEST + DISTINCT`~~ ✅ Fixed
