# Storefront — Product Catalog

## Overview

The full product browsing experience. Users land here from `/products`, `/categories/[slug]`, or `/search`. All three share the same grid + filter UI, with different default filters.

## Routes

| Route                | Feature                | Description                 |
| -------------------- | ---------------------- | --------------------------- |
| `/products`          | `ProductsFeature`      | Full catalog                |
| `/categories/[slug]` | `CategoryFeature`      | Filtered to one category    |
| `/search`            | `SearchFeature`        | Full-text search results    |

## Feature path

`features/products/`

```
features/products/
├── components/
│   ├── ProductCard.tsx
│   ├── ProductGrid.tsx
│   ├── ProductFilters.tsx       # 'use client' — writes nuqs params
│   ├── ProductSort.tsx          # 'use client' — writes nuqs params
│   └── ProductPagination.tsx
├── hooks/
│   └── useProductParams.ts      # nuqs schema (server cache + client hook)
├── actions/
│   └── products.actions.ts
├── services/
│   └── products.service.ts
├── types/
│   └── index.ts
└── index.tsx
```

`features/category/` and `features/search/` are thin wrappers around the same components and service, with default params.

## URL state (nuqs)

All filter/sort/pagination state lives in the URL.

```typescript
// features/products/hooks/useProductParams.ts
const productParams = {
  category: parseAsString.withDefault(""),
  brand: parseAsString.withDefault(""),
  minPrice: parseAsFloat.withDefault(0),
  maxPrice: parseAsFloat.withDefault(100000),
  size: parseAsString.withDefault(""),
  color: parseAsString.withDefault(""),
  sort: parseAsString.withDefault("newest"),
  page: parseAsInteger.withDefault(1),
};
```

For search (`/search`):

```typescript
{ q: "", sort: "newest", page: 1 }
```

See `integrations/05-nuqs-url-state.md` for the full pattern.

## Data

`ProductsFeature` (Server Component) flow:

1. Parse search params via `loadProductParams(searchParams)`.
2. Call `getProducts(params)` from the service.
3. Render `<ProductFilters />`, `<ProductSort />`, `<ProductGrid />`, `<ProductPagination />`.

The service applies:

- `WHERE status = 'ACTIVE'`.
- Filter clauses for category, brand, size (array contains), color (array contains), price range.
- Sort: `newest` → `createdAt DESC`; `price_asc` / `price_desc` → `priceAfterDiscount`; `best_rated` → `ratingsAverage DESC NULLS LAST`; `most_sold` → `sold DESC`.
- Cursor-based pagination (page size: 24).
- For search: full-text search on PostgreSQL `tsvector` over `name + description`.

## UI

- **Grid / list view toggle** (grid is default).
- **Filter sidebar** — collapsible on mobile (sheet/drawer):
  - Category (single-select)
  - Subcategory (multi-select, depends on selected category)
  - Brand (multi-select)
  - Price range (slider)
  - Size (chip multi-select)
  - Color (swatch multi-select)
  - Rating (1+ to 5+ stars)
- **Sort dropdown** — newest / price ↑ / price ↓ / best rated / most sold.
- **Product card** — image, name, price (original + discounted side-by-side when discount > 0), discount badge, star rating, quick-add to cart button.

## Behavior

- Changing any filter pushes the new URL via nuqs → server re-renders the feature with new data. **No client-side fetch.**
- Pagination uses cursor-based page links: `?page=N`.
- Quick-add from the card calls `addToCartAction` (Server Action). Optimistic UI optional — start without it.

## Edge cases

- Empty result: render an "No products match your filters" empty state with a "Clear filters" button (which resets nuqs params to defaults).
- Out-of-stock product: still appears in the catalog with an "Out of stock" badge; quick-add is disabled.
- Product with no discount: render single price, no strikethrough.

## Acceptance criteria

- [ ] All filters and sort change the URL (verify by reading the address bar).
- [ ] Refreshing the page preserves filter state (URL is the source of truth).
- [ ] Sharing the URL produces the same filtered view for the recipient.
- [ ] No `useState` for any filter/sort/pagination state.
- [ ] `index.tsx` is a Server Component.
- [ ] `getProducts` is shared with the `/api/products` route handler — no logic duplication.
