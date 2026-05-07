# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

We're building the app described in @docs/SPEC.MD. Read that file for general architectural tasks or to double-check the exact database structure, tech stack or application architecture.

Keep your replies extremely concise and focus on conveying the key information. No unnecessary fluff, no long code snippets.

Whenever working with any third-party library or something similar, you MUST look up the official documentation to ensure that you're working with up-to-date information. Use the DocsExplorer subagent for efficient documentation lookup.

@AGENTS.md

## Commands

Always use **Bun** — never `npm`, `npx`, or `yarn`.

```bash
bun dev                 # start dev server
bun build               # production build
bun lint                # ESLint
bun prisma:migrate      # run migrations (uses DIRECT_URL)
bun prisma:generate     # regenerate Prisma client after schema changes
bun prisma:studio       # Prisma Studio GUI
bun prisma:seed         # seed the database
```

## Architecture

Full-stack e-commerce app. Next.js is the entire backend — no separate API service.

- **Server Components** fetch data directly via Prisma (no client-side waterfalls on initial load).
- **Server Actions** handle all web mutations.
- **API Route Handlers** (`app/api/`) are thin wrappers around the same service functions used by Server Actions. Built for a future React Native mobile app — the web app never calls them.
- **`proxy.ts`** (middleware) runs before every request: Clerk auth check + role guard. Route protection and role enforcement happen here, not inside pages.

## Project layout

No `src/` folder. Key top-level directories:

```
app/
  (storefront)/     # public storefront — shared nav/footer layout
  (auth)/           # Clerk sign-in / sign-up pages
  admin/            # admin dashboard — own layout (sidebar + topbar)
  api/              # REST route handlers (mobile API, not used by web)
features/           # ← core of the codebase
  <feature>/        # storefront features (products, cart, checkout, account, …)
  admin/
    <feature>/      # admin features (dashboard, orders, products, …)
lib/                # singleton clients + utilities (prisma.ts, cloudinary.ts, slug.ts, utils.ts, env.ts, …)
components/ui/      # shadcn/ui primitives only — no business logic here
components/shared/  # cross-feature UI: form primitives, cloudinary-uploader, action feedback hook
types/              # global types: DecimalToString<T,K> (utils.ts), Clerk JWT augmentation (globals.d.ts)
prisma/             # schema.prisma + migrations
```

## Feature structure contract

Every feature lives in `features/<name>/` and exports one default from `index.tsx`. Pages are thin — they only render the feature:

```
features/<name>/
  components/   # UI components for this feature
  hooks/        # nuqs params schema (server cache + client hook)
  actions/      # Server Actions (web mutations)
  services/     # business logic — called by both actions and API route handlers
  types/
  index.tsx     # export default <Name>Feature — Server Component
```

## Auth & roles

- `User.id` stores the Clerk user ID string directly (e.g. `user_2abc…`). Use `auth()` → `userId` as a FK in Prisma queries — no mapping step.
- Roles (`USER` / `MANAGER` / `ADMIN`) live in Clerk `publicMetadata.role` and are mirrored to the DB via the `POST /api/webhooks/clerk` webhook.
- Prisma is **server-only**. `DATABASE_URL` must never reach the client bundle.
- `lib/require-role.ts` exports `requireAdmin()` and `requireManagerOrAdmin()` — call these at the top of admin Server Actions / API handlers as a second guard layer beyond the middleware.
- `/admin/settings` and `/admin/users` are ADMIN-only routes; all other `/admin/*` routes are accessible to MANAGER and ADMIN.

## URL state

All filters, pagination, sort, and search state lives in the URL via **nuqs**. Define a params schema once per feature in `hooks/use<Feature>Params.ts` — the same schema drives both the server-side `createSearchParamsCache` and the client-side `useQueryStates` hook.

## Anonymous checkout

Guest carts are keyed by a `sessionToken` cookie (DB row, 7-day expiry). `Cart.userId` and `Order.userId` are nullable. On sign-in, the session cart merges into the user cart. Anonymous orders carry flat `anon_*` columns instead of FK references.

## Server Action pattern

All mutations use the `ActionState` type from `components/shared/form/utils/to-action-state.ts`:

```ts
import { toActionState, fromErrorToActionState } from "@/components/shared/form/utils/to-action-state";

export async function myAction(...): Promise<ActionState> {
  try {
    // ... mutation
    return toActionState("SUCCESS", "Done");
  } catch (e) {
    return fromErrorToActionState(e); // handles Zod errors, Clerk errors, generic Error
  }
}
```

The client-side `useActionFeedback` hook (in `components/shared/form/`) reads `ActionState` and surfaces toasts via Sonner.

## Caching & revalidation

Service functions use Next.js request-level `cache()` so they deduplicate within a single request. After mutations, call `revalidatePath()` to invalidate the relevant route. No `revalidateTag()` pattern is in use.

## Payments

- **CARD**: Stripe Payment Intents. Order created first (status `PENDING`), then Stripe webhook (`payment_intent.succeeded`) sets `isPaid = true` and transitions to `PROCESSING`. **Stripe integration is not yet implemented** — `lib/stripe.ts` and `/api/webhooks/stripe` are placeholders.
- **CASH**: Order created immediately, admin marks paid manually on delivery.

## Human-readable order IDs

Requires a one-time DB setup after the first migration:

```sql
CREATE SEQUENCE order_human_id_seq START 1;
```

Generate in the order-creation Server Action:

```typescript
const result = await prisma.$queryRaw<[{ id: string }]>`
  SELECT 'ORD-' || LPAD(nextval('order_human_id_seq')::text, 6, '0') AS id
`;
const humanOrderId = result[0].id; // "ORD-000001"
```

## Cloudinary uploads

Images upload **directly from the browser** to Cloudinary via the Upload Widget — no binary data passes through the Next.js server. The DB stores only `imageId` (public ID) and `imageUrl` (delivery URL). When deleting a product/category, use the `destroyAsset(imageId)` helper from `lib/cloudinary.ts` (not the raw SDK method).

## Naming conventions

- Component props types must be prefixed with the component name: `AdminUsersPageProps`, not `Props`.
- Prefer Prisma-generated types (`User`, `Order`, etc. from `@/generated/prisma/client`) over hand-written row types. Use `Pick<User, "id" | "name" | ...>` when only a subset of fields is needed.
- Lucide icons must be prefixed with `Lucide`: `LucideSearch`, `LucideTrash2`, `LucidePlus`, etc. Never import bare names like `Search`, `Trash2`, or `Plus`.
- Slug generation: use `makeSlug()` and `allocateUniqueSlug()` from `lib/slug.ts`.

## Tailwind CSS v4

No `tailwind.config.js/ts`. All theme customisation (colors, fonts, spacing, etc.) lives in `app/globals.css` using CSS `@theme` / `@layer` blocks — this is the v4 CSS-first approach. Do not create a JS config file.

## Zod v4

This project uses **Zod v4**. Key differences from v3:

- `z.enum()` now accepts enum objects directly — no need for `z.nativeEnum()` (deprecated):
  ```ts
  import { ProductStatus } from "@/generated/prisma/enums";
  z.enum(ProductStatus); // ✅ correct in v4
  z.nativeEnum(ProductStatus); // ❌ deprecated
  ```
- `.Enum` / `.Values` accessors removed; use `.enum` (singular).

## Database (Supabase + Prisma)

Two URLs required — the pooler URL for runtime, the direct URL for migrations only:

```env
DATABASE_URL   # pooler (port 6543) — runtime queries
DIRECT_URL     # direct (port 5432) — prisma migrate only
```

The Prisma client is generated to `generated/prisma` (not the default `@prisma/client`):

```ts
import { prisma } from "@/lib/prisma";           // singleton client
import type { User } from "@/generated/prisma/client"; // generated types
import { ProductStatus } from "@/generated/prisma/enums"; // generated enums
```

## Environment variables

`lib/env.ts` is a validated env singleton that throws on startup if required vars are missing. Import from it instead of accessing `process.env` directly in server code.

## Decimal serialization

Prisma `Decimal` fields cannot be passed as-is to Client Components. Use the `DecimalToString<T, K>` utility type from `types/utils.ts` to type-narrow serialized props:

```ts
import type { DecimalToString } from "@/types/utils";
type ProductCardProps = DecimalToString<Product, "price" | "discount">;
```

<!-- SPECKIT START -->
For additional context about technologies to be used, project structure,
shell commands, and other important information, read the current plan
<!-- SPECKIT END -->
