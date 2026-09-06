---
name: svelte-conventions
description: Svelte 5 runes, TanStack Svelte Query v6, MapLibre and Tailwind conventions for the WanderTag frontend. Use when writing or reviewing any component, hook, or API module in this repo — especially anything touching queries, the map, or layout height.
---

Conventions specific to this codebase. They differ from what a general Svelte or
TanStack tutorial will tell you, and the differences are the parts that break.

## Runes, not stores

Svelte 5 runes mode is on for everything outside `node_modules`.

```svelte
let open = $state(false);
const total = $derived(items.length);
let { title, children }: Props = $props();
$effect(() => { /* side effects only */ });
```

Shared state is a class instance with rune fields, exported as a singleton — see
`src/hooks/use-auth.svelte.ts`. The file must be named `*.svelte.ts` for runes to
work outside a component.

## TanStack Svelte Query v6 is runes-based

**No `$` prefix.** v6 returns reactive objects, not stores.

```svelte
const pinQuery = usePin(() => id, () => position); const pin = $derived(pinQuery.data); // correct
const discover = useDiscoverPin(); await discover.mutateAsync({(id, body)}); // correct //
$pinQuery.data — WRONG, fails type checking
```

Query options are a **thunk** so they stay reactive:

```ts
export const useNearbyPins = (getParams: () => NearbyPinsParams | undefined) =>
	createQuery(() => {
		const params = getParams();
		return {
			queryKey: pinKeys.nearby(params),
			queryFn: () => pinService.nearby(params!),
			enabled: !!params
		};
	});
```

Each domain gets `src/api/<domain>/{types,service,queries}.ts` plus a key factory
(`pinKeys`), and mutations invalidate every key their write touches — a discovery
changes the pin list, the profile and both leaderboards.

## Map

- Size the container `h-full w-full`; `maplibre-gl.css` sets `position: relative`,
  so `absolute inset-0` is inert and collapses it to 0 px.
- The shell needs `h-dvh` (definite), and `min-h-0` on every flex ancestor.
- Coordinates are `[lon, lat]`.
- Symbol layers need `'text-font': ['Noto Sans Regular']`.
- Push data with `source.setData()` inside `$effect`, never by recreating layers.

## Layout

Mobile-first is a hard rule, not a preference:

```svelte
style="padding-bottom: var(--safe-bottom)" <!-- clears the home indicator -->
class="min-h-dvh" <!-- never min-h-screen -->
class="touch-target" <!-- 44px minimum -->
```

Colours come from tokens in `src/routes/layout.css` (`bg-surface`,
`text-muted-foreground`, `bg-primary`, `text-gold`). Never hardcode a hex value in
a component — the token set is what makes dark mode work.

## Copy

All user-facing text goes through `t()`. Add the key to `de.ts` first (the
reference catalogue), then `en.ts`; `en.ts` is typed as `Messages` so a missing key
fails `npm run check`. Interpolation is a function per message, so plural rules and
unit formatting stay in the locale file. Never build a sentence by concatenating
translated fragments in a component.

## Never hardcode a distance

Read radii from `useConfig()`. The whole point is that raising
`GEO_REVEAL_RADIUS_M` on the server changes the app without a frontend release.

## Before committing

`npm run check` (zero errors, zero warnings) and `npm run lint`.
Conventional Commits: `feat(map): …`, `fix(auth): …`.
