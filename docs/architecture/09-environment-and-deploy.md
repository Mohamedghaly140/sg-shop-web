# 09 — Environment & Deployment

## Environment variables

```env
# ── Database (Supabase) ───────────────────────────────────────
DATABASE_URL="postgresql://postgres.[ref]:[pw]@aws-0-[region].pooler.supabase.com:6543/postgres"
DIRECT_URL="postgresql://postgres.[ref]:[pw]@aws-0-[region].supabase.com:5432/postgres"

# ── Clerk ─────────────────────────────────────────────────────
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY="pk_..."
CLERK_SECRET_KEY="sk_..."
CLERK_WEBHOOK_SECRET="whsec_..."
NEXT_PUBLIC_CLERK_SIGN_IN_URL="/sign-in"
NEXT_PUBLIC_CLERK_SIGN_UP_URL="/sign-up"
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL="/"
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL="/"

# ── Stripe ────────────────────────────────────────────────────
STRIPE_SECRET_KEY="sk_..."
STRIPE_WEBHOOK_SECRET="whsec_..."
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_..."

# ── Cloudinary ────────────────────────────────────────────────
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME="..."
CLOUDINARY_API_KEY="..."
CLOUDINARY_API_SECRET="..."

# ── Resend ────────────────────────────────────────────────────
RESEND_API_KEY="re_..."

# ── App ───────────────────────────────────────────────────────
NEXT_PUBLIC_APP_URL="https://yourdomain.com"
```

Variables prefixed with `NEXT_PUBLIC_` are bundled into the client. Anything secret (DB password, secret keys, webhook secrets) **must not** carry that prefix.

## Vercel deployment

```json
// package.json
{
  "scripts": {
    "dev": "next dev",
    "build": "bunx prisma generate && next build",
    "start": "next start"
  }
}
```

- All environment variables set in Vercel project settings.
- `DATABASE_URL` uses the Supabase pooler URL (port 6543). `DIRECT_URL` uses the direct URL (port 5432) — Prisma uses it only during `prisma migrate deploy`.
- Clerk and Stripe webhook URLs must be registered in their dashboards pointing to the production domain.

## Database migrations

```bash
# Development — create and apply a new migration
bunx prisma migrate dev --name <descriptive_name>

# After any schema change — regenerate the Prisma client
bunx prisma generate

# Production — apply all pending migrations (runs in Vercel build or CI)
bunx prisma migrate deploy

# Open Prisma Studio (local DB browser)
bunx prisma studio
```

### One-time setup after first migration

The `humanOrderId` sequence must exist before any orders can be created. Run **once** in the Supabase SQL editor:

```sql
CREATE SEQUENCE order_human_id_seq START 1;
```

## Webhook URL registration

After first deploy, register the production webhook URLs:

| Provider | URL                                      |
| -------- | ---------------------------------------- |
| Clerk    | `https://yourdomain.com/api/webhooks/clerk` |
| Stripe   | `https://yourdomain.com/api/webhooks/stripe` |

Copy the resulting signing secret into `CLERK_WEBHOOK_SECRET` / `STRIPE_WEBHOOK_SECRET` on Vercel.

## Local development

```bash
bun install
cp .env.example .env.local           # then fill in values
bunx prisma migrate dev              # apply migrations
bun run dev                          # http://localhost:3000
```

For local Stripe webhook testing:

```bash
stripe listen --forward-to localhost:3000/api/webhooks/stripe
```

For local Clerk webhook testing, use a tunnel (e.g. ngrok) and point Clerk's webhook config at the tunnel URL.
