# 04 — Roles & Permissions

Roles are stored in Clerk `publicMetadata.role` and **mirrored** to the local `users` table via webhook.

## Role definitions

| Role      | Description                                                                             |
| --------- | --------------------------------------------------------------------------------------- |
| `USER`    | Default role. Browse, purchase, manage own profile and orders.                          |
| `MANAGER` | Manage products, orders, and view customers. Cannot access settings or role assignment. |
| `ADMIN`   | Full access to all admin features including settings and role management.               |

## Route protection matrix

| Route             | Anonymous    | USER | MANAGER      | ADMIN |
| ----------------- | ------------ | ---- | ------------ | ----- |
| `/`               | ✅           | ✅   | ✅           | ✅    |
| `/products/*`     | ✅           | ✅   | ✅           | ✅    |
| `/cart`           | ✅ (session) | ✅   | ✅           | ✅    |
| `/checkout`       | ✅ (guest)   | ✅   | ✅           | ✅    |
| `/account/*`      | ❌           | ✅   | ✅           | ✅    |
| `/admin/*`        | ❌           | ❌   | ✅ (partial) | ✅    |
| `/admin/settings` | ❌           | ❌   | ❌           | ✅    |
| `/admin/users`    | ❌           | ❌   | ❌           | ✅    |

## Where checks happen

1. **`proxy.ts`** — first line of defense. Reads the Clerk session, then:
   - If a protected route has no session → redirect `/sign-in`.
   - If an admin route and role is not `ADMIN` or `MANAGER` → redirect `/`.
   - If `/admin/settings` or `/admin/users` and role is not `ADMIN` → redirect `/admin`.
2. **Server Actions / Route Handlers** — re-check `auth()` and role inside the handler. Never trust the proxy alone for mutations.
3. **UI** — hide nav items and action buttons by role. UI is for UX, not security; the server check is the real gate.

## Role assignment

- All new signups receive `USER` role automatically via the `user.created` Clerk webhook.
- `MANAGER` and `ADMIN` roles are assigned manually in the Admin Dashboard (`/admin/users`) or the Clerk Dashboard.
- There is no public signup path for `ADMIN` — admin accounts are invite-only.

## Role checks in code

```typescript
// In a Server Action / Route Handler
import { auth } from "@clerk/nextjs/server";

const { userId, sessionClaims } = await auth();
if (!userId) return { success: false, error: "Unauthorized" };

const role = sessionClaims?.publicMetadata?.role as Role | undefined;
if (role !== "ADMIN") return { success: false, error: "Forbidden" };
```

For frequently-checked role logic, extract a helper:

```typescript
// lib/auth-helpers.ts
export async function requireAdmin() {
  const { userId, sessionClaims } = await auth();
  const role = sessionClaims?.publicMetadata?.role;
  if (!userId || role !== "ADMIN") throw new ForbiddenError();
  return userId;
}
```

(Wrap the throw at the action layer with try/catch → `ActionResult` envelope. See `08-conventions.md`.)
