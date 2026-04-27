# Admin — Products Management

## Overview

Full CRUD over the `Product` model. Includes Cloudinary image management, variant fields, and bulk actions.

## Routes

| Route                  | Feature                     | Access         |
| ---------------------- | --------------------------- | -------------- |
| `/admin/products`      | `AdminProductsFeature`      | MANAGER, ADMIN |
| `/admin/products/new`  | `AdminProductFormFeature`   | MANAGER, ADMIN |
| `/admin/products/[id]` | `AdminProductFormFeature`   | MANAGER, ADMIN |

## Feature path

`features/admin/products/`

```
features/admin/products/
├── components/
│   ├── ProductsTable.tsx
│   ├── ProductForm.tsx
│   ├── ImageUploader.tsx
│   └── VariantFields.tsx
├── hooks/
│   └── useProductParams.ts
├── actions/
│   ├── productActionHelpers.ts
│   ├── createProduct.ts
│   ├── updateProduct.ts
│   ├── deleteProduct.ts
│   ├── updateProductStatus.ts
│   ├── toggleFeatured.ts
│   ├── deleteProductImage.ts
│   └── duplicateProduct.ts
├── services/
│   └── get-products.ts
└── index.tsx
```

## URL state (nuqs) — list view

```typescript
{ status: "", category: "", search: "", page: 1 }
```

## List view (`/admin/products`)

- Searchable, filterable table.
- Filters: status (DRAFT / ACTIVE / ARCHIVED), category.
- Search: name, slug, brand name (ILIKE).
- Per row: image thumbnail, name, category, brand, price, discount, stock, status, featured toggle, actions (edit, duplicate, delete, archive).
- Bulk selection with bulk actions: publish (set ACTIVE), archive (set ARCHIVED), delete.
- "+ New product" CTA → `/admin/products/new`.

## Form view (create/edit)

`AdminProductFormFeature` is used for both create and edit (the latter receives `id` and pre-populates).

Fields:

- **Name** (required, string).
- **Slug** — auto-generated from name, editable. Unique check on save.
- **Description** — markdown or rich text (start with plain `<textarea>` for v1).
- **Category** (required, single-select from `Category`).
- **Subcategories** (multi-select from subcategories of selected category).
- **Brand** (optional, single-select from `Brand`).
- **Main image** + **gallery** — Cloudinary Upload Widget. See `integrations/03-cloudinary-media.md`.
- **Sizes** — chip array.
- **Colors** — chip array.
- **Price** (decimal, required, > 0).
- **Discount %** (decimal, 0–70).
- **`priceAfterDiscount`** — auto-computed on save: `price * (1 - discount/100)`. Round to 2 decimals.
- **Quantity** — integer, ≥ 0.
- **Status** — DRAFT / ACTIVE / ARCHIVED.
- **Featured** — boolean (only meaningful when status = ACTIVE).

Validate with Zod before the action runs.

## Image management

- Cloudinary Upload Widget uploads directly from browser to Cloudinary.
- Widget callback returns `public_id` and `secure_url`. The Server Action saves these into `Product.imageId` / `Product.imageUrl` for the main image, and into a `ProductImage` row for each gallery image.
- `deleteProductImage.ts` — removes a `ProductImage` row and calls `cloudinary.uploader.destroy(imageId)`.
- On product delete: cascade `ProductImage` rows AND call Cloudinary destroy for each. Same for the main image. Wrap in a try/catch: a Cloudinary failure should not block the DB delete; log and continue.

## Mutations (one file per action)

| File                       | Effect                                                                                                                                         |
| -------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------- |
| `createProduct.ts`         | Validate; insert `Product`; insert `ProductImage` rows; insert `ProductSubCategory` rows                                                       |
| `updateProduct.ts`         | Validate; upsert subcategories; update product; update gallery images (handle add / remove / reorder)                                          |
| `deleteProduct.ts`         | Reject if order items reference it (FK is `Restrict`) — in practice we **archive** instead. Hard-delete only when no order items reference it. |
| `updateProductStatus.ts`   | Flip status. Pulling a product to ARCHIVED removes it from storefront catalogs but keeps it accessible in orders.                              |
| `toggleFeatured.ts`        | Flip `featured`. UI on the list view exposes this directly.                                                                                    |
| `deleteProductImage.ts`    | Delete a single `ProductImage` row + Cloudinary destroy.                                                                                       |
| `duplicateProduct.ts`      | Clone the product (new slug `<slug>-copy`, status DRAFT, copy gallery images metadata; do not duplicate Cloudinary assets).                    |

After every mutation, `revalidatePath('/admin/products')` and the storefront paths (`/products`, the product's `[slug]`, and any category listings).

## Acceptance criteria

- [ ] List view supports filter, search, pagination via nuqs.
- [ ] Create and edit forms share a single component.
- [ ] Slug auto-generates and is editable.
- [ ] `priceAfterDiscount` is computed on save.
- [ ] Cloudinary upload works directly from the browser; binary never passes through the server.
- [ ] Subcategories are filtered by the selected category.
- [ ] `deleteProduct` falls back to archive if order items reference the product.
- [ ] Featured toggle works from the list view without navigation.
- [ ] Bulk publish / archive / delete works on selected rows.
