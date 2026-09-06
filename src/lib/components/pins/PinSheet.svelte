<script lang="ts">
	import { Lock, MapPin, Mountain, Flag, Check, Trash2, PenLine, Navigation } from '@lucide/svelte';
	import { toast } from 'svelte-sonner';
	import { usePin, useDiscoverPin, useDeletePin } from '$api/pins/queries';
	import { useDeleteNote, useRateNote } from '$api/notes/queries';
	import { apiErrorCode, apiErrorMessage } from '$api/errors';
	import { auth } from '$hooks/use-auth.svelte';
	import { roles } from '$hooks/use-roles.svelte';
	import { geolocation } from '$hooks/use-geolocation.svelte';
	import { t } from '$lib/i18n/index.svelte';
	import { formatDate } from '$lib/utils';
	import { walkingDirectionsUrl } from '$lib/utils/navigation';
	import { i18n } from '$lib/i18n/index.svelte';
	import Sheet from '$lib/components/ui/Sheet.svelte';
	import Button from '$lib/components/ui/Button.svelte';
	import Badge from '$lib/components/ui/Badge.svelte';
	import Spinner from '$lib/components/ui/Spinner.svelte';
	import NoteForm from '$lib/components/notes/NoteForm.svelte';
	import StarRating from '$lib/components/notes/StarRating.svelte';

	interface Props {
		pinId: number | null;
		onclose: () => void;
		/** Called with the discovery result so the parent can run the celebration. */
		ondiscovered: (result: { pinName: string; firstBlood: boolean; streak: number }) => void;
	}

	let { pinId, onclose, ondiscovered }: Props = $props();

	let writing = $state(false);

	const position = $derived(
		geolocation.position
			? { lat: geolocation.position.lat, lon: geolocation.position.lon }
			: undefined
	);

	const pinQuery = usePin(
		() => pinId ?? undefined,
		() => position
	);
	const discover = useDiscoverPin();
	const deletePin = useDeletePin();
	const deleteNote = useDeleteNote();
	const rateNote = useRateNote();

	const pin = $derived(pinQuery.data);

	/**
	 * The notes the server was willing to show.
	 *
	 * On a locked pin this is not empty for everyone: the author of a note always
	 * gets their own back, and an admin gets all of them, so a bad note can be read
	 * and deleted without travelling to it. For everyone else a locked pin still
	 * carries nothing to read.
	 */
	const notes = $derived(pin?.notes ?? []);
	const showNotes = $derived(!!pin && (!pin.locked || notes.length > 0));

	async function onDiscover() {
		const fix = geolocation.position;
		if (!pin || !fix) return;
		try {
			const result = await discover.mutateAsync({
				id: pin.id,
				body: { lat: fix.lat, lon: fix.lon, accuracyM: fix.accuracyM }
			});
			if (result.newlyDiscovered) {
				ondiscovered({
					pinName: result.pinName,
					firstBlood: result.firstBlood,
					streak: result.currentStreak
				});
			} else {
				toast.info(t().game.alreadyDiscovered);
			}
		} catch (error) {
			toast.error(messageFor(error));
		}
	}

	async function onDeletePin() {
		if (!pin || !confirm(t().admin.deleteConfirm)) return;
		try {
			await deletePin.mutateAsync(pin.id);
			toast.success(t().admin.deleted);
			onclose();
		} catch (error) {
			toast.error(messageFor(error));
		}
	}

	/**
	 * Rating is offered only when signed in and inside the interaction radius — the
	 * same rule that unlocks the note body. The server enforces it regardless.
	 */
	async function onRate(noteId: number, stars: number) {
		const fix = geolocation.position;
		if (!fix) return;
		try {
			await rateNote.mutateAsync({ id: noteId, body: { stars, lat: fix.lat, lon: fix.lon } });
		} catch (error) {
			toast.error(messageFor(error));
		}
	}

	async function onDeleteNote(noteId: number) {
		if (!confirm(t().note.deleteConfirm)) return;
		try {
			await deleteNote.mutateAsync(noteId);
			toast.success(t().note.deleted);
		} catch (error) {
			toast.error(messageFor(error));
		}
	}

	/** Maps the backend's error codes onto localised copy. */
	function messageFor(error: unknown): string {
		switch (apiErrorCode(error)) {
			case 'TOO_FAR_AWAY':
				return apiErrorMessage(error) ?? t().error.tooFarAway;
			case 'IMPLAUSIBLE_POSITION':
				return t().error.implausible;
			case 'NOT_FOUND':
				return t().error.notFound;
			default:
				return t().error.generic;
		}
	}
</script>

<Sheet open={pinId !== null} {onclose} title={pin?.name}>
	{#if pinQuery.isPending}
		<div class="grid place-items-center py-10"><Spinner class="text-muted-foreground" /></div>
	{:else if pinQuery.isError || !pin}
		<p class="text-muted-foreground py-8 text-center text-sm">{t().error.generic}</p>
	{:else}
		<div class="flex flex-wrap items-center gap-2 pb-3">
			<Badge tone="primary">
				<MapPin class="size-3" />
				{t().pin.categories[pin.category] ?? pin.category}
			</Badge>
			{#if pin.elevationM}
				<Badge>
					<Mountain class="size-3" />
					{t().pin.elevation(pin.elevationM)}
				</Badge>
			{/if}
			{#if pin.distanceM !== null}
				<Badge>{t().pin.distanceAway(pin.distanceM)}</Badge>
			{/if}
			{#if pin.discovered}
				<Badge tone="success"><Check class="size-3" />{t().pin.discovered}</Badge>
			{:else if !pin.discoveredByAnyone}
				<Badge tone="rare"><Flag class="size-3" />{t().pin.beTheFirst}</Badge>
			{/if}
		</div>

		{#if pin.description}
			<p class="text-muted-foreground pb-4 text-sm leading-relaxed">{pin.description}</p>
		{/if}

		<!--
			Offered regardless of distance — a locked pin is exactly the one you need
			directions to. WanderTag hands off rather than navigating itself: a PWA
			cannot keep a route alive with the screen locked, and a maps app has
			better footpath data anyway.
		-->
		<Button
			variant="secondary"
			full
			href={walkingDirectionsUrl(pin.lat, pin.lon, pin.name)}
			target="_blank"
			rel="noopener"
		>
			<Navigation class="size-4" />
			{t().directions.start}
		</Button>

		{#if pin.locked}
			<!-- Locked is the normal state for most pins on screen, so it is explained
			     rather than presented as an error. -->
			<div class="border-border bg-surface-sunken flex items-start gap-3 rounded-lg border p-3">
				<Lock class="text-muted-foreground mt-0.5 size-4 shrink-0" />
				<div class="text-sm">
					<p class="font-medium">{t().pin.locked}</p>
					<p class="text-muted-foreground">
						{pin.noteCount > 0 ? t().pin.notes(pin.noteCount) + ' · ' : ''}{t().note.lockedBody}
					</p>
				</div>
			</div>
		{:else}
			{#if !pin.discovered && auth.isAuthenticated}
				<Button full size="lg" loading={discover.isPending} onclick={onDiscover}>
					<Flag class="size-4" />
					{t().pin.discover}
				</Button>
			{/if}

			{#if !auth.isAuthenticated}
				<div class="border-border bg-surface-sunken rounded-lg border p-3 text-sm">
					<p class="text-muted-foreground pb-2">{t().auth.loginPrompt}</p>
					<Button size="sm" onclick={() => auth.login()}>{t().auth.login}</Button>
				</div>
			{/if}
		{/if}

		{#if showNotes}
			<section class="pt-4">
				<h3 class="pb-2 text-sm font-semibold">
					{pin.locked && !roles.isAdmin
						? t().note.yourNote
						: pin.noteCount > 0
							? t().pin.notes(pin.noteCount)
							: t().pin.noNotes}
				</h3>

				<ul class="flex flex-col gap-2">
					{#each notes as note (note.id)}
						<li class="border-border bg-surface rounded-lg border p-3">
							<div class="flex items-start justify-between gap-2">
								<p class="min-w-0 flex-1 font-medium">{note.title}</p>
								{#if note.authorId === auth.user?.id || roles.isAdmin}
									<button
										class="text-muted-foreground hover:text-danger shrink-0"
										onclick={() => onDeleteNote(note.id)}
										aria-label={t().note.delete}
									>
										<Trash2 class="size-4" />
									</button>
								{/if}
							</div>
							{#if note.body}
								<p class="pt-1 text-sm leading-relaxed whitespace-pre-wrap">{note.body}</p>
							{/if}
							<p class="text-muted-foreground pt-2 text-xs">
								{t().note.by(note.authorName)} · {formatDate(note.createdAt, i18n.locale)} · {t().note.readCount(
									note.readCount
								)}
							</p>

							<div class="pt-2">
								<StarRating
									average={note.rating.average}
									votes={note.rating.votes}
									yours={note.rating.yours}
									pending={rateNote.isPending}
									onrate={auth.isAuthenticated && !pin.locked && !note.locked
										? (stars) => onRate(note.id, stars)
										: undefined}
								/>
							</div>
						</li>
					{/each}
				</ul>

				{#if auth.isAuthenticated && !pin.locked}
					<div class="pt-3">
						{#if writing}
							<NoteForm
								pinId={pin.id}
								oncancel={() => (writing = false)}
								oncreated={() => {
									writing = false;
									toast.success(t().note.created);
								}}
							/>
						{:else}
							<Button variant="secondary" full onclick={() => (writing = true)}>
								<PenLine class="size-4" />
								{t().note.drop}
							</Button>
						{/if}
					</div>
				{/if}
			</section>
		{/if}
	{/if}

	{#if roles.isAdmin}
		<div class="border-border mt-4 border-t pt-3">
			<Button variant="danger" size="sm" loading={deletePin.isPending} onclick={onDeletePin}>
				<Trash2 class="size-4" />
				{t().note.delete}
			</Button>
		</div>
	{/if}
</Sheet>
