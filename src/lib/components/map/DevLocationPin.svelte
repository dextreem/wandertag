<script lang="ts">
	import { Crosshair } from '@lucide/svelte';
	import { geolocation } from '$hooks/use-geolocation.svelte';
	import { t } from '$lib/i18n/index.svelte';
	import Sheet from '$lib/components/ui/Sheet.svelte';
	import Button from '$lib/components/ui/Button.svelte';

	/**
	 * Development-only control for pinning your position by hand.
	 *
	 * A desktop browser has no GPS and falls back to a network lookup that is often
	 * unavailable — Brave notably does not use Google's location service — so on a
	 * laptop the app can otherwise never get a fix, and every proximity-gated
	 * feature is unreachable.
	 *
	 * Rendered only when `import.meta.env.DEV` is true, so it never reaches a
	 * production build. It is not a security boundary either way: the server already
	 * treats client coordinates as untrusted and runs its own proximity and
	 * plausibility checks.
	 */
	interface Props {
		/** Current map centre, offered as a one-tap way to pin a spot. */
		mapCentre?: { lat: number; lon: number } | null;
		/**
		 * `floating` sits on the map. `inline` is a normal button, for the
		 * location-denied empty state — which replaces the map entirely, so the
		 * floating control would be unreachable exactly when it is needed most.
		 */
		variant?: 'floating' | 'inline';
	}

	let { mapCentre = null, variant = 'floating' }: Props = $props();

	let open = $state(false);
	let lat = $state('');
	let lon = $state('');
	let error = $state<string | null>(null);

	const active = $derived(geolocation.override !== null);

	function openSheet() {
		const current = geolocation.override ?? geolocation.position ?? mapCentre;
		lat = current ? String(current.lat.toFixed(6)) : '';
		lon = current ? String(current.lon.toFixed(6)) : '';
		error = null;
		open = true;
	}

	function apply(event?: SubmitEvent) {
		event?.preventDefault();
		const parsedLat = Number.parseFloat(lat.replace(',', '.'));
		const parsedLon = Number.parseFloat(lon.replace(',', '.'));

		if (!Number.isFinite(parsedLat) || parsedLat < -90 || parsedLat > 90) {
			error = t().dev.badLat;
			return;
		}
		if (!Number.isFinite(parsedLon) || parsedLon < -180 || parsedLon > 180) {
			error = t().dev.badLon;
			return;
		}

		geolocation.setOverride(parsedLat, parsedLon);
		open = false;
	}

	function useMapCentre() {
		if (!mapCentre) return;
		lat = mapCentre.lat.toFixed(6);
		lon = mapCentre.lon.toFixed(6);
		error = null;
	}
</script>

{#if variant === 'floating'}
	<button
		class="bg-surface absolute z-10 grid size-11 place-items-center rounded-full shadow-lg
		       {active ? 'text-rare' : 'text-muted-foreground'}"
		style="bottom: calc(0.75rem + var(--bottom-nav-height)); right: 4.25rem"
		onclick={openSheet}
		aria-label={t().dev.setLocation}
		aria-pressed={active}
		title={t().dev.setLocation}
	>
		<Crosshair class="size-5" />
	</button>
{:else}
	<Button variant="secondary" onclick={openSheet}>
		<Crosshair class="size-4" />
		{t().dev.setLocation}
	</Button>
{/if}

<Sheet {open} onclose={() => (open = false)} title={t().dev.setLocation}>
	<form class="flex flex-col gap-3" onsubmit={apply}>
		<p class="text-muted-foreground text-sm">{t().dev.explainer}</p>

		<div class="grid grid-cols-2 gap-2">
			<label class="flex flex-col gap-1">
				<span class="text-sm font-medium">{t().dev.lat}</span>
				<input
					bind:value={lat}
					inputmode="decimal"
					placeholder="49.191788"
					class="border-border-strong bg-surface focus:border-primary min-h-11 rounded-lg border px-3 text-base focus:outline-none"
				/>
			</label>
			<label class="flex flex-col gap-1">
				<span class="text-sm font-medium">{t().dev.lon}</span>
				<input
					bind:value={lon}
					inputmode="decimal"
					placeholder="7.141897"
					class="border-border-strong bg-surface focus:border-primary min-h-11 rounded-lg border px-3 text-base focus:outline-none"
				/>
			</label>
		</div>

		{#if error}
			<p class="text-danger text-sm">{error}</p>
		{/if}

		{#if mapCentre}
			<Button type="button" variant="secondary" onclick={useMapCentre}>
				{t().dev.useMapCentre}
			</Button>
		{/if}

		<Button type="submit" full>{t().dev.apply}</Button>

		{#if active}
			<Button
				type="button"
				variant="ghost"
				onclick={() => {
					geolocation.clearOverride();
					open = false;
				}}
			>
				{t().dev.clear}
			</Button>
		{/if}
	</form>
</Sheet>
