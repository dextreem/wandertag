<script lang="ts">
	import { Trophy, Flag, Flame } from '@lucide/svelte';
	import { useLeaderboard } from '$api/leaderboard/queries';
	import type { LeaderboardScope } from '$api/leaderboard/types';
	import { t } from '$lib/i18n/index.svelte';
	import { cn } from '$lib/utils';
	import AppHeader from '$lib/components/ui/AppHeader.svelte';
	import Spinner from '$lib/components/ui/Spinner.svelte';
	import EmptyState from '$lib/components/ui/EmptyState.svelte';

	let scope = $state<LeaderboardScope>('GLOBAL');

	const boardQuery = useLeaderboard(() => scope);
	const entries = $derived(boardQuery.data?.entries ?? []);

	/** Gold for first, silver-ish for second and third; everyone else gets their number. */
	function rankTone(rank: number) {
		if (rank === 1) return 'text-rare';
		if (rank <= 3) return 'text-muted-foreground';
		return 'text-muted-foreground';
	}
</script>

<svelte:head><title>{t().board.title} · WanderTag</title></svelte:head>

<!-- Centred and capped on desktop: a ranking table is easier to scan narrow. -->
<div class="mx-auto flex min-h-0 w-full max-w-2xl flex-1 flex-col">
	<AppHeader title={t().board.title} />

	<div class="border-border flex gap-1 border-b px-4 py-2">
		{#each [['GLOBAL', t().board.global], ['MONTHLY', t().board.monthly]] as const as [value, label] (value)}
			<button
				class={cn(
					'rounded-full px-3 py-1.5 text-sm font-medium transition-colors',
					scope === value ? 'bg-primary-subtle text-primary' : 'text-muted-foreground'
				)}
				onclick={() => (scope = value)}
			>
				{label}
			</button>
		{/each}
	</div>

	{#if boardQuery.isPending}
		<div class="grid flex-1 place-items-center"><Spinner class="text-muted-foreground" /></div>
	{:else if entries.length === 0}
		<EmptyState title={t().board.empty}>
			{#snippet icon()}<Trophy class="size-10" />{/snippet}
		</EmptyState>
	{:else}
		<ul class="divide-border divide-y">
			{#each entries as entry (entry.userId)}
				<li
					class={cn(
						'flex items-center gap-3 px-4 py-3',
						// The caller's own row is highlighted: on a long board, "where am I?"
						// is the only question most people open this screen to answer.
						entry.isMe && 'bg-primary-subtle'
					)}
				>
					<span class={cn('w-7 text-center text-lg font-bold tabular-nums', rankTone(entry.rank))}>
						{entry.rank === 1 ? '🏆' : entry.rank}
					</span>

					<div class="min-w-0 flex-1">
						<p class="truncate font-medium">{entry.displayName}</p>
						<p class="text-muted-foreground flex items-center gap-2 pt-0.5 text-xs">
							{#if entry.firstBloodCount > 0}
								<span class="inline-flex items-center gap-1">
									<Flag class="size-3" />{entry.firstBloodCount}
								</span>
							{/if}
							{#if entry.currentStreak > 0}
								<span class="inline-flex items-center gap-1">
									<Flame class="size-3" />{entry.currentStreak}
								</span>
							{/if}
						</p>
					</div>

					<div class="shrink-0 text-right">
						<span class="text-lg font-bold tabular-nums">{entry.discoveryCount}</span>
						<span class="text-muted-foreground block text-[10px] uppercase">
							{t().board.discoveries}
						</span>
					</div>
				</li>
			{/each}
		</ul>
	{/if}
</div>
