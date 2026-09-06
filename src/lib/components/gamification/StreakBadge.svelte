<script lang="ts">
	import { Flame } from '@lucide/svelte';
	import { t } from '$lib/i18n/index.svelte';
	import Badge from '$lib/components/ui/Badge.svelte';

	let { streak }: { streak: number } = $props();
</script>

{#if streak > 0}
	<Badge tone="warning">
		<Flame class="size-3" />
		{t().game.streak(streak)}
	</Badge>
{/if}
