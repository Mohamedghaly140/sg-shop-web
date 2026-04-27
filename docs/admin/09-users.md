# Admin — Users (Role Management)

## Overview

System-wide user and role management. **ADMIN only.**

This is distinct from `/admin/customers`:

- **`/admin/customers`** is for managing the people who shop on the store (USER role primarily). MANAGERS can access it. Role assignment from there is also ADMIN-only but the focus is order/spend history.
- **`/admin/users`** is the dedicated role-management surface. ADMIN-only. The focus is who has access to what.

## Route

| Route          | Feature             | Access     |
| -------------- | ------------------- | ---------- |
| `/admin/users` | `AdminUsersFeature` | ADMIN only |

## Feature path

`features/admin/users/`

```
features/admin/users/
├── components/
│   ├── UsersTable.tsx
│   ├── ChangeRoleDialog.tsx
│   └── ToggleActiveDialog.tsx
├── hooks/
│   └── useUsersParams.ts
├── actions/
│   ├── changeUserRole.ts            # ADMIN only — wraps Clerk + DB
│   └── toggleUserActive.ts          # ADMIN only
├── services/
│   └── get-users.ts
└── index.tsx
```

## URL state (nuqs)

```typescript
{ search: "", role: "", active: "", page: 1 }
```

## List view

- Table: name, email, role badge, active state, joined, last sign-in (from Clerk if needed), actions.
- Filters: role, active state.
- Search: name, email.
- Pagination via nuqs.
- Per-row actions: change role, toggle active.

## Mutations

### `changeUserRole.ts`

- Re-check ADMIN role server-side.
- **Update Clerk first** via the Clerk API: set `publicMetadata.role`.
- On Clerk success, update the local `User.role`.
- On Clerk failure: return error; do not touch the local DB.
- On Clerk success but DB failure: log a critical alert; the next `user.updated` webhook will sync.
- Cannot change your own role (prevents accidental self-demotion).

### `toggleUserActive.ts`

- Re-check ADMIN role server-side.
- Flip `User.active`.
- Synchronize with Clerk:
  - **Inactive** → use Clerk's user-banning API.
  - **Active** → unban.
- Cannot deactivate your own account.

## Edge cases

- Demoting the last ADMIN: refuse. Always require at least one active ADMIN.
- Self-demotion / self-deactivation: refuse with a clear error.
- A user signs in while their `active = false`: blocked at sign-in (Clerk ban) or in `proxy.ts` (defense in depth).

## Acceptance criteria

- [ ] Page is ADMIN-only at proxy AND at action.
- [ ] Role change updates both Clerk and DB atomically (Clerk first).
- [ ] Cannot demote the last ADMIN.
- [ ] Cannot change your own role.
- [ ] Cannot deactivate your own account.
- [ ] Inactive users cannot sign in.
- [ ] Filter, search, pagination via nuqs.
