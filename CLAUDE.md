@AGENTS.md

# Venturo

Co-living room rental site: browse rooms, express interest ("notify me"),
sign a contract, admin confirms deposits.

## Stack

- **Next.js 16** (App Router) + React 19 + TypeScript, strict mode
- **Tailwind CSS 4** (`@theme inline` tokens in `src/app/globals.css`, no `tailwind.config`)
- **Prisma 7** (`prisma-client` generator, output to `src/generated/prisma`) with the `@prisma/adapter-pg` driver adapter over Postgres
- **Supabase** for auth (`@supabase/ssr`); Postgres itself is hosted on Supabase but all queries go through Prisma, not the Supabase client
- ESLint (`eslint-config-next`)

## Commands

- `npm run dev` — start dev server
- `npm run build` — production build
- `npm run start` — run production build
- `npm run lint` — ESLint
- `npx prisma migrate dev` — create/apply a migration (uses `DIRECT_URL`, see `prisma.config.ts`)
- `npx prisma generate` — regenerate the Prisma client after schema changes
- `npx tsx prisma/seed.ts` — reseed the database

No test suite exists yet.

## Architecture

- `src/app/` — App Router routes. Each route folder owns its `page.tsx` and,
  where it has mutations, a co-located `actions.ts` of `"use server"` functions.
  There is no separate API layer — Server Actions are the only write path.
- `src/proxy.ts` — this Next.js version's renamed `middleware.ts` (see
  `AGENTS.md`); refreshes the Supabase session cookie on every request.
- `src/lib/supabase/` — `server.ts` for Server Components/Actions/Route
  Handlers (reads cookies), `client.ts` for Client Components, `middleware.ts`
  for the session-refresh logic used by `proxy.ts`.
- `src/lib/prisma.ts` — singleton `PrismaClient`, stashed on `globalThis` to
  survive dev-mode hot reload without exhausting Supabase's connection limit.
- `src/lib/require-admin.ts` — auth/role guard. Server Actions are directly
  callable once deployed, so admin checks must run inside the action itself,
  not just be inferred from what the UI renders.
- `src/generated/prisma/` — generated Prisma client, committed like normal
  source since there's no build step that regenerates it in this setup. Never
  hand-edit; run `npx prisma generate` after schema changes instead.
- `prisma/schema.prisma` — source of truth for the data model
  (User/Room/Photo/Interest/Contract). `User.id` matches the Supabase Auth
  user ID directly rather than a separately generated UUID.

## Conventions

- Auth: `createClient()` from `src/lib/supabase/server.ts` inside Server
  Components/Actions to get the current user; redirect to `/login` when
  absent.
- Data access goes through the `prisma` singleton, never a fresh
  `PrismaClient` per call.
- Money is stored as integer cents, never floats.
- After a mutation, `revalidatePath` the affected route(s) plus `"/"` with
  `"layout"` scope when nav-visible state (e.g. session) could change.
- UI building blocks live in `src/components/ui/`; use the existing
  `Button`/`ButtonLink` variant system instead of ad-hoc className overrides
  (no `tailwind-merge` is installed, so later Tailwind classes aren't
  guaranteed to win over earlier ones of the same property).
- Brand colors are Tailwind tokens (`venturo-olive`, `venturo-cream`,
  `venturo-cream-alt`) defined in `globals.css` — use those tokens rather than
  hardcoding hex values.
