# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

@AGENTS.md

## Commands

- `npm run dev` — dev server at http://localhost:3000
- `npm run build` — production build (also type-checks)
- `npm run start` — serve the production build
- `npm run lint` — ESLint (flat config in `eslint.config.mjs`, extends `eslint-config-next` core-web-vitals + typescript)

No test framework is set up yet.

## Stack

Next.js 16.4 (App Router, Turbopack), React 19.3, TypeScript (strict), Tailwind CSS v4. The `@/*` import alias maps to the repo root.

The bundled docs (`node_modules/next/dist/docs/`, referred to as `docs/` below) mirror nextjs.org/docs: `01-app/01-getting-started`, `01-app/02-guides`, `01-app/03-api-reference`.

## Things that differ from a default Next.js setup

`next.config.ts` turns on several non-default behaviors that change how code should be written:

- **`cacheComponents: true`** — Cache Components mode. Data/UI caching is opt-in via `"use cache"`, and dynamic data access must be wrapped in `<Suspense>` or the build fails. See `docs/01-app/01-getting-started/08-caching.md`; don't apply pre-Cache-Components patterns (`docs/01-app/02-guides/caching-without-cache-components.md` describes the old model).
- **`partialPrefetching: true`** — `<Link>` prefetches only the route's static "App Shell" by default; `<Link prefetch={true}>` opts a link into prefetching URL-specific cached content. See `docs/01-app/02-guides/adopting-partial-prefetching.md`.
- **`experimental.agentFeedback: true`** — `next dev` may add a managed feedback block to `AGENTS.md`. Like the agent-rules block, it is regenerated if removed; commit it rather than deleting it.
- **Tailwind runs through a Turbopack loader** (`@tailwindcss/turbopack` on `*.css` in `next.config.ts`), not PostCSS — there is no `postcss.config`. Theme tokens (colors, Geist font variables) are defined with `@theme inline` in `app/globals.css`.

Route components use the globally generated `LayoutProps<"/route">` / `PageProps<"/route">` type helpers (see `app/layout.tsx`) instead of hand-written prop types.
