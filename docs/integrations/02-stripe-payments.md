# Integration — Stripe (Payments)

**Pattern:** Payment Intents + Webhooks. The webhook is the source of truth for payment state — never trust the client.

## CARD flow (Payment Intents)

```
1. POST /checkout (Server Action or API route)
   → Create Order row (status: PENDING, isPaid: false)
   → stripe.paymentIntents.create({ amount, currency, metadata: { orderId } })
   → Return { orderId, clientSecret }

2. Client: Stripe.js Elements confirms payment using clientSecret

3. POST /api/webhooks/stripe  (event: payment_intent.succeeded)
   → Verify Stripe-Signature header
   → Find Order by stripePaymentIntentId
   → Order.isPaid = true, Order.paidAt = now, Order.status = PROCESSING
   → Send order confirmation email via Resend

4. Client → redirected to /checkout/success?orderId=...
```

## CASH flow

```
1. POST /checkout
   → Create Order (status: PENDING, isPaid: false, paymentMethod: CASH)
   → Send confirmation email immediately
   → Return { orderId }

2. Redirect to /checkout/success

3. Admin marks isPaid = true manually when cash is collected on delivery
```

CASH never touches Stripe. `Order.stripePaymentIntentId` stays `null`.

## Refund flow

```
Admin clicks Refund in order detail
→ Server Action: stripe.refunds.create({ payment_intent: order.stripePaymentIntentId })
→ On success:
   → Order.status = REFUNDED
   → Order.isPaid = false
   → In-app notification sent to customer (registered)
   → Refund email sent (RefundProcessed template)
```

Refund is only available on orders where `paymentMethod = CARD`, `isPaid = true`, and `status` is not already `REFUNDED`.

## Webhook events

**Endpoint:** `POST /api/webhooks/stripe`
**Verification:** verify the `Stripe-Signature` header against `STRIPE_WEBHOOK_SECRET`.

| Event                           | Action                                              |
| ------------------------------- | --------------------------------------------------- |
| `payment_intent.succeeded`      | Mark order paid, set status PROCESSING, send email  |
| `payment_intent.payment_failed` | Set status back to PENDING, notify customer         |
| `charge.dispute.created`        | Flag order for admin review via in-app notification |

### Webhook idempotency

Webhooks may be delivered more than once. Use idempotency:

- Look up the order by `stripePaymentIntentId`.
- If `isPaid` is already `true` and the event is `payment_intent.succeeded`, return `200 OK` without re-doing side effects (don't re-send email, don't re-emit notifications).

## Webhook implementation skeleton

```typescript
// app/api/webhooks/stripe/route.ts
import { headers } from "next/headers";
import Stripe from "stripe";
import { stripe } from "@/lib/stripe";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  const body = await req.text();
  const sig = (await headers()).get("stripe-signature")!;

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(
      body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET!,
    );
  } catch {
    return new Response("Invalid signature", { status: 400 });
  }

  switch (event.type) {
    case "payment_intent.succeeded": {
      const pi = event.data.object;
      const order = await prisma.order.findUnique({
        where: { stripePaymentIntentId: pi.id },
      });
      if (!order || order.isPaid) return new Response("OK", { status: 200 });

      // mark paid, send email — see service layer
      // ...
      break;
    }
    // payment_intent.payment_failed, charge.dispute.created — handled similarly
  }

  return new Response("OK", { status: 200 });
}
```

## Stripe client

```typescript
// lib/stripe.ts
import Stripe from "stripe";

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2024-04-10", // pin to a version
});
```

## Currency & amounts

- Stripe expects amounts in the **smallest currency unit** (cents for USD, piastres for EGP).
- Convert from `Decimal` (Prisma) to integer cents before calling `paymentIntents.create`.
- Round consistently — `Math.round(value * 100)` after the price is finalized.

## Local webhook testing

```bash
stripe listen --forward-to localhost:3000/api/webhooks/stripe
```

The CLI prints a webhook secret — paste it into `STRIPE_WEBHOOK_SECRET` in `.env.local`.

## Acceptance criteria

- [ ] CARD flow creates a PaymentIntent and stores `stripePaymentIntentId` on the Order.
- [ ] Webhook verifies the signature and rejects invalid signatures.
- [ ] `payment_intent.succeeded` flips `isPaid`, sets `paidAt`, transitions to PROCESSING.
- [ ] Webhook handlers are idempotent (safe on duplicate delivery).
- [ ] Refund updates the order to REFUNDED and sends the refund email.
- [ ] CASH orders never call Stripe.
- [ ] Amount conversion to smallest currency unit is correct and consistent.
