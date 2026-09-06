<script lang="ts">
	import { Lock, MapPin, StickyNote } from '@lucide/svelte';
	import { useConfig } from '$api/config/queries';
	import { useNearbyPins } from '$api/pins/queries';
	import { useNearbyNotes } from '$api/notes/queries';
	import { geolocation } from '$hooks/use-geolocation.svelte';
	import { t, i18n } from '$lib/i18n/index.svelte';
	import { formatDistance, formatDate, cn } from '$lib/utils';
	import AppHeader from '$lib/components/ui/AppHeader.svelte';
	import NearbyList from '$lib/components/pins/NearbyList.svelte';
	import PinSheet from '$lib/components/pins/PinSheet.svelte';
	import NoteSheet from '$lib/components/notes/NoteSheet.svelte';
	import DiscoveryCelebration from '$lib/components/gamification/DiscoveryCelebration.svelte';
	import Spinner from '$lib/components/ui/Spinner.svelte';
	import EmptyState from '$lib/components/ui/EmptyState.svelte';

	/**
	 * The list view exists because a map is a poor way to answer "what is closest?".
	 * Sorted strictly by distance, it is the view you use while deciding where to
	 * walk next.
	 */
	const configQuery = useConfig();
	const config = $derived(configQuery.data);

	let openPinId = $state<number | null>(null);
	let openNoteId = $state<number | null>(null);
	let celebration = $state<{ pinName: string; firstBlood: boolean; streak: number } | null>(null);
	let tab = $state<'pins' | 'notes'>('pins');

	/**
	 * The list asks for the widest radius the server will honour, not the reveal
	 * radius.
	 *
	 * It used to use `revealRadiusM` (1 km) while the map used the viewport, so
	 * anything between the two — a note 2.8 km away, say — was visible on the map
	 * and missing from the list, which reads as the list being broken. The list is
	 * "what is nearest to me", so it should show everything the server is willing to
	 * return, ordered by distance, with the applied radius stated at the bottom.
	 */
	const queryParams = $derived.by(() => {
		const fix = geolocation.position;
		if (!fix || !config) return undefined;
		// Precise: the query key does the rounding, so a 50 m gate stays meaningful.
		return { lat: fix.lat, lon: fix.lon, radiusM: config.geo.maxRevealRadiusM };
	});

	const pinsQuery = useNearbyPins(() => queryParams);
	const notesQuery = useNearbyNotes(() => queryParams);

	const pins = $derived(pinsQuery.data?.pins ?? []);
	/**
	 * Every note nearby, unfiltered.
	 *
	 * This used to keep only notes with no pin, from when a note could stand alone.
	 * Now that a note always belongs to a pin, that predicate matched nothing and the
	 * tab was permanently empty — which is exactly how the user found it.
	 */
	const notes = $derived(notesQuery.data?.notes ?? []);
	const appliedRadiusM = $derived(
		tab === 'pins' ? pinsQuery.data?.appliedRadiusM : notesQuery.data?.appliedRadiusM
	);
</script>

<svelte:head><title>{t().nav.list} · WanderTag</title></svelte:head>

<!-- Full-bleed on a phone; a centred, capped column on desktop, where a list
     stretched across a monitor is unreadable. -->
<div class="mx-auto flex min-h-0 w-full max-w-3xl flex-1 flex-col">
	<AppHeader title={t().nav.list} />

	<div class="border-border flex shrink-0 gap-1 border-b px-4 py-2">
		{#each [['pins', t().nav.places], ['notes', t().game.notesDropped]] as const as [value, label] (value)}
			<button
				class={cn(
					'rounded-full px-3 py-1.5 text-sm font-medium transition-colors',
					tab === value ? 'bg-primary-subtle text-primary' : 'text-muted-foreground'
				)}
				onclick={() => (tab = value)}
			>
				{label}
			</button>
		{/each}
	</div>

	<div class="min-h-0 flex-1 overflow-y-auto">
		{#if !geolocation.position}
			<div class="text-muted-foreground flex flex-col items-center gap-2 py-16 text-sm">
				<Spinner class="text-muted-foreground" />
				{t().map.locating}
			</div>
		{:else if tab === 'pins'}
			{#if pinsQuery.isPending}
				<div class="grid place-items-center py-16"><Spinner class="text-muted-foreground" /></div>
			{:else if pins.length === 0}
				<EmptyState title={t().map.nothingNearby}>
					{#snippet icon()}<MapPin class="size-10" />{/snippet}
				</EmptyState>
			{:else}
				<NearbyList {pins} selectedId={openPinId} onselect={(id) => (openPinId = id)} />
			{/if}
		{:else if notesQuery.isPending}
			<div class="grid place-items-center py-16"><Spinner class="text-muted-foreground" /></div>
		{:else if notes.length === 0}
			<EmptyState title={t().note.emptyNearby}>
				{#snippet icon()}<StickyNote class="size-10" />{/snippet}
			</EmptyState>
		{:else}
			<ul class="divide-border divide-y">
				{#each notes as note (note.id)}
					<li>
						<button
							class="hover:bg-surface-sunken flex w-full items-center gap-3 px-4 py-3 text-left transition-colors"
							onclick={() => (openNoteId = note.id)}
						>
							<div class="min-w-0 flex-1">
								<p class="truncate font-medium">{note.title}</p>
								<p class="text-muted-foreground pt-0.5 text-xs">
									{t().note.by(note.authorName)} · {formatDate(note.createdAt, i18n.locale)}
								</p>
							</div>
							<div class="flex shrink-0 items-center gap-2">
								{#if note.locked}<Lock class="text-muted-foreground size-3.5" />{/if}
								<span class="text-sm font-medium tabular-nums">
									{note.distanceM !== null ? formatDistance(note.distanceM, i18n.locale) : ''}
								</span>
							</div>
						</button>
					</li>
				{/each}
			</ul>
		{/if}
	</div>

	{#if geolocation.position && appliedRadiusM}
		<p class="text-muted-foreground border-border shrink-0 border-t px-4 py-2 text-xs">
			{t().map.revealRadius(appliedRadiusM)}
		</p>
	{/if}
</div>

<PinSheet
	pinId={openPinId}
	onclose={() => (openPinId = null)}
	ondiscovered={(result) => {
		celebration = result;
		openPinId = null;
	}}
/>
<NoteSheet noteId={openNoteId} onclose={() => (openNoteId = null)} />
{#if celebration}
	<DiscoveryCelebration {...celebration} onclose={() => (celebration = null)} />
{/if}
