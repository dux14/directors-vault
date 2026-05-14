# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

@AGENTS.md

## Commands

```bash
npm run dev      # Start dev server (Turbopack)
npm run build    # Production build
npm run lint     # ESLint check
```

**Supabase CLI** — always use the local package, never a global install:
```bash
npx supabase db push               # Apply pending migrations to remote
npx supabase db dump               # Dump schema
npx supabase link --project-ref vfywbuhnxtatqppzhjtx
```

## Architecture

**Pattern**: Server Component fetches data → passes to `*Client.tsx` for interactivity. Every route under `src/app/` follows this split (e.g. `page.tsx` + `MovieDetailClient.tsx`).

**Data sources**:
- **TMDB** (`src/lib/tmdb.ts`): all movie/person metadata. Calls are cached in-memory (10 min) and via Next.js `revalidate: 600`. The `locale` param must be passed through on every fetch — defaults to `"es-MX"`. Server components read locale from the `dv-locale` cookie via `getServerTmdbLocale()` in `src/lib/i18n/server.ts`.
- **Supabase** (`src/lib/actions.ts`, `src/lib/collection-actions.ts`): all user data. Use `"use server"` actions — never call Supabase directly from client components.

**Supabase client split** — use the right one:
| Context | Import |
|---|---|
| Server Components, Route Handlers, Server Actions | `src/lib/supabase/server.ts` → `createClient()` (async, reads cookies) |
| Client Components (`"use client"`) | `src/lib/supabase/client.ts` → `createClient()` (sync) |
| Auth middleware | `src/lib/supabase/middleware.ts` → `updateSession()` |

**JWT pinning in `server.ts`** — `createClient()` extracts the `access_token` directly from the `sb-<ref>-auth-token` cookie and pins it as `global.headers.Authorization`. This works around a `@supabase/supabase-js` bug where `_getAccessToken()` falls back to the anon key (so `auth.uid() = NULL` in PostgREST → 403 RLS rejection) when the auth client's internal `getSession()` returns null after a token refresh. Don't remove the JWT-pinning logic without verifying writes still work in production.

**Auth**: Supabase Auth via `@supabase/ssr`. The middleware (`updateSession`) refreshes tokens on every request and redirects unauthenticated users to `/login`. Public routes: `/login`, `/auth/callback`, `/auth/confirm`.

**i18n**: Client-side `LanguageProvider` in `src/lib/i18n/context.tsx` stores locale in `localStorage` + `dv-locale` cookie. Use `useTranslation()` in client components for `t()` and `tmdbLocale`. Server components call `getServerTmdbLocale()` to read the same cookie.

**Collections & RLS**: Three DB tables — `collections`, `collection_movies`, `collection_members`. RLS uses two `SECURITY DEFINER` functions to avoid recursion: `check_collection_access(uuid)` (owner OR member can read) and `check_collection_owner(uuid)` (owner only can mutate). Never write inline subqueries against `collection_members` inside policies — always go through these functions.

**Ratings**: Stored as integers 1–8 (`personal_rating` column). Scale: 1=F, 2=E, 3=D, 4=C, 5=B, 6=A, 7=A+, 8=S.

**Feature flags**: `src/lib/feature-flags.ts` — `NEXT_PUBLIC_FF_RECOMMENDER` and `NEXT_PUBLIC_FF_SOCIAL` env vars gate beta features.

**Styling**: Vanilla CSS Modules per component (`*.module.css`). No CSS framework. `src/app/globals.css` holds design tokens.

## Migrations

Never edit committed migrations (`001`–`009`). Create new ones numbered in sequence: `supabase/migrations/NNN_description.sql`. Apply with `npx supabase db push`.

## Environment Variables

See `.env.example`. Required:
- `NEXT_PUBLIC_TMDB_API_KEY` — TMDB v3 API key
- `NEXT_PUBLIC_SUPABASE_URL` + `NEXT_PUBLIC_SUPABASE_ANON_KEY` — from Supabase project dashboard
- `SUPABASE_SERVICE_ROLE_KEY` — server-only operations
- `NEXT_PUBLIC_APP_URL` — set to `http://localhost:3000` locally
