<script lang="ts">
	import { Flag, Flame, MapPin, StickyNote, Shield, LogOut } from '@lucide/svelte';
	import { useMe, useUpdateProfile } from '$api/me/queries';
	import { auth } from '$hooks/use-auth.svelte';
	import { roles } from '$hooks/use-roles.svelte';
	import { theme, type Theme } from '$hooks/use-theme.svelte';
	import { i18n, t, type Locale } from '$lib/i18n/index.svelte';
	import { cn } from '$lib/utils';
	import AppHeader from '$lib/components/ui/AppHeader.svelte';
	import Button from '$lib/components/ui/Button.svelte';
	import Badge from '$lib/components/ui/Badge.svelte';
	import Spinner from '$lib/components/ui/Spinner.svelte';
	import StatTile from '$lib/components/ui/StatTile.svelte';
	import HistorySheet, { type HistoryKind } from '$lib/components/gamification/HistorySheet.svelte';

	const meQuery = useMe(() => auth.isAuthenticated);

	// Which stat's list is open, if any.
	let history = $state<HistoryKind | null>(null);
	const updateProfile = useUpdateProfile();

	const profile = $derived(meQuery.data);
	const stats = $derived(profile?.stats);

	/** Locale is kept in two places on purpose: the UI switches instantly from the
	 *  local store, and the server copy makes the choice follow the user's account. */
	function setLocale(locale: Locale) {
		i18n.set(locale);
		if (auth.isAuthenticated) updateProfile.mutate({ locale });
	}
</script>

<svelte:head><title>{t().profile.title} · WanderTag</title></svelte:head>

<!-- Centred and capped on desktop; the stat grid widens from two to three. -->
<div class="mx-auto flex w-full max-w-2xl flex-1 flex-col">
	<AppHeader title={t().profile.title} />

	<div class="flex flex-col gap-6 p-4">
		{#if !auth.isAuthenticated}
			<div
				class="border-border bg-surface flex flex-col items-center gap-3 rounded-lg border p-6 text-center"
			>
				<p class="text-muted-foreground text-sm">{t().auth.loginPrompt}</p>
				<div class="flex gap-2">
					<Button onclick={() => auth.login('/profile')}>{t().auth.login}</Button>
					<Button variant="secondary" onclick={() => auth.register('/profile')}>
						{t().auth.register}
					</Button>
				</div>
			</div>
		{:else if meQuery.isPending}
			<div class="grid place-items-center py-10"><Spinner class="text-muted-foreground" /></div>
		{:else if profile && stats}
			<section class="flex items-center gap-3">
				<div
					class="bg-primary-subtle text-primary grid size-14 shrink-0 place-items-center rounded-full text-xl font-bold"
				>
					{profile.displayName.charAt(0).toUpperCase()}
				</div>
				<div class="min-w-0 flex-1">
					<p class="truncate text-lg font-semibold">{profile.displayName}</p>
					{#if profile.email}
						<p class="text-muted-foreground truncate text-sm">{profile.email}</p>
					{/if}
				</div>
				{#if roles.isAdmin}
					<Badge tone="primary"><Shield class="size-3" />{t().profile.adminBadge}</Badge>
				{/if}
			</section>

			<section>
				<h2 class="pb-2 text-sm font-semibold">{t().profile.stats}</h2>
				<div class="grid grid-cols-2 gap-2 sm:grid-cols-3">
					<StatTile
						label={t().game.pinsUncovered}
						value={stats.discoveryCount}
						onclick={() => (history = 'discoveries')}
					>
						{#snippet icon()}<MapPin class="size-3.5" />{/snippet}
					</StatTile>
					<StatTile
						label={t().game.firstBloods}
						value={stats.firstBloodCount}
						tone="rare"
						onclick={() => (history = 'firstBloods')}
					>
						{#snippet icon()}<Flag class="size-3.5" />{/snippet}
					</StatTile>
					<StatTile label={t().game.streakLabel} value={stats.currentStreak}>
						{#snippet icon()}<Flame class="size-3.5" />{/snippet}
					</StatTile>
					<StatTile
						label={t().game.notesDropped}
						value={stats.noteCount}
						onclick={() => (history = 'notes')}
					>
						{#snippet icon()}<StickyNote class="size-3.5" />{/snippet}
					</StatTile>
					<StatTile label={t().game.longestStreak} value={stats.longestStreak} />
					<StatTile label={t().game.thisMonth} value={stats.discoveriesThisMonth} />
				</div>
			</section>
		{/if}

		<section>
			<h2 class="pb-2 text-sm font-semibold">{t().profile.language}</h2>
			<div class="flex gap-2">
				{#each [['de', 'Deutsch'], ['en', 'English']] as const as [value, label] (value)}
					<button
						class={cn(
							'min-h-11 flex-1 rounded-lg border text-sm font-medium transition-colors',
							i18n.locale === value
								? 'border-primary bg-primary-subtle text-primary'
								: 'border-border bg-surface text-muted-foreground'
						)}
						onclick={() => setLocale(value)}
					>
						{label}
					</button>
				{/each}
			</div>
		</section>

		<section>
			<h2 class="pb-2 text-sm font-semibold">{t().profile.theme}</h2>
			<div class="flex gap-2">
				{#each [['light', t().profile.themeLight], ['dark', t().profile.themeDark], ['system', t().profile.themeSystem]] as const as [value, label] (value)}
					<button
						class={cn(
							'min-h-11 flex-1 rounded-lg border text-sm font-medium transition-colors',
							theme.theme === value
								? 'border-primary bg-primary-subtle text-primary'
								: 'border-border bg-surface text-muted-foreground'
						)}
						onclick={() => theme.set(value as Theme)}
					>
						{label}
					</button>
				{/each}
			</div>
		</section>

		{#if auth.isAuthenticated}
			<Button variant="secondary" full onclick={() => auth.logout()}>
				<LogOut class="size-4" />
				{t().auth.logout}
			</Button>
		{/if}

		<p class="text-muted-foreground pb-2 text-center text-xs">{t().common.attribution}</p>
	</div>
</div>

<HistorySheet kind={history} onclose={() => (history = null)} />
