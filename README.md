# REDLINE storefront (`web/`)

Next.js App Router production app for the shoe showcase. Demo Vite SPA remains under `../Demo/animated-shoe-showcase` for reference only (`WishlistDemo`, `ShoeShowcase` are not part of this app).

## Stack

- Next.js 15 + React 19 + TypeScript
- Tailwind CSS 4 + Motion + Sonner
- Drizzle ORM + Postgres when `DATABASE_URL` is set
- JSON file stores under `.data/` when `DATABASE_URL` is unset
- Client cart/wishlist persistence (`redline-cart` / `redline-wishlist`)

## Develop

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Deploy (Vercel)

Production hosting, env vars, Neon Postgres, Stripe webhooks, and seed steps: [DEPLOYMENT.md](./DEPLOYMENT.md).

## Database (Phase E+)

### Local Postgres (Docker)

From this directory:

```bash
npm run infra:up
```

`.env.local` already points at:

`postgresql://redline:redline@localhost:5434/shoe_showcase`

Then push schema and seed:

```bash
npx drizzle-kit push --force
npm run db:seed
```

(`--force` skips the interactive confirm; use `npm run db:push` in a normal terminal if you prefer prompts.)

Stop with `npm run infra:down` (or `docker compose down -v` to wipe the volume).

### Hosted Postgres (Neon etc.)

1. Create a database and copy the connection string into `DATABASE_URL` in `.env.local`.
2. Run `npm run db:push` and `npm run db:seed`.

Without `DATABASE_URL`, the app keeps working on `.data/*.json` (including admin product CRUD).

## Scripts

| Script | Purpose |
|--------|---------|
| `npm run infra:up` | Start local infra (`docker compose up -d`) |
| `npm run infra:down` | Stop local infra (`docker compose down`) |
| `npm run db:push` | Apply Drizzle schema to Postgres |
| `npm run db:seed` | Upsert seed catalog into Postgres |
| `npm run db:studio` | Open Drizzle Studio |
| `npm run db:generate` | Generate SQL migrations |
