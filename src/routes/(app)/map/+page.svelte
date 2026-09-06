<script lang="ts">
	import { PenLine, MapPinOff, Navigation } from '@lucide/svelte';
	import { toast } from 'svelte-sonner';
	import { useConfig } from '$api/config/queries';
	import { useNearbyPins } from '$api/pins/queries';
	import { useFriendPositions } from '$api/friends/queries';
	import { auth } from '$hooks/use-auth.svelte';
	import { roles } from '$hooks/use-roles.svelte';
	import { geolocation } from '$hooks/use-geolocation.svelte';
	import { t } from '$lib/i18n/index.svelte';
	import MapView from '$lib/components/map/MapView.svelte';
	import DevLocationPin from '$lib/components/map/DevLocationPin.svelte';
	import MapLegend from '$lib/components/map/MapLegend.svelte';
	import NearbyList from '$lib/components/pins/NearbyList.svelte';
	import PinSheet from '$lib/components/pins/PinSheet.svelte';
	import CreatePinSheet from '$lib/components/pins/CreatePinSheet.svelte';
	import DiscoveryCelebration from '$lib/components/gamification/DiscoveryCelebration.svelte';
	import Sheet from '$lib/components/ui/Sheet.svelte';
	import NoteForm from '$lib/components/notes/NoteForm.svelte';
	import Button from '$lib/components/ui/Button.svelte';
	import Spinner from '$lib/components/ui/Spinner.svelte';
	import EmptyState from '$lib/components/ui/EmptyState.svelte';

	const configQuery = useConfig();

	let openPinId = $state<number | null>(null);
	let droppingNote = $state(false);
	let newPinCoords = $state<{ lat: number; lon: number } | null>(null);
	let celebration = $state<{ pinName: string; firstBlood: boolean; streak: number } | null>(null);

	/**
	 * The radius the map is currently asking for.
	 *
	 * Seeded from the server's configured reveal radius and then driven by the
	 * viewport, which is how zooming out becomes the radius control for rural
	 * areas. The server clamps it, so this can be optimistic.
	 */
	let viewportRadiusM = $state<number | null>(null);
	let viewportCentre = $state<{ lat: number; lon: number } | null>(null);

	const config = $derived(configQuery.data);

	/**
	 * Query anchor — two positions, and keeping them apart matters.
	 *
	 * `lat`/`lon` is always the user's own GPS fix, because the server measures
	 * distances and the `locked` flag from it. Sending the map centre here instead
	 * (as this once did) made panning rewrite every distance in the list and could
	 * report a pin 11 m away as 600 m and locked, hiding the discover button.
	 *
	 * `areaLat`/`areaLon` is the map centre, so panning still searches where you are
	 * looking. Both go out at full precision — the query *key* rounds them, which is
	 * what keeps GPS jitter from refetching on every frame.
	 *
	 * With no fix yet the viewport stands in for both, so an anonymous visitor or a
	 * device still acquiring GPS sees something rather than nothing.
	 */
	const queryParams = $derived.by(() => {
		const fix = geolocation.position;
		const centre = viewportCentre;
		if (!config) return undefined;

		const origin = fix ? { lat: fix.lat, lon: fix.lon } : centre;
		if (!origin) return undefined;

		return {
			lat: origin.lat,
			lon: origin.lon,
			...(centre ? { areaLat: centre.lat, areaLon: centre.lon } : {}),
			radiusM: Math.max(viewportRadiusM ?? config.geo.revealRadiusM, config.geo.revealRadiusM)
		};
	});

	const pinsQuery = useNearbyPins(() => queryParams);
	// Only friends who have opted in come back here; the endpoint filters server-side.
	const friendsQuery = useFriendPositions(() => auth.isAuthenticated);

	const pins = $derived(pinsQuery.data?.pins ?? []);
	// Pins alone answer this now: a note always sits on one, so there is nothing a
	// separate notes query could add to "is there anything here?".
	const nothingNearby = $derived(pinsQuery.isSuccess && pins.length === 0);

	function onViewportChange(centre: { lat: number; lon: number }, radiusM: number) {
		viewportCentre = centre;
		viewportRadiusM = radiusM;
	}

	function onLongPress(coords: { lat: number; lon: number }) {
		if (!roles.isAdmin) return;
		newPinCoords = coords;
	}

	function onDropNote() {
		if (!geolocation.position) {
			toast.error(t().map.locating);
			return;
		}
		droppingNote = true;
	}
</script>

<svelte:head><title>{t().nav.map} · WanderTag</title></svelte:head>

{#if geolocation.status === 'denied' || geolocation.status === 'unavailable'}
	<!-- Without a position the app has no way to work, so this is a full stop
	     rather than a dismissible banner. -->
	<EmptyState
		title={geolocation.status === 'denied' ? t().map.locationDenied : t().map.locationUnavailable}
		description={import.meta.env.DEV
			? t().dev.explainer
			: t().map.interactRadius(config?.geo.interactRadiusM ?? 50)}
	>
		{#snippet icon()}<MapPinOff class="size-10" />{/snippet}
		{#snippet action()}
			<div class="flex flex-col items-center gap-2">
				<Button onclick={() => geolocation.start()}>
					<Navigation class="size-4" />
					{t().map.enableLocation}
				</Button>
				{#if import.meta.env.DEV}
					<DevLocationPin variant="inline" />
				{/if}
			</div>
		{/snippet}
	</EmptyState>
{:else if !config}
	<div class="grid flex-1 place-items-center"><Spinner class="text-muted-foreground" /></div>
{:else}
	<!--
		Desktop splits into a nearest-first sidebar plus the map, the same shape
		dropnote used. On mobile the sidebar is hidden — the List tab is that view,
		and a phone has no width to spare beside a map.
	-->
	<div class="flex min-h-0 flex-1">
		<aside class="border-border bg-surface hidden w-80 shrink-0 flex-col border-r md:flex lg:w-96">
			<div class="border-border shrink-0 border-b p-3">
				{#if auth.isAuthenticated}
					<Button full onclick={onDropNote}>
						<PenLine class="size-4" />
						{t().note.drop}
					</Button>
				{:else}
					<Button full onclick={() => auth.login()}>{t().auth.login}</Button>
				{/if}
			</div>

			<div class="min-h-0 flex-1 overflow-y-auto">
				{#if pinsQuery.isPending}
					<div class="grid place-items-center py-10"><Spinner class="text-muted-foreground" /></div>
				{:else if pins.length === 0}
					<p class="text-muted-foreground px-4 py-8 text-center text-sm">
						{t().map.nothingNearby}
					</p>
				{:else}
					<NearbyList {pins} selectedId={openPinId} onselect={(id) => (openPinId = id)} />
				{/if}
			</div>

			<p class="border-border text-muted-foreground shrink-0 border-t px-4 py-2 text-xs">
				{t().map.revealRadius(pinsQuery.data?.appliedRadiusM ?? config.geo.revealRadiusM)}
			</p>
		</aside>

		<div class="relative flex min-h-0 flex-1 flex-col">
			<MapView
				styleUrl={config.map.styleUrl}
				attribution={config.map.attribution}
				{pins}
				interactRadiusM={config.geo.interactRadiusM}
				friends={friendsQuery.data ?? []}
				onPinClick={(id) => (openPinId = id)}
				{onViewportChange}
				onLongPress={roles.isAdmin ? onLongPress : undefined}
			/>

			{#if geolocation.status === 'requesting' && !geolocation.position}
				<div
					class="pointer-events-none absolute inset-x-0 z-10 flex justify-center"
					style="top: calc(0.75rem + var(--safe-top))"
				>
					<span
						class="bg-surface inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-sm shadow-lg"
					>
						<Spinner class="text-primary size-3.5" />
						{t().map.locating}
					</span>
				</div>
			{/if}

			{#if nothingNearby}
				<div class="pointer-events-none absolute inset-x-0 bottom-20 z-10 flex justify-center px-6">
					<p class="bg-surface rounded-full px-4 py-2 text-center text-sm shadow-lg">
						{t().map.nothingNearby}
					</p>
				</div>
			{/if}

			<MapLegend />

			{#if import.meta.env.DEV}
				<DevLocationPin mapCentre={viewportCentre} />
			{/if}

			{#if auth.isAuthenticated}
				<!-- Primary action, thumb-reachable on mobile and clear of the tab bar.
				     Hidden on desktop, where the sidebar carries the same button. -->
				<button
					class="bg-primary text-primary-foreground absolute right-4 z-20 grid size-14 place-items-center rounded-full shadow-xl active:brightness-95 md:hidden"
					style="bottom: calc(1rem + var(--bottom-nav-height))"
					onclick={onDropNote}
					aria-label={t().note.drop}
				>
					<PenLine class="size-6" />
				</button>
			{/if}
		</div>
	</div>
{/if}

<PinSheet
	pinId={openPinId}
	onclose={() => (openPinId = null)}
	ondiscovered={(result) => {
		celebration = result;
		openPinId = null;
	}}
/>

<Sheet open={droppingNote} onclose={() => (droppingNote = false)} title={t().note.drop}>
	<NoteForm
		oncancel={() => (droppingNote = false)}
		oncreated={() => {
			droppingNote = false;
			toast.success(t().note.created);
		}}
	/>
</Sheet>

{#if newPinCoords}
	<CreatePinSheet coords={newPinCoords} onclose={() => (newPinCoords = null)} />
{/if}

{#if celebration}
	<DiscoveryCelebration {...celebration} onclose={() => (celebration = null)} />
{/if}
