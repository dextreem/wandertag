<script lang="ts">
	import { toast } from 'svelte-sonner';
	import { useCreateNote } from '$api/notes/queries';
	import { apiErrorCode, apiErrorMessage } from '$api/errors';
	import { geolocation } from '$hooks/use-geolocation.svelte';
	import { t } from '$lib/i18n/index.svelte';
	import Button from '$lib/components/ui/Button.svelte';

	interface Props {
		/**
		 * The pin this note joins. Null means there is no place here yet, so dropping
		 * the note creates one — a note never exists without a pin, and the form
		 * therefore asks for a place name in that case.
		 */
		pinId?: number | null;
		oncancel: () => void;
		oncreated: () => void;
	}

	let { pinId = null, oncancel, oncreated }: Props = $props();

	const BODY_MAX = 500;
	const TITLE_MAX = 120;
	const PIN_NAME_MAX = 255;

	let title = $state('');
	let body = $state('');
	let pinName = $state('');

	/** True when this drop will create the place, rather than join an existing one. */
	const creatingPlace = $derived(pinId === null);

	const create = useCreateNote();

	const charsLeft = $derived(BODY_MAX - body.length);
	const canSubmit = $derived(
		title.trim().length > 0 && !!geolocation.position && !create.isPending
	);

	async function onSubmit(event: SubmitEvent) {
		event.preventDefault();
		const fix = geolocation.position;
		if (!fix) return;

		try {
			await create.mutateAsync({
				title: title.trim(),
				body: body.trim() || null,
				pinId,
				pinName: creatingPlace ? pinName.trim() || null : null,
				// The note is anchored at the reported position; the server re-validates
				// it against the pin and the anti-cheat ledger before accepting.
				lat: fix.lat,
				lon: fix.lon,
				accuracyM: fix.accuracyM
			});
			title = '';
			body = '';
			pinName = '';
			oncreated();
		} catch (error) {
			toast.error(
				apiErrorCode(error) === 'TOO_FAR_AWAY'
					? (apiErrorMessage(error) ?? t().error.tooFarAway)
					: (apiErrorMessage(error) ?? t().error.generic)
			);
		}
	}
</script>

<form class="flex flex-col gap-3" onsubmit={onSubmit}>
	{#if creatingPlace}
		<label class="flex flex-col gap-1">
			<span class="text-sm font-medium">{t().note.placeName}</span>
			<input
				bind:value={pinName}
				maxlength={PIN_NAME_MAX}
				placeholder={t().note.placeNamePlaceholder}
				class="border-border bg-surface placeholder:text-muted-foreground focus:border-primary min-h-11 rounded-lg border
				       px-3 text-base focus:outline-none"
			/>
			<span class="text-muted-foreground text-xs">{t().note.placeNameHint}</span>
		</label>
	{/if}

	<label class="flex flex-col gap-1">
		<span class="text-sm font-medium">{t().note.title}</span>
		<input
			bind:value={title}
			maxlength={TITLE_MAX}
			required
			placeholder={t().note.titlePlaceholder}
			class="border-border bg-surface placeholder:text-muted-foreground focus:border-primary min-h-11 rounded-lg border
			       px-3 text-base focus:outline-none"
		/>
	</label>

	<label class="flex flex-col gap-1">
		<span class="text-sm font-medium">{t().note.body}</span>
		<textarea
			bind:value={body}
			maxlength={BODY_MAX}
			rows="4"
			placeholder={t().note.bodyPlaceholder}
			class="border-border bg-surface placeholder:text-muted-foreground focus:border-primary resize-none rounded-lg border px-3
			       py-2 text-base focus:outline-none"
		></textarea>
		<span class="text-muted-foreground self-end text-xs">{t().note.charsLeft(charsLeft)}</span>
	</label>

	<div class="flex gap-2">
		<Button type="submit" full loading={create.isPending} disabled={!canSubmit}>
			{t().note.submit}
		</Button>
		<Button type="button" variant="ghost" onclick={oncancel}>{t().note.cancel}</Button>
	</div>
</form>
