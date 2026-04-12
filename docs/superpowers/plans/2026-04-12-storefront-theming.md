# Storefront Theming Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Apply a minimalist luxury visual identity to the SG Couture storefront using `[data-theme="storefront"]` CSS scoping, leaving the admin dashboard's shadcn defaults untouched.

**Architecture:** Two new Google Fonts (DM Serif Display, DM Sans) are loaded in the root layout and exposed as CSS variables. A `[data-theme="storefront"]` block in `globals.css` overrides shadcn semantic tokens with the couture palette and scopes typographic base rules. The storefront layout wraps all output in `<div data-theme="storefront">` and renders a fixed centered-logo Nav and a 4-column Footer. No admin files are touched.

**Tech Stack:** Next.js 16 App Router, Tailwind CSS v4, shadcn/ui, `next/font/google`

---

## File Map

| Action | File | Responsibility |
|--------|------|----------------|
| Modify | `app/layout.tsx` | Add DM Serif Display + DM Sans, expose as `--font-dm-serif` and `--font-dm-sans` |
| Modify | `app/globals.css` | Update `@theme inline`, add `[data-theme="storefront"]` token block + scoped base rules |
| Create | `app/(storefront)/_components/nav.tsx` | Fixed centered-logo nav with scroll-transparency |
| Create | `app/(storefront)/_components/footer.tsx` | 4-column footer with newsletter input |
| Modify | `app/(storefront)/layout.tsx` | Wrap output in `data-theme="storefront"`, add Nav + Footer |

---

### Task 1: Load DM Serif Display + DM Sans in root layout

**Files:**
- Modify: `app/layout.tsx`

- [ ] **Step 1: Add the two new font imports alongside existing ones**

Open `app/layout.tsx`. The current imports are `Geist, Geist_Mono, Inter`. Add `DM_Serif_Display` and `DM_Sans`:

```tsx
import type { Metadata } from "next";
import { Geist, Geist_Mono, Inter, DM_Serif_Display, DM_Sans } from "next/font/google";
import { Toaster } from "@/components/ui/sonner";
import { NuqsAdapter } from "nuqs/adapters/next/app";
import ThemeProvider from "@/components/theme/theme-provider";
import "./globals.css";
import { cn } from "@/lib/utils";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const dmSerif = DM_Serif_Display({
  subsets: ["latin"],
  weight: ["400"],
  variable: "--font-dm-serif",
  display: "swap",
});

const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-dm-sans",
  display: "swap",
});
```

- [ ] **Step 2: Apply both new font variables to the `<html>` element**

The `html` className currently spreads `geistSans.variable`, `geistMono.variable`, and `inter.variable`. Add `dmSerif.variable` and `dmSans.variable`:

```tsx
<html
  lang="en"
  className={cn(
    "h-full",
    "antialiased",
    geistSans.variable,
    geistMono.variable,
    "font-sans",
    inter.variable,
    dmSerif.variable,
    dmSans.variable,
  )}
>
```

- [ ] **Step 3: Verify dev server starts without font errors**

Run: `bun dev`
Navigate to `http://localhost:3000`. Open DevTools → Elements. On `<html>` you should see `style` attributes containing `--font-dm-serif` and `--font-dm-sans` with their font-family values. No console errors.

- [ ] **Step 4: Commit**

```bash
git add app/layout.tsx
git commit -m "feat: load DM Serif Display and DM Sans font variables"
```

---

### Task 2: Add storefront CSS tokens and base rules

**Files:**
- Modify: `app/globals.css`

- [ ] **Step 1: Update `--font-heading` in the `@theme inline` block**

In `globals.css`, find the line inside `@theme inline`:
```css
--font-heading: var(--font-sans);
```
Replace it with:
```css
--font-heading: var(--font-dm-serif);
```
This makes `font-heading` use DM Serif Display globally. The admin never applies `font-heading` to headings (shadcn doesn't), so this is safe.

- [ ] **Step 2: Append the `[data-theme="storefront"]` token block**

Add this block after the `.dark { … }` closing brace:

```css
[data-theme="storefront"] {
  --background: #FAFAF8;
  --foreground: #1A1A1A;
  --card: #FFFFFF;
  --card-foreground: #1A1A1A;
  --popover: #FFFFFF;
  --popover-foreground: #1A1A1A;
  --primary: #1A1A1A;
  --primary-foreground: #FAFAF8;
  --secondary: #F0EDE8;
  --secondary-foreground: #1A1A1A;
  --muted: #F0EDE8;
  --muted-foreground: #8A8480;
  --accent: #C9A96E;
  --accent-foreground: #FFFFFF;
  --destructive: oklch(0.577 0.245 27.325);
  --border: #E8E4DE;
  --input: #E8E4DE;
  --ring: #C9A96E;
  --radius: 0px;
  --font-sans: var(--font-dm-sans);
}
```

`--font-sans: var(--font-dm-sans)` overrides Inter with DM Sans within the storefront scope. Because Tailwind's `font-sans` utility applies `font-family: var(--font-sans)`, all `font-sans` classes inside `[data-theme="storefront"]` will resolve to DM Sans automatically.

- [ ] **Step 3: Add scoped base rules inside `@layer base`**

Inside the existing `@layer base { … }` block (after the `html { @apply font-sans; }` rule), add:

```css
[data-theme="storefront"] h1,
[data-theme="storefront"] h2,
[data-theme="storefront"] h3 {
  font-family: var(--font-heading);
}
```

This auto-applies DM Serif Display to headings inside the storefront without touching the admin.

- [ ] **Step 4: Verify tokens apply**

Run: `bun dev`
Navigate to `http://localhost:3000`. In DevTools → Computed styles on `<body>` (which is still outside `[data-theme="storefront"]`), background should still be white (admin default). The storefront theme will only activate once the layout wrapper is added in Task 5.

- [ ] **Step 5: Commit**

```bash
git add app/globals.css
git commit -m "feat: add storefront CSS token scope and base typography rules"
```

---

### Task 3: Build the storefront Nav component

**Files:**
- Create: `app/(storefront)/_components/nav.tsx`

The `_components` folder uses Next.js's underscore-prefix convention — it is excluded from routing.

- [ ] **Step 1: Create the nav file**

```tsx
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Search, Heart, ShoppingBag, User } from "lucide-react";

const leftLinks = [
  { label: "Shop", href: "/products" },
  { label: "Collections", href: "/categories" },
  { label: "New In", href: "/products?sort=newest" },
];

const rightIcons = [
  { icon: Search, label: "Search", href: "/search" },
  { icon: Heart, label: "Wishlist", href: "/account/wishlist" },
  { icon: ShoppingBag, label: "Cart", href: "/cart" },
  { icon: User, label: "Account", href: "/account" },
] as const;

export function StorefrontNav() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 inset-x-0 z-50 transition-colors duration-300 ${
        scrolled ? "bg-background border-b border-border" : "bg-transparent"
      }`}
    >
      <nav className="max-w-7xl mx-auto px-8 py-6 grid grid-cols-3 items-center">
        {/* Left links */}
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

        {/* Center logo */}
        <div className="flex justify-center">
          <Link
            href="/"
            className="font-heading text-xl tracking-[0.2em] uppercase"
          >
            SG Couture
          </Link>
        </div>

        {/* Right icons */}
        <div className="flex items-center justify-end gap-6">
          {rightIcons.map(({ icon: Icon, label, href }) => (
            <Link
              key={href}
              href={href}
              aria-label={label}
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              <Icon size={18} strokeWidth={1.5} />
            </Link>
          ))}
        </div>
      </nav>
    </header>
  );
}
```

- [ ] **Step 2: Verify no TypeScript errors**

Run: `bun tsc --noEmit`
Expected: exit code 0, no errors referencing `nav.tsx`.

- [ ] **Step 3: Commit**

```bash
git add "app/(storefront)/_components/nav.tsx"
git commit -m "feat: add storefront centered-logo nav with scroll transparency"
```

---

### Task 4: Build the storefront Footer component

**Files:**
- Create: `app/(storefront)/_components/footer.tsx`

- [ ] **Step 1: Create the footer file**

```tsx
import Link from "next/link";

const shopLinks = [
  { label: "All Products", href: "/products" },
  { label: "Collections", href: "/categories" },
  { label: "New In", href: "/products?sort=newest" },
  { label: "Sale", href: "/products?sale=true" },
];

const accountLinks = [
  { label: "My Account", href: "/account" },
  { label: "Orders", href: "/account/orders" },
  { label: "Wishlist", href: "/account/wishlist" },
  { label: "Addresses", href: "/account/addresses" },
];

export function StorefrontFooter() {
  return (
    <footer className="bg-muted mt-auto">
      <div className="max-w-7xl mx-auto px-8 py-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-12">
          {/* Brand */}
          <div className="space-y-4">
            <p className="font-heading text-xl tracking-[0.2em] uppercase">
              SG Couture
            </p>
            <p className="font-sans text-sm text-muted-foreground leading-relaxed">
              Minimal luxury. Thoughtfully made.
            </p>
          </div>

          {/* Shop */}
          <div className="space-y-4">
            <p className="font-sans text-xs tracking-[0.15em] uppercase">
              Shop
            </p>
            <ul className="space-y-3">
              {shopLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="font-sans text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Account */}
          <div className="space-y-4">
            <p className="font-sans text-xs tracking-[0.15em] uppercase">
              Account
            </p>
            <ul className="space-y-3">
              {accountLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="font-sans text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Newsletter */}
          <div className="space-y-4">
            <p className="font-sans text-xs tracking-[0.15em] uppercase">
              Stay in Touch
            </p>
            <p className="font-sans text-sm text-muted-foreground">
              New arrivals, early access, and nothing else.
            </p>
            <div className="flex gap-0 border-b border-foreground">
              <input
                type="email"
                placeholder="Your email"
                className="flex-1 bg-transparent font-sans text-sm py-2 text-foreground placeholder:text-muted-foreground focus:outline-none"
              />
              <button
                type="button"
                className="font-sans text-xs tracking-widest uppercase py-2 px-4 hover:text-accent transition-colors"
              >
                Join
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-border">
        <div className="max-w-7xl mx-auto px-8 py-6 flex items-center justify-between">
          <p className="font-sans text-xs text-muted-foreground">
            © {new Date().getFullYear()} SG Couture. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
```

- [ ] **Step 2: Verify no TypeScript errors**

Run: `bun tsc --noEmit`
Expected: exit code 0, no errors referencing `footer.tsx`.

- [ ] **Step 3: Commit**

```bash
git add "app/(storefront)/_components/footer.tsx"
git commit -m "feat: add storefront 4-column footer with newsletter"
```

---

### Task 5: Wire up the storefront layout

**Files:**
- Modify: `app/(storefront)/layout.tsx`

- [ ] **Step 1: Replace the placeholder layout**

```tsx
import { StorefrontNav } from "./_components/nav";
import { StorefrontFooter } from "./_components/footer";

export default function StorefrontLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div data-theme="storefront" className="min-h-screen flex flex-col">
      <StorefrontNav />
      <main className="flex-1 pt-20">{children}</main>
      <StorefrontFooter />
    </div>
  );
}
```

`pt-20` (80px) offsets the fixed nav. The nav height is `py-6` (24px × 2) + ~18px icon = ~66px; 80px gives comfortable breathing room. Adjust to `pt-[66px]` if the gap looks too large after visual check.

- [ ] **Step 2: Visual verification checklist**

Run: `bun dev` and open `http://localhost:3000`.

- [ ] Page background is warm off-white `#FAFAF8` (not stark white)
- [ ] Nav is fixed at top, centered "SG Couture" with left/right link groups
- [ ] Nav background is transparent on page load, turns opaque after scrolling 8px
- [ ] Footer renders with 4 columns (Brand / Shop / Account / Newsletter)
- [ ] Body text uses DM Sans (sans-serif, clean geometric)
- [ ] No element has rounded corners (radius = 0)
- [ ] Navigate to `/admin` — background is white (default shadcn), fonts are Inter/Geist, no gold accent

- [ ] **Step 3: Commit**

```bash
git add "app/(storefront)/layout.tsx"
git commit -m "feat: wire storefront layout with data-theme scope, nav, and footer"
```

---

## Out of Scope (follow-up features)

These belong in individual feature implementations, not this theming layer:

- **Button hover → gold**: Apply `hover:bg-accent hover:text-accent-foreground` on the `Button` component or per-call in feature components. The tokens are now in place.
- **Product card**: Image scale on hover, wishlist icon fade-in — implement when building `features/products/components/product-card.tsx`.
- **Badge styles** (New, Sale): Implement in the product card or wherever badges are rendered.
- **Mobile nav**: Hamburger + drawer for small screens — implement as a follow-up to this layout.
- **Input underline style**: Apply `border-0 border-b border-input bg-transparent rounded-none` per-component in checkout/account forms.
