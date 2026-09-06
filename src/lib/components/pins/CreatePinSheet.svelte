<script lang="ts">
	import { toast } from 'svelte-sonner';
	import { useCreatePin } from '$api/pins/queries';
	import type { PinCategory } from '$api/types';
	import { t } from '$lib/i18n/index.svelte';
	import Sheet from '$lib/components/ui/Sheet.svelte';
	import Button from '$lib/components/ui/Button.svelte';

	/**
	 * Admin pin placement.
	 *
	 * Opened by a long-press on the map, so the coordinates come from wherever the
	 * admin pressed — no proximity requirement, which is the entire point of the
	 * role. The server re-checks the role on the request.
	 */
	let { coords, onclose }: { coords: { lat: number; lon: number }; onclose: () => void } = $props();

	const CATEGORIES: PinCategory[] = [
		'PEAK',
		'VIEWPOINT',
		'ALPINE_HUT',
		'WILDERNESS_HUT',
		'SHELTER',
		'RUINS',
		'CASTLE',
		'MONUMENT',
		'MEMORIAL',
		'SPRING',
		'WATERFALL',
		'CAVE',
		'OBSERVATION_TOWER',
		'DRINKING_WATER',
		'OTHER'
	];

	let name = $state('');
	let description = $state('');
	let category = $state<PinCategory>('OTHER');
	let featured = $state(false);

	const create = useCreatePin();

	async function onSubmit(event: SubmitEvent) {
		event.preventDefault();
		try {
			await create.mutateAsync({
				name: name.trim(),
				description: description.trim() || null,
				category,
				lat: coords.lat,
				lon: coords.lon,
				featured
			});
			toast.success(t().admin.created);
			onclose();
		} catch {
			toast.error(t().error.generic);
		}
	}
</script>

<Sheet open {onclose} title={t().admin.createPin}>
	<form class="flex flex-col gap-3" onsubmit={onSubmit}>
		<p class="text-muted-foreground text-xs tabular-nums">
			{coords.lat.toFixed(5)}, {coords.lon.toFixed(5)}
		</p>

		<label class="flex flex-col gap-1">
			<span class="text-sm font-medium">{t().admin.name}</span>
			<input
				bind:value={name}
				required
				maxlength={255}
				class="border-border bg-surface focus:border-primary min-h-11 rounded-lg border px-3 text-base focus:outline-none"
			/>
		</label>

		<label class="flex flex-col gap-1">
			<span class="text-sm font-medium">{t().admin.category}</span>
			<select
				bind:value={category}
				class="border-border bg-surface focus:border-primary min-h-11 rounded-lg border px-3 text-base focus:outline-none"
			>
				{#each CATEGORIES as value (value)}
					<option {value}>{t().pin.categories[value]}</option>
				{/each}
			</select>
		</label>

		<label class="flex flex-col gap-1">
			<span class="text-sm font-medium">{t().admin.description}</span>
			<textarea
				bind:value={description}
				rows="3"
				class="border-border bg-surface focus:border-primary resize-none rounded-lg border px-3 py-2 text-base focus:outline-none"
			></textarea>
		</label>

		<label class="flex items-center gap-2 py-1">
			<input type="checkbox" bind:checked={featured} class="size-4 accent-[--primary]" />
			<span class="text-sm">{t().admin.featured}</span>
		</label>

		<div class="flex gap-2">
			<Button type="submit" full loading={create.isPending} disabled={!name.trim()}>
				{t().admin.save}
			</Button>
			<Button type="button" variant="ghost" onclick={onclose}>{t().note.cancel}</Button>
		</div>
	</form>
</Sheet>
