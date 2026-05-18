# Product Detail Screen — Review & Evaluation

## What's Working Well

**Layout & structure** — Clean two-column grid (image left, info right) on desktop, stacking to single column on mobile. `lg:sticky` on the info panel is a good touch for tall galleries.

**Image gallery** (`features/product-detail/components/image-gallery.tsx`) — Solid: vertical thumbnail strip on desktop, swipe arrows + dot indicators on mobile, proper `Image` `sizes` hints, `priority` on the active image.

**ProductInfo panel** (`features/product-detail/components/product-info.tsx`) — Feature-complete:
- Color swatches rendered as CSS-colored circles with ring selection state
- Size selector with client-side validation (blocks form submit if no size selected)
- Quantity stepper bounded to stock
- Sticky bottom bar on mobile (IntersectionObserver-driven)
- Wishlist with `useOptimistic` for instant feedback
- Stars rating row with half-star support and ARIA label

**Data layer** — `getProductDetail` uses `cache()`, fetches wishlist status in a single query via relation filter (no N+1). Decimal serialization is handled correctly in the page.

**Actions** — `addToCartAction` handles both authenticated and anonymous (session-cookie) carts. `toggleWishlistAction` correctly redirects unauthenticated users with a message.

**Related products** — Two-pass strategy (subcategory → category fallback) is correct. Mobile horizontal scroll with `snap-mandatory`.

---

## Issues & Gaps

### High

**1. Wishlist error silently dropped** (`product-info.tsx:350–360`)
`toggleWishlistAction` returns `toActionState("ERROR", "Sign in to save…")` for unauthenticated users, but there is no `useActionFeedback` wired up for `wishlistState` in `ProductInfo`. The error is never surfaced — the user gets no feedback.

### Medium

**2. Size error rendered out of place** (`product-info.tsx:343–347`)
The `sizeError` message appears below the wishlist button, visually disconnected from the size selector. It should be positioned immediately below the size grid.

**3. Color swatches assume a valid CSS color value** (`product-info.tsx:244`)
`style={{ backgroundColor: color }}` works for hex/named colors but renders as blank or white for labels like `"Ivory"` or `"Blush Rose"`. There is no text fallback when the swatch color cannot be resolved.

**4. Missing `loading.tsx` for the product detail route**
`app/(storefront)/products/[slug]/` has no `loading.tsx`. Navigating to a product page shows a blank screen during the server fetch. A skeleton should be added.

### Low

**5. "Care & Materials" content is hardcoded** (`product-info.tsx:379–381`)
The care instructions are a static placeholder, not pulled from the product model. Either a `careInstructions` field should be added to the `Product` schema, or the accordion item should be hidden until real content is available.

**6. "Size Guide" button is a no-op** (`product-info.tsx:261–265`)
Renders a `<button>` that does nothing. Should open a modal/sheet or be removed until the feature is built.

**7. ~~Related products fires 3 sequential DB queries~~** (`services/get-related-products.ts`) ✅ Fixed
~~The service runs: fetch current product → fetch by subcategory → fetch by category. The last two are sequential even when they could be parallelised with `Promise.all` when the subcategory result comes back short of the limit.~~

---

## Priority Summary

| # | Issue | Severity |
|---|-------|----------|
| 1 | Wishlist error silently dropped | High |
| 2 | Size error position | Medium |
| 3 | Color swatch label fallback | Medium |
| 4 | Missing loading.tsx | Medium |
| 5 | Hardcoded care content | Low |
| 6 | Size guide no-op | Low |
| 7 | ~~Related products query efficiency~~ ✅ | Low |
