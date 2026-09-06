<script lang="ts">
	import type { Snippet } from 'svelte';
	import Logo from './Logo.svelte';

	let { title, actions }: { title?: string; actions?: Snippet } = $props();
</script>

<header
	class="border-border bg-surface/95 sticky top-0 z-20 flex items-center gap-3 border-b px-4 backdrop-blur-md"
	style="padding-top: var(--safe-top); min-height: calc(3.25rem + var(--safe-top))"
>
	{#if title}
		<h1 class="min-w-0 flex-1 truncate text-lg font-semibold">{title}</h1>
	{:else}
		<div class="flex-1"><Logo /></div>
	{/if}
	{#if actions}{@render actions()}{/if}
</header>
