<script lang="ts">
	import { useAdminViolations } from '$api/admin/queries';
	import { t, i18n } from '$lib/i18n/index.svelte';
	import { formatDate, formatDistance } from '$lib/utils';
	import Spinner from '$lib/components/ui/Spinner.svelte';
	import EmptyState from '$lib/components/ui/EmptyState.svelte';

	/**
	 * Rejected position claims.
	 *
	 * Shown so a block can be judged rather than trusted: a run of 300 km hops is
	 * plainly cheating, whereas a single 3 km jump is a bad fix — and the admin can
	 * lift the block from the Users tab.
	 */
	let { enabled }: { enabled: boolean } = $props();

	const violationsQuery = useAdminViolations(() => enabled);
	const rows = $derived(violationsQuery.data ?? []);
</script>

{#if violationsQuery.isPending}
	<div class="grid place-items-center py-16"><Spinner class="text-muted-foreground" /></div>
{:else if rows.length === 0}
	<EmptyState title={t().admin2.noViolations} />
{:else}
	<ul class="divide-border divide-y">
		{#each rows as row (row.id)}
			<li class="flex items-center gap-3 px-4 py-3 text-sm">
				<div class="min-w-0 flex-1">
					<p class="font-medium">
						{formatDistance(row.distanceM, i18n.locale)} in {row.elapsedS}s
					</p>
					<p class="text-muted-foreground text-xs">
						{row.speedMps} m/s · {formatDate(row.detectedAt, i18n.locale)}
					</p>
				</div>
				<code class="text-muted-foreground shrink-0 text-[10px]">{row.userId.slice(0, 8)}</code>
			</li>
		{/each}
	</ul>
{/if}
