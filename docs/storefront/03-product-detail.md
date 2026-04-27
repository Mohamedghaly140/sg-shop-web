# Storefront — Product Detail

## Overview

Single product page. Shows the product, lets the user pick variants, add to cart or wishlist, and read reviews.

## Route

| Route              | Feature                | Access |
| ------------------ | ---------------------- | ------ |
| `/products/[slug]` | `ProductDetailFeature` | Public |

## Feature path

`features/product-detail/`

```
features/product-detail/
├── components/
│   ├── ImageGallery.tsx
│   ├── VariantSelector.tsx
│   ├── AddToCartButton.tsx
│   └── ReviewsList.tsx
├── actions/
│   └── product-detail.actions.ts
├── services/
│   └── product-detail.service.ts
└── index.tsx
```

## Data

`ProductDetailFeature` (Server Component) fetches:

- The product by slug, with: `category`, `brand`, `images` (sorted by `sortOrder`), `subCategories`, `reviews` (with reviewer name, paginated).
- Aggregate ratings breakdown: count per star (1–5).
- Related products: same category, `status = ACTIVE`, exclude current product, limit 8.

If the product is not found or has `status !== 'ACTIVE'` → 404.

## UI

- **`ImageGallery`** — main image plus scrollable thumbnails. Click a thumbnail to swap the main image.
- **Title block** — name, brand link, star rating + review count.
- **Price block** — when `discount > 0`: original price strikethrough beside `priceAfterDiscount`. Otherwise just the price.
- **`VariantSelector`** — size and color pickers. Each option shows whether stock is available for that combination (disable / strike out unavailable combos).
- **Quantity stepper** — min 1, max stock quantity.
- **`AddToCartButton`** — calls `addToCartAction`. Disabled until size/color picked (when applicable).
- **Wishlist button** — toggle. Anonymous users are prompted to sign in.
- **Description** — long-form description below the fold.
- **Reviews section** — `ReviewsList` with aggregate rating breakdown bar chart and individual reviews (paginated).
- **Related products** — horizontal scroll or grid below.

## Behavior

- Changing variants updates the displayed stock indicator but does not refetch.
- "Add to cart" creates a `CartItem` with the chosen size, color, quantity, and a **price snapshot**.
- "Wishlist" requires auth — anonymous users are redirected to `/sign-in?redirect=/products/[slug]`.
- Reviews can only be **created** by users who have a `DELIVERED` order containing this product (verified-buyer check enforced in `reviews.service.ts`).

## Edge cases

- Stock = 0: "Out of stock" — disable add to cart.
- No images beyond the main image: render only the main image, no thumbnail strip.
- No variants: hide `VariantSelector`.
- No reviews yet: render an empty state inviting a verified buyer to leave the first review.

## Acceptance criteria

- [ ] Page renders product, gallery, variants, reviews.
- [ ] Add to cart respects selected size/color/quantity.
- [ ] Price snapshot is captured into `CartItem.price`.
- [ ] Wishlist requires auth.
- [ ] 404 when slug is unknown or product is `DRAFT`/`ARCHIVED`.
- [ ] Review creation is gated on a `DELIVERED` order containing the product.
- [ ] After review insert/update/delete, `Product.ratingsAverage` and `Product.ratingsQuantity` are recomputed in the service.
