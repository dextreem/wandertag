<script lang="ts">
	import { page } from '$app/state';
	import { resolve } from '$app/paths';
	import { Map, List, Trophy, User, Shield, Users, LogOut, Sun, Moon } from '@lucide/svelte';
	import { auth } from '$hooks/use-auth.svelte';
	import { roles } from '$hooks/use-roles.svelte';
	import { theme } from '$hooks/use-theme.svelte';
	import { t, i18n } from '$lib/i18n/index.svelte';
	import { cn } from '$lib/utils';
	import Logo from './Logo.svelte';
	import Button from './Button.svelte';

	/**
	 * Desktop navigation, mirroring dropnote's app header: brand on the left,
	 * sections in the middle, user controls on the right.
	 *
	 * Hidden below `md`, where `BottomNav` takes over — a top bar is the wrong
	 * shape for a thumb, and a tab bar is the wrong shape for a mouse.
	 */
	const tabs = $derived([
		{ href: resolve('/map'), label: t().nav.map, icon: Map },
		{ href: resolve('/list'), label: t().nav.list, icon: List },
		{ href: resolve('/board'), label: t().nav.board, icon: Trophy },
		{ href: resolve('/friends'), label: t().friends.title, icon: Users },
		{ href: resolve('/profile'), label: t().nav.profile, icon: User },
		...(roles.isAdmin ? [{ href: resolve('/admin'), label: t().nav.admin, icon: Shield }] : [])
	]);

	const isDark = $derived(theme.theme === 'dark');
</script>

<header
	class="border-border bg-surface hidden shrink-0 items-center gap-6 border-b px-6 md:flex"
	style="padding-top: var(--safe-top); min-height: calc(3.5rem + var(--safe-top))"
>
	<a href={resolve('/')} class="shrink-0"><Logo /></a>

	<nav class="flex items-center gap-1" aria-label={t().nav.label}>
		{#each tabs as tab (tab.href)}
			{@const active = page.url.pathname.startsWith(tab.href)}
			<a
				href={tab.href}
				class={cn(
					'flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
					active
						? 'bg-primary-subtle text-primary'
						: 'text-muted-foreground hover:bg-surface-sunken'
				)}
				aria-current={active ? 'page' : undefined}
			>
				<tab.icon class="size-4" />
				{tab.label}
			</a>
		{/each}
	</nav>

	<div class="ml-auto flex items-center gap-2">
		<button
			class="text-muted-foreground hover:bg-surface-sunken grid size-9 place-items-center rounded-lg"
			onclick={() => i18n.set(i18n.locale === 'de' ? 'en' : 'de')}
			aria-label={t().profile.language}
		>
			<span class="text-xs font-semibold">{i18n.locale === 'de' ? 'EN' : 'DE'}</span>
		</button>

		<button
			class="text-muted-foreground hover:bg-surface-sunken grid size-9 place-items-center rounded-lg"
			onclick={() => theme.set(isDark ? 'light' : 'dark')}
			aria-label={t().profile.theme}
		>
			{#if isDark}<Sun class="size-4" />{:else}<Moon class="size-4" />{/if}
		</button>

		{#if auth.isAuthenticated}
			<span class="text-muted-foreground max-w-40 truncate text-sm">
				{auth.user?.username}
			</span>
			<button
				class="text-muted-foreground hover:bg-surface-sunken grid size-9 place-items-center rounded-lg"
				onclick={() => auth.logout()}
				aria-label={t().auth.logout}
			>
				<LogOut class="size-4" />
			</button>
		{:else}
			<Button size="sm" variant="ghost" onclick={() => auth.login()}>{t().auth.login}</Button>
			<Button size="sm" onclick={() => auth.register()}>{t().auth.register}</Button>
		{/if}
	</div>
</header>
