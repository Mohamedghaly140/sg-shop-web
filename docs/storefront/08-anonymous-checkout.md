# Storefront — Anonymous (Guest) Checkout

## Overview

Guest checkout requires only a name, email, phone, and shipping address — **no account needed**. This is a core feature that reduces purchase friction for new visitors.

This doc deep-dives the guest flow. For the regular checkout feature (registered + anon together) see `05-checkout.md`.

## Full flow

```
1. Guest visits site
   └─ No session. sessionToken cookie set on first cart interaction.
   └─ Cart row created in DB keyed by sessionToken.

2. Guest adds items to cart
   └─ CartItems linked to the sessionToken cart row.

3. Guest navigates to /checkout
   └─ No authentication required.

4. Guest fills in:
   ├─ Contact:  name, email, phone
   ├─ Shipping: country, governorate, city, area, address line, details
   ├─ Payment:  CASH or CARD
   └─ Optional: coupon code

5. Order created in DB:
   ├─ Order.userId               = null
   ├─ Order.shippingAddressId    = null
   ├─ Order.anonName/Phone/Email = contact fields
   ├─ Order.anonCountry/City/... = shipping fields
   ├─ Order.guestToken           = crypto.randomUUID()
   └─ Order.guestTokenExpiresAt  = now + 7 days

6. Confirmation email sent to anonEmail:
   ├─ Full order summary
   └─ Claim link: /orders/claim?token=<guestToken>

7. Guest clicks claim link (within 7 days):
   ├─ Prompted to create account or sign in
   └─ On successful auth:
      ├─ Order.userId          = userId
      ├─ Order.claimedByUserId = userId
      └─ Order appears in /account/orders
```

## Cart merge on sign-in

When a guest signs in while they have an active session cart:

1. Read `sessionToken` from cookie.
2. Load the session cart and the user's existing DB cart (if any).
3. For each session cart item: if same `productId + color + size` exists in user cart → sum quantities. Otherwise append as a new item.
4. Delete the session cart row. Recalculate and save user cart totals.
5. Clear the `sessionToken` cookie.

This runs on the next request after sign-in (in the proxy or in a top-level Server Component on `/`).

## Claim link

Route: `/orders/claim?token=<guestToken>`

Flow:

1. Look up the order by `guestToken`. If not found or `guestTokenExpiresAt < now()` → render an "Expired or invalid link" page with a CTA to contact support.
2. If the user is **not** signed in → redirect to `/sign-in?redirect=/orders/claim?token=...`.
3. After sign-in, claim:
   - `Order.userId = signedInUserId`
   - `Order.claimedByUserId = signedInUserId`
   - Optionally clear `Order.guestToken` to prevent reclaiming.
4. Redirect to `/account/orders/[id]` for the now-claimed order.

## Email contents

The guest confirmation email (`GuestOrderConfirmation` React Email template) includes:

- Order summary (line items, totals, payment method).
- Shipping address (echo what they entered).
- Estimated delivery.
- **Prominent claim link** with a clear pitch: "Create an account to track your order, save addresses, and check out faster next time."

See `integrations/04-resend-email.md` for the email-sending pattern.

## Edge cases

- **Guest token expired**: claim attempt renders an expiry page. The order itself is not affected — the guest can still receive shipping updates via email and contact support to claim.
- **Same email already has an account**: claim link still works — when they sign in (rather than sign up), the order is linked to their existing account.
- **Guest tries to claim someone else's token**: tokens are unguessable UUIDs; no extra defense beyond that needed. (Tokens **can** be used by anyone who has the link, by design — this is how email forwarding works.)
- **Multiple anonymous orders, same email**: each has its own `guestToken` and its own claim link. Claiming one doesn't claim the others.

## Acceptance criteria

- [ ] Guest can complete checkout with only name, email, phone, shipping address.
- [ ] No `userId` on guest orders; all `anon*` fields populated.
- [ ] `guestToken` is a UUID, `guestTokenExpiresAt` is now + 7 days.
- [ ] Confirmation email includes a working claim link.
- [ ] Claim link expires after 7 days and shows a clear expiry page.
- [ ] Claim sets `Order.userId` and `Order.claimedByUserId`, then redirects to the order detail page.
- [ ] Sign-in merges anonymous cart into the user cart and clears the cookie.
