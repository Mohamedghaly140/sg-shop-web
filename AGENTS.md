# Agent Rules

This repository is the SG Couture full-stack e-commerce app described in `docs/SPEC.MD`. Read that file for architectural tasks or when checking the exact database structure, tech stack, or application architecture.

Keep replies concise and focus on the key information. Avoid unnecessary fluff and long code snippets.

Your training data is likely stale for every library in this stack. Before writing code that touches any of the following, look up the current official docs or local package docs first.

## Next.js 16 (App Router)

APIs, file conventions, and data-fetching patterns differ from older versions. Read `node_modules/next/dist/docs/` or fetch official docs before writing any App Router code. Heed deprecation notices.

## Tailwind CSS v4

v4 is a breaking rewrite. Utility names, config format, and the PostCSS plugin all changed. Do not assume v3 knowledge applies.

## Clerk (`@clerk/nextjs`)

Auth helpers, middleware integration, and `auth()` API change across major versions. Always verify the correct import paths and function signatures.

## nuqs

URL state parsing API, including server cache, client hooks, and param parsers, has had breaking changes. Check docs before using any `nuqs` or `nuqs/server` export.

## Prisma

Check current client API and schema syntax, especially for `$queryRaw`, decimal handling, and relation operations, before writing queries.

## General Documentation Rule

When in doubt about any third-party library, fetch the docs first and code second.

## Commands

Always use Bun. Do not use `npm`, `npx`, or `yarn`.

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

Next.js is the entire backend. There is no separate API service.

- Server Components fetch data directly through Prisma. Avoid client-side waterfalls on initial load.
- Server Actions handle all web mutations.
- API Route Handlers under `app/api/` are thin wrappers around the same service functions used by Server Actions. They exist for a future React Native mobile app; the web app must not call them.
- `proxy.ts` runs before every request and handles Clerk auth checks plus role guards. Route protection and role enforcement belong there, not inside pages.

## Project Layout

There is no `src/` folder. Key top-level directories:

```text
app/
  (storefront)/     # public storefront, shared nav/footer layout
  (auth)/           # Clerk sign-in / sign-up pages
  admin/            # admin dashboard, own layout with sidebar + topbar
  api/              # REST route handlers for mobile API, not used by web
features/           # core of the codebase
  <feature>/        # storefront features: products, cart, checkout, account, ...
  admin/
    <feature>/      # admin features: dashboard, orders, products, ...
lib/                # singleton clients: prisma.ts, stripe.ts, cloudinary.ts, resend.ts
components/ui/      # shadcn/ui primitives only; no business logic
emails/             # React Email templates
types/              # global types such as ActionResult<T>
prisma/             # schema.prisma + migrations
```

## Feature Structure Contract

Every feature lives in `features/<name>/` and exports one default component from `index.tsx`. Pages are thin and only render the feature.

```text
features/<name>/
  components/   # UI components for this feature
  hooks/        # nuqs params schema: server cache + client hook
  actions/      # Server Actions for web mutations
  services/     # business logic called by both actions and API route handlers
  types/
  index.tsx     # export default <Name>Feature, usually a Server Component
```

## Auth & Roles

- `User.id` stores the Clerk user ID string directly, for example `user_2abc...`. Use `auth()` to get `userId` and use that value as a foreign key in Prisma queries. There is no mapping step.
- Roles are `USER`, `MANAGER`, and `ADMIN`. They live in Clerk `publicMetadata.role` and are mirrored to the DB by `POST /api/webhooks/clerk`.
- Prisma is server-only. `DATABASE_URL` must never reach the client bundle.
- `lib/require-role.ts` exports `requireAdmin()` and `requireManagerOrAdmin()`. Call these at the top of admin Server Actions and API handlers as a second guard layer beyond middleware.

## URL State

All filters, pagination, sort, and search state lives in the URL via nuqs. Define a params schema once per feature in `hooks/use<Feature>Params.ts`; the same schema drives both server-side `createSearchParamsCache` and the client-side `useQueryStates` hook.

## Anonymous Checkout

Guest carts are keyed by a `sessionToken` cookie stored in a DB row with a 7-day expiry. `Cart.userId` and `Order.userId` are nullable. On sign-in, merge the session cart into the user cart. Anonymous orders carry flat `anon_*` columns instead of foreign key references.

## Payments

- `CARD`: Stripe Payment Intents. Create the order first with status `PENDING`, then the Stripe webhook for `payment_intent.succeeded` sets `isPaid = true` and transitions the order to `PROCESSING`.
- `CASH`: Create the order immediately. Admin marks it paid manually on delivery.

## Human-Readable Order IDs

Requires one-time DB setup after the first migration:

```sql
CREATE SEQUENCE order_human_id_seq START 1;
```

Generate the value in the order-creation Server Action:

```ts
const result = await prisma.$queryRaw<[{ id: string }]>`
  SELECT 'ORD-' || LPAD(nextval('order_human_id_seq')::text, 6, '0') AS id
`;
const humanOrderId = result[0].id; // "ORD-000001"
```

## Cloudinary Uploads

Images upload directly from the browser to Cloudinary via the Upload Widget. No binary data passes through the Next.js server. The DB stores only `imageId` as the public ID and `imageUrl` as the delivery URL. When deleting a product, category, or brand, call `cloudinary.uploader.destroy(imageId)` in the service function.

## Naming Conventions

- Component prop types must be prefixed with the component name, for example `AdminUsersPageProps`, not `Props`.
- Prefer Prisma-generated types such as `User` and `Order` from `@/generated/prisma/client` over hand-written row types. Use `Pick<User, "id" | "name">` when only a subset of fields is needed.
- Lucide icons must be prefixed with `Lucide`, for example `LucideSearch`, `LucideTrash2`, and `LucidePlus`. Do not import bare names like `Search`, `Trash2`, or `Plus`.

## Zod v4

This project uses Zod v4. Key differences from v3:

- `z.enum()` accepts enum objects directly. `z.nativeEnum()` is deprecated.

```ts
import { ProductStatus } from "@/generated/prisma/enums";

z.enum(ProductStatus); // correct in v4
z.nativeEnum(ProductStatus); // deprecated
```

- `.Enum` and `.Values` accessors were removed. Use `.enum` instead.

## Database (Supabase + Prisma)

Two URLs are required: the pooler URL for runtime and the direct URL for migrations only.

```env
DATABASE_URL   # pooler, port 6543, runtime queries
DIRECT_URL     # direct, port 5432, prisma migrate only
```

The Prisma client is generated to `generated/prisma`, not the default `@prisma/client`.

```ts
import { prisma } from "@/lib/prisma";
import type { User } from "@/generated/prisma/client";
import { ProductStatus } from "@/generated/prisma/enums";
```

## Environment Variables

`lib/env.ts` is a validated env singleton that throws on startup if required variables are missing. Import from it instead of accessing `process.env` directly in server code.

## Decimal Serialization

Prisma `Decimal` fields cannot be passed as-is to Client Components. Use the `DecimalToString<T, K>` utility type from `types/utils.ts` to type-narrow serialized props.

```ts
import type { DecimalToString } from "@/types/utils";

type ProductCardProps = DecimalToString<Product, "price" | "discount">;
```
