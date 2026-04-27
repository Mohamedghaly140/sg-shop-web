# 06 — API Design

API route handlers live under `app/api/`. They are built **alongside every web feature** and designed to be consumed by the React Native Expo mobile app in a future phase. The web app itself uses Server Actions for mutations and Server Components for data fetching — it does **not** call these API routes.

## Route map

```
app/api/
├── webhooks/
│   ├── clerk/route.ts              POST  — Clerk user lifecycle sync
│   └── stripe/route.ts             POST  — Stripe payment events
│
├── products/
│   ├── route.ts                    GET   — paginated list with filters
│   └── [slug]/route.ts             GET   — single product by slug
│
├── categories/
│   └── route.ts                    GET   — all categories with subcategories
│
├── brands/
│   └── route.ts                    GET   — all brands
│
├── cart/
│   ├── route.ts                    GET   — current cart
│   │                               POST  — add item to cart
│   └── [itemId]/route.ts           PATCH — update item quantity
│                                   DELETE — remove item
│
├── orders/
│   ├── route.ts                    GET   — user order list (auth required)
│   │                               POST  — create order
│   └── [id]/route.ts               GET   — single order detail
│
├── account/
│   ├── profile/route.ts            GET   — profile | PATCH — update
│   ├── addresses/
│   │   ├── route.ts                GET   — list | POST — create
│   │   └── [id]/route.ts           PATCH — update | DELETE — remove
│   └── wishlist/
│       ├── route.ts                GET   — list | POST — add product
│       └── [productId]/route.ts    DELETE — remove product
│
└── checkout/route.ts               POST  — create order + Stripe PaymentIntent
```

## Response envelope

Every route returns the same shape:

```typescript
// Success
{ success: true, data: T }

// Error
{ success: false, error: { code: string, message: string } }
```

## Auth pattern in route handlers

```typescript
import { auth } from "@clerk/nextjs/server";

export async function GET() {
  const { userId } = await auth();
  if (!userId) {
    return Response.json(
      {
        success: false,
        error: { code: "UNAUTHORIZED", message: "Authentication required" },
      },
      { status: 401 },
    );
  }
  // ...
}
```

## Input validation

All request bodies validated with **Zod** before reaching service functions:

```typescript
import { z } from "zod";

export const AddToCartSchema = z.object({
  productId: z.string().cuid(),
  quantity: z.number().int().min(1).max(100),
  color: z.string().optional(),
  size: z.string().optional(),
});
```

## Service layer — no logic duplication

Route handlers and Server Actions never contain business logic. Both call the same service function:

```typescript
// features/cart/services/cart.service.ts
export async function addToCart(
  userId: string | null,
  sessionToken: string | null,
  input: AddToCartInput,
) {
  // business logic lives here — called by both the Server Action and the API route
}

// features/cart/actions/cart.actions.ts  (web — Server Action)
"use server";
export async function addToCartAction(
  input: unknown,
): Promise<ActionResult<Cart>> {
  const { userId } = await auth();
  const parsed = AddToCartSchema.safeParse(input);
  if (!parsed.success) return { success: false, error: "Invalid input" };
  return addToCart(userId, null, parsed.data);
}

// app/api/cart/route.ts  (mobile API)
export async function POST(req: Request) {
  const { userId } = await auth();
  const body = await req.json();
  const parsed = AddToCartSchema.safeParse(body);
  if (!parsed.success) {
    return Response.json(
      {
        success: false,
        error: { code: "INVALID_INPUT", message: "Invalid input" },
      },
      { status: 400 },
    );
  }
  const result = await addToCart(userId, null, parsed.data);
  return Response.json(result);
}
```

## Status codes

| Outcome              | HTTP | Envelope                                          |
| -------------------- | ---- | ------------------------------------------------- |
| Success              | 200  | `{ success: true, data }`                         |
| Created              | 201  | `{ success: true, data }`                         |
| Invalid input (Zod)  | 400  | `{ success: false, error: INVALID_INPUT }`        |
| Unauthenticated      | 401  | `{ success: false, error: UNAUTHORIZED }`         |
| Forbidden (role)     | 403  | `{ success: false, error: FORBIDDEN }`            |
| Not found            | 404  | `{ success: false, error: NOT_FOUND }`            |
| Conflict (e.g. dup.) | 409  | `{ success: false, error: CONFLICT }`             |
| Server error         | 500  | `{ success: false, error: INTERNAL_SERVER_ERROR }`|

## Webhook routes

Webhook routes are **not** wrapped in the standard envelope — Clerk and Stripe expect plain HTTP responses. See:

- `integrations/01-clerk-auth.md` for the Clerk webhook.
- `integrations/02-stripe-payments.md` for the Stripe webhook.
