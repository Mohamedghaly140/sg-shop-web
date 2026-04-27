# Admin — Settings

## Overview

Store-wide configuration. **ADMIN only.**

## Route

| Route             | Feature                | Access     |
| ----------------- | ---------------------- | ---------- |
| `/admin/settings` | `AdminSettingsFeature` | ADMIN only |

`proxy.ts` enforces ADMIN-only access; the action also re-checks. MANAGER hitting this route is redirected to `/admin`.

## Feature path

`features/admin/settings/`

```
features/admin/settings/
├── components/
│   ├── StoreInfoForm.tsx
│   ├── ShippingZonesPanel.tsx
│   └── TaxConfigPanel.tsx
├── actions/
│   ├── updateStoreInfo.ts
│   ├── upsertShippingZone.ts
│   ├── deleteShippingZone.ts
│   └── updateTaxConfig.ts
├── services/
│   └── get-settings.ts
└── index.tsx
```

## Settings sections

### Store info

- Store name
- Currency (e.g. `EGP`, `USD`)
- Timezone (IANA, default `Africa/Cairo`)
- Support email

### Shipping zones

- Each zone: name, list of countries / governorates, flat shipping rate.
- Used at checkout to compute `Order.shippingFees`.

### Tax configuration

- Per country / region: tax rate (percentage), tax-inclusive vs tax-additive flag.
- Applied at checkout if enabled.

## Storage

There is no Prisma model for settings in the canonical schema yet. Two reasonable options:

1. **Single `settings` row** — a one-row `StoreSettings` table with JSON fields for shipping zones and tax config. Simple to load.
2. **Dedicated tables** — `StoreSettings` for scalar fields, `ShippingZone` and `TaxRule` as their own tables.

**Decision for v1:** go with option (2) for shipping zones (they're list-shaped and queried by location at checkout) and option (1) for tax config (a small JSON blob is enough to start). Add the migration in Phase 4 alongside the rest of admin.

## Mutations

| File                       | Effect                                                                                        |
| -------------------------- | --------------------------------------------------------------------------------------------- |
| `updateStoreInfo.ts`       | Validate; upsert the single `StoreSettings` row.                                              |
| `upsertShippingZone.ts`    | Create or update a `ShippingZone` row.                                                        |
| `deleteShippingZone.ts`    | Delete a `ShippingZone` row. (Past orders snapshot their shipping fees, so this is safe.)     |
| `updateTaxConfig.ts`       | Validate; upsert tax config blob in `StoreSettings`.                                          |

All ADMIN-only. Re-check role inside the action.

## Acceptance criteria

- [ ] MANAGER cannot access the page (proxy redirect).
- [ ] Actions reject non-ADMIN role at the server.
- [ ] Store info changes propagate (display in storefront footer / metadata).
- [ ] Shipping zones drive checkout shipping fees.
- [ ] Tax config drives checkout totals when enabled.
