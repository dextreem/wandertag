<script lang="ts">
	import { onMount } from 'svelte';
	import { Flag, Flame, Trophy } from '@lucide/svelte';
	import { t } from '$lib/i18n/index.svelte';
	import Button from '$lib/components/ui/Button.svelte';

	interface Props {
		pinName: string;
		firstBlood: boolean;
		streak: number;
		onclose: () => void;
	}

	let { pinName, firstBlood, streak, onclose }: Props = $props();

	/**
	 * Auto-dismisses. The reward for reaching a pin should feel like a moment, not
	 * another dialog to close while standing in the rain — but first blood is rare
	 * enough to be worth holding on screen longer.
	 */
	onMount(() => {
		const timer = setTimeout(onclose, firstBlood ? 6000 : 3500);
		return () => clearTimeout(timer);
	});
</script>

<div
	class="fixed inset-0 z-[60] grid place-items-center bg-black/50 p-6 backdrop-blur-sm"
	onclick={onclose}
	role="presentation"
>
	<div
		class="bg-surface flex w-full max-w-xs flex-col items-center gap-3 rounded-[--radius-xl] p-6 text-center shadow-2xl"
		role="alert"
	>
		{#if firstBlood}
			<div class="bg-rare-subtle text-rare grid size-16 place-items-center rounded-full">
				<Trophy class="size-8" />
			</div>
			<p class="text-rare text-xl font-bold">{t().game.firstBlood}</p>
			<p class="font-medium">{pinName}</p>
			<p class="text-muted-foreground text-sm">{t().game.firstBloodHint}</p>
		{:else}
			<div class="bg-primary-subtle text-primary grid size-16 place-items-center rounded-full">
				<Flag class="size-8" />
			</div>
			<p class="text-primary text-xl font-bold">{t().game.discovered}</p>
			<p class="font-medium">{pinName}</p>
		{/if}

		{#if streak > 1}
			<p class="text-warning inline-flex items-center gap-1.5 text-sm font-medium">
				<Flame class="size-4" />
				{t().game.streak(streak)}
			</p>
		{/if}

		<Button variant="ghost" size="sm" onclick={onclose}>{t().common.close}</Button>
	</div>
</div>
