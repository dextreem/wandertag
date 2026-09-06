<script lang="ts">
	import { UserX, UserCheck, ShieldOff, Flame, MapPin, Flag } from '@lucide/svelte';
	import { toast } from 'svelte-sonner';
	import { useAdminUsers, useSetUserActive, useUnblockUser } from '$api/admin/queries';
	import { t, i18n } from '$lib/i18n/index.svelte';
	import { formatDate } from '$lib/utils';
	import Button from '$lib/components/ui/Button.svelte';
	import Badge from '$lib/components/ui/Badge.svelte';
	import Spinner from '$lib/components/ui/Spinner.svelte';
	import EmptyState from '$lib/components/ui/EmptyState.svelte';

	let { enabled }: { enabled: boolean } = $props();

	const usersQuery = useAdminUsers(() => enabled);
	const setActive = useSetUserActive();
	const unblock = useUnblockUser();

	const users = $derived(usersQuery.data ?? []);

	async function onSetActive(userId: string, active: boolean) {
		if (!active && !confirm(t().admin2.deactivateConfirm)) return;
		try {
			await setActive.mutateAsync({ userId, active });
		} catch {
			toast.error(t().error.generic);
		}
	}

	async function onUnblock(userId: string) {
		try {
			await unblock.mutateAsync(userId);
		} catch {
			toast.error(t().error.generic);
		}
	}
</script>

{#if usersQuery.isPending}
	<div class="grid place-items-center py-16"><Spinner class="text-muted-foreground" /></div>
{:else if users.length === 0}
	<EmptyState title={t().admin2.noUsers} />
{:else}
	<p class="text-muted-foreground px-4 pt-3 pb-1 text-xs">{t().admin2.deactivatedNote}</p>
	<ul class="divide-border divide-y">
		{#each users as u (u.userId)}
			<li class="flex flex-col gap-2 px-4 py-3">
				<div class="min-w-0 flex-1">
					<p class="flex items-center gap-2 font-medium">
						<span class="truncate">{u.displayName}</span>
						{#if !u.active}
							<Badge tone="danger">{t().admin2.deactivated}</Badge>
						{:else if u.blocked}
							<Badge tone="warning">{t().admin2.blocked}</Badge>
						{/if}
					</p>
					<p class="text-muted-foreground flex flex-wrap items-center gap-2 pt-0.5 text-xs">
						<span class="inline-flex items-center gap-1">
							<MapPin class="size-3" />{u.discoveryCount}
						</span>
						<span class="inline-flex items-center gap-1">
							<Flag class="size-3" />{u.firstBloodCount}
						</span>
						{#if u.currentStreak > 0}
							<span class="inline-flex items-center gap-1">
								<Flame class="size-3" />{u.currentStreak}
							</span>
						{/if}
						{#if u.recentViolations > 0}
							<span class="text-warning">{t().admin2.violationsRecent(u.recentViolations)}</span>
						{/if}
					</p>
					{#if u.blocked && u.blockedUntil}
						<p class="text-warning pt-1 text-xs">
							{t().admin2.blockedUntil(formatDate(u.blockedUntil, i18n.locale))}
							{#if u.blockReason}— {u.blockReason}{/if}
						</p>
					{/if}
				</div>

				<div class="flex flex-wrap gap-2">
					{#if u.active}
						<Button size="sm" variant="secondary" onclick={() => onSetActive(u.userId, false)}>
							<UserX class="size-4" />
							{t().admin2.deactivate}
						</Button>
					{:else}
						<Button size="sm" onclick={() => onSetActive(u.userId, true)}>
							<UserCheck class="size-4" />
							{t().admin2.activate}
						</Button>
					{/if}
					{#if u.blocked}
						<Button size="sm" variant="ghost" onclick={() => onUnblock(u.userId)}>
							<ShieldOff class="size-4" />
							{t().admin2.unblock}
						</Button>
					{/if}
				</div>
			</li>
		{/each}
	</ul>
{/if}
