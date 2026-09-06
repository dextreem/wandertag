<script lang="ts">
	import { cn } from '$lib/utils';
	let { class: className, showName = true }: { class?: string; showName?: boolean } = $props();
</script>

<span class={cn('inline-flex items-center gap-2', className)}>
	<!-- The mark from the dropnote prototype, carried over so the lineage is visible. -->
	<img src="/logo.svg" alt="" class="size-8 shrink-0" aria-hidden="true" />
	{#if showName}
		<span class="text-lg font-bold tracking-tight">
			Wander<span class="text-primary">Tag</span>
		</span>
	{/if}
</span>
