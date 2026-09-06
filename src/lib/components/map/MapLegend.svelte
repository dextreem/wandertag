<script lang="ts">
	import { Info, X } from '@lucide/svelte';
	import { MARKER_COLORS } from './markers';
	import { t } from '$lib/i18n/index.svelte';

	/**
	 * Explains the marker vocabulary.
	 *
	 * Without it the map is guesswork: a hollow tan ring, a filled sage circle and a
	 * teal dot all look like "a thing" until someone tells you that sage and tan are
	 * places while teal is people.
	 */
	let open = $state(false);

	const rows = $derived([
		{
			label: t().legend.undiscovered,
			fill: '#f7f4ed',
			stroke: MARKER_COLORS.undiscovered,
			strokeWidth: 3
		},
		{ label: t().legend.discovered, fill: MARKER_COLORS.discovered, stroke: '#f7f4ed' },
		{ label: t().legend.available, fill: MARKER_COLORS.available, stroke: '#f7f4ed' },
		{
			label: t().legend.adminPin,
			fill: MARKER_COLORS.available,
			stroke: MARKER_COLORS.adminRing,
			strokeWidth: 3
		},
		{ label: t().legend.note, fill: MARKER_COLORS.note, stroke: '#f7f4ed', strokeWidth: 3 },
		{ label: t().legend.you, fill: MARKER_COLORS.user, stroke: '#ffffff', strokeWidth: 3 }
	]);
</script>

{#if open}
	<div
		class="bg-surface/95 border-border absolute left-3 z-20 w-56 rounded-xl border p-3 shadow-lg backdrop-blur-md"
		style="bottom: calc(0.75rem + var(--bottom-nav-height))"
		role="group"
		aria-label={t().legend.title}
	>
		<div class="flex items-start justify-between gap-2 pb-2">
			<p class="text-sm font-semibold">{t().legend.title}</p>
			<button
				class="text-muted-foreground hover:text-foreground -mt-0.5"
				onclick={() => (open = false)}
				aria-label={t().common.close}
			>
				<X class="size-4" />
			</button>
		</div>

		<ul class="flex flex-col gap-1.5">
			{#each rows as row (row.label)}
				<li class="flex items-center gap-2 text-xs">
					<span
						class="size-3.5 shrink-0 rounded-full"
						style="background: {row.fill}; box-shadow: inset 0 0 0 {row.strokeWidth ??
							2}px {row.stroke}"
					></span>
					<span class="text-muted-foreground">{row.label}</span>
				</li>
			{/each}
		</ul>

		<p class="text-muted-foreground border-border mt-2 border-t pt-2 text-[11px]">
			{t().legend.hint}
		</p>
	</div>
{:else}
	<button
		class="bg-surface text-muted-foreground absolute left-3 z-20 grid size-9 place-items-center rounded-full shadow-lg"
		style="bottom: calc(0.75rem + var(--bottom-nav-height))"
		onclick={() => (open = true)}
		aria-label={t().legend.show}
	>
		<Info class="size-4" />
	</button>
{/if}
