# Storefront Theming Design

**Date:** 2026-04-12
**Status:** Approved
**Scope:** Storefront layout only — admin dashboard remains on default shadcn/ui tokens.

---

## Overview

SG Couture's storefront adopts a **minimalist luxury** aesthetic — stark white space, editorial typography, warm champagne gold accent, and zero-radius architectural components. The admin dashboard is intentionally untouched and stays on shadcn defaults.

---

## Approach: `[data-theme="storefront"]` Scoping

A single `globals.css` file. The storefront layout wraps all its output in `<div data-theme="storefront">`. A `[data-theme="storefront"]` CSS block overrides shadcn's semantic tokens with the couture palette. No separate CSS files, no token drift, no bleed into the admin.

---

## 1. Color Tokens

Defined in `globals.css` under `[data-theme="storefront"]`:

| Token                | Value       | Usage                                      |
|----------------------|-------------|--------------------------------------------|
| `--background`       | `#FAFAF8`   | Warm off-white page background             |
| `--foreground`       | `#1A1A1A`   | Near-black body text                       |
| `--card`             | `#FFFFFF`   | Product cards, modals                      |
| `--muted`            | `#F0EDE8`   | Section backgrounds, input fills           |
| `--muted-foreground` | `#8A8480`   | Captions, placeholders, secondary text     |
| `--border`           | `#E8E4DE`   | Warm barely-there dividers                 |
| `--input`            | `#E8E4DE`   | Input border color                         |
| `--primary`          | `#1A1A1A`   | Primary CTA (black button)                 |
| `--primary-foreground` | `#FAFAF8` | Text on primary buttons                    |
| `--accent`           | `#C9A96E`   | Champagne gold — used sparingly            |
| `--accent-foreground`| `#FFFFFF`   | Text on gold accent elements               |
| `--ring`             | `#C9A96E`   | Focus rings                                |
| `--radius`           | `0px`       | Sharp corners throughout — no rounding     |

**Light mode only.** No dark mode for the storefront.

---

## 2. Typography

Two Google Fonts via `next/font/google`:

- **DM Serif Display** — headings, product names, prices, section titles
- **DM Sans** — body text, nav links, buttons, captions, form labels

### Token Mapping

```css
--font-sans:    DM Sans variable font
--font-heading: DM Serif Display variable font
```

### Usage Conventions

| Context             | Class                                              |
|---------------------|----------------------------------------------------|
| h1–h3               | `font-heading` (applied via `@layer base` scoped to `[data-theme="storefront"]`) |
| Nav links           | `font-sans text-xs tracking-[0.15em] uppercase`    |
| Body copy           | `font-sans text-sm leading-relaxed`                |
| Prices              | `font-heading text-sm text-muted-foreground`       |
| Button labels       | `font-sans text-xs tracking-widest uppercase`      |
| Logo                | `font-heading text-xl tracking-[0.2em] uppercase`  |

---

## 3. Layout

### Storefront Root

```tsx
<div data-theme="storefront" className="min-h-screen flex flex-col">
  <header />
  <main className="flex-1" />
  <footer />
</div>
```

### Page Container

All storefront pages use: `max-w-7xl mx-auto px-4 sm:px-8`

### Navigation

Centered-logo layout with flanking link groups:

```
[ Shop  Collections  New In ]  [ SG COUTURE ]  [ Search  Wishlist  Cart  Account ]
```

- Full-width, `py-6 px-8`
- `border-b border-border` bottom rule
- Transparent bg with `backdrop-blur-sm`; transitions to `bg-background` on scroll via a `"use client"` component that toggles a CSS class on `window` scroll event
- Right group uses Lucide icons (no text labels on desktop) for Search, Wishlist, Cart, Account

### Footer

4-column grid on desktop, stacked on mobile:
1. Brand statement + tagline
2. Shop links
3. Account links
4. Newsletter email signup

- `bg-muted py-16`
- Bottom bar: copyright + social icons, separated by `border-t border-border`

---

## 4. Component Styles

All overrides live within `[data-theme="storefront"]` in `globals.css` or as Tailwind utility compositions in components.

### Buttons

| Variant   | Style                                                                                  |
|-----------|----------------------------------------------------------------------------------------|
| Primary   | `bg-primary text-primary-foreground tracking-widest uppercase text-xs py-3 px-8`      |
| Hover     | `hover:bg-accent hover:text-accent-foreground transition-colors duration-300`          |
| Secondary | Transparent, `border border-foreground`, same type treatment                           |
| Ghost     | No border, muted text, underline on hover                                              |

### Inputs & Forms

- No radius (`--radius: 0px` inherited)
- Bottom-border-only underline style for checkout/account forms: `border-b border-border bg-transparent rounded-none` — no full border box
- Focus: `ring-accent` gold ring
- Fill: `bg-muted` on focus

### Product Cards

- No shadow — flat, image-forward
- Image: square `aspect-square overflow-hidden`
- Hover: `scale-105 transition-transform duration-500 ease-out` on the image
- Wishlist heart icon: invisible at rest, fades in on card hover (`opacity-0 group-hover:opacity-100 transition-opacity`)
- Name: `font-heading text-base`
- Price: `font-heading text-sm text-muted-foreground`

### Badges

- No radius
- Typography: `text-[10px] tracking-widest uppercase`
- Sale: `bg-destructive text-white`
- New: `bg-foreground text-background`

---

## 5. What Stays Unchanged

- `app/admin/**` — all admin pages use default shadcn tokens, no `data-theme` attribute
- `components/ui/**` — shadcn primitives are not modified; storefront overrides their CSS variables via `[data-theme="storefront"]` scoping
- Dark mode tokens in `.dark` — preserved for admin use

---

## Implementation Notes

- Fonts loaded in `app/layout.tsx` (root layout) and CSS variables set on `<html>` so both storefront and admin can reference them
- Scroll-transparent nav requires a `"use client"` wrapper component — keep it minimal (just adds/removes a class on scroll)
- The `@layer base` scoped heading rule: `[data-theme="storefront"] h1, h2, h3 { font-family: var(--font-heading); }`
