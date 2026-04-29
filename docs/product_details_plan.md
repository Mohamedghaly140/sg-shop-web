# Product Detail Feature — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the full `ProductDetailFeature` UI at `/products/[slug]` — 2-column image gallery + product info panel with color/size selectors, price display, add-to-cart/wishlist stubs, and a shadcn accordion for detail sections.

**Architecture:** The feature index (`index.tsx`) is a Server Component that fetches product data via a Prisma service, serializes Decimal fields to strings, and passes them to two client sub-components: `ImageGallery` (thumbnail strip + main image swap) and `ProductInfo` (selectors + accordion + mobile sticky bar). The routing page (`[slug]/page.tsx`) calls `notFound()` when the product is missing or inactive. Add to Cart and Wishlist are UI stubs — actions will be wired in a later cart/wishlist plan.

**Tech Stack:** Next.js 16 App Router, Tailwind CSS v4, Prisma (generated to `@/generated/prisma`), shadcn/ui Accordion, Clerk `auth()`, Lucide icons, TypeScript

---

## File Map

| Action  | File                                                     | Responsibility                                                                     |
| ------- | -------------------------------------------------------- | ---------------------------------------------------------------------------------- |
| Install | `components/ui/accordion.tsx`                            | shadcn accordion primitive                                                         |
| Create  | `features/product-detail/services/get-product-detail.ts` | Prisma query — product + images + category + brand + wishlist flag                 |
| Modify  | `app/(storefront)/products/[slug]/page.tsx`              | Receive `params`, call service, `notFound()`, `generateMetadata`                   |
| Create  | `features/product-detail/components/ImageGallery.tsx`    | Client: thumbnail strip + main image swap; mobile dots carousel                    |
| Create  | `features/product-detail/components/ProductInfo.tsx`     | Client: color/size selectors, price row, CTA buttons, accordion, mobile sticky bar |
| Modify  | `features/product-detail/index.tsx`                      | Server Component: fetch → serialize → render 2-col layout                          |

---

### Task 1: Install shadcn Accordion

**Files:**

- Create: `components/ui/accordion.tsx` (via shadcn CLI)

- [ ] **Step 1: Install the accordion component**

```bash
bunx shadcn@latest add accordion
```

Expected: outputs "✔ Done." and creates `components/ui/accordion.tsx`.

- [ ] **Step 2: Verify build**

```bash
bun build
```

Expected: exits 0, no errors.

- [ ] **Step 3: Commit**

```bash
git add components/ui/accordion.tsx
git commit -m "chore: install shadcn accordion component"
```

---

### Task 2: Service — `get-product-detail.ts`

**Files:**

- Create: `features/product-detail/services/get-product-detail.ts`

- [ ] **Step 1: Create the service**

Create `features/product-detail/services/get-product-detail.ts`:

```typescript
import { cache } from "react";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { ProductStatus } from "@/generated/prisma/enums";

export const getProductDetail = cache(async (slug: string) => {
  const { userId } = await auth();

  const product = await prisma.product.findUnique({
    where: { slug, status: ProductStatus.ACTIVE },
    select: {
      id: true,
      name: true,
      slug: true,
      description: true,
      quantity: true,
      price: true,
      discount: true,
      priceAfterDiscount: true,
      sizes: true,
      colors: true,
      imageUrl: true,
      ratingsAverage: true,
      ratingsQuantity: true,
      createdAt: true,
      category: { select: { name: true, slug: true } },
      brand: { select: { name: true } },
      images: {
        select: { imageUrl: true, sortOrder: true },
        orderBy: { sortOrder: "asc" },
      },
      wishlistedBy: {
        where: { userId: userId ?? "" },
        select: { userId: true },
      },
    },
  });

  if (!product) return null;

  const { wishlistedBy, ...rest } = product;
  return {
    ...rest,
    inWishlist: wishlistedBy.length > 0,
  };
});

export type ProductDetailData = NonNullable<
  Awaited<ReturnType<typeof getProductDetail>>
>;
```

- [ ] **Step 2: Verify TypeScript compiles**

```bash
bun build
```

Expected: exits 0. TypeScript should accept the select shape.

- [ ] **Step 3: Commit**

```bash
git add features/product-detail/services/get-product-detail.ts
git commit -m "feat: add getProductDetail service with category, images, and wishlist flag"
```

---

### Task 3: Update Page — Params, notFound, generateMetadata

**Files:**

- Modify: `app/(storefront)/products/[slug]/page.tsx`

Update the page to accept `params`, call the service, and handle the 404 case. The `product` prop is not yet passed to the feature (the feature index still takes no props at this point — that wiring happens in Task 6 when both sides are ready simultaneously).

- [ ] **Step 1: Replace the page file**

Replace `app/(storefront)/products/[slug]/page.tsx` entirely:

```tsx
import { notFound } from "next/navigation";
import { getProductDetail } from "@/features/product-detail/services/get-product-detail";
import ProductDetailFeature from "@/features/product-detail";

type ProductDetailPageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: ProductDetailPageProps) {
  const { slug } = await params;
  const product = await getProductDetail(slug);
  if (!product) return {};
  return {
    title: `${product.name} | SG Couture`,
    description: product.description.slice(0, 155),
  };
}

export default async function ProductDetailPage({
  params,
}: ProductDetailPageProps) {
  const { slug } = await params;
  const product = await getProductDetail(slug);
  if (!product) notFound();
  // product prop added in Task 6 once ProductDetailFeature accepts it
  return <ProductDetailFeature />;
}
```

- [ ] **Step 2: Verify build**

```bash
bun build
```

Expected: exits 0. The feature still renders `<p>Product Detail</p>` — that is fine for now.

- [ ] **Step 3: Commit**

```bash
git add "app/(storefront)/products/[slug]/page.tsx"
git commit -m "feat: wire product detail page with params, notFound, and generateMetadata"
```

---

### Task 4: ImageGallery Client Component

**Files:**

- Create: `features/product-detail/components/ImageGallery.tsx`

The gallery merges the product's primary image with its additional `images[]` array (sorted by `sortOrder`). The primary image is always index 0.

- [ ] **Step 1: Create the component**

Create `features/product-detail/components/ImageGallery.tsx`:

```tsx
"use client";

import { useState } from "react";
import Image from "next/image";
import { LucideChevronLeft, LucideChevronRight } from "lucide-react";

type GalleryImage = { imageUrl: string };

type ImageGalleryProps = {
  primaryImageUrl: string;
  additionalImages: GalleryImage[];
  productName: string;
};

export function ImageGallery({
  primaryImageUrl,
  additionalImages,
  productName,
}: ImageGalleryProps) {
  const images: GalleryImage[] = [
    { imageUrl: primaryImageUrl },
    ...additionalImages,
  ];
  const [activeIndex, setActiveIndex] = useState(0);

  const prev = () => setActiveIndex(i => (i === 0 ? images.length - 1 : i - 1));
  const next = () => setActiveIndex(i => (i === images.length - 1 ? 0 : i + 1));

  return (
    <div className="flex gap-4">
      {/* Desktop: vertical thumbnail strip */}
      {images.length > 1 && (
        <div className="hidden lg:flex flex-col gap-2 w-[72px] shrink-0">
          {images.map((img, idx) => (
            <button
              key={idx}
              onClick={() => setActiveIndex(idx)}
              className={`relative aspect-[3/4] overflow-hidden border transition-colors duration-200 ${
                activeIndex === idx ? "border-foreground" : "border-transparent"
              }`}
            >
              <Image
                src={img.imageUrl}
                alt={`${productName} view ${idx + 1}`}
                fill
                className="object-cover"
                sizes="72px"
              />
            </button>
          ))}
        </div>
      )}

      {/* Main image */}
      <div className="flex-1 relative aspect-[4/5] overflow-hidden bg-muted">
        <Image
          src={images[activeIndex].imageUrl}
          alt={productName}
          fill
          className="object-cover transition-opacity duration-300"
          sizes="(max-width: 1024px) 100vw, 50vw"
          priority
        />

        {/* Mobile prev/next arrows */}
        {images.length > 1 && (
          <>
            <button
              onClick={prev}
              aria-label="Previous image"
              className="lg:hidden absolute left-3 top-1/2 -translate-y-1/2 bg-background/80 p-1.5 text-foreground"
            >
              <LucideChevronLeft size={18} strokeWidth={1.5} />
            </button>
            <button
              onClick={next}
              aria-label="Next image"
              className="lg:hidden absolute right-3 top-1/2 -translate-y-1/2 bg-background/80 p-1.5 text-foreground"
            >
              <LucideChevronRight size={18} strokeWidth={1.5} />
            </button>

            {/* Mobile dots indicator */}
            <div className="lg:hidden absolute bottom-3 inset-x-0 flex justify-center gap-1.5">
              {images.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveIndex(idx)}
                  aria-label={`Go to image ${idx + 1}`}
                  className={`w-1.5 h-1.5 rounded-full transition-colors duration-200 ${
                    activeIndex === idx ? "bg-foreground" : "bg-foreground/30"
                  }`}
                />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Verify build**

```bash
bun build
```

Expected: exits 0.

- [ ] **Step 3: Commit**

```bash
git add features/product-detail/components/ImageGallery.tsx
git commit -m "feat: add ImageGallery component with thumbnail strip and mobile carousel"
```

---

### Task 5: ProductInfo Client Component

**Files:**

- Create: `features/product-detail/components/ProductInfo.tsx`

This component handles color/size selection (client state), the price row, Add to Cart (stub), Wishlist (stub), the shadcn Accordion for detail sections, and the mobile sticky bottom bar via IntersectionObserver.

Care & Materials and Delivery & Returns are static placeholder text — the Prisma schema has no dedicated fields for them.

- [ ] **Step 1: Create the component**

Create `features/product-detail/components/ProductInfo.tsx`:

```tsx
"use client";

import { useEffect, useRef, useState } from "react";
import { LucideHeart } from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

type ProductInfoProps = {
  id: string;
  name: string;
  description: string;
  price: string;
  discount: string;
  priceAfterDiscount: string;
  sizes: string[];
  colors: string[];
  quantity: number;
  categoryName: string;
  categorySlug: string;
  inWishlist: boolean;
};

export function ProductInfo({
  id,
  name,
  description,
  price,
  discount,
  priceAfterDiscount,
  sizes,
  colors,
  quantity,
  categoryName,
  categorySlug,
  inWishlist,
}: ProductInfoProps) {
  const [selectedColor, setSelectedColor] = useState<string | null>(
    colors[0] ?? null,
  );
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [showStickyBar, setShowStickyBar] = useState(false);
  const addToCartRef = useRef<HTMLButtonElement>(null);

  const isSoldOut = quantity === 0;
  const hasDiscount = Number(discount) > 0;
  const discountPercent = hasDiscount ? Math.round(Number(discount)) : 0;

  useEffect(() => {
    const el = addToCartRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => setShowStickyBar(!entry.isIntersecting),
      { threshold: 0 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <>
      <div className="flex flex-col gap-6 lg:sticky lg:top-36">
        {/* Category label */}
        <p className="font-sans text-[0.6875rem] tracking-[0.2em] uppercase text-gold">
          {categoryName}
        </p>

        {/* Product name */}
        <h1 className="font-heading text-3xl leading-tight text-foreground">
          {name}
        </h1>

        {/* Price row */}
        <div className="flex items-center gap-3">
          <span className="font-sans text-base text-foreground">
            LE {Number(priceAfterDiscount).toLocaleString()}
          </span>
          {hasDiscount && (
            <>
              <span className="font-sans text-sm text-muted-foreground line-through">
                LE {Number(price).toLocaleString()}
              </span>
              <span className="font-sans text-[0.6875rem] tracking-[0.1em] uppercase bg-gold text-gold-foreground px-2 py-0.5">
                {discountPercent}% Off
              </span>
            </>
          )}
        </div>

        {/* Color selector */}
        {colors.length > 0 && (
          <div className="flex flex-col gap-3">
            <p className="font-sans text-xs text-foreground">
              Color:{" "}
              <span className="font-medium capitalize">{selectedColor}</span>
            </p>
            <div className="flex gap-2 flex-wrap">
              {colors.map(color => (
                <button
                  key={color}
                  onClick={() => setSelectedColor(color)}
                  title={color}
                  style={{ backgroundColor: color }}
                  className={`w-7 h-7 rounded-full border border-border transition-all duration-200 ${
                    selectedColor === color
                      ? "ring-1 ring-offset-2 ring-foreground"
                      : ""
                  }`}
                />
              ))}
            </div>
          </div>
        )}

        {/* Size selector */}
        {sizes.length > 0 && (
          <div className="flex flex-col gap-3">
            <div className="flex items-baseline justify-between">
              <p className="font-sans text-xs text-foreground">Size</p>
              <button className="font-sans text-[0.625rem] tracking-[0.15em] uppercase text-muted-foreground hover:text-foreground transition-colors border-b border-current pb-px">
                Size Guide
              </button>
            </div>
            <div className="flex gap-2 flex-wrap">
              {sizes.map(size => (
                <button
                  key={size}
                  onClick={() => setSelectedSize(size)}
                  className={`min-w-[3rem] px-3 py-2 font-sans text-xs border transition-colors duration-200 ${
                    selectedSize === size
                      ? "border-foreground bg-foreground text-background"
                      : "border-border text-foreground hover:border-foreground"
                  }`}
                >
                  {size}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Add to Cart */}
        <button
          ref={addToCartRef}
          type="button"
          disabled={isSoldOut}
          className="w-full font-sans text-[0.6875rem] tracking-[0.2em] uppercase py-3.5 transition-colors duration-300 disabled:cursor-not-allowed disabled:opacity-50 bg-foreground text-background hover:bg-gold"
        >
          {isSoldOut ? "Sold Out" : "Add to Cart"}
        </button>

        {/* Save to Wishlist */}
        <button
          type="button"
          className="w-full font-sans text-[0.6875rem] tracking-[0.2em] uppercase py-3.5 border border-border text-foreground hover:border-foreground transition-colors duration-300 flex items-center justify-center gap-2"
        >
          <LucideHeart
            size={14}
            strokeWidth={1.5}
            className={inWishlist ? "fill-foreground" : ""}
          />
          {inWishlist ? "Saved to Wishlist" : "Save to Wishlist"}
        </button>

        {/* Accordion — Description, Care, Delivery */}
        <Accordion type="multiple" className="border-t border-border">
          <AccordionItem value="description" className="border-border">
            <AccordionTrigger className="font-sans text-xs tracking-[0.15em] uppercase text-foreground hover:no-underline">
              Description
            </AccordionTrigger>
            <AccordionContent className="font-sans text-sm text-muted-foreground leading-relaxed">
              {description}
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="care" className="border-border">
            <AccordionTrigger className="font-sans text-xs tracking-[0.15em] uppercase text-foreground hover:no-underline">
              Care & Materials
            </AccordionTrigger>
            <AccordionContent className="font-sans text-sm text-muted-foreground leading-relaxed">
              Dry clean only. Store in the dust bag provided. Avoid prolonged
              exposure to direct sunlight. Handle with care.
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="delivery" className="border-border">
            <AccordionTrigger className="font-sans text-xs tracking-[0.15em] uppercase text-foreground hover:no-underline">
              Delivery & Returns
            </AccordionTrigger>
            <AccordionContent className="font-sans text-sm text-muted-foreground leading-relaxed">
              Standard delivery 3–5 business days. Express delivery 1–2 business
              days. Free returns within 14 days of receipt. Items must be unworn
              and in original packaging.
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>

      {/* Mobile sticky bottom bar */}
      {showStickyBar && (
        <div className="lg:hidden fixed bottom-0 inset-x-0 z-40 bg-background border-t border-border px-4 py-3 flex items-center gap-4">
          <div className="flex flex-col">
            <span className="font-sans text-sm text-foreground">
              LE {Number(priceAfterDiscount).toLocaleString()}
            </span>
            {hasDiscount && (
              <span className="font-sans text-xs text-muted-foreground line-through">
                LE {Number(price).toLocaleString()}
              </span>
            )}
          </div>
          <button
            type="button"
            disabled={isSoldOut}
            className="flex-1 font-sans text-[0.6875rem] tracking-[0.2em] uppercase py-3 bg-foreground text-background hover:bg-gold transition-colors duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSoldOut ? "Sold Out" : "Add to Cart"}
          </button>
        </div>
      )}
    </>
  );
}
```

- [ ] **Step 2: Verify build**

```bash
bun build
```

Expected: exits 0. The Accordion import must resolve to `components/ui/accordion.tsx` (installed in Task 1).

- [ ] **Step 3: Commit**

```bash
git add features/product-detail/components/ProductInfo.tsx
git commit -m "feat: add ProductInfo component with selectors, accordion, and mobile sticky bar"
```

---

### Task 6: Feature Index — Wire Everything

**Files:**

- Modify: `features/product-detail/index.tsx`

Serialize all Prisma `Decimal` fields to strings before passing them to client components. The `ProductDetailData` type from the service carries raw `Decimal` objects — they must not cross the server/client boundary as-is.

- [ ] **Step 1: Replace the feature index**

Replace `features/product-detail/index.tsx` entirely:

```tsx
import { ImageGallery } from "./components/ImageGallery";
import { ProductInfo } from "./components/ProductInfo";
import type { ProductDetailData } from "./services/get-product-detail";

type ProductDetailFeatureProps = {
  product: ProductDetailData;
};

export default function ProductDetailFeature({
  product,
}: ProductDetailFeatureProps) {
  return (
    <div className="max-w-7xl mx-auto px-4 md:px-8 py-12 md:py-16">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16">
        {/* Left — Image gallery */}
        <ImageGallery
          primaryImageUrl={product.imageUrl}
          additionalImages={
            product.images.filter(img => img.imageUrl != null) as {
              imageUrl: string;
            }[]
          }
          productName={product.name}
        />

        {/* Right — Product info */}
        <ProductInfo
          id={product.id}
          name={product.name}
          description={product.description}
          price={product.price.toString()}
          discount={product.discount.toString()}
          priceAfterDiscount={product.priceAfterDiscount.toString()}
          sizes={product.sizes}
          colors={product.colors}
          quantity={product.quantity}
          categoryName={product.category.name}
          categorySlug={product.category.slug}
          inWishlist={product.inWishlist}
        />
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Update page.tsx to pass the `product` prop (now that the feature accepts it)**

In `app/(storefront)/products/[slug]/page.tsx`, replace the return line:

```tsx
// Before:
return <ProductDetailFeature />;

// After:
return <ProductDetailFeature product={product} />;
```

- [ ] **Step 3: Verify build**

```bash
bun build
```

Expected: exits 0. All TypeScript types should align — `ProductInfo` receives strings for Decimal fields, `ImageGallery` receives plain string URLs.

- [ ] **Step 4: Commit**

```bash
git add features/product-detail/index.tsx "app/(storefront)/products/[slug]/page.tsx"
git commit -m "feat: wire ProductDetailFeature with ImageGallery and ProductInfo, serialize Decimals"
```

---

### Task 7: Final Verification

- [ ] **Step 1: Run lint**

```bash
bun lint
```

Expected: exits 0, no ESLint errors.

- [ ] **Step 2: Run production build**

```bash
bun build
```

Expected: exits 0. All four modified/created files compile cleanly.

- [ ] **Step 3: Start dev server and visually verify**

```bash
bun dev
```

Navigate to a product's detail page at `http://localhost:3000/products/[slug]` (use an actual slug from your DB, e.g. via Prisma Studio: `bun prisma:studio`).

| Check                                | Expected                                                        |
| ------------------------------------ | --------------------------------------------------------------- |
| Page loads without error             | 200, no console errors                                          |
| Left column                          | Main image with 4:5 aspect ratio, warm cream bg                 |
| Thumbnail strip (desktop, 2+ images) | Vertical strip left of main image, active has foreground border |
| Clicking thumbnail                   | Main image swaps                                                |
| Mobile (< lg)                        | Full-width image, prev/next arrows, dots indicator              |
| Category label                       | Small gold caps above H1                                        |
| Product name                         | H1 in DM Serif Display                                          |
| Price (no discount)                  | Single price                                                    |
| Price (with discount)                | Struck-through original + current price + gold "X% Off" badge   |
| Color swatches                       | Filled circles; selected has ring                               |
| Size chips                           | Outline chips; selected chip fills dark                         |
| Add to Cart                          | Dark button, hover turns gold                                   |
| Sold out product                     | Button disabled, "Sold Out" text                                |
| Wishlist button                      | Outline button with heart icon                                  |
| Accordion                            | Three sections expand/collapse inline                           |
| Mobile scroll past Add to Cart       | Sticky bar appears at bottom                                    |
| `/products/nonexistent-slug`         | 404 page                                                        |

- [ ] **Step 4: Add production build output confirmation**

No commit needed — this step is verification only.

---

## What's Next

After this plan ships:

| Plan                              | Builds                                                                             |
| --------------------------------- | ---------------------------------------------------------------------------------- |
| **Plan 3: Cart & CartDrawer**     | Cart service, CartFeature page, CartDrawer — wires the "Add to Cart" button here   |
| **Plan 2: ProductCard + Catalog** | Shared ProductCard component, ProductsFeature grid, CategoryFeature, SearchFeature |
| **Plan 6: Account / Wishlist**    | Wires the "Save to Wishlist" button here                                           |
