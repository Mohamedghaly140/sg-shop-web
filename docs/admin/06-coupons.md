# Admin — Coupons

## Overview

Promo code management. Each coupon is a percentage discount applied at checkout, with optional usage limits and an expiration date.

## Route

| Route            | Feature               | Access         |
| ---------------- | --------------------- | -------------- |
| `/admin/coupons` | `AdminCouponsFeature` | MANAGER, ADMIN |

## Feature path

`features/admin/coupons/`

```
features/admin/coupons/
├── components/
│   ├── CouponsTable.tsx
│   ├── CouponForm.tsx
│   └── CouponUsageBar.tsx
├── actions/
│   ├── createCoupon.ts
│   ├── updateCoupon.ts
│   ├── deactivateCoupon.ts
│   └── deleteCoupon.ts
├── services/
│   └── get-coupons.ts
└── index.tsx
```

## Coupon fields

| Field       | Type     | Notes                                                |
| ----------- | -------- | ---------------------------------------------------- |
| `name`      | string   | Uppercase, unique. Stored as the code (e.g. `SAVE20`) |
| `discount`  | decimal  | Percentage 1–70                                       |
| `expire`    | datetime | Required                                              |
| `maxUsage`  | integer  | 0 = unlimited                                         |
| `usedCount` | integer  | Read-only, incremented at checkout                    |

## List view

- Toggle between **active** (not expired AND `usedCount < maxUsage` OR `maxUsage = 0`) and **expired** views.
- Per row: code, discount, expires at, usage (`usedCount / maxUsage` with progress bar), status badge, actions (edit, deactivate, delete).
- "+ New coupon" CTA opens `CouponForm` dialog.

## Form

Validate with Zod:

- `name`: required, uppercase only, no whitespace, unique.
- `discount`: 1–70.
- `expire`: required, must be in the future on create.
- `maxUsage`: ≥ 0 integer.

## Mutations (one file per action)

| File                  | Effect                                                                     |
| --------------------- | -------------------------------------------------------------------------- |
| `createCoupon.ts`     | Validate; insert. Reject duplicate name with a clear error.                 |
| `updateCoupon.ts`     | Validate; update. Reject changes that would invalidate already-used coupons (e.g. lowering `maxUsage` below `usedCount`). |
| `deactivateCoupon.ts` | Set `expire` to now. Coupon cannot be applied; existing orders unaffected. |
| `deleteCoupon.ts`     | Hard delete only when `usedCount = 0`. Otherwise refuse — orders link to it via `Order.couponId` (FK `onDelete: SetNull`, but we still want the audit trail). |

## Coupon application at checkout

The checkout service validates a coupon at apply-time:

- Coupon exists and `expire > now()`.
- `maxUsage = 0` OR `usedCount < maxUsage`.

Increment `usedCount` **only** when the order is successfully created (and for CARD, after the webhook flips `isPaid = true` — if you want to be strict). For simplicity, increment on order creation; if the order is later cancelled, decrement in the cancel action.

## Acceptance criteria

- [ ] Coupons are unique by code (case-insensitive uppercase enforcement).
- [ ] Discount range 1–70 is enforced server-side.
- [ ] Expired coupons cannot be applied at checkout.
- [ ] `maxUsage = 0` means unlimited; positive values are enforced.
- [ ] `usedCount` correctly tracks applications and is decremented on cancellation.
- [ ] Deleting a used coupon is blocked.
- [ ] Deactivation works by setting expire = now().
