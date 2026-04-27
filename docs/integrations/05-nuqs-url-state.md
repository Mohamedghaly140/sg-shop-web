# Integration — nuqs (URL State Management)

`nuqs` manages all URL-based state: filters, sort order, pagination, search queries, date ranges. State lives in the URL — shareable, bookmarkable, and readable server-side without a client round-trip.

## Pattern

Define a params schema **once** per feature in `hooks/use<Feature>Params.ts`. The same schema serves both server-side cache parsing and client-side reading/writing.

```typescript
// features/products/hooks/useProductParams.ts
import {
  createSearchParamsCache,
  parseAsString,
  parseAsInteger,
  parseAsFloat,
} from "nuqs/server";
import { useQueryStates } from "nuqs";

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

// Server Component: parse URL params on the server
export const loadProductParams = createSearchParamsCache(productParams);

// Client Component: read and write URL params
export function useProductParams() {
  return useQueryStates(productParams);
}
```

## Server reads, client writes

```typescript
// features/products/index.tsx — Server Component
export default async function ProductsFeature({ searchParams }: Props) {
  const params = await loadProductParams(searchParams); // fully typed
  const data = await getProducts(params);
  return <ProductGrid products={data.products} total={data.total} />;
}

// features/products/components/ProductSort.tsx — Client Component
"use client";
export function ProductSort() {
  const [{ sort }, setParams] = useProductParams();
  return (
    <select
      value={sort}
      onChange={(e) => setParams({ sort: e.target.value, page: 1 })}
    >
      <option value="newest">Newest</option>
      <option value="price_asc">Price: Low to High</option>
      <option value="price_desc">Price: High to Low</option>
    </select>
  );
}
```

Changing the sort pushes `?sort=price_asc&page=1` to the URL, which triggers a server re-render of `ProductsFeature` with the new params. **No client-side data fetch needed.**

## nuqs params by feature

| Feature                    | Params                                                                       |
| -------------------------- | ---------------------------------------------------------------------------- |
| Products catalog           | `category`, `brand`, `minPrice`, `maxPrice`, `size`, `color`, `sort`, `page` |
| Search                     | `q`, `sort`, `page`                                                          |
| Account orders             | `status`, `page`                                                             |
| Admin / orders             | `status`, `search`, `paymentMethod`, `from`, `to`, `page`                    |
| Admin / products           | `status`, `category`, `search`, `page`                                       |
| Admin / customers          | `search`, `role`, `page`                                                     |
| Admin / users              | `search`, `role`, `active`, `page`                                           |
| Admin / analytics          | `range` (7d / 30d / 90d / custom), `from`, `to`                              |

## Conventions

- **Always reset `page` to 1** when changing any other filter (`setParams({ status, page: 1 })`).
- Default values are explicit on every param via `.withDefault(...)`.
- Empty strings are treated as "no filter applied" — services should ignore them.
- **Never** use `useState` for filter / sort / pagination state. URL is the source of truth.

## Setup

Wrap the app with the nuqs adapter once, in `app/layout.tsx`:

```typescript
import { NuqsAdapter } from "nuqs/adapters/next/app";

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        <NuqsAdapter>{children}</NuqsAdapter>
      </body>
    </html>
  );
}
```

## Acceptance criteria

- [ ] Every feature with filters/pagination uses `nuqs` (no `useState`).
- [ ] Each feature has a single params schema in `hooks/use<Feature>Params.ts`.
- [ ] Server Components read via `loadXxxParams(searchParams)`.
- [ ] Client Components write via `useQueryStates`.
- [ ] Page resets to 1 when other filters change.
- [ ] URL changes trigger server re-render with fresh data — no client fetch.
