# Storefront Design System & UI Redesign

**Date:** 2026-04-29
**Status:** Approved — ready for implementation planning
**Scope:** Full storefront — design tokens, shared components, all feature page layouts

---

## 1. Design Direction

**Luxury Editorial (Option A)**

SG Couture is a couture fashion brand. The aesthetic is editorial, cold luxury — DM Serif Display headings, warm cream background, gold brand accent, sharp corners (0px radius). Reference brands: Celine, The Row, Lemaire.

Tagline: *"Minimal luxury. Thoughtfully made."*

**Not** in scope:
- Dark mode (light only)
- Rounded corners
- Friendly/approachable aesthetics

---

## 2. Design Tokens

All tokens live in the `[data-theme="storefront"]` block in `app/globals.css`.

### 2.1 Color Tokens

```css
[data-theme="storefront"] {
  /* Base */
  --background:           oklch(0.98 0.003 95);   /* warm off-white — page base */
  --foreground:           oklch(0.145 0 0);        /* near-black — primary text */

  /* Brand gold — NEW. Replaces the misused --accent. */
  --gold:                 oklch(0.723 0.098 70);   /* brand gold/amber */
  --gold-foreground:      oklch(1 0 0);            /* white on gold */

  /* Surfaces */
  --card:                 oklch(1 0 0);
  --card-foreground:      oklch(0.145 0 0);
  --popover:              oklch(1 0 0);
  --popover-foreground:   oklch(0.145 0 0);

  /* shadcn semantic tokens — restored to correct roles */
  --primary:              oklch(0.145 0 0);        /* near-black — primary buttons */
  --primary-foreground:   oklch(0.98 0.003 95);    /* warm white on primary */
  --secondary:            oklch(0.944 0.006 85);   /* warm cream — secondary surfaces */
  --secondary-foreground: oklch(0.145 0 0);
  --muted:                oklch(0.944 0.006 85);   /* warm cream — muted backgrounds */
  --muted-foreground:     oklch(0.563 0.006 56);   /* warm gray — secondary text */
  --accent:               oklch(0.944 0.006 85);   /* warm cream — hover surfaces (shadcn role) */
  --accent-foreground:    oklch(0.145 0 0);

  /* Utility */
  --destructive:          oklch(0.577 0.245 27.325);
  --border:               oklch(0.908 0.006 80);   /* warm divider */
  --input:                oklch(0.908 0.006 80);
  --ring:                 oklch(0.723 0.098 70);   /* focus ring = gold */

  /* Shape */
  --radius: 0px;                                   /* sharp corners — editorial */
  --font-sans: var(--font-dm-sans);
}
```

**Tailwind mapping** — add to `@theme inline` in `globals.css`:

```css
--color-gold: var(--gold);
--color-gold-foreground: var(--gold-foreground);
```

This enables `text-gold`, `bg-gold`, `border-gold` utility classes across storefront components.

**Existing code migration:** All occurrences of `text-accent`, `bg-accent`, `hover:text-accent`, `hover:border-accent` in storefront components must be replaced with `text-gold`, `bg-gold`, `hover:text-gold`, `hover:border-gold`.

### 2.2 Typography

| Role | Font | Size | Weight | Leading | Tracking |
|------|------|------|--------|---------|----------|
| Display / Hero | DM Serif Display | `clamp(3.5rem, 8vw, 6.5rem)` | 400 | 0.88 | tight |
| H2 | DM Serif Display | `2.25rem` | 400 | 1.1 | — |
| H3 | DM Serif Display | `1.5rem` | 400 | 1.2 | — |
| Body | DM Sans | `0.9375rem` | 400 | 1.6 | — |
| Product name | DM Sans | `0.875rem` | 500 | — | 0.03em |
| Price | DM Sans | `0.875rem` | 400 | — | — |
| Label / Caption | DM Sans | `0.6875rem` | 400 | — | 0.15–0.25em uppercase |

The existing `[data-theme="storefront"] h1, h2, h3 { font-family: var(--font-heading) }` rule already covers heading assignment.

### 2.3 Layout System

| Token | Value | Notes |
|-------|-------|-------|
| Max width | `max-w-7xl` (1280px) | All page sections |
| Page padding | `px-4 md:px-8` | 16px mobile → 32px desktop |
| Section vertical padding | `py-12 md:py-20` | 48px mobile → 80px desktop |
| Product grid gap | `gap-x-4 gap-y-10` | Consistent across all grids |
| Product grid columns | `grid-cols-2 lg:grid-cols-4` | 2 mobile, 3 tablet (via `md:grid-cols-3`), 4 desktop |

---

## 3. Shared Components

### 3.1 StorefrontNav

**Location:** `app/(storefront)/_components/nav.tsx`

**Desktop layout:** 3-column grid — `[nav links] [logo] [icon actions]`

**Changes from current implementation:**
1. Replace `text-accent` / logo color with `text-gold`.
2. Add cart item count badge (gold circle) on the bag icon — fetched server-side from cart service, passed as prop.
3. Add announcement bar below the nav header (`bg-[oklch(0.96_0.008_85)]`): "Free shipping on orders over LE 1,500 →" — thin strip, `text-gold`, small caps. Can be made configurable later.
4. Add mobile hamburger menu:
   - `<= md`: show hamburger icon (left), logo (center), cart icon (right).
   - Tap hamburger → full-screen overlay slides in from left.
   - Overlay: logo top, close (✕) top-right, nav links as large DM Serif Display text (one per row, bottom-bordered), secondary actions (Search, Wishlist, Account) in small caps below.
   - Overlay backdrop is `bg-background`.

### 3.2 ProductCard

**Location:** `features/products/components/ProductCard.tsx` (new shared component)

**Props:**
```typescript
type ProductCardProps = {
  id: string;
  name: string;
  slug: string;
  imageUrl: string;
  price: string;           // serialized Decimal
  discount: string;        // serialized Decimal
  priceAfterDiscount: string;
  status: ProductStatus;
  inWishlist?: boolean;
};
```

**States:**

| State | Image | Button | Name/Price |
|-------|-------|--------|-----------|
| Default | Normal | "Add to Cart" — dark bg | Normal color |
| Hover | Scale 105% + subtle overlay | Button bg → gold | — |
| Sold out | Dimmed (white/40% overlay) | "Sold Out" — muted, disabled | Muted color |
| Loading | Warm gradient skeleton | Skeleton | Skeleton |

**Layout:**
- `aspect-ratio: 3/4` image container, `overflow-hidden`.
- Wishlist heart icon — top-right, white square background, always visible.
- Badge — top-left, gold background, white text, `8px` caps label. "Sale" if `discount > 0`; "New" if `createdAt` is within the last 14 days. "Sale" takes priority over "New" when both conditions are true.
- Product name — `font-sans text-sm font-medium tracking-wide`.
- Price row — current price + optional struck-through original price.
- "Add to Cart" button — full width, `text-[0.6875rem] tracking-[0.15em] uppercase`.
- Clicking image or name → navigates to `/products/[slug]`.
- "Add to Cart" button → calls cart server action; does not navigate.

**Usage:** Import and use in `HomeFeature` (FeaturedProducts), `ProductsFeature` (grid), `CategoryFeature`, `SearchFeature`, `WishlistFeature`.

### 3.3 CartDrawer

**Location:** `features/cart/components/CartDrawer.tsx` (new)

Rendered inside `app/(storefront)/layout.tsx` so it is available on every page.

**Prerequisite:** `bunx shadcn@latest add sheet` — `sheet.tsx` is not yet in `components/ui/`.

**Structure:**
- Right-side sheet (`<Sheet>` from shadcn, positioned `right`).
- Header: "Your Bag (N)" in DM Serif Display + close button.
- Line items: thumbnail (64×80) + name/variant + quantity stepper (−/qty/+) + price. Each item has a remove link.
- Footer: Subtotal row → shipping note → "Checkout" (dark, full-width) → "View Cart" (outline, full-width).
- Empty state: centered message "Your bag is empty" + "Start Shopping" CTA.

**State management:** Cart state lives server-side. The drawer re-fetches via a Server Action on open, or receives optimistic updates after add/remove.

### 3.4 SectionHeader

**Location:** `features/home/components/SectionHeader.tsx` (extract, then import elsewhere)

```typescript
type SectionHeaderProps = {
  title: string;
  href?: string;       // if provided, shows "View All" link
  linkLabel?: string;  // defaults to "View All"
  as?: "h2" | "h3";   // defaults to "h2"
};
```

**Layout:** `flex items-baseline justify-between`. Title in DM Serif Display. "View All" link in `text-[0.625rem] tracking-[0.2em] uppercase text-muted-foreground hover:text-foreground border-b border-current`.

### 3.5 StorefrontFooter

Largely correct as-is. **One change:** remove the raw `border-foreground` on the newsletter input — replace with `border-border` to use the warm token.

---

## 4. Page Layouts

### 4.1 Home `/`

**Components:** `HeroBanner` · `CategoryGrid` · `FeaturedProducts`

**Changes to existing components:**

`HeroBanner`:
- Replace the right accent panel's hardcoded `bg-[oklch(0.944_0.006_85)]` with `bg-muted`.
- Replace the large decorative `S` color hardcode with `text-muted-foreground/30`.
- Replace `bg-accent` / `text-accent` with `bg-gold` / `text-gold` where applicable.

`CategoryGrid`:
- Remove the `SHADES` array of raw OKLCH values; replace with `bg-muted` for all tiles (subtle warm cream). Category images provide the visual differentiation.
- Remove the large `08` number overlay (decorative clutter). Keep the bottom gold bar hover animation.
- Replace `text-accent` with `text-gold`.

`FeaturedProducts`:
- Replace the inline product card JSX with the new shared `<ProductCard>` component.

### 4.2 Product Catalog `/products` · `/categories/[slug]` · `/search`

**Layout:** Single-column. Filter bar at top, sticky on scroll. Grid below. Pagination below grid.

**Header area:**
- Breadcrumb in `text-xs text-muted-foreground` (e.g. Home → Dresses).
- Page title as H2 (DM Serif Display).
- Product count in `text-sm text-muted-foreground`.

**Filter bar** (sticky, `border-b border-border bg-background/95 backdrop-blur`):
- Left: pill/chip filters for sizes (XS/S/M/L/XL), colors (color swatches), price range.
- Active filter chips: `border-foreground text-foreground bg-[oklch(0.96_0.008_85)]`.
- Right: Sort dropdown using shadcn `<Select>`.
- Mobile: Collapses to a "Filters" button that opens a shadcn `<Sheet>` from the bottom with all filter controls stacked. Requires `sheet.tsx` (same install as CartDrawer — `bunx shadcn@latest add sheet`).

**Product grid:** `ProductCard` components, `grid-cols-2 md:grid-cols-3 lg:grid-cols-4`.

**Empty state:** Centered message (DM Serif Display) + "Clear Filters" CTA if filters are active, "Browse All Products" if search returned nothing.

**Pagination:** Page number buttons with current page in dark fill. Previous/Next arrows.

### 4.3 Product Detail `/products/[slug]`

**Desktop layout:** 2-column, `lg:grid-cols-[1fr_1fr]`, max-w-7xl.

**Left — Image gallery:**
- Vertical thumbnail strip (4 thumbnails, 3:4 aspect, `border border-transparent` → `border-foreground` on active).
- Main image takes remaining width, 4:5 aspect, `object-cover`, `overflow-hidden`.
- Hover on thumbnail → swaps main image (client component).
- Mobile: full-width swipeable image carousel (no thumbnails — stack vertically or use dots indicator).

**Right — Product info:**
- Category name as `text-gold` label above H1.
- Product name as H1 (DM Serif Display, `text-3xl`).
- Price row: current price + original (struck through) + discount badge (gold bg, white text, e.g. "25% Off").
- Color selector: labeled "Color: [Name]", swatch circles (filled for color, outlined border), selected swatch gets `ring-1 ring-offset-1 ring-foreground`.
- Size selector: chip grid (XS/S/M/L/XL). Unavailable sizes struck through, muted, cursor-not-allowed.
- Size guide link (text link, small caps).
- "Add to Cart" button — full width, dark, `py-3.5 text-[0.6875rem] tracking-[0.2em] uppercase`.
- "Save to Wishlist" — outline button, full width, heart icon + text.
- Accordion sections (shadcn `<Accordion>`): Description · Care & Materials · Delivery & Returns. Each expands inline.
- Mobile: sticky bottom bar with price + "Add to Cart" when info panel scrolls out of view.

### 4.4 Cart `/cart`

**Layout:** `lg:grid-cols-[1fr_auto]` — line items left (flex), order summary right (fixed 320px).

**Line items:**
- Each row: thumbnail (80×100) · name + variant · quantity stepper · unit price · remove link.
- Quantity stepper: `−` / count / `+` with immediate optimistic update.
- Remove: text link `text-muted-foreground hover:text-destructive`.

**Order summary (sticky):**
- "Order Summary" label (small caps).
- Subtotal, shipping ("Calculated at checkout"), divider, Total.
- Coupon code input + "Apply" button (inline, borderless input + dark button).
- "Proceed to Checkout" — full-width dark button.

**Empty state:** "Your bag is empty" (DM Serif Display) + "Start Shopping" CTA.

### 4.5 Checkout `/checkout`

**Layout:** `lg:grid-cols-[3fr_2fr]` — form left, summary right.

**Step indicator:** 3 steps — Contact → Shipping → Payment. Active step in `text-gold`, inactive in `text-muted-foreground`. Connected by a thin `border-border` line.

**Step 1 — Contact:** First name, last name, email, phone. Guest flow shows "Already have an account? Sign in" below CTA. Registered users skip this step (pre-filled).

**Step 2 — Shipping:** Address form (line 1, line 2, city, governorate, postal code). Saved addresses shown as selectable cards for registered users. Delivery method selector (Standard / Express).

**Step 3 — Payment:** Method toggle: Cash on Delivery vs Card. Card option embeds Stripe Elements. Cash shows confirmation note. "Place Order" CTA.

**Order summary (sticky right):** Thumbnail strip of items, subtotal, shipping, total. Collapses to a togglable accordion on mobile.

### 4.6 Account `/account/*`

**Shared layout:** `app/(storefront)/account/` sub-layout with sidebar.

**Sidebar** (240px, `border-r border-border`):
- "My Account" heading (DM Serif Display, `text-xl`).
- Nav links: Overview · Orders · Addresses · Wishlist · (divider) · Sign Out.
- Active link: left gold border `border-l-2 border-gold text-gold pl-2`, others `text-muted-foreground pl-2`.
- Mobile: horizontal scrollable tabs above content.

**Account Overview `/account`:**
- Welcome heading with first name (DM Serif Display).
- Stats row: 3 bordered tiles — Orders count, Wishlist count, Addresses count (DM Serif Display number + small caps label).
- Most recent order card: order ID, date, amount, status badge.

**Orders `/account/orders`:**
- Table with columns: Order #, Date, Items, Total, Status.
- Status badges: `PROCESSING` → gold bg/text · `DELIVERED` → green · `CANCELLED` → red · `PENDING` → muted.
- Row is clickable → `/account/orders/[id]`.

**Order Detail `/account/orders/[id]`:**
- Order number as H2, date + status badge.
- Vertical status timeline (Ordered → Processing → Shipped → Delivered).
- Product list (thumbnail + name + variant + qty + price).
- Totals summary.

**Addresses `/account/addresses`:**
- Card grid (`grid-cols-1 md:grid-cols-2`). Each card: full address, "Default" badge if applicable, Edit / Delete links.
- "Add New Address" card with dashed border + plus icon.

**Wishlist `/account/wishlist`:**
- Same `ProductCard` grid as catalog (`grid-cols-2 lg:grid-cols-4`).
- Each card's wishlist heart is filled (already saved). Clicking removes from wishlist.

### 4.7 Checkout Success `/checkout/success`

**Layout:** Centered, max-w-md. Uses a separate minimal layout (`app/(storefront)/checkout/success/layout.tsx`) that renders only the logo — not the full `StorefrontNav` with all navigation links, which would be distracting post-purchase.

- Large gold checkmark icon at top.
- "Thank You" heading (DM Serif Display, `text-4xl`).
- Order number in small caps.
- Confirmation message + email sent note.
- Order items summary (collapsed, togglable).
- Two CTAs: "Track Order" (outline) · "Continue Shopping" (dark).

---

## 5. Interaction Patterns

| Pattern | Spec |
|---------|------|
| Image hover zoom | `group-hover:scale-105 transition-transform duration-700` |
| Button hover (primary) | `hover:bg-gold transition-colors duration-300` |
| Gold bar underline reveal | `w-0 group-hover:w-full transition-all duration-500 ease-out` (absolute, bottom-0, h-[2px], bg-gold) |
| Cart badge | `bg-gold text-gold-foreground` circle, absolute top-right on bag icon |
| Skeleton loading | Warm gradient shimmer: `bg-gradient-to-r from-muted via-[oklch(0.96_0.008_85)] to-muted` |
| Page entry animation | `fadeUp` (already defined in storefront.css): opacity 0→1, translateY 20px→0, 0.7s ease, staggered delays |
| Scroll-triggered nav | scrollY > 8px → `bg-background border-b border-border` |

---

## 6. Responsive Breakpoints

| Breakpoint | Tailwind | Key layout changes |
|-----------|----------|--------------------|
| Mobile | `< sm` (640px) | Single column, mobile nav, bottom sheet filters, sticky cart CTA on PDP |
| Tablet | `sm–lg` (640–1024px) | 3-col product grid, side-by-side cart, account tabs |
| Desktop | `> lg` (1024px+) | 4-col product grid, full sidebar, 2-col PDP/cart/checkout |

---

## 7. Migration Summary

| Change | Affected files |
|--------|---------------|
| Add `--gold` / `--gold-foreground` tokens | `app/globals.css` |
| Add `--color-gold` to `@theme inline` | `app/globals.css` |
| Replace `text-accent` / `bg-accent` / `hover:text-accent` with gold equivalents | All storefront components |
| Replace hardcoded OKLCH values in JSX with semantic tokens | `HeroBanner.tsx`, `CategoryGrid.tsx` |
| Extract `SectionHeader` component | `features/home/components/SectionHeader.tsx` |
| Create shared `ProductCard` component | `features/products/components/ProductCard.tsx` |
| Update `FeaturedProducts` to use `ProductCard` | `features/home/components/FeaturedProducts.tsx` |
| Add cart badge + announcement bar + mobile nav to `StorefrontNav` | `app/(storefront)/_components/nav.tsx` |
| Create `CartDrawer` + render in layout | `features/cart/components/CartDrawer.tsx`, `app/(storefront)/layout.tsx` |
| Build `ProductsFeature` | `features/products/` (currently a stub) |
| Build `ProductDetailFeature` | `features/product-detail/` (currently a stub) |
| Build `CartFeature` | `features/cart/` (currently a stub) |
| Build `CheckoutFeature` | `features/checkout/` (currently a stub) |
| Build `AccountOverviewFeature` | `features/account/` (currently a stub) |
| Build `OrdersFeature` + `OrderDetailFeature` | `features/orders/`, `features/order-detail/` |
| Build `AddressesFeature` | `features/addresses/` |
| Build `WishlistFeature` | `features/wishlist/` |
| Build `SearchFeature` | `features/search/` |
| Build `CheckoutSuccessFeature` | `features/checkout-success/` |
| Create account sub-layout with sidebar | `app/(storefront)/account/layout.tsx` |
| Create checkout success minimal layout | `app/(storefront)/checkout/success/layout.tsx` |
| Install `sheet` shadcn component | `bunx shadcn@latest add sheet` |

---

## 8. Out of Scope

- Product reviews / ratings UI (Phase 5 feature per spec)
- Analytics / banners (Phase 5)
- React Native mobile app (Phase 6)
- Admin dashboard UI (separate design system)
- Newsletter server action wiring (noted as TODO in footer, stays as TODO)
