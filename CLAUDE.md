# CLAUDE.md

We're building the app described in @SPEC.MD. Read that file for general architectural tasks or to double-check the exact database structure, tech stack or application architecture.

Keep your replies extremely concise and focus on conveying the key information. No unnecessary fluff, no long code snippets.

Whenever working with any third-party library or something similar, you MUST look up the official documentation to ensure that you're working with up-to-date information. Use the DocsExplorer subagent for efficient documentation lookup.

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

@AGENTS.md

## Commands

Always use **Bun** — never `npm`, `npx`, or `yarn`.

```bash
bun dev        # start dev server
bun build      # production build
bun lint       # ESLint
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
lib/                # singleton clients: prisma.ts, stripe.ts, cloudinary.ts, resend.ts
components/ui/      # shadcn/ui primitives only — no business logic here
emails/             # React Email templates
types/              # global types (ActionResult<T>, etc.)
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

## URL state

All filters, pagination, sort, and search state lives in the URL via **nuqs**. Define a params schema once per feature in `hooks/use<Feature>Params.ts` — the same schema drives both the server-side `createSearchParamsCache` and the client-side `useQueryStates` hook.

## Anonymous checkout

Guest carts are keyed by a `sessionToken` cookie (DB row, 7-day expiry). `Cart.userId` and `Order.userId` are nullable. On sign-in, the session cart merges into the user cart. Anonymous orders carry flat `anon_*` columns instead of FK references.

## Payments

- **CARD**: Stripe Payment Intents. Order created first (status `PENDING`), then Stripe webhook (`payment_intent.succeeded`) sets `isPaid = true` and transitions to `PROCESSING`.
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

Images upload **directly from the browser** to Cloudinary via the Upload Widget — no binary data passes through the Next.js server. The DB stores only `imageId` (public ID) and `imageUrl` (delivery URL). When deleting a product/category/brand, call `cloudinary.uploader.destroy(imageId)` in the service function.

## Naming conventions

- Component props types must be prefixed with the component name: `AdminUsersPageProps`, not `Props`.
- Prefer Prisma-generated types (`User`, `Order`, etc. from `@/generated/prisma/client`) over hand-written row types. Use `Pick<User, "id" | "name" | ...>` when only a subset of fields is needed.
- Lucide icons must be prefixed with `Lucide`: `LucideSearch`, `LucideTrash2`, `LucidePlus`, etc. Never i  
  import bare names like `Search`, `Trash2`, or `Plus`.

## Database (Supabase + Prisma)

Two URLs required — the pooler URL for runtime, the direct URL for migrations only:

```env
DATABASE_URL   # pooler (port 6543) — runtime queries
DIRECT_URL     # direct (port 5432) — prisma migrate only
```
