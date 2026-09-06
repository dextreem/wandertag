<script lang="ts">
	import { MapPin, Star, EyeOff, Eye, Trash2 } from '@lucide/svelte';
	import { toast } from 'svelte-sonner';
	import { useAdminPins } from '$api/admin/queries';
	import { useUpdatePin, useDeletePin } from '$api/pins/queries';
	import type { PinCategory, PinSource } from '$api/types';
	import { t } from '$lib/i18n/index.svelte';
	import { cn } from '$lib/utils';
	import Badge from '$lib/components/ui/Badge.svelte';
	import Spinner from '$lib/components/ui/Spinner.svelte';
	import EmptyState from '$lib/components/ui/EmptyState.svelte';
	import SearchBar from '$lib/components/ui/SearchBar.svelte';
	import PinSheet from '$lib/components/pins/PinSheet.svelte';
	import Pager from '$lib/components/ui/Pager.svelte';

	/**
	 * Pin management over the whole dataset.
	 *
	 * The previous version listed whatever was within 25 km of the admin, which is
	 * unusable against ~14k pins — you cannot moderate what you cannot find. Search
	 * and filters run server-side; the pager is prev/next because 4,600 numbered
	 * pages would be decoration.
	 */
	let { enabled }: { enabled: boolean } = $props();

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

	let query = $state('');
	let category = $state<PinCategory | ''>('');
	let source = $state<PinSource | ''>('');
	let hiddenOnly = $state(false);
	let page = $state(0);
	/**
	 * The pin opened from a row. Moderating means reading what is on a pin, so the
	 * rows lead into the same sheet the map uses — an admin gets every note back
	 * regardless of distance, which is what makes this usable from a desk.
	 */
	let openPinId = $state<number | null>(null);

	const params = $derived(
		enabled
			? {
					query: query || undefined,
					category: category || undefined,
					source: source || undefined,
					hidden: hiddenOnly ? true : undefined,
					page,
					size: 25
				}
			: undefined
	);

	const pinsQuery = useAdminPins(() => params);
	const result = $derived(pinsQuery.data);
	const pins = $derived(result?.items ?? []);

	const updatePin = useUpdatePin();
	const deletePin = useDeletePin();

	// Any filter change invalidates the current page number.
	function reset<T>(setter: (value: T) => void) {
		return (value: T) => {
			setter(value);
			page = 0;
		};
	}

	async function toggle(id: number, field: 'featured' | 'hidden', value: boolean) {
		try {
			await updatePin.mutateAsync({ id, body: { [field]: value } });
			toast.success(t().admin.updated);
		} catch {
			toast.error(t().error.generic);
		}
	}

	async function remove(id: number) {
		if (!confirm(t().admin.deleteConfirm)) return;
		try {
			await deletePin.mutateAsync(id);
			toast.success(t().admin.deleted);
		} catch {
			toast.error(t().error.generic);
		}
	}
</script>

<div class="border-border flex shrink-0 flex-col gap-2 border-b p-3">
	<SearchBar onchange={reset((value: string) => (query = value))} />

	<div class="flex flex-wrap gap-2">
		<select
			bind:value={category}
			onchange={() => (page = 0)}
			class="border-border-strong bg-surface min-h-9 rounded-lg border px-2 text-sm"
			aria-label={t().admin.category}
		>
			<option value="">{t().paging.anyCategory}</option>
			{#each CATEGORIES as value (value)}
				<option {value}>{t().pin.categories[value]}</option>
			{/each}
		</select>

		<select
			bind:value={source}
			onchange={() => (page = 0)}
			class="border-border-strong bg-surface min-h-9 rounded-lg border px-2 text-sm"
			aria-label={t().paging.anySource}
		>
			<option value="">{t().paging.anySource}</option>
			<option value="OSM">{t().paging.sourceOsm}</option>
			<option value="ADMIN">{t().paging.sourceAdmin}</option>
			<option value="USER">{t().paging.sourceUser}</option>
		</select>

		<button
			class={cn(
				'min-h-9 rounded-lg px-3 text-sm font-medium transition-colors',
				hiddenOnly ? 'bg-primary-subtle text-primary' : 'bg-surface-sunken text-muted-foreground'
			)}
			onclick={() => {
				hiddenOnly = !hiddenOnly;
				page = 0;
			}}
			aria-pressed={hiddenOnly}
		>
			{t().paging.onlyHidden}
		</button>
	</div>
</div>

<div class="min-h-0 flex-1 overflow-y-auto">
	{#if pinsQuery.isPending}
		<div class="grid place-items-center py-16"><Spinner class="text-muted-foreground" /></div>
	{:else if pins.length === 0}
		<EmptyState title={t().paging.none}>
			{#snippet icon()}<MapPin class="size-10" />{/snippet}
		</EmptyState>
	{:else}
		<ul class="divide-border divide-y">
			{#each pins as pin (pin.id)}
				<li class="flex items-center gap-2 pr-2 pl-4">
					<!-- The row body opens the pin; the icon buttons stay outside it, so a
					     nested button is impossible and a mis-tap cannot hide a pin. -->
					<button
						class="hover:bg-surface-sunken -mx-2 min-w-0 flex-1 rounded-lg px-2 py-3 text-left transition-colors"
						onclick={() => (openPinId = pin.id)}
					>
						<p class="flex items-center gap-2 truncate font-medium">
							<span class="truncate">{pin.name}</span>
							{#if pin.hidden}<Badge tone="danger">{t().admin.hidden}</Badge>{/if}
						</p>
						<p class="text-muted-foreground flex items-center gap-1.5 pt-0.5 text-xs">
							<span>{t().pin.categories[pin.category] ?? pin.category}</span>
							<Badge>{pin.source}</Badge>
							{#if pin.noteCount > 0}<span>· {t().pin.notes(pin.noteCount)}</span>{/if}
						</p>
					</button>

					<button
						class="touch-target grid place-items-center rounded-lg {pin.featured
							? 'text-rare'
							: 'text-muted-foreground'}"
						onclick={() => toggle(pin.id, 'featured', !pin.featured)}
						aria-label={t().admin.featured}
					>
						<Star class="size-5" fill={pin.featured ? 'currentColor' : 'none'} />
					</button>

					<button
						class="touch-target text-muted-foreground grid place-items-center rounded-lg"
						onclick={() => toggle(pin.id, 'hidden', !pin.hidden)}
						aria-label={t().admin.hidden}
					>
						{#if pin.hidden}<Eye class="size-5" />{:else}<EyeOff class="size-5" />{/if}
					</button>

					<button
						class="touch-target text-muted-foreground hover:text-danger grid place-items-center rounded-lg"
						onclick={() => remove(pin.id)}
						aria-label={t().note.delete}
					>
						<Trash2 class="size-5" />
					</button>
				</li>
			{/each}
		</ul>
	{/if}
</div>

<PinSheet
	pinId={openPinId}
	onclose={() => (openPinId = null)}
	ondiscovered={() => (openPinId = null)}
/>

{#if result}
	<Pager
		page={result.page}
		totalPages={result.totalPages}
		totalItems={result.totalItems}
		onpage={(next) => (page = next)}
	/>
{/if}
