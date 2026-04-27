# Integration — Clerk (Authentication)

**Package:** `@clerk/nextjs`

Clerk owns identity. The local `users` table is a **mirror** synced via webhooks. `User.id` stores the Clerk user ID string (e.g. `user_2abc...`) so that `auth()` returns a `userId` that's used directly as a FK in Prisma queries — no lookup or mapping step.

## Supported sign-in methods

- Email + password
- Magic link (passwordless email)
- Google OAuth
- Apple OAuth (added when mobile ships)

## Auth flow

```
Request arrives
      │
      ▼
proxy.ts
  → auth() from @clerk/nextjs/server
  → if protected route and no session → redirect /sign-in
  → if admin route and role !== ADMIN/MANAGER → redirect /
      │
      ▼
Server Component / Server Action
  → const { userId } = await auth()
  → userId used directly as FK in Prisma queries
```

## Webhook sync

**Endpoint:** `POST /api/webhooks/clerk`
**Verification:** signature verified with the `svix` package.

| Event          | Action                                                    |
| -------------- | --------------------------------------------------------- |
| `user.created` | `prisma.user.create` — id = Clerk ID, role = USER         |
| `user.updated` | `prisma.user.update` — sync name, email, phone            |
| `user.deleted` | `prisma.user.update` — set `active = false` (soft delete) |

### Implementation

```typescript
// app/api/webhooks/clerk/route.ts
import { Webhook } from "svix";
import { headers } from "next/headers";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  const body = await req.text();
  const headersList = await headers();

  const wh = new Webhook(process.env.CLERK_WEBHOOK_SECRET!);

  let event: WebhookEvent;
  try {
    event = wh.verify(body, {
      "svix-id": headersList.get("svix-id")!,
      "svix-timestamp": headersList.get("svix-timestamp")!,
      "svix-signature": headersList.get("svix-signature")!,
    }) as WebhookEvent;
  } catch {
    return new Response("Invalid signature", { status: 400 });
  }

  const { type, data } = event;

  if (type === "user.created") {
    await prisma.user.create({
      data: {
        id: data.id,
        email: data.email_addresses[0].email_address,
        name: `${data.first_name ?? ""} ${data.last_name ?? ""}`.trim(),
        phone: data.phone_numbers[0]?.phone_number ?? "",
      },
    });
  }

  if (type === "user.updated") {
    await prisma.user.update({
      where: { id: data.id },
      data: {
        email: data.email_addresses[0].email_address,
        name: `${data.first_name ?? ""} ${data.last_name ?? ""}`.trim(),
        phone: data.phone_numbers[0]?.phone_number ?? "",
      },
    });
  }

  if (type === "user.deleted") {
    await prisma.user.update({
      where: { id: data.id },
      data: { active: false },
    });
  }

  return new Response("OK", { status: 200 });
}
```

## Webhook responses

The Clerk webhook does **not** use the standard `{ success, data }` envelope. It returns plain `200 OK` on success, `400` on signature failure. Webhooks are not part of the public API contract.

## Welcome email

The `user.created` webhook handler is also responsible for sending the welcome email via Resend. See `04-resend-email.md`.

## Roles

Roles are stored in Clerk `publicMetadata.role` and mirrored in `User.role`. The local DB is a mirror — Clerk is authoritative. See `architecture/04-roles-and-permissions.md`.

When changing a role from the admin dashboard, the `changeUserRole.ts` Server Action calls Clerk first, then mirrors to the DB. See `admin/09-users.md`.

## Sign-in / sign-up routes

`app/(auth)/sign-in/[[...sign-in]]/page.tsx` and `app/(auth)/sign-up/[[...sign-up]]/page.tsx` host Clerk's components.

```env
NEXT_PUBLIC_CLERK_SIGN_IN_URL="/sign-in"
NEXT_PUBLIC_CLERK_SIGN_UP_URL="/sign-up"
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL="/"
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL="/"
```

## Local development

The Clerk webhook needs an externally reachable URL. Use a tunnel (ngrok, Cloudflare Tunnel) and configure the Clerk dashboard webhook to point at the tunnel.

## Acceptance criteria

- [ ] `proxy.ts` redirects unauthenticated users from protected routes.
- [ ] `proxy.ts` enforces role-based admin route protection.
- [ ] Webhook signature verification works and rejects invalid signatures.
- [ ] `user.created` creates a local `User` row with role = USER.
- [ ] `user.updated` keeps name, email, phone in sync.
- [ ] `user.deleted` soft-deletes (`active = false`) instead of hard-deleting.
- [ ] `User.id` is the Clerk user ID, not a generated cuid.
- [ ] Welcome email sends on `user.created`.
