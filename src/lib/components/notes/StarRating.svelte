<script lang="ts">
	import { Star } from '@lucide/svelte';
	import { t } from '$lib/i18n/index.svelte';
	import { cn } from '$lib/utils';

	/**
	 * 1–5 stars for a note.
	 *
	 * Read-only unless [onrate] is given — which the caller only does when the user
	 * is signed in and inside the interaction radius, because an opinion about a
	 * place should come from having been there.
	 *
	 * The filled state shows *your* score when you have one and the average
	 * otherwise, so the widget answers "what did I give this?" first and "what do
	 * others think?" second.
	 */
	interface Props {
		average: number | null;
		votes: number;
		yours: number | null;
		onrate?: (stars: number) => void;
		pending?: boolean;
	}

	let { average, votes, yours, onrate, pending = false }: Props = $props();

	let hovered = $state<number | null>(null);

	const shown = $derived(hovered ?? yours ?? (average !== null ? Math.round(average) : 0));
	const interactive = $derived(!!onrate);
</script>

<div class="flex flex-wrap items-center gap-2">
	<div
		class="flex items-center gap-0.5"
		role={interactive ? 'radiogroup' : undefined}
		aria-label={t().rating.label}
		onmouseleave={() => (hovered = null)}
	>
		{#each [1, 2, 3, 4, 5] as star (star)}
			{#if interactive}
				<button
					type="button"
					class={cn(
						'touch-target -m-1.5 grid place-items-center p-1.5 transition-transform',
						pending && 'pointer-events-none opacity-50',
						'active:scale-90'
					)}
					aria-label={t().rating.giveStars(star)}
					aria-checked={yours === star}
					role="radio"
					onmouseenter={() => (hovered = star)}
					onfocus={() => (hovered = star)}
					onclick={() => onrate?.(star)}
				>
					<Star
						class={cn('size-5', star <= shown ? 'text-rare' : 'text-border-strong')}
						fill={star <= shown ? 'currentColor' : 'none'}
					/>
				</button>
			{:else}
				<Star
					class={cn('size-4', star <= shown ? 'text-rare' : 'text-border-strong')}
					fill={star <= shown ? 'currentColor' : 'none'}
				/>
			{/if}
		{/each}
	</div>

	<span class="text-muted-foreground text-xs">
		{#if votes === 0}
			{t().rating.none}
		{:else}
			{average?.toFixed(1)} · {t().rating.votes(votes)}
		{/if}
	</span>
</div>
