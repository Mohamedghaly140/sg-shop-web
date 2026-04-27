# 02 — Tech Stack

| Layer                     | Technology              | Notes                            |
| ------------------------- | ----------------------- | -------------------------------- |
| Framework                 | Next.js 16 (App Router) |                                  |
| Language                  | TypeScript              | strict mode                      |
| Runtime / Package manager | Bun                     | Never use `npm` or `npx`         |
| Styling                   | Tailwind CSS v4         |                                  |
| Component library         | shadcn/ui               | Radix UI primitives              |
| URL state                 | nuqs                    | Type-safe URL search params      |
| Authentication            | Clerk                   | `@clerk/nextjs`                  |
| ORM                       | Prisma                  |                                  |
| Database                  | PostgreSQL via Supabase |                                  |
| Payments                  | Stripe                  | Payment Intents + Webhooks       |
| Media storage             | Cloudinary              | Images, transforms, CDN delivery |
| Email                     | Resend                  | React Email templates            |
| Hosting                   | Vercel                  |                                  |

## Why these choices

- **Next.js 16 App Router** — Server Components by default, Server Actions for mutations, route handlers for the public API. One framework covers UI, BFF, and the future-mobile API.
- **Bun** — fast install, fast script runner, native TypeScript. Use `bun add`, `bun run`, `bunx`.
- **Tailwind CSS v4 + shadcn/ui** — design system without a heavy component runtime; Radix primitives for a11y.
- **nuqs** — URL is the source of truth for filters/sort/pagination. Server Components read directly; client components write.
- **Clerk** — managed identity (email, magic link, OAuth). The app DB is a mirror of Clerk via webhooks.
- **Prisma + Supabase Postgres** — typed queries against managed Postgres. Two URLs (pooler runtime, direct migrations).
- **Stripe** — Payment Intents pattern with webhook-driven state changes.
- **Cloudinary** — direct browser-to-Cloudinary uploads (no binary data through Next.js).
- **Resend + React Email** — typed transactional emails as React components.
- **Vercel** — first-class Next.js host.

## Forbidden / non-choices

- **No `npm` or `npx`.** Use `bun` and `bunx` everywhere — including `package.json` scripts.
- **No `src/` folder.** All source lives at the project root.
- **No client-side data fetching on initial load.** Server Components fetch via Prisma directly.
- **No `useState` for filter/sort/pagination state.** Use nuqs.
- **No `any` in TypeScript.** Use `unknown` and narrow with Zod or type guards.
