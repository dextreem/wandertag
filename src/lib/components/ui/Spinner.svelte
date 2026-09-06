<script lang="ts">
	import { cn } from '$lib/utils';
	let { class: className }: { class?: string } = $props();
</script>

<span
	class={cn(
		'inline-block size-5 animate-spin rounded-full border-2 border-current border-t-transparent',
		className
	)}
	role="status"
	aria-label="Loading"
></span>
