<script lang="ts">
	import type { Snippet } from 'svelte';
	import { X } from '@lucide/svelte';
	import { cn } from '$lib/utils';
	import { t } from '$lib/i18n/index.svelte';

	interface Props {
		open: boolean;
		onclose: () => void;
		title?: string;
		class?: string;
		children: Snippet;
	}

	let { open, onclose, title, class: className, children }: Props = $props();

	let startY = $state<number | null>(null);
	let dragY = $state(0);

	/**
	 * Detail panel, in two shapes.
	 *
	 * On a phone it is a bottom sheet: the only panel shape whose controls land
	 * under the thumb, and it keeps the map visible above so the user does not lose
	 * their spatial context while reading a note. From `md` up it becomes a
	 * right-hand side panel, which is what suits a wide screen — a sheet stretched
	 * across a monitor is a lot of travel for the cursor and wastes the width.
	 *
	 * Swipe-to-dismiss is implemented by hand — one gesture is not worth a
	 * dependency, and it must not fight MapLibre's own touch handling. It applies
	 * only to the mobile shape; on desktop the close button and Escape do the job.
	 */
	function onTouchStart(event: TouchEvent) {
		startY = event.touches[0].clientY;
	}

	function onTouchMove(event: TouchEvent) {
		if (startY === null) return;
		dragY = Math.max(0, event.touches[0].clientY - startY);
	}

	function onTouchEnd() {
		if (dragY > DISMISS_THRESHOLD_PX) onclose();
		startY = null;
		dragY = 0;
	}

	const DISMISS_THRESHOLD_PX = 100;

	function onKeydown(event: KeyboardEvent) {
		if (event.key === 'Escape') onclose();
	}
</script>

<svelte:window onkeydown={open ? onKeydown : undefined} />

{#if open}
	<!-- Scrim. Tapping it dismisses, matching the platform convention. -->
	<div
		class="fixed inset-0 z-40 bg-black/40 backdrop-blur-[2px]"
		onclick={onclose}
		role="presentation"
	></div>

	<!-- tabindex="-1": the panel itself must be focusable so a screen reader lands
	     inside the dialog and Escape reaches it, instead of focus staying on the
	     map behind. -->
	<div
		class={cn(
			'bg-surface fixed z-50 flex flex-col',
			// Mobile: bottom sheet, rounded top corners, capped height.
			'inset-x-0 bottom-0 max-h-[85dvh] rounded-t-[--radius-xl]',
			'shadow-[0_-8px_32px_rgb(0_0_0/0.18)]',
			// Desktop: full-height panel pinned to the right edge.
			'md:inset-y-0 md:right-0 md:left-auto md:max-h-none md:w-[26rem] md:rounded-none',
			'md:border-border md:border-l md:shadow-[-8px_0_32px_rgb(0_0_0/0.12)]',
			'transition-transform duration-150',
			className
		)}
		style="--drag-y: {dragY}px; padding-bottom: var(--safe-bottom)"
		role="dialog"
		aria-modal="true"
		aria-label={title}
		tabindex="-1"
		ontouchstart={onTouchStart}
		ontouchmove={onTouchMove}
		ontouchend={onTouchEnd}
	>
		<!-- Drag handle: the affordance that says the panel can be swiped away.
		     Meaningless with a mouse, so it is mobile-only. -->
		<div class="flex shrink-0 justify-center pt-2.5 pb-1 md:hidden">
			<div class="bg-border-strong h-1 w-10 rounded-full"></div>
		</div>

		{#if title}
			<header class="flex shrink-0 items-center gap-3 px-4 pt-1 pb-3 md:pt-4">
				<h2 class="min-w-0 flex-1 truncate text-lg font-semibold">{title}</h2>
				<button
					class="touch-target text-muted-foreground hover:bg-surface-sunken -mr-2 grid place-items-center rounded-full"
					onclick={onclose}
					aria-label={t().common.close}
				>
					<X class="size-5" />
				</button>
			</header>
		{/if}

		<div class="min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 pb-4">
			{@render children()}
		</div>
	</div>
{/if}

<style>
	/* The swipe offset only applies to the mobile bottom sheet; on desktop the
	   panel is pinned and must not be draggable out of place. */
	div[role='dialog'] {
		transform: translateY(var(--drag-y, 0px));
	}

	@media (min-width: 768px) {
		div[role='dialog'] {
			transform: none;
		}
	}
</style>
