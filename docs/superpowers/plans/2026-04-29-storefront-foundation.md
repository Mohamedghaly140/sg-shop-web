# Storefront Design Foundation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Fix the storefront design token system, update the nav with mobile support and cart badge, extract a shared SectionHeader, and refactor all existing home components to use proper semantic tokens — eliminating every hardcoded raw OKLCH value from JSX.

**Architecture:** All token changes land in `app/globals.css` only. A new `--gold` / `--gold-foreground` CSS variable pair replaces the misused `--accent` as the brand color. Tailwind v4's `@theme inline` maps `--color-gold` so `text-gold` / `bg-gold` work as utilities. The nav becomes a compound component: announcement bar on top (fixed `top-0`), main nav below (`top-8`). Mobile overlay is pure React state — no external library. `SectionHeader` is extracted to `features/home/components/SectionHeader.tsx` and used by all home section components.

**Tech Stack:** Next.js 16 App Router, Tailwind CSS v4, Clerk `@clerk/nextjs`, Lucide icons, TypeScript

---

## File Map

| Action | File | Responsibility |
|--------|------|----------------|
| Modify | `app/globals.css` | Add `--gold`, `--gold-foreground` to storefront theme; map `--color-gold` in `@theme inline` |
| Modify | `app/(storefront)/layout.tsx` | Pass `cartCount={0}` to nav; update `<main>` top padding |
| Modify | `app/(storefront)/_components/nav.tsx` | Announcement bar, mobile hamburger/overlay, cart badge, `text-gold` for logo |
| Create | `features/home/components/SectionHeader.tsx` | Reusable section title + optional "View All" link |
| Modify | `features/home/components/HeroBanner.tsx` | Replace hardcoded oklch values with `bg-muted`, `text-gold`, `bg-gold`; fix hero height |
| Modify | `features/home/components/CategoryGrid.tsx` | Remove `SHADES` array; replace hardcoded bg values with `bg-muted`; replace accent refs with gold |
| Modify | `features/home/components/FeaturedProducts.tsx` | Use `SectionHeader`; replace accent hover refs with gold; wrap card in `<div>` for split click/add |
| Modify | `app/(storefront)/_components/footer.tsx` | Fix `border-foreground` → `border-border` on newsletter form |

---

### Task 1: Design Tokens

**Files:**
- Modify: `app/globals.css`

- [ ] **Step 1: Replace the storefront theme block in `app/globals.css`**

Find the `[data-theme="storefront"]` block (currently around line 121). Replace the entire block with:

```css
[data-theme="storefront"] {
  --background:           oklch(0.98 0.003 95);
  --foreground:           oklch(0.145 0 0);
  --card:                 oklch(1 0 0);
  --card-foreground:      oklch(0.145 0 0);
  --popover:              oklch(1 0 0);
  --popover-foreground:   oklch(0.145 0 0);
  --primary:              oklch(0.145 0 0);
  --primary-foreground:   oklch(0.98 0.003 95);
  --secondary:            oklch(0.944 0.006 85);
  --secondary-foreground: oklch(0.145 0 0);
  --muted:                oklch(0.944 0.006 85);
  --muted-foreground:     oklch(0.563 0.006 56);
  --accent:               oklch(0.944 0.006 85);
  --accent-foreground:    oklch(0.145 0 0);
  --gold:                 oklch(0.723 0.098 70);
  --gold-foreground:      oklch(1 0 0);
  --destructive:          oklch(0.577 0.245 27.325);
  --border:               oklch(0.908 0.006 80);
  --input:                oklch(0.908 0.006 80);
  --ring:                 oklch(0.723 0.098 70);
  --radius: 0px;
  --font-sans: var(--font-dm-sans);
}
```

- [ ] **Step 2: Add `--color-gold` to the `@theme inline` block**

Inside the `@theme inline { ... }` block at the top of `globals.css`, add these two lines alongside the other `--color-*` entries:

```css
  --color-gold: var(--gold);
  --color-gold-foreground: var(--gold-foreground);
```

- [ ] **Step 3: Verify build**

```bash
bun build
```

Expected: exits 0, no CSS or TypeScript errors.

- [ ] **Step 4: Commit**

```bash
git add app/globals.css
git commit -m "feat: add --gold brand token to storefront theme, restore --accent to shadcn surface role"
```

---

### Task 2: StorefrontNav — Announcement Bar, Cart Badge, Mobile Nav

**Files:**
- Modify: `app/(storefront)/layout.tsx`
- Modify: `app/(storefront)/_components/nav.tsx`

- [ ] **Step 1: Update layout to pass `cartCount` prop and fix main padding**

Replace `app/(storefront)/layout.tsx` entirely:

```tsx
import "./storefront.css";
import { StorefrontNav } from "./_components/nav";
import { StorefrontFooter } from "./_components/footer";

export default function StorefrontLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div data-theme="storefront" className="min-h-screen flex flex-col">
      <StorefrontNav cartCount={0} />
      {/* pt-28: 32px announcement bar + ~80px nav height */}
      <main className="flex-1 pt-28">{children}</main>
      <StorefrontFooter />
    </div>
  );
}
```

- [ ] **Step 2: Rewrite `nav.tsx` with announcement bar, mobile overlay, and cart badge**

Replace `app/(storefront)/_components/nav.tsx` entirely:

```tsx
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  LucideSearch,
  LucideHeart,
  LucideShoppingBag,
  LucideUser,
  LucideMenu,
  LucideX,
} from "lucide-react";
import { Show, UserButton } from "@clerk/nextjs";

const leftLinks = [
  { label: "Shop", href: "/products" },
  { label: "Collections", href: "/categories" },
  { label: "New In", href: "/products?sort=newest" },
];

type StorefrontNavProps = {
  cartCount: number;
};

export function StorefrontNav({ cartCount }: StorefrontNavProps) {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  return (
    <>
      {/* Announcement bar — always visible, fixed top-0 */}
      <div className="fixed top-0 inset-x-0 z-50 bg-secondary border-b border-border py-1.5 text-center">
        <p className="font-sans text-[0.6875rem] tracking-[0.15em] uppercase text-gold">
          Free shipping on orders over LE 1,500
        </p>
      </div>

      {/* Main nav — fixed top-8 (sits below announcement bar) */}
      <header
        className={`fixed top-8 inset-x-0 z-50 transition-colors duration-300 ${
          scrolled
            ? "bg-background border-b border-border"
            : "bg-transparent"
        }`}
      >
        {/* ── Desktop (md+) ── */}
        <nav
          aria-label="Main"
          className="hidden md:grid max-w-7xl mx-auto px-8 py-5 grid-cols-3 items-center"
        >
          <div className="flex items-center gap-8">
            {leftLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="font-sans text-xs tracking-[0.15em] uppercase text-muted-foreground hover:text-foreground transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </div>

          <div className="flex justify-center">
            <Link
              href="/"
              className="font-heading text-xl tracking-[0.2em] uppercase text-gold hover:opacity-80 transition-opacity"
            >
              SG Couture
            </Link>
          </div>

          <div className="flex items-center justify-end gap-6">
            <Link
              href="/search"
              aria-label="Search"
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              <LucideSearch size={18} strokeWidth={1.5} />
            </Link>
            <Link
              href="/account/wishlist"
              aria-label="Wishlist"
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              <LucideHeart size={18} strokeWidth={1.5} />
            </Link>
            <Link
              href="/cart"
              aria-label="Cart"
              className="relative text-muted-foreground hover:text-foreground transition-colors"
            >
              <LucideShoppingBag size={18} strokeWidth={1.5} />
              {cartCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 bg-gold text-gold-foreground text-[0.5rem] w-4 h-4 rounded-full flex items-center justify-center font-sans leading-none">
                  {cartCount > 9 ? "9+" : cartCount}
                </span>
              )}
            </Link>

            <Show when="signed-out">
              <Link
                href="/sign-in"
                aria-label="Sign in"
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                <LucideUser size={18} strokeWidth={1.5} />
              </Link>
            </Show>
            <Show when="signed-in">
              <UserButton
                appearance={{
                  elements: {
                    avatarBox: "size-[18px]",
                    userButtonTrigger: "focus:shadow-none",
                  },
                }}
              />
            </Show>
          </div>
        </nav>

        {/* ── Mobile bar (< md) ── */}
        <div className="md:hidden flex items-center justify-between px-4 py-4">
          <button
            aria-label="Open menu"
            onClick={() => setMobileOpen(true)}
            className="text-foreground"
          >
            <LucideMenu size={20} strokeWidth={1.5} />
          </button>

          <Link
            href="/"
            className="font-heading text-lg tracking-[0.2em] uppercase text-gold"
          >
            SG Couture
          </Link>

          <Link
            href="/cart"
            aria-label="Cart"
            className="relative text-foreground"
          >
            <LucideShoppingBag size={20} strokeWidth={1.5} />
            {cartCount > 0 && (
              <span className="absolute -top-1.5 -right-1.5 bg-gold text-gold-foreground text-[0.5rem] w-4 h-4 rounded-full flex items-center justify-center font-sans leading-none">
                {cartCount > 9 ? "9+" : cartCount}
              </span>
            )}
          </Link>
        </div>
      </header>

      {/* ── Mobile full-screen overlay ── */}
      {mobileOpen && (
        <div className="fixed inset-0 z-[60] bg-background flex flex-col">
          <div className="flex items-center justify-between px-4 py-4 border-b border-border">
            <Link
              href="/"
              className="font-heading text-lg tracking-[0.2em] uppercase text-gold"
              onClick={() => setMobileOpen(false)}
            >
              SG Couture
            </Link>
            <button
              aria-label="Close menu"
              onClick={() => setMobileOpen(false)}
              className="text-foreground"
            >
              <LucideX size={20} strokeWidth={1.5} />
            </button>
          </div>

          <nav className="flex-1 px-6 py-8 flex flex-col">
            {leftLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className="font-heading text-3xl text-foreground py-5 border-b border-border hover:text-gold transition-colors"
              >
                {link.label}
              </Link>
            ))}

            <div className="flex gap-8 mt-10">
              {[
                { label: "Search", href: "/search" },
                { label: "Wishlist", href: "/account/wishlist" },
                { label: "Account", href: "/account" },
              ].map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  className="font-sans text-xs tracking-[0.15em] uppercase text-muted-foreground hover:text-foreground transition-colors"
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </nav>
        </div>
      )}
    </>
  );
}
```

- [ ] **Step 3: Verify build**

```bash
bun build
```

Expected: exits 0. TypeScript should accept `cartCount: number` as a new required prop since `layout.tsx` already passes it.

- [ ] **Step 4: Commit**

```bash
git add "app/(storefront)/layout.tsx" "app/(storefront)/_components/nav.tsx"
git commit -m "feat: add announcement bar, mobile nav overlay, and cart badge to StorefrontNav"
```

---

### Task 3: SectionHeader Component

**Files:**
- Create: `features/home/components/SectionHeader.tsx`

- [ ] **Step 1: Create the component**

Create `features/home/components/SectionHeader.tsx`:

```tsx
import Link from "next/link";

type SectionHeaderProps = {
  title: string;
  href?: string;
  linkLabel?: string;
  as?: "h2" | "h3";
};

export function SectionHeader({
  title,
  href,
  linkLabel = "View All",
  as: Tag = "h2",
}: SectionHeaderProps) {
  return (
    <div className="flex items-baseline justify-between mb-12">
      <Tag className="font-heading text-3xl">{title}</Tag>
      {href && (
        <Link
          href={href}
          className="font-sans text-xs tracking-[0.2em] uppercase text-muted-foreground hover:text-foreground transition-colors border-b border-current pb-px"
        >
          {linkLabel}
        </Link>
      )}
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
git add features/home/components/SectionHeader.tsx
git commit -m "feat: add shared SectionHeader component"
```

---

### Task 4: Fix HeroBanner Token References

**Files:**
- Modify: `features/home/components/HeroBanner.tsx`

- [ ] **Step 1: Replace hardcoded oklch values with semantic tokens and fix hero height**

Replace `features/home/components/HeroBanner.tsx` entirely:

```tsx
import Link from "next/link";

export function HeroBanner() {
  return (
    // pt-28 is consumed by the fixed header; hero fills remaining viewport height
    <section className="relative h-[calc(100vh-7rem)] flex overflow-hidden">
      {/* Editorial text panel */}
      <div className="flex-[3] flex flex-col justify-end pb-20 px-12 lg:px-24 z-10 bg-background">
        <div className="max-w-xl">
          <p
            className="font-sans text-xs tracking-[0.3em] uppercase text-gold mb-8"
            style={{ animation: "fadeUp 0.7s ease 0.1s both" }}
          >
            SS 2025 Collection
          </p>
          <h1
            className="font-heading text-[clamp(3.5rem,8vw,6.5rem)] leading-[0.88] tracking-tight text-foreground mb-12"
            style={{ animation: "fadeUp 0.7s ease 0.25s both" }}
          >
            Refined.<br />
            Rare.<br />
            <em className="text-gold not-italic">Remarkable.</em>
          </h1>
          <div
            className="flex items-center gap-8"
            style={{ animation: "fadeUp 0.7s ease 0.4s both" }}
          >
            <Link
              href="/products"
              className="font-sans text-xs tracking-[0.2em] uppercase bg-foreground text-background px-8 py-4 hover:bg-gold transition-colors duration-300"
            >
              Shop Now
            </Link>
            <Link
              href="/categories"
              className="font-sans text-xs tracking-[0.2em] uppercase text-foreground border-b border-foreground pb-px hover:text-gold hover:border-gold transition-colors duration-300"
            >
              View Collections
            </Link>
          </div>
        </div>
      </div>

      {/* Right accent panel */}
      <div className="flex-[2] relative overflow-hidden bg-muted">
        <span className="absolute -left-12 top-1/2 -translate-y-1/2 font-heading text-[22rem] leading-none select-none text-muted-foreground/20 pointer-events-none">
          S
        </span>
        <div className="absolute bottom-0 inset-x-0 h-[3px] bg-gold" />
        <p
          className="absolute top-10 right-10 font-sans text-xs tracking-[0.25em] uppercase text-muted-foreground"
          style={{ writingMode: "vertical-rl" }}
        >
          Spring / Summer 2025
        </p>
      </div>
    </section>
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
git add features/home/components/HeroBanner.tsx
git commit -m "fix: replace hardcoded oklch values with semantic tokens in HeroBanner"
```

---

### Task 5: Fix CategoryGrid Token References

**Files:**
- Modify: `features/home/components/CategoryGrid.tsx`

- [ ] **Step 1: Remove the `SHADES` array and replace with `bg-muted`**

Replace `features/home/components/CategoryGrid.tsx` entirely:

```tsx
import Link from "next/link";
import Image from "next/image";
import { SectionHeader } from "./SectionHeader";

type Category = {
  id: string;
  name: string;
  slug: string;
  imageUrl: string | null;
};

type CategoryGridProps = {
  categories: Category[];
};

export function CategoryGrid({ categories }: CategoryGridProps) {
  if (categories.length === 0) return null;

  return (
    <section className="py-12 md:py-20 px-4 md:px-8 max-w-7xl mx-auto">
      <SectionHeader title="Shop by Category" href="/products" />

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {categories.map((cat) => (
          <Link
            key={cat.id}
            href={`/categories/${cat.slug}`}
            className="group relative bg-muted aspect-[3/4] flex items-end p-8 overflow-hidden"
          >
            {cat.imageUrl && (
              <Image
                src={cat.imageUrl}
                alt={cat.name}
                fill
                className="object-cover opacity-60 group-hover:scale-105 transition-transform duration-700"
                sizes="(max-width: 640px) 100vw, 33vw"
              />
            )}
            <div className="absolute bottom-0 left-0 h-[2px] w-0 bg-gold group-hover:w-full transition-all duration-500 ease-out" />
            <div className="relative z-10">
              <p className="font-heading text-2xl text-foreground mb-2">
                {cat.name}
              </p>
              <p className="font-sans text-xs tracking-[0.2em] uppercase text-muted-foreground group-hover:text-gold transition-colors duration-300">
                Explore →
              </p>
            </div>
          </Link>
        ))}
      </div>
    </section>
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
git add features/home/components/CategoryGrid.tsx
git commit -m "fix: remove hardcoded oklch SHADES array from CategoryGrid, use bg-muted"
```

---

### Task 6: Fix FeaturedProducts Token References

**Files:**
- Modify: `features/home/components/FeaturedProducts.tsx`

- [ ] **Step 1: Use SectionHeader, split card link from Add to Cart, fix token refs**

Replace `features/home/components/FeaturedProducts.tsx` entirely:

```tsx
import Link from "next/link";
import Image from "next/image";
import { SectionHeader } from "./SectionHeader";
import type { getFeaturedProducts } from "../services/get-home-data";

type FeaturedProduct = Awaited<ReturnType<typeof getFeaturedProducts>>[number];

type FeaturedProductsProps = {
  products: FeaturedProduct[];
};

export function FeaturedProducts({ products }: FeaturedProductsProps) {
  if (products.length === 0) return null;

  return (
    <section className="py-12 md:py-20 px-4 md:px-8 max-w-7xl mx-auto border-t border-border">
      <SectionHeader title="Featured" href="/products?featured=true" />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-x-4 gap-y-10">
        {products.map((product) => {
          const hasDiscount = Number(product.discount) > 0;
          return (
            <div key={product.id} className="group">
              <Link href={`/products/${product.slug}`} className="block">
                <div className="relative aspect-[3/4] bg-muted overflow-hidden mb-4">
                  <Image
                    src={product.imageUrl}
                    alt={product.name}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-700"
                    sizes="(max-width: 640px) 50vw, 25vw"
                  />
                  <div className="absolute inset-0 bg-foreground/0 group-hover:bg-foreground/5 transition-colors duration-300" />
                </div>
                <p className="font-sans text-sm font-medium text-foreground tracking-wide mb-1">
                  {product.name}
                </p>
                <div className="flex items-center gap-2 mb-3">
                  <p className="font-sans text-sm text-foreground">
                    LE {Number(product.priceAfterDiscount).toLocaleString()}
                  </p>
                  {hasDiscount && (
                    <p className="font-sans text-xs text-muted-foreground line-through">
                      LE {Number(product.price).toLocaleString()}
                    </p>
                  )}
                </div>
              </Link>
              {/* Add to Cart — wired in Plan 3 (Cart & CartDrawer) */}
              <button
                type="button"
                className="w-full font-sans text-[0.6875rem] tracking-[0.15em] uppercase bg-foreground text-background py-2.5 hover:bg-gold transition-colors duration-300"
              >
                Add to Cart
              </button>
            </div>
          );
        })}
      </div>
    </section>
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
git add features/home/components/FeaturedProducts.tsx
git commit -m "fix: use SectionHeader and semantic gold tokens in FeaturedProducts"
```

---

### Task 7: Fix Footer Newsletter Border Token

**Files:**
- Modify: `app/(storefront)/_components/footer.tsx`

- [ ] **Step 1: Replace `border-foreground` with `border-border` on the newsletter form**

In `app/(storefront)/_components/footer.tsx`, find:

```tsx
<form className="flex gap-0 border-b border-foreground">
```

Replace with:

```tsx
<form className="flex gap-0 border-b border-border">
```

- [ ] **Step 2: Verify build**

```bash
bun build
```

Expected: exits 0.

- [ ] **Step 3: Commit**

```bash
git add "app/(storefront)/_components/footer.tsx"
git commit -m "fix: use border-border token in footer newsletter form"
```

---

### Task 8: Final Verification

- [ ] **Step 1: Run lint**

```bash
bun lint
```

Expected: exits 0, no ESLint errors or warnings about unused variables (the `SHADES` array has been removed).

- [ ] **Step 2: Run production build**

```bash
bun build
```

Expected: exits 0. All pages compile — the existing stub features (`<p>Products</p>` etc.) are fine, they are not broken by this plan.

- [ ] **Step 3: Start dev server and visually verify**

```bash
bun dev
```

Open `http://localhost:3000` and check:

| Check | Expected |
|-------|----------|
| Page background | Warm off-white (not pure white) |
| Announcement bar | Thin warm cream strip at very top, gold text "Free shipping..." |
| Nav logo | Gold/amber color |
| Nav links | Warm gray, hover to near-black |
| Scroll page | Nav gains solid background + border-bottom |
| Mobile width (< 640px) | Hamburger + centered logo + cart icon |
| Tap hamburger | Full-screen overlay with large serif links |
| Tap a link in overlay | Overlay closes, navigates |
| Category tiles | Uniform warm cream bg (no mismatched color bands) |
| Category tile hover | Gold bar slides in from bottom-left |
| Featured products | Cards show image, name, price, "Add to Cart" button |
| Product card hover | Image scales, button bg shifts to gold |
| Footer newsletter | Subtle warm border (not harsh black) |

- [ ] **Step 4: Add `.superpowers/` to `.gitignore` if not already present**

```bash
grep -q ".superpowers" .gitignore || echo ".superpowers/" >> .gitignore
git add .gitignore
git commit -m "chore: ignore .superpowers brainstorm session files"
```

---

## What's Next

This plan delivers a correct token foundation and a fully working home page. The remaining plans in order:

| Plan | What it builds | Prerequisite |
|------|---------------|--------------|
| **Plan 2: ProductCard + Catalog** | Shared `ProductCard`, `ProductsFeature`, `CategoryFeature`, `SearchFeature` | Plan 1 |
| **Plan 3: Cart & CartDrawer** | Cart service, `CartFeature` page, `CartDrawer`, wired "Add to Cart" | Plan 2 |
| **Plan 4: Product Detail** | `ProductDetailFeature` — gallery, variants, add to cart | Plan 3 |
| **Plan 5: Checkout** | `CheckoutFeature` multi-step form, `CheckoutSuccessFeature` | Plan 3 |
| **Plan 6: Account** | Account sub-layout, Orders, Addresses, Wishlist | Plan 3 |
