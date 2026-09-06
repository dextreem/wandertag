<script lang="ts">
	import { Flag } from '@lucide/svelte';
	import { useAdminActivity } from '$api/admin/queries';
	import { t, i18n } from '$lib/i18n/index.svelte';
	import { formatDate, formatDistance } from '$lib/utils';
	import Badge from '$lib/components/ui/Badge.svelte';
	import Spinner from '$lib/components/ui/Spinner.svelte';
	import EmptyState from '$lib/components/ui/EmptyState.svelte';

	/** What everyone has been uncovering, newest first. */
	let { enabled }: { enabled: boolean } = $props();

	const activityQuery = useAdminActivity(() => enabled);
	const rows = $derived(activityQuery.data ?? []);
</script>

{#if activityQuery.isPending}
	<div class="grid place-items-center py-16"><Spinner class="text-muted-foreground" /></div>
{:else if rows.length === 0}
	<EmptyState title={t().admin2.noActivity} />
{:else}
	<ul class="divide-border divide-y">
		{#each rows as row (row.id)}
			<li class="flex items-center gap-3 px-4 py-3">
				<div class="min-w-0 flex-1">
					<p class="truncate">
						<span class="font-medium">{row.displayName}</span>
						<span class="text-muted-foreground"> → </span>
						<span>{row.pinName}</span>
					</p>
					<p class="text-muted-foreground flex items-center gap-2 pt-0.5 text-xs">
						<span>{t().pin.categories[row.category] ?? row.category}</span>
						<span>· {formatDistance(row.distanceM, i18n.locale)}</span>
						<span>· {formatDate(row.discoveredAt, i18n.locale)}</span>
					</p>
				</div>
				{#if row.firstBlood}
					<Badge tone="rare"><Flag class="size-3" />{t().admin2.firstBlood}</Badge>
				{/if}
			</li>
		{/each}
	</ul>
{/if}
