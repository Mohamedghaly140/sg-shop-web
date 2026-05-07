<!--
SYNC IMPACT REPORT
==================
Version change: (unpopulated template) → 1.0.0
Modified principles: N/A (initial population from template)
Added sections:
  - I. Server-First Architecture
  - II. Feature Encapsulation
  - III. Auth & Role Enforcement (Non-Negotiable)
  - IV. URL State as Single Source of Truth
  - V. Type Safety & Serialization
  - Security Standards
  - Development Workflow
Removed sections: None
Templates requiring updates:
  - .specify/templates/plan-template.md ✅ Constitution Check section references new principles
  - .specify/templates/spec-template.md ✅ Aligned (no mandatory section changes needed)
  - .specify/templates/tasks-template.md ✅ Aligned (no principle-driven task type changes needed)
Follow-up TODOs: None — all placeholders resolved
-->

# SG Couture Constitution

## Core Principles

### I. Server-First Architecture

All data fetching for initial page renders MUST happen in Server Components via direct Prisma
queries — no client-side waterfalls on load. Server Actions handle all web mutations. API Route
Handlers under `app/api/` are reserved exclusively for the future React Native mobile app; the
web app MUST NOT call them. `proxy.ts` middleware is the single enforcement point for Clerk auth
checks and role guards — route protection MUST NOT be duplicated inside page components.

**Rationale**: Eliminates client-side waterfall fetches, keeps the server as the authoritative
boundary, and maintains a clean separation between the web surface and the mobile API surface.

### II. Feature Encapsulation

Every feature MUST live under `features/<name>/` (storefront) or `features/admin/<name>/`
(admin). Each feature directory MUST contain exactly: `components/`, `hooks/`, `actions/`,
`services/`, `types/`, and `index.tsx` (the single default export that pages render). Pages are
thin shells — they only render the feature component. Business logic belongs in `services/`;
mutations belong in `actions/`; shared primitives belong in `components/shared/` or `lib/`.

**Rationale**: Prevents logic from leaking into pages or cross-feature imports, keeps features
independently understandable, and establishes a predictable contract for both human and AI
contributors.

### III. Auth & Role Enforcement (NON-NEGOTIABLE)

Auth checks occur in two layers that MUST both be present for admin surfaces:
1. `proxy.ts` middleware — route-level guard via Clerk session.
2. `requireAdmin()` / `requireManagerOrAdmin()` from `lib/require-role.ts` — called at the top
   of every admin Server Action and API handler.

`DATABASE_URL` and the Prisma client MUST remain server-only — they MUST never reach the client
bundle. `User.id` stores the raw Clerk user ID string; no mapping step is permitted.

**Rationale**: Defense-in-depth. Middleware alone is bypassable through direct action invocation;
the in-action guard closes that gap.

### IV. URL State as Single Source of Truth

All filters, pagination, sort, and search state MUST live in the URL via **nuqs**. Each feature
defines its params schema once in `hooks/use<Feature>Params.ts`; the same schema MUST drive both
`createSearchParamsCache` (server) and `useQueryStates` (client). No filter or pagination state
may live exclusively in React state or a server session.

**Rationale**: Makes every list view linkable, bookmarkable, and shareable; eliminates
client/server state divergence on navigation.

### V. Type Safety & Serialization

Contributors MUST use Prisma-generated types (`User`, `Order`, etc. from
`@/generated/prisma/client`) over hand-written row types. Use `Pick<T, "field">` for subsets.
Prisma `Decimal` fields MUST be converted via `DecimalToString<T, K>` from `types/utils.ts`
before passing to Client Components. Component prop type names MUST be prefixed with the
component name (e.g. `AdminUsersPageProps`). Lucide icons MUST be imported with the `Lucide`
prefix (e.g. `LucideSearch`). Zod v4 MUST use `z.enum(EnumObject)` — `z.nativeEnum()` is
forbidden.

**Rationale**: Eliminates serialization bugs, keeps types co-located with the schema, and ensures
consistent naming that AI and human readers can rely on without checking callers.

## Security Standards

- Prisma is server-only. `DATABASE_URL` MUST NOT appear in any client-accessible module.
- All admin Server Actions and API handlers MUST call the appropriate role guard from
  `lib/require-role.ts` as their first statement after destructuring arguments.
- `/admin/settings` and `/admin/users` routes are ADMIN-only; all other `/admin/*` routes accept
  MANAGER or ADMIN.
- Guest (anonymous) sessions are keyed by `sessionToken` cookie (7-day expiry DB row).
  `Cart.userId` and `Order.userId` are intentionally nullable — treat them as such in every
  query and action.
- Stripe Payment Intent webhook (`payment_intent.succeeded`) is the authoritative source for
  setting `isPaid = true` — no server action may set this directly.
- All environment variables MUST be accessed via `lib/env.ts` (validated singleton); direct
  `process.env` access is forbidden in server code.

## Development Workflow

- **Runtime queries** use `DATABASE_URL` (pooler, port 6543).
  **Migrations** use `DIRECT_URL` (port 5432) via `bun prisma:migrate`.
- After any mutation, call `revalidatePath()` for the affected route.
  No `revalidateTag()` pattern is in use.
- All mutations MUST return `ActionState` via `toActionState` / `fromErrorToActionState`
  from `components/shared/form/utils/to-action-state.ts`.
- Service functions MUST be wrapped in Next.js `cache()` for request-level deduplication.
- Slug generation MUST use `makeSlug()` / `allocateUniqueSlug()` from `lib/slug.ts`.
- Image uploads go directly from the browser to Cloudinary via the Upload Widget.
  The DB stores only `imageId` and `imageUrl`. Deletions use `destroyAsset(imageId)` from
  `lib/cloudinary.ts`.
- Always use **Bun** (`bun dev`, `bun build`, `bun lint`, etc.) — `npm`, `npx`, and `yarn` are
  forbidden.
- Tailwind customization lives exclusively in `app/globals.css` via `@theme`/`@layer` blocks.
  No `tailwind.config.js` or `tailwind.config.ts` file may be created.

## Governance

This constitution supersedes all other practices documented in this repository. Where it
conflicts with any other document, this constitution takes precedence. Amendments require:

1. A clear description of the change and the rationale.
2. A version bump following semantic versioning:
   - **MAJOR**: Removal or redefinition of a core principle.
   - **MINOR**: New principle or section added; material expansion of existing guidance.
   - **PATCH**: Clarifications, wording, typo fixes.
3. Propagation of changes to all dependent templates under `.specify/templates/`.
4. Update of `LAST_AMENDED_DATE` on every amendment.

All PRs touching architectural, auth, or data-layer code MUST verify compliance with Principles
I–V before merge. Violations MUST be documented in the plan's Complexity Tracking table with
explicit justification.

Runtime development guidance lives in `CLAUDE.md` (project-level) and `AGENTS.md`.

**Version**: 1.0.0 | **Ratified**: 2026-05-05 | **Last Amended**: 2026-05-05
