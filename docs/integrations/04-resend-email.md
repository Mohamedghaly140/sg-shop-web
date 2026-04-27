# Integration — Resend (Transactional Email)

**Package:** `resend`
**Templates:** React Email components in `emails/`

Resend handles all transactional email. Templates are React components rendered at send time.

## Transactional emails

| Trigger                   | Template                 | Recipient                         |
| ------------------------- | ------------------------ | --------------------------------- |
| Order placed (registered) | `OrderConfirmation`      | User email                        |
| Order placed (anonymous)  | `GuestOrderConfirmation` | `anonEmail` — includes claim link |
| Order shipped             | `OrderShipped`           | User email or `anonEmail`         |
| Order delivered           | `OrderDelivered`         | User email or `anonEmail`         |
| Order cancelled           | `OrderCancelled`         | User email or `anonEmail`         |
| Refund processed          | `RefundProcessed`        | User email or `anonEmail`         |
| New user welcome          | `Welcome`                | New user (triggered by webhook)   |

## Sending pattern

```typescript
// lib/resend.ts
import { Resend } from "resend";
export const resend = new Resend(process.env.RESEND_API_KEY);

// In a service function:
import { resend } from "@/lib/resend";
import { OrderConfirmationEmail } from "@/emails/OrderConfirmation";

await resend.emails.send({
  from: "orders@yourdomain.com",
  to: order.user?.email ?? order.anonEmail!,
  subject: `Order ${order.humanOrderId} confirmed`,
  react: OrderConfirmationEmail({ order }),
});
```

## Recipient resolution

For order-related emails, prefer `order.user?.email` and fall back to `order.anonEmail`. Never send to a hard-coded address. Use:

```typescript
const recipient = order.user?.email ?? order.anonEmail;
if (!recipient) {
  // log and skip — should never happen given Order constraints
  return;
}
```

## Templates

Each template is a React component that takes a typed prop (usually the order with relations already loaded). Live in `emails/`:

```
emails/
├── OrderConfirmation.tsx
├── GuestOrderConfirmation.tsx
├── OrderShipped.tsx
├── OrderDelivered.tsx
├── OrderCancelled.tsx
├── RefundProcessed.tsx
└── Welcome.tsx
```

### `GuestOrderConfirmation` extras

The guest confirmation email includes:

- The standard order summary.
- A **prominent claim link** to `/orders/claim?token={guestToken}`.
- Pitch: "Create an account to track your order, save addresses, and check out faster next time."

## Where sends happen

| Event                                  | Where                                                         |
| -------------------------------------- | ------------------------------------------------------------- |
| Order placed (CARD)                    | `payment_intent.succeeded` Stripe webhook handler             |
| Order placed (CASH)                    | `createOrder` service, immediately after the order is created |
| Order placed (anonymous, both methods) | Same as above — pick template based on `userId == null`       |
| Order shipped                          | `updateOrderStatus.ts` action when status → SHIPPED           |
| Order delivered                        | `updateOrderStatus.ts` action when status → DELIVERED         |
| Order cancelled                        | `cancelOrder.ts` action                                       |
| Refund processed                       | `refundOrder.ts` action                                       |
| Welcome                                | `user.created` Clerk webhook handler                          |

## Non-blocking sends

Email failures must not block the primary mutation. Wrap sends in try/catch and log. Optionally, queue retries via a job system later — out of scope for v1.

```typescript
try {
  await resend.emails.send({ ... });
} catch (err) {
  console.error("Email send failed", { event: "order_confirmation", orderId, err });
}
```

## Domain & deliverability

- Verify the sending domain (e.g. `yourdomain.com`) in Resend.
- Configure SPF, DKIM, DMARC records as Resend instructs.
- Use a stable from-address (e.g. `orders@yourdomain.com`).

## Acceptance criteria

- [ ] All listed transactional emails are wired up.
- [ ] Recipient resolution falls back from user email to `anonEmail` correctly.
- [ ] Email failures do not break the primary mutation flow.
- [ ] `GuestOrderConfirmation` includes a working claim link.
- [ ] Templates are typed React components in `emails/`.
- [ ] Domain is verified in Resend before going to production.
