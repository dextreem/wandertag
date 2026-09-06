<script lang="ts">
	import { Lock, Flag, Check, StickyNote, Mountain } from '@lucide/svelte';
	import type { PinMarker } from '$api/pins/types';
	import { t, i18n } from '$lib/i18n/index.svelte';
	import { formatDistance, cn } from '$lib/utils';
	import Badge from '$lib/components/ui/Badge.svelte';

	/**
	 * Compact nearest-first list, shared by the desktop map sidebar and the mobile
	 * list tab. Extracted so the two cannot drift apart — the ordering and the
	 * badge meanings are part of the game's rules, not per-screen decoration.
	 */
	interface Props {
		pins: PinMarker[];
		selectedId?: number | null;
		onselect: (id: number) => void;
	}

	let { pins, selectedId = null, onselect }: Props = $props();
</script>

<ul class="divide-border divide-y">
	{#each pins as pin (pin.id)}
		<li>
			<button
				class={cn(
					'flex w-full items-center gap-3 px-4 py-3 text-left transition-colors',
					'hover:bg-surface-sunken active:bg-surface-sunken',
					selectedId === pin.id && 'bg-primary-subtle'
				)}
				onclick={() => onselect(pin.id)}
				aria-current={selectedId === pin.id ? 'true' : undefined}
			>
				<div class="min-w-0 flex-1">
					<p class="truncate font-medium">{pin.name}</p>
					<p class="text-muted-foreground flex items-center gap-1.5 pt-0.5 text-xs">
						<span>{t().pin.categories[pin.category] ?? pin.category}</span>
						{#if pin.elevationM}
							<span class="inline-flex items-center gap-1">
								· <Mountain class="size-3" />{pin.elevationM} m
							</span>
						{/if}
						{#if pin.noteCount > 0}
							<span class="inline-flex items-center gap-1">
								· <StickyNote class="size-3" />{pin.noteCount}
							</span>
						{/if}
					</p>
				</div>

				<div class="flex shrink-0 flex-col items-end gap-1">
					<span class="text-sm font-medium tabular-nums">
						{formatDistance(pin.distanceM, i18n.locale)}
					</span>
					{#if pin.discovered}
						<Badge tone="success"><Check class="size-3" /></Badge>
					{:else if !pin.discoveredByAnyone}
						<Badge tone="rare"><Flag class="size-3" /></Badge>
					{:else if pin.locked}
						<Lock class="text-muted-foreground size-3.5" />
					{/if}
				</div>
			</button>
		</li>
	{/each}
</ul>
