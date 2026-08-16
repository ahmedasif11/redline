# Deploy REDLINE to Vercel

This app is a Next.js 15 App Router storefront. Vercel is the intended host: `@vercel/analytics` is already wired in the root layout, and the Postgres client uses `prepare: false` so it works with Neon (and other serverless Postgres providers).

**Do not deploy without `DATABASE_URL`.** Without it, catalog, users, orders, and inventory fall back to JSON files under `.data/`. That works on a local disk; on Vercel the filesystem is ephemeral, so data would vanish between invocations.

## What you need

| Service | Why |
| --- | --- |
| [Vercel](https://vercel.com) account + this Git repo | Hosts the Next.js app |
| Hosted Postgres ([Neon](https://neon.tech) recommended) | Persistent catalog, auth, orders, inventory |
| [Stripe](https://stripe.com) account (test or live) | Checkout payments + webhooks |
| [Resend](https://resend.com) (optional) | Order confirmation emails |

Node.js 18+ locally is enough to push schema and seed.

## 1. Create a Postgres database

1. Create a Neon project (or any Postgres 15+ database).
2. Copy the **pooled** connection string (Neon: host looks like `….pooler.neon.tech`).
3. It should look like:

```text
postgresql://USER:PASSWORD@HOST/DB?sslmode=require
```

Keep this URL for both Vercel env vars and local schema/seed commands.

## 2. Apply schema and seed (from your machine)

Drizzle Kit reads `DATABASE_URL` from `.env.local`. Point that file at the **hosted** database (or export the URL in the shell — `dotenv` will not override an already-set `DATABASE_URL`):

```bash
# Option A: put the Neon URL in .env.local as DATABASE_URL, then:
npm run db:push
npm run db:seed

# Option B: one-off against production without editing .env.local
DATABASE_URL='postgresql://USER:PASSWORD@HOST/DB?sslmode=require' npm run db:push
DATABASE_URL='postgresql://USER:PASSWORD@HOST/DB?sslmode=require' npm run db:seed
```

`db:push` creates tables. `db:seed` upserts the catalog and inventory. Re-running seed is safe; it updates existing product rows.

If `db:push` prompts for confirmation, use:

```bash
npx drizzle-kit push --force
```

## 3. Import the project on Vercel

1. Push the repo to GitHub/GitLab/Bitbucket if it is not already remote.
2. In Vercel: **Add New… → Project** and import the repo.
3. Framework Preset should be **Next.js**. Root Directory stays `.` (this repo *is* the Next app).
4. Build settings (defaults are correct):

   | Setting | Value |
   | --- | --- |
   | Build Command | `next build` (`npm run build`) |
   | Output | Next.js (no extra config) |
   | Install Command | `npm install` |

5. Do **not** add `vercel.json` unless you later need custom headers or rewrites. None are required today.

Leave **Deploy** until environment variables are set (step 4), or deploy once and redeploy after saving env vars.

## 4. Environment variables

In the Vercel project: **Settings → Environment Variables**. Apply them to Production (and Preview if you want checkout to work on preview URLs).

### Required

| Name | Example | Notes |
| --- | --- | --- |
| `DATABASE_URL` | `postgresql://…?sslmode=require` | Same hosted DB you pushed/seeded. Mark as **Sensitive**. |
| `AUTH_SECRET` | long random string | Signs httpOnly session cookies (`jose` HS256). Generate with `openssl rand -base64 32`. |
| `NEXT_PUBLIC_APP_URL` | `https://your-app.vercel.app` | Stripe success/cancel URLs. Use the production domain, no trailing slash. After you attach a custom domain, update this and redeploy. |
| `NEXT_PUBLIC_SITE_URL` | `https://your-app.vercel.app` | Canonical origin for `sitemap.xml` and `robots.txt`. Same value as `NEXT_PUBLIC_APP_URL` is fine. |
| `ADMIN_EMAIL` | `you@example.com` | First login with this email **creates** an admin (or promotes an existing user). |
| `ADMIN_PASSWORD` | strong password | Used only when the admin user is created. Changing this later does **not** reset an existing user’s password. |

`NEXT_PUBLIC_*` values are inlined at **build** time. After changing them, trigger a new deployment.

### Stripe (production checkout)

Leave these unset only if you want the local **demo checkout** (marks orders paid without Stripe). On Vercel you almost always want Stripe.

| Name | Example | Notes |
| --- | --- | --- |
| `STRIPE_SECRET_KEY` | `sk_live_…` or `sk_test_…` | Server-only. Use test keys until you go live. |
| `STRIPE_WEBHOOK_SECRET` | `whsec_…` | From the Stripe webhook endpoint (step 5). Not the same as the secret key. |

`NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` appears in `.env.example` but is unused: checkout uses Stripe-hosted Checkout Sessions, not Stripe.js on the client.

### Email (optional)

| Name | Example | Notes |
| --- | --- | --- |
| `RESEND_API_KEY` | `re_…` | If unset, order confirmation emails are skipped (logged only). |
| `RESEND_FROM_EMAIL` | `REDLINE <orders@yourdomain.com>` | Defaults to Resend’s onboarding sender. For production, verify your domain in Resend. |

### Not needed on Vercel

- Local Docker `DATABASE_URL` (`localhost:5434`)
- `NEXTAUTH_SECRET` — optional alias for `AUTH_SECRET`; prefer `AUTH_SECRET`

## 5. Stripe webhook

Checkout fulfillment runs in `POST /api/v1/webhooks/stripe` (`checkout.session.completed` and related events). Without a webhook, paid sessions will not mark orders paid or decrement stock.

1. Deploy the app with `STRIPE_SECRET_KEY` set (webhook secret can wait one deploy).
2. In Stripe Dashboard → **Developers → Webhooks → Add endpoint**:
   - URL: `https://YOUR_DOMAIN/api/v1/webhooks/stripe`
   - Events:
     - `checkout.session.completed`
     - `checkout.session.async_payment_succeeded`
     - `checkout.session.expired`
     - `checkout.session.async_payment_failed`
3. Copy the endpoint **Signing secret** (`whsec_…`) into Vercel as `STRIPE_WEBHOOK_SECRET`.
4. Redeploy so the new secret is available to the serverless function.

Use a **test** webhook + test keys on preview/staging, and a **live** webhook + live keys on production.

Stripe CLI for local only:

```bash
stripe listen --forward-to localhost:3000/api/v1/webhooks/stripe
```

## 6. First production checks

1. Open `https://YOUR_DOMAIN` — catalog should match the seed.
2. Register a customer, add to cart, check out with Stripe test card `4242 4242 4242 4242`.
3. Confirm `/checkout/success`, order in the account orders list, and stock drop.
4. Log in as `ADMIN_EMAIL` / `ADMIN_PASSWORD` and open the admin orders/catalog UI.
5. If Resend is configured, confirm the order email (check spam / Resend logs).

## 7. Custom domain

1. Vercel project → **Settings → Domains** → add the domain and complete DNS.
2. Set `NEXT_PUBLIC_APP_URL` and `NEXT_PUBLIC_SITE_URL` to `https://yourdomain.com`.
3. Redeploy.
4. Update the Stripe webhook URL to the custom domain (or add a second endpoint).
5. Update Resend’s allowed/from domain if you send from that hostname.

Session cookies use `secure` in production, so HTTPS (Vercel default) is required.

## 8. Previews and branches

Each preview deployment gets a unique `*.vercel.app` URL. Stripe redirects and webhooks will fail if `NEXT_PUBLIC_APP_URL` still points at production.

Options:

- Set Preview env `NEXT_PUBLIC_APP_URL` to a stable preview domain, **or**
- Skip Stripe on Preview (omit Stripe keys) and only test checkout on Production, **or**
- Add a Stripe webhook per preview URL (usually not worth it).

`DATABASE_URL` can be shared with production for convenience, or use a separate Neon branch so previews cannot mutate live orders.

## Troubleshooting

| Symptom | Likely cause |
| --- | --- |
| Empty shop / lost orders after a while | `DATABASE_URL` missing; app wrote to ephemeral `.data/` |
| `DATABASE_URL is not set` at runtime | Env var not saved for that environment, or deploy started before it was added |
| Stripe returns to `localhost:3000` | `NEXT_PUBLIC_APP_URL` still local; rebuild after changing it |
| Webhook `INVALID_SIGNATURE` | Wrong `STRIPE_WEBHOOK_SECRET`, or test vs live mismatch |
| Orders stay unpaid after paying | Webhook not registered, or function error — check Vercel logs and Stripe webhook deliveries |
| Cannot log in as admin | `ADMIN_EMAIL` / `ADMIN_PASSWORD` unset, or user already exists with a different password (env password is not overwritten) |
| Sitemap/robots use `redline.example` | `NEXT_PUBLIC_SITE_URL` missing at build time |
| Resend errors / no email | Unverified domain, or still using `onboarding@resend.dev` in production |

Vercel function logs: project → **Logs**. Stripe: **Developers → Webhooks →** endpoint → **Attempts**.

## Local vs production (quick map)

| Concern | Local | Vercel |
| --- | --- | --- |
| Database | Docker (`npm run infra:up`) or unset (JSON) | Hosted Postgres **required** |
| Schema | `npm run db:push` | Same command against hosted `DATABASE_URL` |
| Auth secret | Optional (dev fallback exists) | **Required** |
| Stripe | Optional demo checkout | Webhook + secret key |
| App URL | `http://localhost:3000` | `https://…` production domain |
