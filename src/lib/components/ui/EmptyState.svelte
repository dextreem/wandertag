<script lang="ts">
	import type { Snippet } from 'svelte';

	let {
		title,
		description,
		icon,
		action
	}: { title: string; description?: string; icon?: Snippet; action?: Snippet } = $props();
</script>

<div class="flex flex-col items-center gap-3 px-6 py-12 text-center">
	{#if icon}
		<div class="text-muted-foreground">{@render icon()}</div>
	{/if}
	<p class="font-medium">{title}</p>
	{#if description}
		<p class="text-muted-foreground max-w-xs text-sm">{description}</p>
	{/if}
	{#if action}
		<div class="pt-2">{@render action()}</div>
	{/if}
</div>
