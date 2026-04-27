# Admin — Customers

## Overview

Customer directory and individual customer detail. Includes role assignment (ADMIN-only).

## Routes

| Route                   | Feature                      | Access         |
| ----------------------- | ---------------------------- | -------------- |
| `/admin/customers`      | `AdminCustomersFeature`      | MANAGER, ADMIN |
| `/admin/customers/[id]` | `AdminCustomerDetailFeature` | MANAGER, ADMIN |

## Feature path

`features/admin/customers/`

```
features/admin/customers/
├── components/
│   ├── CustomersTable.tsx
│   ├── CustomerInfoCard.tsx
│   ├── CustomerOrdersList.tsx
│   ├── CustomerAddressesList.tsx
│   └── RoleAssignmentDialog.tsx
├── hooks/
│   └── useCustomerParams.ts
├── actions/
│   ├── toggleCustomerActive.ts
│   └── changeCustomerRole.ts          # ADMIN only
├── services/
│   ├── get-customers.ts
│   └── get-customer.ts
└── index.tsx
```

## URL state (nuqs) — list view

```typescript
{ search: "", role: "", page: 1 }
```

## List view (`/admin/customers`)

- Table per row: name, email, role, order count, lifetime value, joined date, status (active/inactive).
- Search: name, email, phone (ILIKE).
- Filter: role (USER / MANAGER / ADMIN).
- Pagination via nuqs.
- Click row → `/admin/customers/[id]`.

### Aggregations

- **Order count**: `count(orders WHERE userId = u.id)`.
- **Lifetime value**: `sum(orders.totalOrderPrice WHERE userId = u.id AND isPaid = true)`.

These can be computed on-demand or maintained in a materialized view if performance becomes an issue. Start with on-demand.

## Detail view (`/admin/customers/[id]`)

Sections:

- **`CustomerInfoCard`** — name, email, phone, role, active state, joined date, lifetime stats.
- **`CustomerOrdersList`** — paginated orders for this customer, with click-through to `/admin/orders/[id]`.
- **`CustomerAddressesList`** — saved addresses (read-only here; admin doesn't edit customer addresses except in extreme cases).
- **Role assignment** (ADMIN only) — `RoleAssignmentDialog`. MANAGER cannot see this section.
- **Activity log** — out of scope for the initial build; design service layer to allow adding it later.

## Mutations

| File                       | Effect                                                                                                                       | Access |
| -------------------------- | ---------------------------------------------------------------------------------------------------------------------------- | ------ |
| `toggleCustomerActive.ts`  | Flip `User.active`. Inactive users cannot sign in (we sync to Clerk via the change).                                          | MANAGER+ |
| `changeCustomerRole.ts`    | Update Clerk `publicMetadata.role` AND local `User.role`. Wrap both in error handling — Clerk update first, then mirror to DB. | ADMIN   |

### Role change details

- Roles must be kept in sync between Clerk and the local DB.
- Authoritative source: **Clerk**. The action calls Clerk's API to update `publicMetadata.role`, then updates the local `User.role`.
- If the Clerk update fails, do not update the local DB — return error.
- If Clerk succeeds but the DB update fails, log a critical alert; the next `user.updated` webhook will sync.

### Active state

- Setting `active = false` is **soft delete** for our domain. We do not delete the Clerk user.
- Inactive users must be blocked at sign-in. Implement either via:
  - Clerk's user banning API (preferred), or
  - A check in `proxy.ts` that signs out an inactive user.

## Acceptance criteria

- [ ] List view supports filters and search via nuqs.
- [ ] Aggregations (orders count, LTV) display correctly.
- [ ] Detail view shows orders, addresses, and (for ADMIN) role assignment.
- [ ] Role change updates both Clerk and the local DB atomically (Clerk first).
- [ ] Inactive customers cannot sign in.
- [ ] MANAGER cannot see role assignment UI.
