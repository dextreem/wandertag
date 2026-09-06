<script lang="ts">
	import type { Snippet } from 'svelte';
	import { ChevronRight } from '@lucide/svelte';
	import { cn } from '$lib/utils';

	/**
	 * One number on the profile.
	 *
	 * Becomes a button when [onclick] is given, so a stat can open the list behind
	 * it — a number you can check rather than one you have to trust. Rendered as two
	 * explicit branches rather than a dynamic tag: a real `<button>` gets keyboard
	 * and focus behaviour for free, which a div with `role="button"` does not.
	 */
	let {
		label,
		value,
		icon,
		tone = 'default',
		onclick,
		class: className
	}: {
		label: string;
		value: string | number;
		icon?: Snippet;
		tone?: 'default' | 'rare';
		onclick?: () => void;
		class?: string;
	} = $props();

	const shell = $derived(
		cn(
			'border-border bg-surface flex flex-col gap-1 rounded-lg border p-3 text-left',
			tone === 'rare' && 'border-rare/30 bg-rare-subtle',
			className
		)
	);
</script>

{#snippet body()}
	<div class="text-muted-foreground flex items-center gap-1.5">
		{#if icon}{@render icon()}{/if}
		<span class="text-xs font-medium">{label}</span>
		{#if onclick}
			<ChevronRight class="ml-auto size-3.5" />
		{/if}
	</div>
	<span class={cn('text-2xl font-bold tabular-nums', tone === 'rare' && 'text-rare')}>
		{value}
	</span>
{/snippet}

{#if onclick}
	<button type="button" class={cn(shell, 'hover:border-primary/50 transition-colors')} {onclick}>
		{@render body()}
	</button>
{:else}
	<div class={shell}>
		{@render body()}
	</div>
{/if}
