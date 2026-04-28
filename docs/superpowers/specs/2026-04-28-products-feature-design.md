# ProductsFeature Design — Storefront Catalog

**Date:** 2026-04-28
**Route:** `/products`
**Feature path:** `features/products/`

---

## Context

`ProductsFeature` is the full storefront product catalog. It is build-order item #2 after the home page. The cart feature is not yet built; the quick-add button on product cards will be present but disabled. This spec covers the initial implementation only — multi-select filters and cart wiring are out of scope.

---

## Architecture

`features/products/index.tsx` is a Server Component. On each request it:

1. Parses URL params via `loadProductParams(searchParams)`
2. Fetches `getProducts(params)` and `getFilterOptions()` in parallel
3. Renders a `lg:grid-cols-[280px_1fr]` layout: filter sidebar + main area

No client-side data fetch. Changing any filter, sort, view, or page param pushes a new URL which triggers a full server re-render with fresh data.

---

## File Structure

```
features/products/
  components/
    ProductCard.tsx           # image, name, price, badges, disabled Add-to-Cart
    ProductGrid.tsx           # 2/3/4-col grid of ProductCards
    ProductList.tsx           # horizontal list rows of ProductCards
    ProductFilters.tsx        # 'use client' — sidebar, writes nuqs params
    MobileFiltersSheet.tsx    # 'use client' — Sheet wrapper for mobile
    ProductSort.tsx           # 'use client' — sort dropdown + grid/list toggle
    ProductPagination.tsx     # 'use client' — Prev/Next buttons
    ProductEmptyState.tsx     # 'use client' — "no results" + clear filters
  hooks/
    useProductParams.ts       # single nuqs schema: server cache + client hook
  services/
    get-products.ts           # getProducts(params) — shared with /api/products
    get-filter-options.ts     # getFilterOptions() — categories, brands, sizes, colors
  types/
    index.ts
  index.tsx
```

---

## URL State

One schema in `hooks/useProductParams.ts` drives both the server-side cache and the client hook:

```typescript
const productParams = {
  category: parseAsString.withDefault(""),
  brand:    parseAsString.withDefault(""),
  minPrice: parseAsFloat.withDefault(0),
  maxPrice: parseAsFloat.withDefault(0),    // 0 = no upper bound
  size:     parseAsString.withDefault(""),
  color:    parseAsString.withDefault(""),
  sort:     parseAsStringEnum(["newest","price_asc","price_desc","best_rated","most_sold"]).withDefault("newest"),
  view:     parseAsStringEnum(["grid","list"]).withDefault("grid"),
  page:     parseAsInteger.withDefault(1),
  featured: parseAsBoolean.withDefault(false),  // supports home-page "View All" link
};

export const loadProductParams = createSearchParamsCache(productParams);
export const useProductParams  = () => useQueryStates(productParams, { shallow: false });
```

All filter/sort changes must also reset `page` to 1.

---

## Services

### `get-products.ts` — `getProducts(params)`

Always filters `WHERE status = 'ACTIVE'`. Additional clauses:

| Param | Prisma clause |
|---|---|
| `category` (slug) | `category: { slug: category }` |
| `brand` (slug) | `brand: { slug: brand }` |
| `minPrice` > 0 | `priceAfterDiscount: { gte: minPrice }` |
| `maxPrice` > 0 | `priceAfterDiscount: { lte: maxPrice }` |
| `size` | `sizes: { has: size }` |
| `color` | `colors: { has: color }` |
| `featured` = true | `featured: true` |

Sort mapping:

| `sort` value | `orderBy` |
|---|---|
| `newest` | `{ createdAt: "desc" }` |
| `price_asc` | `{ priceAfterDiscount: "asc" }` |
| `price_desc` | `{ priceAfterDiscount: "desc" }` |
| `best_rated` | `{ ratingsAverage: { sort: "desc", nulls: "last" } }` |
| `most_sold` | `{ sold: "desc" }` |

Pagination: `skip: (page - 1) * 24`, `take: 24`. Page is clamped to a minimum of 1; if the page param overshoots, the query returns an empty array and the empty state renders.

Returns:
```typescript
type GetProductsResult = {
  products: StorefrontProductItem[];
  total: number;
  pageCount: number;
};
```

`StorefrontProductItem` is `DecimalToString<..., "price" | "discount" | "priceAfterDiscount">` with fields: `id, name, slug, imageUrl, price, discount, priceAfterDiscount, ratingsAverage, ratingsQuantity, quantity, sizes, colors`.

### `get-filter-options.ts` — `getFilterOptions()`

Returns categories and brands that have at least one ACTIVE product, plus distinct sizes and colors from ACTIVE products.

```typescript
type FilterOptions = {
  categories: { id: string; name: string; slug: string }[];
  brands:     { id: string; name: string; slug: string }[];
  sizes:      string[];
  colors:     string[];
};
```

Sizes and colors are collected by fetching `{ sizes: true, colors: true }` from all ACTIVE products and flattening/deduplicating. This is acceptable for catalog scale; no raw SQL needed.

---

## Components

### `ProductCard` (Server Component)

Props: `product: StorefrontProductItem`, `layout: "grid" | "list"`

- **Grid layout**: vertical card — `aspect-[3/4]` image, info below
- **List layout**: horizontal card — fixed `w-32` image left, info + button right
- Discount badge (`-{discount}%`) when `discount > 0`
- "Out of stock" badge when `quantity === 0`
- Star rating row (filled/empty stars) when `ratingsAverage` is not null
- Disabled `<Button disabled>Add to Cart</Button>` (always disabled until cart is built)
- Entire card wrapped in `<Link href={/products/${slug}}>`

### `ProductGrid` (Server Component)

Props: `products: StorefrontProductItem[]`

`grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-4 gap-y-10` of `<ProductCard layout="grid">`.

### `ProductList` (Server Component)

Props: `products: StorefrontProductItem[]`

`flex flex-col divide-y` of `<ProductCard layout="list">`.

### `ProductFilters` (`use client`)

Props: `options: FilterOptions`

- Collapsible `<Accordion>` sections: Category, Brand, Size, Color, Price
- Each section uses single-select (radio-style); clicking the active value deselects it
- Price: two number inputs (min/max), applies on blur
- "Clear all filters" button resets all params to defaults + `page: 1`
- Active filter count shown in the section header when a value is set

### `MobileFiltersSheet` (`use client`)

Props: `options: FilterOptions`, `activeCount: number`

- "Filters ({n})" button, only visible `lg:hidden`
- Opens a shadcn `<Sheet>` containing `<ProductFilters />`

### `ProductSort` (`use client`)

No props. Reads/writes `sort` and `view` via `useProductParams()`.

- Sort `<Select>` (newest / price ↑ / price ↓ / best rated / most sold)
- `LucideLayoutGrid` / `LucideLayoutList` icon toggle buttons
- Any sort change also resets `page: 1`

### `ProductPagination` (`use client`)

Props: `page: number`, `pageCount: number`

- "← Prev" button (disabled when `page === 1`)
- "Page {page} of {pageCount}" label
- "Next →" button (disabled when `page === pageCount`)
- Uses `setParams({ page: page ± 1 })`

### `ProductEmptyState` (`use client`)

No props. Centered "No products match your filters." message with a "Clear filters" button that resets all params to defaults.

---

## Layout (`index.tsx`)

```
┌─ 280px sidebar (lg+) ──────────┬─ main ──────────────────────────────────────┐
│                                 │  [MobileFiltersSheet]  [ProductSort]        │
│ <ProductFilters />              │  {total} products                           │
│                                 │                                             │
│                                 │  <ProductGrid> or <ProductList>             │
│                                 │   (server picks based on `view` param)      │
│                                 │                                             │
│                                 │  <ProductEmptyState> if total === 0         │
│                                 │                                             │
│                                 │  <ProductPagination>                        │
└─────────────────────────────────┴─────────────────────────────────────────────┘
```

Server reads `view` from parsed params and renders the correct layout component — no client-side conditional rendering.

---

## Edge Cases

| Scenario | Behavior |
|---|---|
| No products match filters | `ProductEmptyState` with clear-filters button |
| Out of stock | Card shows "Out of stock" badge; Add to Cart disabled |
| No discount | Single `priceAfterDiscount`, no strikethrough |
| `ratingsAverage` null | Star row hidden |
| Page param out of range | Clamped to min 1; overshoot returns empty array → empty state |
| `maxPrice = 0` | No upper bound filter applied |

---

## Acceptance Criteria

- [ ] All filters, sort, view, and page changes update the URL only — no `useState`
- [ ] Refreshing the page preserves full filter state
- [ ] Sharing the URL produces the same filtered view
- [ ] `index.tsx` is a Server Component with no `"use client"` directive
- [ ] `getProducts` is the same function used by `/api/products` — no logic duplication
- [ ] Grid and list views both render correctly
- [ ] Prev/Next pagination is disabled at the boundaries
- [ ] `/products?featured=true` (from home page) filters to featured products only
- [ ] Empty state renders when no products match
