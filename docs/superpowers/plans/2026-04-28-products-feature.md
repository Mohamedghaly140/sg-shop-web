# ProductsFeature Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the storefront product catalog at `/products` — filter sidebar, sort, grid/list toggle, and URL-state pagination.

**Architecture:** `features/products/index.tsx` is a Server Component that fetches products and filter options in parallel, renders a `lg:grid-cols-[280px_1fr]` layout. All filter/sort/view/page state lives in the URL via nuqs — client components write params, server re-renders on every change. No client-side data fetch.

**Tech Stack:** Next.js 16 App Router, Prisma 7 (Supabase/PostgreSQL), nuqs 2, Tailwind CSS v4, radix-ui, shadcn/ui components

---

## File Map

**New:**
- `components/ui/accordion.tsx` — Accordion primitive (radix-ui wrapper)
- `features/products/types/index.ts` — StorefrontProductItem, FilterOptions
- `features/products/hooks/useProductParams.ts` — nuqs schema
- `features/products/services/get-filter-options.ts` — filter option queries
- `features/products/services/get-products.ts` — paginated product query
- `features/products/components/ProductCard.tsx` — single product card (Server)
- `features/products/components/ProductGrid.tsx` — grid layout (Server)
- `features/products/components/ProductList.tsx` — list layout (Server)
- `features/products/components/ProductFilters.tsx` — filter sidebar (`use client`)
- `features/products/components/MobileFiltersDialog.tsx` — mobile trigger (`use client`)
- `features/products/components/ProductSort.tsx` — sort + view toggle (`use client`)
- `features/products/components/ProductPagination.tsx` — prev/next (`use client`)
- `features/products/components/ProductEmptyState.tsx` — empty state (`use client`)

**Modified:**
- `features/products/index.tsx` — replace stub with full Server Component
- `app/(storefront)/products/page.tsx` — pass `searchParams` prop

---

### Task 1: Add Accordion component

**Files:**
- Create: `components/ui/accordion.tsx`

- [ ] Create `components/ui/accordion.tsx`:

```typescript
"use client";

import * as React from "react";
import { Accordion as AccordionPrimitive } from "radix-ui";
import { LucideChevronDown } from "lucide-react";

import { cn } from "@/lib/utils";

const Accordion = AccordionPrimitive.Root;

const AccordionItem = React.forwardRef<
  React.ElementRef<typeof AccordionPrimitive.Item>,
  React.ComponentPropsWithoutRef<typeof AccordionPrimitive.Item>
>(({ className, ...props }, ref) => (
  <AccordionPrimitive.Item
    ref={ref}
    className={cn("border-b border-border", className)}
    {...props}
  />
));
AccordionItem.displayName = "AccordionItem";

const AccordionTrigger = React.forwardRef<
  React.ElementRef<typeof AccordionPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof AccordionPrimitive.Trigger>
>(({ className, children, ...props }, ref) => (
  <AccordionPrimitive.Header className="flex">
    <AccordionPrimitive.Trigger
      ref={ref}
      className={cn(
        "flex flex-1 items-center justify-between py-4 font-sans text-xs tracking-[0.15em] uppercase transition-all [&[data-state=open]>svg]:rotate-180",
        className
      )}
      {...props}
    >
      {children}
      <LucideChevronDown className="size-3.5 shrink-0 transition-transform duration-200" />
    </AccordionPrimitive.Trigger>
  </AccordionPrimitive.Header>
));
AccordionTrigger.displayName = AccordionPrimitive.Trigger.displayName;

const AccordionContent = React.forwardRef<
  React.ElementRef<typeof AccordionPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof AccordionPrimitive.Content>
>(({ className, children, ...props }, ref) => (
  <AccordionPrimitive.Content
    ref={ref}
    className="overflow-hidden data-[state=closed]:hidden"
    {...props}
  >
    <div className={cn("pb-4 pt-0", className)}>{children}</div>
  </AccordionPrimitive.Content>
));
AccordionContent.displayName = AccordionPrimitive.Content.displayName;

export { Accordion, AccordionItem, AccordionTrigger, AccordionContent };
```

- [ ] Run `bun tsc --noEmit` and confirm no new errors
- [ ] Commit: `git commit -m "feat: add Accordion UI component"`

---

### Task 2: Types and nuqs params hook

**Files:**
- Create: `features/products/types/index.ts`
- Create: `features/products/hooks/useProductParams.ts`

- [ ] Create `features/products/types/index.ts`:

```typescript
import type { Prisma } from "@/generated/prisma/client";

export const storefrontProductSelect = {
  id: true,
  name: true,
  slug: true,
  imageUrl: true,
  price: true,
  discount: true,
  priceAfterDiscount: true,
  ratingsAverage: true,
  ratingsQuantity: true,
  quantity: true,
  sizes: true,
  colors: true,
} as const;

type StorefrontProductRow = Prisma.ProductGetPayload<{
  select: typeof storefrontProductSelect;
}>;

export type StorefrontProductItem = Omit<
  StorefrontProductRow,
  "price" | "discount" | "priceAfterDiscount" | "ratingsAverage"
> & {
  price: string;
  discount: string;
  priceAfterDiscount: string;
  ratingsAverage: string | null;
};

export type FilterOptions = {
  categories: { id: string; name: string; slug: string }[];
  brands: { id: string; name: string; slug: string }[];
  sizes: string[];
  colors: string[];
};
```

- [ ] Create `features/products/hooks/useProductParams.ts`:

```typescript
import {
  createSearchParamsCache,
  parseAsBoolean,
  parseAsFloat,
  parseAsInteger,
  parseAsString,
  parseAsStringEnum,
} from "nuqs/server";
import { useQueryStates } from "nuqs";

export const productParamsSchema = {
  category: parseAsString.withDefault(""),
  brand: parseAsString.withDefault(""),
  minPrice: parseAsFloat.withDefault(0),
  maxPrice: parseAsFloat.withDefault(0),
  size: parseAsString.withDefault(""),
  color: parseAsString.withDefault(""),
  sort: parseAsStringEnum([
    "newest",
    "price_asc",
    "price_desc",
    "best_rated",
    "most_sold",
  ]).withDefault("newest"),
  view: parseAsStringEnum(["grid", "list"]).withDefault("grid"),
  page: parseAsInteger.withDefault(1),
  featured: parseAsBoolean.withDefault(false),
};

export const loadProductParams = createSearchParamsCache(productParamsSchema);

export const useProductParams = () =>
  useQueryStates(productParamsSchema, { shallow: false });
```

- [ ] Run `bun tsc --noEmit` and confirm no new errors
- [ ] Commit: `git commit -m "feat(products): add types and nuqs params schema"`

---

### Task 3: Filter options service

**Files:**
- Create: `features/products/services/get-filter-options.ts`

- [ ] Create `features/products/services/get-filter-options.ts`:

```typescript
import { prisma } from "@/lib/prisma";
import { ProductStatus } from "@/generated/prisma/enums";
import type { FilterOptions } from "../types";

export async function getFilterOptions(): Promise<FilterOptions> {
  const [categories, brands, activeProducts] = await Promise.all([
    prisma.category.findMany({
      where: { products: { some: { status: ProductStatus.ACTIVE } } },
      select: { id: true, name: true, slug: true },
      orderBy: { name: "asc" },
    }),
    prisma.brand.findMany({
      where: { products: { some: { status: ProductStatus.ACTIVE } } },
      select: { id: true, name: true, slug: true },
      orderBy: { name: "asc" },
    }),
    prisma.product.findMany({
      where: { status: ProductStatus.ACTIVE },
      select: { sizes: true, colors: true },
    }),
  ]);

  const sizes = [...new Set(activeProducts.flatMap((p) => p.sizes))].sort();
  const colors = [...new Set(activeProducts.flatMap((p) => p.colors))].sort();

  return { categories, brands, sizes, colors };
}
```

- [ ] Run `bun tsc --noEmit` and confirm no new errors
- [ ] Commit: `git commit -m "feat(products): add getFilterOptions service"`

---

### Task 4: Get products service

**Files:**
- Create: `features/products/services/get-products.ts`

- [ ] Create `features/products/services/get-products.ts`:

```typescript
import type { Prisma } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import { ProductStatus } from "@/generated/prisma/enums";
import {
  storefrontProductSelect,
  type StorefrontProductItem,
} from "../types";

const PAGE_SIZE = 24;

export type GetProductsParams = {
  category: string;
  brand: string;
  minPrice: number;
  maxPrice: number;
  size: string;
  color: string;
  sort: string;
  page: number;
  featured: boolean;
};

export type GetProductsResult = {
  products: StorefrontProductItem[];
  total: number;
  pageCount: number;
};

function getOrderBy(sort: string): Prisma.ProductOrderByWithRelationInput {
  switch (sort) {
    case "price_asc":
      return { priceAfterDiscount: "asc" };
    case "price_desc":
      return { priceAfterDiscount: "desc" };
    case "best_rated":
      return { ratingsAverage: { sort: "desc", nulls: "last" } };
    case "most_sold":
      return { sold: "desc" };
    default:
      return { createdAt: "desc" };
  }
}

export async function getProducts({
  category,
  brand,
  minPrice,
  maxPrice,
  size,
  color,
  sort,
  page,
  featured,
}: GetProductsParams): Promise<GetProductsResult> {
  const safePage = Math.max(1, page);

  const where: Prisma.ProductWhereInput = {
    status: ProductStatus.ACTIVE,
  };

  if (category) where.category = { slug: category };
  if (brand) where.brand = { slug: brand };
  if (minPrice > 0 || maxPrice > 0) {
    where.priceAfterDiscount = {
      ...(minPrice > 0 ? { gte: minPrice } : {}),
      ...(maxPrice > 0 ? { lte: maxPrice } : {}),
    };
  }
  if (size) where.sizes = { has: size };
  if (color) where.colors = { has: color };
  if (featured) where.featured = true;

  const [rows, total] = await Promise.all([
    prisma.product.findMany({
      where,
      select: storefrontProductSelect,
      orderBy: getOrderBy(sort),
      skip: (safePage - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
    }),
    prisma.product.count({ where }),
  ]);

  const pageCount = Math.max(1, Math.ceil(total / PAGE_SIZE));

  const products: StorefrontProductItem[] = rows.map((r) => ({
    ...r,
    price: r.price.toString(),
    discount: r.discount.toString(),
    priceAfterDiscount: r.priceAfterDiscount.toString(),
    ratingsAverage: r.ratingsAverage?.toString() ?? null,
  }));

  return { products, total, pageCount };
}
```

- [ ] Run `bun tsc --noEmit` and confirm no new errors
- [ ] Commit: `git commit -m "feat(products): add getProducts service"`

---

### Task 5: ProductCard component

**Files:**
- Create: `features/products/components/ProductCard.tsx`

- [ ] Create `features/products/components/ProductCard.tsx`:

```typescript
import Image from "next/image";
import Link from "next/link";
import { LucideStar } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { StorefrontProductItem } from "../types";

type ProductCardProps = {
  product: StorefrontProductItem;
  layout: "grid" | "list";
};

export function ProductCard({ product, layout }: ProductCardProps) {
  const hasDiscount = Number(product.discount) > 0;
  const isOutOfStock = product.quantity === 0;

  if (layout === "list") {
    return (
      <Link
        href={`/products/${product.slug}`}
        className="group flex gap-6 py-6 hover:bg-muted/30 px-4 -mx-4 transition-colors"
      >
        <div className="relative w-28 aspect-[3/4] bg-muted overflow-hidden shrink-0">
          <Image
            src={product.imageUrl}
            alt={product.name}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-700"
            sizes="112px"
          />
          {isOutOfStock && (
            <span className="absolute inset-0 flex items-center justify-center bg-background/60 font-sans text-xs tracking-[0.15em] uppercase text-foreground">
              Out of stock
            </span>
          )}
        </div>
        <div className="flex flex-1 flex-col justify-between py-1">
          <div>
            <p className="font-sans text-sm font-medium text-foreground tracking-wide mb-2">
              {product.name}
            </p>
            <div className="flex items-center gap-2 mb-2">
              <p className="font-sans text-sm text-foreground">
                LE {Number(product.priceAfterDiscount).toLocaleString()}
              </p>
              {hasDiscount && (
                <p className="font-sans text-xs text-muted-foreground line-through">
                  LE {Number(product.price).toLocaleString()}
                </p>
              )}
              {hasDiscount && (
                <span className="font-sans text-xs text-accent">
                  -{product.discount}%
                </span>
              )}
            </div>
            {product.ratingsAverage && (
              <div className="flex items-center gap-1">
                <LucideStar className="size-3 fill-accent text-accent" />
                <span className="font-sans text-xs text-muted-foreground">
                  {Number(product.ratingsAverage).toFixed(1)}{" "}
                  {product.ratingsQuantity > 0 && `(${product.ratingsQuantity})`}
                </span>
              </div>
            )}
          </div>
          <Button
            variant="outline"
            size="sm"
            className="w-fit mt-3"
            disabled
          >
            Add to Cart
          </Button>
        </div>
      </Link>
    );
  }

  return (
    <Link href={`/products/${product.slug}`} className="group">
      <div className="relative aspect-[3/4] bg-muted overflow-hidden mb-4">
        <Image
          src={product.imageUrl}
          alt={product.name}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-700"
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
        />
        <div className="absolute inset-0 bg-foreground/0 group-hover:bg-foreground/5 transition-colors duration-300" />
        {hasDiscount && (
          <span className="absolute top-3 left-3 bg-accent text-accent-foreground font-sans text-xs px-2 py-1 tracking-wide">
            -{product.discount}%
          </span>
        )}
        {isOutOfStock && (
          <span className="absolute top-3 right-3 bg-foreground/80 text-background font-sans text-xs px-2 py-1 tracking-wide">
            Out of stock
          </span>
        )}
      </div>
      <p className="font-sans text-sm font-medium text-foreground tracking-wide mb-1">
        {product.name}
      </p>
      <div className="flex items-center gap-2 mb-2">
        <p className="font-sans text-sm text-foreground">
          LE {Number(product.priceAfterDiscount).toLocaleString()}
        </p>
        {hasDiscount && (
          <p className="font-sans text-xs text-muted-foreground line-through">
            LE {Number(product.price).toLocaleString()}
          </p>
        )}
      </div>
      {product.ratingsAverage && (
        <div className="flex items-center gap-1 mb-3">
          <LucideStar className="size-3 fill-accent text-accent" />
          <span className="font-sans text-xs text-muted-foreground">
            {Number(product.ratingsAverage).toFixed(1)}{" "}
            {product.ratingsQuantity > 0 && `(${product.ratingsQuantity})`}
          </span>
        </div>
      )}
      <Button
        variant="outline"
        size="sm"
        className={cn("w-full", !product.ratingsAverage && "mt-3")}
        disabled
      >
        Add to Cart
      </Button>
    </Link>
  );
}
```

- [ ] Run `bun tsc --noEmit` and confirm no new errors
- [ ] Commit: `git commit -m "feat(products): add ProductCard component"`

---

### Task 6: ProductGrid and ProductList components

**Files:**
- Create: `features/products/components/ProductGrid.tsx`
- Create: `features/products/components/ProductList.tsx`

- [ ] Create `features/products/components/ProductGrid.tsx`:

```typescript
import { ProductCard } from "./ProductCard";
import type { StorefrontProductItem } from "../types";

type ProductGridProps = {
  products: StorefrontProductItem[];
};

export function ProductGrid({ products }: ProductGridProps) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-4 gap-y-10">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} layout="grid" />
      ))}
    </div>
  );
}
```

- [ ] Create `features/products/components/ProductList.tsx`:

```typescript
import { ProductCard } from "./ProductCard";
import type { StorefrontProductItem } from "../types";

type ProductListProps = {
  products: StorefrontProductItem[];
};

export function ProductList({ products }: ProductListProps) {
  return (
    <div className="divide-y divide-border">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} layout="list" />
      ))}
    </div>
  );
}
```

- [ ] Run `bun tsc --noEmit` and confirm no new errors
- [ ] Commit: `git commit -m "feat(products): add ProductGrid and ProductList components"`

---

### Task 7: ProductFilters component

**Files:**
- Create: `features/products/components/ProductFilters.tsx`

- [ ] Create `features/products/components/ProductFilters.tsx`:

```typescript
"use client";

import { LucideX } from "lucide-react";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import type { FilterOptions } from "../types";
import { useProductParams } from "../hooks/useProductParams";

type ProductFiltersProps = {
  options: FilterOptions;
};

export function ProductFilters({ options }: ProductFiltersProps) {
  const [params, setParams] = useProductParams();

  const activeCount = [
    params.category,
    params.brand,
    params.size,
    params.color,
    params.minPrice > 0 ? "x" : null,
    params.maxPrice > 0 ? "x" : null,
  ].filter(Boolean).length;

  function clearAll() {
    setParams({
      category: "",
      brand: "",
      minPrice: 0,
      maxPrice: 0,
      size: "",
      color: "",
      page: 1,
    });
  }

  return (
    <div className="space-y-0">
      <div className="flex items-center justify-between py-4 border-b border-border">
        <p className="font-sans text-xs tracking-[0.2em] uppercase text-foreground">
          Filters {activeCount > 0 && `(${activeCount})`}
        </p>
        {activeCount > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={clearAll}
            className="h-6 px-2 text-xs gap-1"
          >
            <LucideX className="size-3" />
            Clear all
          </Button>
        )}
      </div>

      <Accordion type="multiple" defaultValue={["category", "brand", "price", "size", "color"]}>
        {/* Category */}
        {options.categories.length > 0 && (
          <AccordionItem value="category">
            <AccordionTrigger>Category</AccordionTrigger>
            <AccordionContent>
              <div className="space-y-1">
                {options.categories.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() =>
                      setParams({
                        category: params.category === cat.slug ? "" : cat.slug,
                        page: 1,
                      })
                    }
                    className={cn(
                      "w-full text-left px-3 py-2 font-sans text-sm transition-colors",
                      params.category === cat.slug
                        ? "bg-foreground text-background"
                        : "hover:bg-muted text-muted-foreground hover:text-foreground"
                    )}
                  >
                    {cat.name}
                  </button>
                ))}
              </div>
            </AccordionContent>
          </AccordionItem>
        )}

        {/* Brand */}
        {options.brands.length > 0 && (
          <AccordionItem value="brand">
            <AccordionTrigger>Brand</AccordionTrigger>
            <AccordionContent>
              <div className="space-y-1">
                {options.brands.map((brand) => (
                  <button
                    key={brand.id}
                    onClick={() =>
                      setParams({
                        brand: params.brand === brand.slug ? "" : brand.slug,
                        page: 1,
                      })
                    }
                    className={cn(
                      "w-full text-left px-3 py-2 font-sans text-sm transition-colors",
                      params.brand === brand.slug
                        ? "bg-foreground text-background"
                        : "hover:bg-muted text-muted-foreground hover:text-foreground"
                    )}
                  >
                    {brand.name}
                  </button>
                ))}
              </div>
            </AccordionContent>
          </AccordionItem>
        )}

        {/* Price */}
        <AccordionItem value="price">
          <AccordionTrigger>Price</AccordionTrigger>
          <AccordionContent>
            <div className="flex items-center gap-2">
              <Input
                type="number"
                placeholder="Min"
                min={0}
                defaultValue={params.minPrice > 0 ? params.minPrice : ""}
                onBlur={(e) => {
                  const val = parseFloat(e.target.value);
                  setParams({ minPrice: isNaN(val) ? 0 : val, page: 1 });
                }}
                className="h-8 text-sm"
              />
              <span className="font-sans text-xs text-muted-foreground shrink-0">
                to
              </span>
              <Input
                type="number"
                placeholder="Max"
                min={0}
                defaultValue={params.maxPrice > 0 ? params.maxPrice : ""}
                onBlur={(e) => {
                  const val = parseFloat(e.target.value);
                  setParams({ maxPrice: isNaN(val) ? 0 : val, page: 1 });
                }}
                className="h-8 text-sm"
              />
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* Size */}
        {options.sizes.length > 0 && (
          <AccordionItem value="size">
            <AccordionTrigger>Size</AccordionTrigger>
            <AccordionContent>
              <div className="flex flex-wrap gap-2">
                {options.sizes.map((size) => (
                  <button
                    key={size}
                    onClick={() =>
                      setParams({
                        size: params.size === size ? "" : size,
                        page: 1,
                      })
                    }
                    className={cn(
                      "px-3 py-1.5 font-sans text-xs border transition-colors",
                      params.size === size
                        ? "border-foreground bg-foreground text-background"
                        : "border-border hover:border-foreground text-muted-foreground hover:text-foreground"
                    )}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </AccordionContent>
          </AccordionItem>
        )}

        {/* Color */}
        {options.colors.length > 0 && (
          <AccordionItem value="color">
            <AccordionTrigger>Color</AccordionTrigger>
            <AccordionContent>
              <div className="flex flex-wrap gap-2">
                {options.colors.map((color) => (
                  <button
                    key={color}
                    onClick={() =>
                      setParams({
                        color: params.color === color ? "" : color,
                        page: 1,
                      })
                    }
                    className={cn(
                      "px-3 py-1.5 font-sans text-xs border transition-colors",
                      params.color === color
                        ? "border-foreground bg-foreground text-background"
                        : "border-border hover:border-foreground text-muted-foreground hover:text-foreground"
                    )}
                  >
                    {color}
                  </button>
                ))}
              </div>
            </AccordionContent>
          </AccordionItem>
        )}
      </Accordion>
    </div>
  );
}
```

- [ ] Run `bun tsc --noEmit` and confirm no new errors
- [ ] Commit: `git commit -m "feat(products): add ProductFilters sidebar"`

---

### Task 8: MobileFiltersDialog component

**Files:**
- Create: `features/products/components/MobileFiltersDialog.tsx`

- [ ] Create `features/products/components/MobileFiltersDialog.tsx`:

```typescript
"use client";

import { LucideSlidersHorizontal } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import type { FilterOptions } from "../types";
import { ProductFilters } from "./ProductFilters";

type MobileFiltersDialogProps = {
  options: FilterOptions;
  activeCount: number;
};

export function MobileFiltersDialog({
  options,
  activeCount,
}: MobileFiltersDialogProps) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2 lg:hidden">
          <LucideSlidersHorizontal className="size-4" />
          Filters
          {activeCount > 0 && (
            <span className="inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-foreground px-1.5 text-xs font-medium text-background">
              {activeCount}
            </span>
          )}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-sm">
        <DialogHeader>
          <DialogTitle className="font-sans text-xs tracking-[0.2em] uppercase">
            Filters
          </DialogTitle>
        </DialogHeader>
        <ProductFilters options={options} />
      </DialogContent>
    </Dialog>
  );
}
```

- [ ] Run `bun tsc --noEmit` and confirm no new errors
- [ ] Commit: `git commit -m "feat(products): add MobileFiltersDialog"`

---

### Task 9: ProductSort component

**Files:**
- Create: `features/products/components/ProductSort.tsx`

- [ ] Create `features/products/components/ProductSort.tsx`:

```typescript
"use client";

import { LucideLayoutGrid, LucideLayoutList } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { useProductParams } from "../hooks/useProductParams";

const SORT_OPTIONS = [
  { value: "newest", label: "Newest" },
  { value: "price_asc", label: "Price: Low to High" },
  { value: "price_desc", label: "Price: High to Low" },
  { value: "best_rated", label: "Best Rated" },
  { value: "most_sold", label: "Most Popular" },
];

export function ProductSort() {
  const [params, setParams] = useProductParams();

  return (
    <div className="flex items-center gap-3">
      <Select
        value={params.sort}
        onValueChange={(sort) => setParams({ sort: sort as typeof params.sort, page: 1 })}
      >
        <SelectTrigger className="h-8 w-[180px] text-xs">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {SORT_OPTIONS.map((opt) => (
            <SelectItem key={opt.value} value={opt.value} className="text-xs">
              {opt.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <div className="flex border border-border">
        <Button
          variant="ghost"
          size="icon"
          className={cn(
            "h-8 w-8 rounded-none",
            params.view === "grid" && "bg-foreground text-background"
          )}
          onClick={() => setParams({ view: "grid" })}
          aria-label="Grid view"
        >
          <LucideLayoutGrid className="size-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className={cn(
            "h-8 w-8 rounded-none border-l border-border",
            params.view === "list" && "bg-foreground text-background"
          )}
          onClick={() => setParams({ view: "list" })}
          aria-label="List view"
        >
          <LucideLayoutList className="size-4" />
        </Button>
      </div>
    </div>
  );
}
```

- [ ] Run `bun tsc --noEmit` and confirm no new errors
- [ ] Commit: `git commit -m "feat(products): add ProductSort component"`

---

### Task 10: ProductPagination component

**Files:**
- Create: `features/products/components/ProductPagination.tsx`

- [ ] Create `features/products/components/ProductPagination.tsx`:

```typescript
"use client";

import { LucideChevronLeft, LucideChevronRight } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useProductParams } from "../hooks/useProductParams";

type ProductPaginationProps = {
  page: number;
  pageCount: number;
};

export function ProductPagination({ page, pageCount }: ProductPaginationProps) {
  const [, setParams] = useProductParams();

  if (pageCount <= 1) return null;

  return (
    <div className="flex items-center justify-center gap-4 pt-12 border-t border-border">
      <Button
        variant="outline"
        size="sm"
        onClick={() => setParams({ page: page - 1 })}
        disabled={page <= 1}
        className="gap-1"
      >
        <LucideChevronLeft className="size-4" />
        Prev
      </Button>

      <p className="font-sans text-xs tracking-[0.15em] uppercase text-muted-foreground">
        Page {page} of {pageCount}
      </p>

      <Button
        variant="outline"
        size="sm"
        onClick={() => setParams({ page: page + 1 })}
        disabled={page >= pageCount}
        className="gap-1"
      >
        Next
        <LucideChevronRight className="size-4" />
      </Button>
    </div>
  );
}
```

- [ ] Run `bun tsc --noEmit` and confirm no new errors
- [ ] Commit: `git commit -m "feat(products): add ProductPagination component"`

---

### Task 11: ProductEmptyState component

**Files:**
- Create: `features/products/components/ProductEmptyState.tsx`

- [ ] Create `features/products/components/ProductEmptyState.tsx`:

```typescript
"use client";

import { LucidePackageSearch } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useProductParams } from "../hooks/useProductParams";

export function ProductEmptyState() {
  const [, setParams] = useProductParams();

  function clearFilters() {
    setParams({
      category: "",
      brand: "",
      minPrice: 0,
      maxPrice: 0,
      size: "",
      color: "",
      sort: "newest",
      page: 1,
    });
  }

  return (
    <div className="flex flex-col items-center justify-center py-24 text-center">
      <LucidePackageSearch className="size-10 text-muted-foreground mb-6" />
      <p className="font-heading text-2xl text-foreground mb-2">
        No products found
      </p>
      <p className="font-sans text-sm text-muted-foreground mb-8">
        No products match your current filters.
      </p>
      <Button variant="outline" onClick={clearFilters}>
        Clear filters
      </Button>
    </div>
  );
}
```

- [ ] Run `bun tsc --noEmit` and confirm no new errors
- [ ] Commit: `git commit -m "feat(products): add ProductEmptyState component"`

---

### Task 12: Wire up index.tsx and page.tsx

**Files:**
- Modify: `features/products/index.tsx`
- Modify: `app/(storefront)/products/page.tsx`

- [ ] Replace `features/products/index.tsx` with:

```typescript
import { loadProductParams } from "./hooks/useProductParams";
import { getProducts } from "./services/get-products";
import { getFilterOptions } from "./services/get-filter-options";
import { ProductGrid } from "./components/ProductGrid";
import { ProductList } from "./components/ProductList";
import { ProductFilters } from "./components/ProductFilters";
import { MobileFiltersDialog } from "./components/MobileFiltersDialog";
import { ProductSort } from "./components/ProductSort";
import { ProductPagination } from "./components/ProductPagination";
import { ProductEmptyState } from "./components/ProductEmptyState";

type ProductsFeatureProps = {
  searchParams: Promise<Record<string, string | string[]>>;
};

export default async function ProductsFeature({
  searchParams,
}: ProductsFeatureProps) {
  const params = await loadProductParams(searchParams);

  const [{ products, total, pageCount }, filterOptions] = await Promise.all([
    getProducts(params),
    getFilterOptions(),
  ]);

  const activeFilterCount = [
    params.category,
    params.brand,
    params.size,
    params.color,
    params.minPrice > 0 ? "x" : null,
    params.maxPrice > 0 ? "x" : null,
  ].filter(Boolean).length;

  return (
    <div className="max-w-[1600px] mx-auto px-6 py-10">
      <div className="flex items-baseline justify-between mb-8">
        <h1 className="font-heading text-3xl">Collection</h1>
        <p className="font-sans text-xs text-muted-foreground tracking-wide">
          {total} {total === 1 ? "product" : "products"}
        </p>
      </div>

      <div className="grid lg:grid-cols-[280px_1fr] gap-10">
        {/* Desktop sidebar */}
        <aside className="hidden lg:block">
          <ProductFilters options={filterOptions} />
        </aside>

        {/* Main content */}
        <div className="min-w-0">
          {/* Mobile filter + sort bar */}
          <div className="flex items-center justify-between gap-4 mb-6">
            <MobileFiltersDialog
              options={filterOptions}
              activeCount={activeFilterCount}
            />
            <ProductSort />
          </div>

          {/* Grid or list */}
          {products.length === 0 ? (
            <ProductEmptyState />
          ) : params.view === "list" ? (
            <ProductList products={products} />
          ) : (
            <ProductGrid products={products} />
          )}

          {/* Pagination */}
          <ProductPagination page={params.page} pageCount={pageCount} />
        </div>
      </div>
    </div>
  );
}
```

- [ ] Update `app/(storefront)/products/page.tsx`:

```typescript
import ProductsFeature from "@/features/products";

type ProductsPageProps = {
  searchParams: Promise<Record<string, string | string[]>>;
};

export default function ProductsPage({ searchParams }: ProductsPageProps) {
  return <ProductsFeature searchParams={searchParams} />;
}
```

- [ ] Run `bun tsc --noEmit` and confirm no errors
- [ ] Start dev server: `bun dev`
- [ ] Open `http://localhost:3000/products` in browser
- [ ] Verify: catalog renders, sidebar appears on desktop, sort dropdown works, grid/list toggle switches layout, filter selections update URL, pagination shows when total > 24
- [ ] Verify `/products?featured=true` filters to featured products
- [ ] Stop dev server
- [ ] Commit:

```bash
git add features/products/ app/(storefront)/products/page.tsx
git commit -m "feat: implement ProductsFeature storefront catalog"
```

---

## Self-Review Checklist

**Spec coverage:**
- [x] Left sidebar (desktop) + mobile dialog — Task 7, 8, 12
- [x] Filter by category/brand/price/size/color — Task 7
- [x] Single-select with deselect on re-click — Task 7
- [x] Sort (newest/price asc/desc/best rated/most sold) — Task 9
- [x] Grid/list toggle with nuqs `view` param — Task 9
- [x] URL state via nuqs, no useState for filters — Tasks 2, 7–11
- [x] Server Component index.tsx — Task 12
- [x] Parallel data fetching — Task 12
- [x] `getProducts` shared with `/api/products` (same service file) — Task 4
- [x] Prev/Next pagination disabled at boundaries — Task 10
- [x] Disabled Add to Cart button — Task 5
- [x] `featured=true` filter from home page — Tasks 2, 4, 12
- [x] Empty state with clear filters — Task 11
- [x] Out of stock badge — Task 5
- [x] No discount = single price — Task 5
- [x] `ratingsAverage` null = star row hidden — Task 5
