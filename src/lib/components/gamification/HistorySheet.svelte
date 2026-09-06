<script lang="ts">
	import { Flag, MapPin, StickyNote } from '@lucide/svelte';
	import { useMyDiscoveries, useMyNotes } from '$api/me/queries';
	import { t, i18n } from '$lib/i18n/index.svelte';
	import { formatDate, formatDistance } from '$lib/utils';
	import Sheet from '$lib/components/ui/Sheet.svelte';
	import Badge from '$lib/components/ui/Badge.svelte';
	import Spinner from '$lib/components/ui/Spinner.svelte';
	import EmptyState from '$lib/components/ui/EmptyState.svelte';
	import SearchBar from '$lib/components/ui/SearchBar.svelte';
	import Pager from '$lib/components/ui/Pager.svelte';
	import StarRating from '$lib/components/notes/StarRating.svelte';

	/**
	 * The list behind a profile stat tile.
	 *
	 * Each number on the profile is a claim about your history; this is the evidence
	 * for it, searchable and paged because a heavy user's history is long. The kind
	 * decides which endpoint is asked and, for first bloods, applies the same filter
	 * server-side so the list length matches the tile exactly.
	 */
	export type HistoryKind = 'discoveries' | 'firstBloods' | 'notes';

	interface Props {
		kind: HistoryKind | null;
		onclose: () => void;
	}

	let { kind, onclose }: Props = $props();

	let query = $state('');
	let page = $state(0);

	// Reopening on a different tile starts fresh rather than inheriting a filter.
	$effect(() => {
		if (kind) {
			query = '';
			page = 0;
		}
	});

	const discoveryParams = $derived(
		kind === 'discoveries' || kind === 'firstBloods'
			? { query: query || undefined, firstBloodOnly: kind === 'firstBloods', page, size: 20 }
			: undefined
	);
	const noteParams = $derived(
		kind === 'notes' ? { query: query || undefined, page, size: 20 } : undefined
	);

	const discoveriesQuery = useMyDiscoveries(() => discoveryParams);
	const notesQuery = useMyNotes(() => noteParams);

	const result = $derived(kind === 'notes' ? notesQuery.data : discoveriesQuery.data);
	const pending = $derived(kind === 'notes' ? notesQuery.isPending : discoveriesQuery.isPending);

	const title = $derived(
		kind === 'notes'
			? t().game.notesDropped
			: kind === 'firstBloods'
				? t().game.firstBloods
				: t().game.pinsUncovered
	);
</script>

<Sheet open={kind !== null} {onclose} {title}>
	<div class="flex flex-col gap-3">
		<SearchBar
			onchange={(value) => {
				query = value;
				page = 0;
			}}
		/>

		{#if pending}
			<div class="grid place-items-center py-10"><Spinner class="text-muted-foreground" /></div>
		{:else if !result || result.items.length === 0}
			<EmptyState title={t().paging.none}>
				{#snippet icon()}
					{#if kind === 'notes'}<StickyNote class="size-10" />{:else}<MapPin class="size-10" />{/if}
				{/snippet}
			</EmptyState>
		{:else if kind === 'notes'}
			<ul class="divide-border divide-y">
				{#each notesQuery.data?.items ?? [] as note (note.id)}
					<li class="flex flex-col gap-1 py-3">
						<p class="font-medium">{note.title}</p>
						{#if note.body}
							<p class="text-muted-foreground text-sm leading-relaxed">{note.body}</p>
						{/if}
						<p class="text-muted-foreground text-xs">
							{formatDate(note.createdAt, i18n.locale)} · {t().note.readCount(note.readCount)}
						</p>
						<StarRating
							average={note.rating.average}
							votes={note.rating.votes}
							yours={note.rating.yours}
						/>
					</li>
				{/each}
			</ul>
		{:else}
			<ul class="divide-border divide-y">
				{#each discoveriesQuery.data?.items ?? [] as row (row.id)}
					<li class="flex items-center gap-3 py-3">
						<div class="min-w-0 flex-1">
							<p class="truncate font-medium">{row.pinName}</p>
							<p class="text-muted-foreground flex items-center gap-2 pt-0.5 text-xs">
								<span>{t().pin.categories[row.category] ?? row.category}</span>
								<span>· {formatDistance(row.distanceM, i18n.locale)}</span>
								<span>· {formatDate(row.discoveredAt, i18n.locale)}</span>
							</p>
						</div>
						{#if row.firstBlood}
							<Badge tone="rare"><Flag class="size-3" /></Badge>
						{/if}
					</li>
				{/each}
			</ul>
		{/if}
	</div>

	{#if result}
		<Pager
			page={result.page}
			totalPages={result.totalPages}
			totalItems={result.totalItems}
			onpage={(next) => (page = next)}
		/>
	{/if}
</Sheet>
