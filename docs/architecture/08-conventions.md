# 08 — Development Conventions

## Package manager

**Bun only.** Never use `npm` or `npx`.

```bash
bun install              # install all deps
bun add <package>        # add a dependency
bun add -d <package>     # add a dev dependency
bun remove <package>     # remove a dependency
bun run dev              # start Next.js dev server
bunx prisma <command>    # run any Prisma CLI command
```

Use `bunx` (not `npx`) in `package.json` scripts and CI commands too.

## TypeScript

- `strict: true` everywhere.
- **No `any`.** Use `unknown` and narrow with Zod or type guards.
- **Infer all Prisma model types** — never manually duplicate model shapes:
  ```typescript
  import type { Product } from "@/generated/prisma";
  ```
- Prefer `type` over `interface` unless extending.

## Naming conventions

| Thing                  | Convention                              | Example                                  |
| ---------------------- | --------------------------------------- | ---------------------------------------- |
| Non-component files    | `kebab-case`                            | `cart.service.ts`                        |
| Component files        | `PascalCase`                            | `ProductCard.tsx`                        |
| Feature default export | `<Name>Feature`                         | `ProductsFeature`                        |
| Server Action files    | `camelCase.ts`, **one file per action** | `createBrand.ts`, `updateOrderStatus.ts` |
| Service files          | `<name>.service.ts`                     | `cart.service.ts`                        |
| nuqs hook files        | `use<Name>Params.ts`                    | `useProductParams.ts`                    |
| DB columns             | `snake_case` via `@map`                 | `created_at`                             |
| TypeScript fields      | `camelCase`                             | `createdAt`                              |
| API routes             | Plural nouns                            | `/api/products`                          |

## Server Actions — one file per action

- **One file per action.** Each file exports a single `*Action` (one mutation entry point per file).
- **Single Responsibility (SOLID).** A file changes for only one kind of business rule. Unrelated mutations are not combined in the same module.
- **Separation of concerns.** Validation, authorization, data updates, and `revalidatePath` boundaries for that action live together — never mixed with other flows.
- **Migration.** Features that still use a bundled `<feature>.actions.ts` should be split into one file per action over time.

Example:

```
features/admin/order-detail/actions/
├── updateOrderStatus.ts          → updateOrderStatusAction
└── togglePaid.ts                 → togglePaidAction
```

## Feature rules

- Each feature has exactly **one public export** from `index.tsx`.
- Nothing outside a feature imports from inside it (except the matching page file).
- `index.tsx` is **always** a Server Component.
- URL state is **always** `nuqs`. Never `useState` for filter/sort/pagination.
- Page files contain **zero logic** — just an import and a render.

See `07-project-structure.md` for details.

## ActionResult pattern

Every Server Action and Route Handler returns this shape. **Never throw out of a Server Action.**

```typescript
// types/index.ts
export type ActionResult<T> =
  | { success: true; data: T }
  | { success: false; error: string };

// Usage in a Server Action:
export async function createOrderAction(
  input: unknown,
): Promise<ActionResult<Order>> {
  try {
    const { userId } = await auth();
    if (!userId) return { success: false, error: "Unauthorized" };

    const parsed = CreateOrderSchema.safeParse(input);
    if (!parsed.success) return { success: false, error: "Invalid input" };

    const order = await createOrder(userId, parsed.data);
    return { success: true, data: order };
  } catch {
    return { success: false, error: "Something went wrong" };
  }
}
```

## Prisma singleton

```typescript
// lib/prisma.ts
import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

export const prisma = globalForPrisma.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
```

## Zod schemas

- Co-locate the Zod schema with the Server Action / Route Handler it validates.
- Export the schema and the inferred type:
  ```typescript
  export const AddToCartSchema = z.object({
    productId: z.string().cuid(),
    quantity: z.number().int().min(1).max(100),
    color: z.string().optional(),
    size: z.string().optional(),
  });
  export type AddToCartInput = z.infer<typeof AddToCartSchema>;
  ```
- Use `safeParse` (not `parse`) so failures become `ActionResult` errors, not exceptions.

## revalidate / cache

- Server Actions that mutate data must call `revalidatePath()` or `revalidateTag()` on every affected path.
- For admin tables: revalidate the list page after CRUD.
- For storefront pages that show product data: revalidate `/products`, `/products/[slug]`, and any category pages.

## Git / commit conventions

- Conventional commits: `feat:`, `fix:`, `refactor:`, `chore:`, `docs:`.
- One logical change per commit. Don't bundle "fixed typo + added feature".
