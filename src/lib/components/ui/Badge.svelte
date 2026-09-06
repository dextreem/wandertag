<script lang="ts">
	import type { Snippet } from 'svelte';
	import { cn } from '$lib/utils';

	type Tone = 'neutral' | 'primary' | 'rare' | 'warning' | 'success' | 'danger';

	let {
		tone = 'neutral',
		class: className,
		children
	}: { tone?: Tone; class?: string; children: Snippet } = $props();

	const tones: Record<Tone, string> = {
		neutral: 'bg-surface-sunken text-muted-foreground',
		primary: 'bg-primary-subtle text-primary',
		rare: 'bg-rare-subtle text-rare',
		warning: 'bg-warning-subtle text-warning',
		success: 'bg-success-subtle text-success',
		danger: 'bg-danger-subtle text-danger'
	};
</script>

<span
	class={cn(
		'inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium',
		tones[tone],
		className
	)}
>
	{@render children()}
</span>
