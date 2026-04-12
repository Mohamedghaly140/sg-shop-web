# Agent Rules

Your training data is likely stale for every library in this stack. Before writing code that touches any of the following, look up the current docs.

## Next.js 16 (App Router)
APIs, file conventions, and data-fetching patterns differ from older versions. Read `node_modules/next/dist/docs/` or fetch official docs before writing any App Router code. Heed deprecation notices.

## Tailwind CSS v4
v4 is a breaking rewrite. Utility names, config format, and the PostCSS plugin all changed. Do not assume v3 knowledge applies.

## Clerk (`@clerk/nextjs`)
Auth helpers, middleware integration, and `auth()` API change across major versions. Always verify the correct import paths and function signatures.

## nuqs
URL state parsing API (server cache, client hooks, param parsers) has had breaking changes. Check docs before using any `nuqs` or `nuqs/server` export.

## Prisma
Check current client API and schema syntax — especially for `$queryRaw`, decimal handling, and relation operations — before writing queries.

## General rule
When in doubt about any third-party library: fetch the docs first, code second.
