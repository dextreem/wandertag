# Project Context — WanderTag Frontend

## Overview

Mobile-first PWA for WanderTag. Companion repo: `../wandertag-backend` (Kotlin/Spring
Boot API on :8081, Keycloak on :8181). Successor to the dropnote prototype
(`~/dev/dropnote`), whose brand and palette this reuses.

SvelteKit 2 · Svelte 5 **runes** · Tailwind 4 · MapLibre GL · TanStack Svelte Query
· `keycloak-js` (PKCE) · vite-plugin-pwa

Conventions follow `~/dev/baik/baik-crm-frontend`: `src/api/<domain>/` modules,
axios client with a bearer interceptor, `$api`/`$hooks`/`$types` aliases, an
`(app)` route group, Playwright + Vitest.

## Traps that have already bitten

**TanStack Svelte Query v6 is runes-based, not stores.** Read `query.data`,
`mutation.mutateAsync` — never `$query`. The `$` prefix fails type checking.

**MapLibre forces `position: relative` on `.maplibregl-map`.** `absolute inset-0`
becomes inert and the container collapses to 0 px. Size the map div with
`h-full w-full`, give the shell a definite `h-dvh` (not `min-h-dvh`), and keep
`min-h-0` on every flex ancestor. `smoke.spec.ts` asserts a non-zero map height.

**GeoJSON coordinates are `[lon, lat]`.** Same order as PostGIS. The dropnote
prototype transposed them. `markers.test.ts` guards this.

**Never call `kc.loadUserProfile()`.** It hits Keycloak's _account_ API, needs the
account client roles, and returns 403 otherwise — a failure there was enough to
drop an authenticated user back to anonymous. Identity comes from
`kc.tokenParsed` (`sub`, `preferred_username`), which is the same claim the backend
uses for attribution.

**Set `text-font: ['Noto Sans Regular']` on symbol layers.** The basemap style's
default font stack 404s on the tile host.

**Basemap glyphs are not precached.** The service worker takes the app shell only.

## Layout rules

The app is used outdoors, one-handed. Bottom tab bar, bottom sheets, FAB
bottom-right, `100dvh`, `env(safe-area-inset-*)`, 44 px minimum touch targets
(`.touch-target`).

## Radius and geolocation

- No distance is hardcoded. `useConfig()` reads `GET /api/v1/config`; the map also
  derives `radiusM` from the viewport, so zooming out widens the search (the server
  clamps it).
- `use-geolocation.svelte.ts` owns the single `watchPosition`, started once by the
  `(app)` layout. Read positions from there, never call the browser API directly.
- Query keys use `roundPosition()` so GPS jitter does not trigger a refetch storm.

## Auth and roles

`(app)/profile` needs a session, `(app)/admin` needs the admin role. Those gates are
**cosmetic** — the server re-checks with `@PreAuthorize`. Map, list and board are
browsable anonymously, which is a product requirement, not an oversight.

## i18n

`src/lib/i18n/de.ts` is the reference catalogue; `en.ts` is typed as `Messages`, so
a missing key fails `npm run check`. German is the default. A plain typed dictionary
is a deliberate choice over Paraglide — see the README.

## Commands

`npm run dev` · `npm run check` · `npm run lint` · `npm run test:unit` ·
`npm run test:e2e` (needs the backend running with pins seeded).
