# Phase 2 — Commerce Core

## Goal

Make the store **buyable**. Cart (registered + anonymous), checkout (CASH + CARD), Stripe Payment Intents, transactional emails, and the guest claim flow.

## Dependencies

- Phase 1 complete.
- Stripe account with API keys.
- Resend account with verified sending domain.

## Deliverables

- Cart system (anonymous via cookie, registered via DB) with drawer + full page.
- Anonymous-to-registered cart merge on sign-in.
- Checkout flow for both registered and anonymous users.
- Stripe Payment Intents + webhook + refund flow.
- Guest order claiming via signed token.
- Transactional emails for order events.
- API route handlers for every web feature shipped here.

## Linked docs

- `architecture/06-api-design.md`
- `architecture/08-conventions.md`
- `storefront/04-cart.md`
- `storefront/05-checkout.md`
- `storefront/08-anonymous-checkout.md`
- `integrations/02-stripe-payments.md`
- `integrations/04-resend-email.md`

## Tasks

### 1. Cart

- [ ] `features/cart/services/cart.service.ts` with:
  - `getCart(userId, sessionToken)` — returns cart with items + product info.
  - `addToCart(userId, sessionToken, input)` — upsert cart, merge same productId+color+size.
  - `updateCartItemQuantity(userId, sessionToken, itemId, quantity)` — clamp to stock; remove on 0.
  - `removeCartItem(userId, sessionToken, itemId)`.
  - `applyCoupon(cartId, code)` — validate active, not expired, within usage limit; return the cart payload with computed `discountApplied` and `totalPriceAfterDiscount` for the UI without updating the `Cart` row.
  - `recomputeCartTotals(cartId)` — call after every mutation.
- [ ] Server Actions in `features/cart/actions/` (one file per action). Each calls the matching service function.
- [ ] Cart cookie helpers in `lib/cart-session.ts` — get/set/clear `sessionToken` cookie (httpOnly, 7-day expiry).
- [ ] `features/cart/components/CartDrawer.tsx` — slide-in panel, mounted in storefront layout.
- [ ] `features/cart/index.tsx` — full cart page at `/cart`.
- [ ] Wire "Add to cart" on `ProductCard` and `ProductDetailFeature`.

### 2. Cart merge on sign-in

- [ ] Implement merge logic in `cart.service.ts`: `mergeAnonymousCart(userId, sessionToken)`.
- [ ] Trigger from `proxy.ts` (or a top-level Server Component on `/`) when a signed-in user has the `sessionToken` cookie.
- [ ] After merge: delete session cart, recompute totals, clear cookie.

### 3. Checkout

- [ ] `features/checkout/services/checkout.service.ts`:
  - `createOrderFromCart(userId | null, sessionToken | null, input)` — generates `humanOrderId`, snapshots prices, validates stock, creates Order + OrderItems. If checkout input includes a coupon code, re-validate it and store `Order.couponId` / `Order.discountApplied`.
  - `incrementCouponUsage(couponId)` after successful order creation.
- [ ] Server Action: `features/checkout/actions/createOrder.ts` — for both CASH and CARD. CARD path also creates the PaymentIntent and returns `clientSecret`.
- [ ] `features/checkout/index.tsx` — multi-step form: contact (anon only) → shipping → payment → review.
- [ ] `app/(storefront)/checkout/success/page.tsx` → `CheckoutSuccessFeature`.
- [ ] On checkout success: redirect to `/checkout/success?orderId=...`.

### 4. Stripe integration

- [ ] Add `stripe` and `@stripe/stripe-js`, `@stripe/react-stripe-js`.
- [ ] `lib/stripe.ts` Stripe server client.
- [ ] `PaymentForm` client component using Stripe Elements with the `clientSecret`.
- [ ] `app/api/webhooks/stripe/route.ts`:
  - Verify `Stripe-Signature` header.
  - Handle `payment_intent.succeeded` → flip `isPaid`, set `paidAt`, transition to PROCESSING, send confirmation email.
  - Handle `payment_intent.payment_failed` → keep PENDING, surface to client.
  - Handle `charge.dispute.created` → flag for admin review (in-app notification).
  - Idempotent: skip side effects if already processed.
- [ ] Configure local webhook tunneling: `stripe listen --forward-to localhost:3000/api/webhooks/stripe`.
- [ ] Register production webhook URL in Stripe Dashboard.

### 5. Refund flow

- [ ] Service: `refundOrder(orderId, reason)` — calls `stripe.refunds.create`, transitions status to REFUNDED, clears `isPaid`.
- [ ] Server Action: `features/admin/order-detail/actions/refundOrder.ts` (Admin only — full admin UI lands in Phase 4 but the action and service can land here so the order management story is complete).
- [ ] Send `RefundProcessed` email.

### 6. Resend transactional email

- [ ] Add `resend` and `@react-email/components`.
- [ ] `lib/resend.ts` client.
- [ ] React Email templates in `emails/`:
  - `OrderConfirmation`
  - `GuestOrderConfirmation` (with claim link)
  - `OrderCancelled`
  - `RefundProcessed`
  - `Welcome`
- [ ] Welcome email send from the `user.created` Clerk webhook (added in Phase 1; wire up here).
- [ ] All sends wrapped in try/catch — never block the primary mutation.

### 7. Guest order claim

- [ ] Generate `guestToken = crypto.randomUUID()` and `guestTokenExpiresAt = now + 7 days` for anonymous orders.
- [ ] Page: `app/(storefront)/orders/claim/page.tsx` reads `?token=`, validates, redirects to sign-in if needed, then claims:
  - `Order.userId = userId`
  - `Order.claimedByUserId = userId`
  - Optionally clear `Order.guestToken`.
- [ ] Redirect after claim → `/account/orders/[id]` (the page itself lands in Phase 3, but linking is fine).

### 8. API route handlers

- [ ] `/api/cart` — GET current cart, POST add item.
- [ ] `/api/cart/[itemId]` — PATCH update quantity, DELETE remove.
- [ ] `/api/checkout` — POST create order + PaymentIntent.
- [ ] `/api/orders` — POST create order (mirrors the Server Action).
- [ ] All call the same service functions; route handlers are thin auth + Zod + envelope wrappers.

## Acceptance criteria

### Cart

- [ ] Anonymous user can add to cart; `sessionToken` cookie + Cart row are created.
- [ ] Same product + color + size always merges into one line.
- [ ] Quantity stepper, remove, clear all work.
- [ ] Coupon application validates expiry and usage limit.
- [ ] Cart drawer is reachable from every storefront page.
- [ ] Sign-in merges anonymous cart into user cart and clears the cookie.
- [ ] Cart totals are recomputed after every mutation and persisted on the Cart row.

### Checkout — registered

- [ ] Registered user can pick a saved address (or skip — Phase 3 adds the address book; for Phase 2, allow entering a one-off address that gets saved as a new Address record).
- [ ] Both CASH and CARD work end-to-end.
- [ ] CARD: PaymentIntent created → client confirms → webhook flips `isPaid`.
- [ ] CASH: order is created in PENDING with `isPaid = false`; confirmation email sent immediately.

### Checkout — anonymous

- [ ] Guest can complete checkout with only name, email, phone, shipping address.
- [ ] All `anon*` fields populated; `userId` and `shippingAddressId` are null.
- [ ] `guestToken` and `guestTokenExpiresAt` are set.
- [ ] Confirmation email is the `GuestOrderConfirmation` template with a claim link.
- [ ] Claim link works within 7 days; expired link shows a clear page.
- [ ] Successful claim sets `userId` and `claimedByUserId`.

### Stripe & emails

- [ ] Webhook signature verification rejects invalid signatures.
- [ ] Webhook is idempotent on duplicate delivery.
- [ ] Refund flow updates order, sends email, creates notification (registered users).
- [ ] All transactional emails send to the right recipient (user.email or anonEmail).
- [ ] Email failures don't block the primary mutation.

### Code quality

- [ ] Every Server Action has a matching API route handler that calls the same service.
- [ ] No business logic in routes or actions — only validation, auth, envelope.
- [ ] One file per action in `features/*/actions/` for new code.
- [ ] No `useState` for any URL state.

## What is **not** in this phase

- Account area UI (profile, addresses, wishlist) → Phase 3.
- Admin dashboard UI → Phase 4 (although `refundOrder` service lives here for completeness).
- Reviews → Phase 5.
- Mobile app → Phase 6.
