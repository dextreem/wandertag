<script lang="ts">
	import { Lock, Trash2, Navigation } from '@lucide/svelte';
	import { toast } from 'svelte-sonner';
	import { useNote, useDeleteNote, useRateNote } from '$api/notes/queries';
	import { auth } from '$hooks/use-auth.svelte';
	import { roles } from '$hooks/use-roles.svelte';
	import { geolocation } from '$hooks/use-geolocation.svelte';
	import { t, i18n } from '$lib/i18n/index.svelte';
	import { formatDate } from '$lib/utils';
	import { walkingDirectionsUrl } from '$lib/utils/navigation';
	import Sheet from '$lib/components/ui/Sheet.svelte';
	import Button from '$lib/components/ui/Button.svelte';
	import Badge from '$lib/components/ui/Badge.svelte';
	import StarRating from '$lib/components/notes/StarRating.svelte';
	import Spinner from '$lib/components/ui/Spinner.svelte';

	let { noteId, onclose }: { noteId: number | null; onclose: () => void } = $props();

	const position = $derived(
		geolocation.position
			? { lat: geolocation.position.lat, lon: geolocation.position.lon }
			: undefined
	);

	const noteQuery = useNote(
		() => noteId ?? undefined,
		() => position
	);
	const deleteNote = useDeleteNote();
	const rateNote = useRateNote();

	const note = $derived(noteQuery.data);

	async function onRate(stars: number) {
		const fix = geolocation.position;
		if (!note || !fix) return;
		try {
			await rateNote.mutateAsync({ id: note.id, body: { stars, lat: fix.lat, lon: fix.lon } });
		} catch {
			toast.error(t().error.generic);
		}
	}

	async function onDelete() {
		if (!note || !confirm(t().note.deleteConfirm)) return;
		try {
			await deleteNote.mutateAsync(note.id);
			toast.success(t().note.deleted);
			onclose();
		} catch {
			toast.error(t().error.generic);
		}
	}
</script>

<Sheet open={noteId !== null} {onclose} title={note?.title}>
	{#if noteQuery.isPending}
		<div class="grid place-items-center py-10"><Spinner class="text-muted-foreground" /></div>
	{:else if noteQuery.isError || !note}
		<p class="text-muted-foreground py-8 text-center text-sm">{t().error.generic}</p>
	{:else}
		<div class="flex flex-wrap items-center gap-2 pb-3">
			<Badge>{t().note.by(note.authorName)}</Badge>
			<Badge>{formatDate(note.createdAt, i18n.locale)}</Badge>
			{#if note.distanceM !== null}
				<Badge>{t().pin.distanceAway(note.distanceM)}</Badge>
			{/if}
		</div>

		{#if note.locked}
			<div class="border-border bg-surface-sunken flex items-start gap-3 rounded-lg border p-3">
				<Lock class="text-muted-foreground mt-0.5 size-4 shrink-0" />
				<div class="text-sm">
					<p class="text-muted-foreground">{t().note.lockedBody}</p>
					<!-- The aggregate is shown from afar; rating still needs proximity. -->
					<div class="pt-2">
						<StarRating
							average={note.rating.average}
							votes={note.rating.votes}
							yours={note.rating.yours}
						/>
					</div>
				</div>
			</div>
		{:else}
			{#if note.body}
				<p class="text-[15px] leading-relaxed whitespace-pre-wrap">{note.body}</p>
			{/if}
			<p class="text-muted-foreground pt-3 text-xs">{t().note.readCount(note.readCount)}</p>

			<div class="pt-3">
				<StarRating
					average={note.rating.average}
					votes={note.rating.votes}
					yours={note.rating.yours}
					pending={rateNote.isPending}
					onrate={auth.isAuthenticated ? onRate : undefined}
				/>
			</div>
		{/if}

		<div class="pt-4">
			<Button
				variant="secondary"
				full
				href={walkingDirectionsUrl(note.lat, note.lon, note.title)}
				target="_blank"
				rel="noopener"
			>
				<Navigation class="size-4" />
				{t().directions.start}
			</Button>
		</div>

		{#if auth.isAuthenticated && (note.authorId === auth.user?.id || roles.isAdmin)}
			<div class="border-border mt-4 border-t pt-3">
				<Button variant="danger" size="sm" loading={deleteNote.isPending} onclick={onDelete}>
					<Trash2 class="size-4" />
					{t().note.delete}
				</Button>
			</div>
		{/if}
	{/if}
</Sheet>
