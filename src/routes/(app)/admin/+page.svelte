<script lang="ts">
	import { Shield } from '@lucide/svelte';
	import { auth } from '$hooks/use-auth.svelte';
	import { roles } from '$hooks/use-roles.svelte';
	import { t } from '$lib/i18n/index.svelte';
	import { cn } from '$lib/utils';
	import AppHeader from '$lib/components/ui/AppHeader.svelte';
	import AdminPins from '$lib/components/admin/AdminPins.svelte';
	import AdminUsers from '$lib/components/admin/AdminUsers.svelte';
	import AdminActivity from '$lib/components/admin/AdminActivity.svelte';
	import AdminViolations from '$lib/components/admin/AdminViolations.svelte';
	import EmptyState from '$lib/components/ui/EmptyState.svelte';

	/**
	 * Moderation shell. Each tab owns its own loading, scrolling and paging, so this
	 * page is only the switch and the role gate.
	 */
	type Tab = 'pins' | 'users' | 'activity' | 'violations';
	let tab = $state<Tab>('pins');

	const tabs = $derived([
		['pins', t().admin2.tabPins],
		['users', t().admin2.tabUsers],
		['activity', t().admin2.tabActivity],
		['violations', t().admin2.tabViolations]
	] as const);
</script>

<svelte:head><title>{t().admin2.title} · WanderTag</title></svelte:head>

<div class="mx-auto flex min-h-0 w-full max-w-3xl flex-1 flex-col">
	<AppHeader title={t().admin2.title} />

	{#if !auth.isChecking && !roles.isAdmin}
		<!-- Cosmetic gate only. Every admin endpoint re-checks the role server-side,
		     so hiding this screen is convenience, not security. -->
		<EmptyState title={t().error.notFound}>
			{#snippet icon()}<Shield class="size-10" />{/snippet}
		</EmptyState>
	{:else}
		<div class="border-border flex shrink-0 gap-1 overflow-x-auto border-b px-4 py-2">
			{#each tabs as [value, label] (value)}
				<button
					class={cn(
						'shrink-0 rounded-full px-3 py-1.5 text-sm font-medium transition-colors',
						tab === value ? 'bg-primary-subtle text-primary' : 'text-muted-foreground'
					)}
					onclick={() => (tab = value)}
				>
					{label}
				</button>
			{/each}
		</div>

		<div class="flex min-h-0 flex-1 flex-col overflow-hidden">
			{#if tab === 'users'}
				<div class="min-h-0 flex-1 overflow-y-auto"><AdminUsers enabled={roles.isAdmin} /></div>
			{:else if tab === 'activity'}
				<div class="min-h-0 flex-1 overflow-y-auto"><AdminActivity enabled={roles.isAdmin} /></div>
			{:else if tab === 'violations'}
				<div class="min-h-0 flex-1 overflow-y-auto">
					<AdminViolations enabled={roles.isAdmin} />
				</div>
			{:else}
				<AdminPins enabled={roles.isAdmin} />
			{/if}
		</div>
	{/if}
</div>
