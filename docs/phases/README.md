# Phases — Build Plan

The project is broken into **6 sequential phases**. Each phase has its own document with goals, dependencies, deliverables, a task checklist, and acceptance criteria.

## Phase overview

| Phase | Title              | Outcome                                                         | Doc                              |
| ----- | ------------------ | --------------------------------------------------------------- | -------------------------------- |
| 1     | Foundation         | Project shell, schema, auth, read-only catalog                  | `phase-1-foundation.md`          |
| 2     | Commerce Core      | Cart, checkout (anon + registered), Stripe, guest claim         | `phase-2-commerce-core.md`       |
| 3     | Registered Account | Profile, orders, addresses, wishlist, in-app notifications      | `phase-3-registered-account.md`  |
| 4     | Admin Dashboard    | Layout, products, orders, customers, categories, brands, coupons | `phase-4-admin-dashboard.md`     |
| 5     | Growth Features    | Reviews, analytics, promo banners, low-stock alerts             | `phase-5-growth-features.md`     |
| 6     | Mobile App         | Expo app consuming existing API routes                          | `phase-6-mobile-app.md`          |

## Dependency graph

```
Phase 1 (Foundation)
   │
   ├──► Phase 2 (Commerce Core)
   │        │
   │        ├──► Phase 3 (Registered Account)
   │        │        │
   │        │        └──► Phase 4 (Admin Dashboard)
   │        │                │
   │        │                └──► Phase 5 (Growth Features)
   │        │                          │
   │        │                          └──► Phase 6 (Mobile App)
   │        │
   │        └──► Phase 4 in parallel with Phase 3
   │             (admin can ship before registered account if order-management
   │              is the higher business priority)
   │
   └─ Each phase keeps building API route handlers alongside web features.
```

Phases 3 and 4 can proceed in parallel after Phase 2 — choose order based on business priority. Phase 5 needs both. Phase 6 needs all five.

## How to work a phase

For each phase doc:

1. Read the **Goal**.
2. Verify **Dependencies** — don't start until they're checked.
3. Walk through the **Tasks** checklist top to bottom.
4. As you complete each task, check it off (in code review, in PR description, or in a tracker — wherever you keep state).
5. At the end, verify **Acceptance criteria** with a manual smoke test or an automated check.

The phase docs link out to the relevant feature docs (`storefront/`, `admin/`) and integration docs (`integrations/`) for detailed specs. Phase docs are the **plan**; feature docs are the **spec**.

## Definition of "done" per phase

- All tasks in the checklist are completed.
- All acceptance criteria pass.
- Schema migrations applied to production DB.
- Webhooks registered in production (where applicable).
- No `any` in TypeScript.
- No `useState` for URL state.
- Feature folder structure follows the contract in `architecture/07-project-structure.md`.
- Every Server Action also has a matching API route handler.

## Working with Claude Code on a phase

A productive session looks like:

```
You: "Let's start Phase 2. Here's the doc: [paste phase-2-commerce-core.md]
      and the relevant feature docs: [paste storefront/04-cart.md, 05-checkout.md, 08-anonymous-checkout.md]"

Claude Code: walks the task checklist, asks clarifying questions before
             ambiguous tasks, and produces code that conforms to the
             conventions in `architecture/08-conventions.md`.
```

Always paste the **current phase doc** plus only the feature docs you need for the task at hand. Don't dump the entire `docs/` directory unless you genuinely need that much context.
