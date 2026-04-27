# Storefront — Checkout

## Overview

Checkout flow for both **registered** and **anonymous** users. CASH and CARD payment methods.

For the standalone deep-dive on the guest flow see `08-anonymous-checkout.md`. This doc covers the full checkout feature (registered + anonymous together).

## Routes

| Route                | Feature                  | Access      |
| -------------------- | ------------------------ | ----------- |
| `/checkout`          | `CheckoutFeature`        | Public + anon |
| `/checkout/success`  | `CheckoutSuccessFeature` | Public       |

## Feature path

`features/checkout/`

```
features/checkout/
├── components/
│   ├── CheckoutForm.tsx
│   ├── AnonContactForm.tsx
│   ├── ShippingForm.tsx
│   ├── PaymentForm.tsx
│   └── OrderSummary.tsx
├── actions/
│   └── checkout.actions.ts       # createOrder, createPaymentIntent
├── services/
│   └── checkout.service.ts
└── index.tsx
```

## Data

`CheckoutFeature` (Server Component) on load:

- Read the cart (userId or sessionToken). If empty → redirect `/cart`.
- If registered: fetch saved addresses (default first) for shipping selection.
- If the checkout form carries a coupon code from the cart UI, re-validate it and compute current totals (subtotal, shipping fees, coupon discount, grand total). Coupon state is not read from the `Cart` row.

## UI

The checkout is one page divided into sections:

1. **Contact** (anonymous only) — `AnonContactForm`: name, email, phone.
2. **Shipping** — `ShippingForm`:
   - Registered: pick a saved address or enter a new one (with checkbox "Save to address book").
   - Anonymous: form fields for country, governorate, city, area, address line, details, postal code, phone.
3. **Payment** — `PaymentForm`: choose CASH or CARD. If CARD, render Stripe Elements.
4. **Order summary** — `OrderSummary`: line items, subtotal, shipping fees, coupon discount, grand total. "Place order" CTA at the bottom.

## Mutations

### CARD flow

```
1. POST /checkout (Server Action)
   → Create Order (status: PENDING, isPaid: false, paymentMethod: CARD)
   → stripe.paymentIntents.create({ amount, currency, metadata: { orderId } })
   → Save Order.stripePaymentIntentId
   → Return { orderId, clientSecret }

2. Client: Stripe.js Elements confirms payment using clientSecret

3. Stripe webhook: payment_intent.succeeded
   → Verify Stripe-Signature header
   → Find Order by stripePaymentIntentId
   → Order.isPaid = true, Order.paidAt = now, Order.status = PROCESSING
   → Send order confirmation email via Resend

4. Client → redirected to /checkout/success?orderId=...
```

### CASH flow

```
1. POST /checkout
   → Create Order (status: PENDING, isPaid: false, paymentMethod: CASH)
   → Send confirmation email immediately (registered → user.email; anon → anonEmail)
   → Return { orderId }

2. Redirect to /checkout/success

3. Admin marks isPaid = true manually when cash is collected on delivery
```

See `integrations/02-stripe-payments.md` for the full Stripe section, including refund handling and webhook events.

## Order shape after creation

| Field                  | Registered     | Anonymous           |
| ---------------------- | -------------- | ------------------- |
| `userId`               | Clerk userId   | `null`              |
| `shippingAddressId`    | Address.id     | `null`              |
| `anonName/Phone/Email` | `null`         | from contact form   |
| `anonCountry/...`      | `null`         | from shipping form  |
| `guestToken`           | `null`         | `crypto.randomUUID()` |
| `guestTokenExpiresAt`  | `null`         | now + 7 days        |
| `humanOrderId`         | `ORD-000001`   | `ORD-000001`        |

Both flows snapshot prices into `OrderItem.price`.

## /checkout/success

`CheckoutSuccessFeature` reads `?orderId=` from the URL and renders:

- `humanOrderId`, status, payment method.
- Line items, totals.
- Estimated delivery / next steps.
- Anonymous: prominent "Create an account to track this order" CTA pointing to the claim link.

## Edge cases

- Empty cart → redirect `/cart`.
- Coupon expired between cart and checkout → drop the discount, recompute, show notice.
- Stock dropped below cart quantity → block checkout, send user back to cart with a notice.
- CARD: PaymentIntent succeeds but webhook is delayed → success page can show "Processing" state until webhook flips `isPaid = true`. Use a brief client poll, or render based on Stripe's client-side confirmation result.
- CARD: payment fails → keep order in PENDING with `isPaid = false`, surface error, allow retry.

## Acceptance criteria

- [ ] Registered users can complete checkout with a saved address.
- [ ] Anonymous users can complete checkout with only a name, email, phone, shipping address.
- [ ] CARD payment flow uses Payment Intents end-to-end.
- [ ] CASH payment creates an order in PENDING with `isPaid = false`.
- [ ] Confirmation email is sent on both flows (CARD on webhook, CASH immediately).
- [ ] `humanOrderId` follows `ORD-000001` format and is unique.
- [ ] Anonymous orders carry `guestToken` and `guestTokenExpiresAt`.
- [ ] Price snapshots are correctly captured in `OrderItem.price`.
