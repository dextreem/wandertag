<script lang="ts">
	import { ChevronLeft, ChevronRight } from '@lucide/svelte';
	import { t } from '$lib/i18n/index.svelte';

	/**
	 * Prev/next pager.
	 *
	 * Numbered pages are deliberately absent: with 4,600 pages of pins a number row
	 * is unusable, and the way anyone actually finds a pin is the search box above.
	 */
	interface Props {
		page: number;
		totalPages: number;
		totalItems: number;
		onpage: (page: number) => void;
	}

	let { page, totalPages, totalItems, onpage }: Props = $props();
</script>

{#if totalItems > 0}
	<div
		class="border-border bg-surface flex shrink-0 items-center justify-between gap-2 border-t px-4 py-2"
	>
		<span class="text-muted-foreground text-xs">
			{t().paging.results(totalItems)} · {t().paging.page(page + 1, Math.max(totalPages, 1))}
		</span>
		<div class="flex gap-1">
			<button
				class="touch-target text-foreground disabled:text-muted-foreground/40 grid place-items-center rounded-lg disabled:pointer-events-none"
				disabled={page <= 0}
				onclick={() => onpage(page - 1)}
				aria-label={t().paging.prev}
			>
				<ChevronLeft class="size-5" />
			</button>
			<button
				class="touch-target text-foreground disabled:text-muted-foreground/40 grid place-items-center rounded-lg disabled:pointer-events-none"
				disabled={page >= totalPages - 1}
				onclick={() => onpage(page + 1)}
				aria-label={t().paging.next}
			>
				<ChevronRight class="size-5" />
			</button>
		</div>
	</div>
{/if}
