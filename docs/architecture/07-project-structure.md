# 07 — Project Structure

**No `src/` folder.** All source lives at the project root.

## Top-level layout

```
/                                     ← project root
│
├── app/
│   ├── (storefront)/                 # Client-facing pages — shared nav/footer layout
│   │   ├── layout.tsx
│   │   ├── page.tsx                  # → <HomeFeature />
│   │   ├── products/
│   │   │   ├── page.tsx              # → <ProductsFeature searchParams={...} />
│   │   │   └── [slug]/page.tsx       # → <ProductDetailFeature slug={slug} />
│   │   ├── categories/
│   │   │   └── [slug]/page.tsx       # → <CategoryFeature slug={slug} searchParams={...} />
│   │   ├── search/page.tsx           # → <SearchFeature searchParams={...} />
│   │   ├── cart/page.tsx             # → <CartFeature />
│   │   ├── checkout/
│   │   │   ├── page.tsx              # → <CheckoutFeature />
│   │   │   └── success/page.tsx      # → <CheckoutSuccessFeature orderId={...} />
│   │   └── account/
│   │       ├── page.tsx              # → <AccountOverviewFeature />
│   │       ├── orders/
│   │       │   ├── page.tsx          # → <OrdersFeature searchParams={...} />
│   │       │   └── [id]/page.tsx     # → <OrderDetailFeature id={id} />
│   │       ├── addresses/page.tsx    # → <AddressesFeature />
│   │       └── wishlist/page.tsx     # → <WishlistFeature />
│   │
│   ├── (auth)/
│   │   ├── sign-in/[[...sign-in]]/page.tsx
│   │   └── sign-up/[[...sign-up]]/page.tsx
│   │
│   ├── admin/                        # Admin dashboard — own layout
│   │   ├── layout.tsx                # Sidebar + topbar shell
│   │   ├── page.tsx                  # → <AdminDashboardFeature />
│   │   ├── orders/...
│   │   ├── products/...
│   │   ├── categories/page.tsx
│   │   ├── brands/page.tsx
│   │   ├── customers/...
│   │   ├── coupons/page.tsx
│   │   ├── analytics/page.tsx
│   │   ├── settings/page.tsx
│   │   └── users/page.tsx
│   │
│   └── api/                          # See architecture/06-api-design.md
│
├── features/                         # ← Core of the codebase
│   ├── home/
│   ├── products/
│   ├── product-detail/
│   ├── cart/
│   ├── checkout/
│   ├── account/
│   └── admin/
│       ├── dashboard/
│       ├── orders/
│       ├── order-detail/
│       ├── products/
│       ├── categories/
│       ├── brands/
│       ├── customers/
│       ├── coupons/
│       ├── analytics/
│       ├── settings/
│       └── users/
│
├── components/
│   └── ui/                           # shadcn/ui primitives only
│
├── lib/
│   ├── prisma.ts                     # Prisma singleton
│   ├── stripe.ts                     # Stripe client
│   ├── cloudinary.ts                 # Cloudinary helpers
│   └── resend.ts                     # Resend client
│
├── emails/                           # React Email templates
│   ├── OrderConfirmation.tsx
│   ├── GuestOrderConfirmation.tsx
│   ├── OrderShipped.tsx
│   ├── OrderCancelled.tsx
│   ├── RefundProcessed.tsx
│   └── Welcome.tsx
│
├── types/
│   └── index.ts                      # Global types: ActionResult<T>, etc.
│
├── proxy.ts                          # Clerk auth + role guard
├── next.config.ts
├── tailwind.config.ts
├── tsconfig.json
└── package.json
```

## Feature folder shape

Every feature follows the same structure. Example: `features/products/`:

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
│   └── products.actions.ts      # OR one file per action — see below
├── services/
│   └── products.service.ts      # business logic
├── types/
│   └── index.ts
└── index.tsx                    # export default ProductsFeature
```

### One-file-per-action pattern (preferred for admin features)

For features with many distinct mutations, split actions into one file per action:

```
features/admin/products/
├── actions/
│   ├── productActionHelpers.ts
│   ├── createProduct.ts
│   ├── updateProduct.ts
│   ├── deleteProduct.ts
│   ├── updateProductStatus.ts
│   ├── toggleFeatured.ts
│   ├── deleteProductImage.ts
│   └── duplicateProduct.ts
```

Naming: file = action verb (camelCase), exported function = `<verb>Action`. Example: `updateOrderStatus.ts` exports `updateOrderStatusAction`.

See `08-conventions.md` for the rules.

## Feature architecture contract

Every feature exports **one thing** from `index.tsx`. Pages are thin wrappers.

```typescript
// Page — no logic, just renders the feature
// app/(storefront)/products/page.tsx
import { ProductsFeature } from "@/features/products";
import type { SearchParams } from "nuqs/server";

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  return <ProductsFeature searchParams={searchParams} />;
}

// Feature index — owns data fetching and component wiring
// features/products/index.tsx  (Server Component)
import { loadProductParams } from "./hooks/useProductParams";
import { getProducts } from "./services/products.service";
import { ProductGrid } from "./components/ProductGrid";
import { ProductFilters } from "./components/ProductFilters";

export default async function ProductsFeature({ searchParams }: Props) {
  const params = await loadProductParams(searchParams);
  const data = await getProducts(params);

  return (
    <div className="flex gap-8">
      <ProductFilters />
      <ProductGrid products={data.products} total={data.total} />
    </div>
  );
}
```

## Feature rules (non-negotiable)

- Each feature has exactly **one public export** from `index.tsx`.
- **Nothing outside a feature imports from inside it** — except the page file importing the feature's `index.tsx`.
- `index.tsx` is **always a Server Component**. Client interactivity lives in leaf components inside `components/`.
- URL state is **always nuqs**. Never use `useState` for filter/sort/pagination state.
- Page files contain **zero logic** — just an import and a render of the feature.
