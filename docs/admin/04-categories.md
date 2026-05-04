# Admin — Categories

## Overview

Category management with subcategories. Provides the product taxonomy used everywhere else.

## Routes

| Route               | Feature                  | Access         |
| ------------------- | ------------------------ | -------------- |
| `/admin/categories` | `AdminCategoriesFeature` | MANAGER, ADMIN |

## Feature path

```
features/admin/categories/
├── components/
│   ├── CategoriesTable.tsx
│   ├── CategoryForm.tsx
│   ├── SubCategoriesPanel.tsx
│   └── SubCategoryForm.tsx
├── actions/
│   ├── createCategory.ts
│   ├── updateCategory.ts
│   ├── deleteCategory.ts
│   ├── createSubCategory.ts
│   ├── updateSubCategory.ts
│   └── deleteSubCategory.ts
├── services/
│   └── get-categories.ts
└── index.tsx
```

## Categories (`/admin/categories`)

- Table of categories: cover image, name, slug, # subcategories, # products, actions.
- "+ New category" CTA opens `CategoryForm` dialog.
- Click a row → opens a side panel (or a dedicated detail page) showing subcategories with full CRUD.

### Category fields

- `name` (required, unique)
- `slug` (auto-generated, editable, unique)
- `imageId` / `imageUrl` (Cloudinary cover image — folder `ecommerce/categories/`)

### Subcategory fields

- `name` (required, unique)
- `slug` (auto-generated, editable, unique)
- `categoryId` (set automatically by the panel context)

### Mutations

- `createCategory.ts` / `updateCategory.ts` / `deleteCategory.ts`
- `createSubCategory.ts` / `updateSubCategory.ts` / `deleteSubCategory.ts`

### Edge cases

- Deleting a category that has products: `Product.categoryId` has FK `onDelete: Restrict`. Block deletion and surface a clear error: "Cannot delete a category that has products. Move products to another category first."
- Deleting a subcategory: `ProductSubCategory.subCategoryId` has FK `onDelete: Cascade`, so the join rows go with it.

## Cloudinary cleanup

On `updateCategory` if the image is replaced: call `cloudinary.uploader.destroy(oldImageId)` after the new one is saved.

On `deleteCategory`: call `cloudinary.uploader.destroy(imageId)` after the row is deleted (only if a Cloudinary asset was attached). Wrap in try/catch — a Cloudinary failure should not block the DB delete.

## Acceptance criteria

- [ ] Categories support full CRUD.
- [ ] Subcategories support full CRUD scoped to a parent category.
- [ ] Slug auto-generates and is editable.
- [ ] Cloudinary cover images upload directly from browser.
- [ ] Deleting a category with products is blocked with a clear error.
- [ ] Old Cloudinary assets are deleted when replaced or when their owning row is deleted.
