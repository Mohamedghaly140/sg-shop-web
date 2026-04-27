# Storefront — Home

## Overview

Landing page. The first impression. Showcases featured products and surfaces categories.

## Route

| Route | Feature           | Access |
| ----- | ----------------- | ------ |
| `/`   | `HomeFeature`     | Public |

## Feature path

`features/home/`

```
features/home/
├── components/
│   ├── HeroBanner.tsx
│   ├── FeaturedProducts.tsx
│   └── CategoryGrid.tsx
└── index.tsx
```

## Data

`HomeFeature` (Server Component) fetches:

- Featured products: `Product` rows where `featured = true` and `status = ACTIVE`, limit 8.
- Categories: all `Category` rows, ordered by `name`, with `imageUrl` for the grid.

No nuqs params on this page.

## UI

- **`HeroBanner`** — full-bleed hero with headline, subheadline, primary CTA to `/products`.
- **`CategoryGrid`** — image-first grid of categories. Each tile links to `/categories/[slug]`.
- **`FeaturedProducts`** — horizontal scroll or 4-column grid of `ProductCard` instances.

## Behavior

- Pure server-rendered. No client interactivity beyond image hover/transition.
- The `ProductCard` (shared from `features/products/components`) has an "Add to cart" button that calls the cart action — that interactivity comes from the leaf, not the home feature.

## Acceptance criteria

- [ ] Page renders with hero, category grid, featured products section.
- [ ] Featured products query respects `featured = true` AND `status = ACTIVE`.
- [ ] Category tiles link to `/categories/[slug]`.
- [ ] Page is a Server Component — no `'use client'` directive in `index.tsx`.
- [ ] Lighthouse perf score ≥ 90 on production build.
