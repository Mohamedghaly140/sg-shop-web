# Integration — Cloudinary (Media Storage)

All product images, category covers, and brand logos are stored in Cloudinary. The database stores only `imageId` (Cloudinary public ID) and `imageUrl` (delivery URL). **No image binary data passes through the Next.js server.**

## Upload flow

The Cloudinary Upload Widget uploads directly from the admin's browser to Cloudinary. The widget callback returns the public ID and URL, which are saved to the database via a Server Action.

```typescript
window.cloudinary.createUploadWidget(
  {
    cloudName: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
    uploadPreset: "ecommerce_products", // unsigned preset, set in Cloudinary dashboard
    folder: "products",
    maxFiles: 10,
  },
  (error, result) => {
    if (result.event === "success") {
      // result.info.public_id  → imageId
      // result.info.secure_url → imageUrl
      // call the Server Action to persist
    }
  },
);
```

The widget is rendered inside `ImageUploader.tsx` (a client component) in the admin product form. See `admin/03-products.md`.

## Upload presets

Set up **unsigned** upload presets in the Cloudinary dashboard:

| Preset                | Folder                  | Used by              |
| --------------------- | ----------------------- | -------------------- |
| `ecommerce_products`  | `ecommerce/products/`   | Product images       |
| `ecommerce_categories`| `ecommerce/categories/` | Category cover images|
| `ecommerce_brands`    | `ecommerce/brands/`     | Brand logos          |

Unsigned presets are safe for browser upload because they're scoped to a folder and have transformation/format constraints baked in.

## Folder structure

```
ecommerce/
├── products/      # Main images + gallery images
├── categories/    # Category cover images
└── brands/        # Brand logos
```

## Image delivery transforms

Build URLs at render time using the stored `imageId`. Use `f_webp,q_auto` everywhere.

| Use case       | URL pattern                                             |
| -------------- | ------------------------------------------------------- |
| Product card   | `.../upload/w_400,h_400,c_fill,f_webp,q_auto/{imageId}` |
| Product detail | `.../upload/w_900,f_webp,q_auto/{imageId}`              |
| Thumbnail      | `.../upload/w_80,h_80,c_fill,f_webp,q_auto/{imageId}`   |
| Category cover | `.../upload/w_600,h_400,c_fill,f_webp,q_auto/{imageId}` |

A small helper in `lib/cloudinary.ts` keeps URL construction in one place:

```typescript
// lib/cloudinary.ts
const cloud = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME!;

export function cldUrl(imageId: string, transform: string) {
  return `https://res.cloudinary.com/${cloud}/image/upload/${transform}/${imageId}`;
}

export const transforms = {
  productCard: "w_400,h_400,c_fill,f_webp,q_auto",
  productDetail: "w_900,f_webp,q_auto",
  thumb: "w_80,h_80,c_fill,f_webp,q_auto",
  categoryCover: "w_600,h_400,c_fill,f_webp,q_auto",
} as const;
```

## Asset deletion

When a product, category, or brand is deleted (or its image is replaced), call:

```typescript
import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

await cloudinary.uploader.destroy(imageId);
```

Wrap in try/catch — a Cloudinary failure should not block the DB update. Log and continue.

## Image replacement

When the admin replaces an image:

1. Upload the new asset (browser → Cloudinary, returns new `imageId`).
2. Save the new `imageId` / `imageUrl` to the DB.
3. **After** the DB update succeeds, call `cloudinary.uploader.destroy(oldImageId)` for the old asset.

If the order is reversed and the DB update fails, the old asset would be lost while the DB still references it.

## Acceptance criteria

- [ ] Images upload directly from browser to Cloudinary; binary never passes through Next.js.
- [ ] Unsigned presets configured for products, categories, brands.
- [ ] DB stores only `imageId` and `imageUrl`.
- [ ] Render-time URLs use `f_webp,q_auto` and appropriate dimensions.
- [ ] Asset deletion runs after the DB update succeeds.
- [ ] Cloudinary failures during cleanup don't block DB operations.
