<script lang="ts">
	import { page } from '$app/state';
	import { resolve } from '$app/paths';
	import { Map, List, Trophy, User, Shield, Users } from '@lucide/svelte';
	import { roles } from '$hooks/use-roles.svelte';
	import { t } from '$lib/i18n/index.svelte';
	import { cn } from '$lib/utils';

	/**
	 * Bottom tab bar — the primary navigation.
	 *
	 * Bottom, not top: this app is used one-handed while walking, and the top of a
	 * phone screen is the least reachable part of it. The bar sits above the home
	 * indicator via the safe-area inset.
	 *
	 * Hidden from md up, where TopNav takes over: a tab bar is the wrong shape for
	 * a mouse, just as a top bar is the wrong shape for a thumb.
	 */
	// resolve() so the links survive a `paths.base` deployment, and so
	// svelte/no-navigation-without-resolve is satisfied.
	const tabs = $derived([
		{ href: resolve('/map'), label: t().nav.map, icon: Map },
		{ href: resolve('/list'), label: t().nav.list, icon: List },
		{ href: resolve('/board'), label: t().nav.board, icon: Trophy },
		{ href: resolve('/friends'), label: t().friends.title, icon: Users },
		{ href: resolve('/profile'), label: t().nav.profile, icon: User },
		...(roles.isAdmin ? [{ href: resolve('/admin'), label: t().nav.admin, icon: Shield }] : [])
	]);
</script>

<nav
	class="border-border bg-surface/95 fixed inset-x-0 bottom-0 z-30 border-t backdrop-blur-md md:hidden"
	style="padding-bottom: var(--safe-bottom)"
	aria-label={t().nav.label}
>
	<ul class="flex h-15 items-stretch">
		{#each tabs as tab (tab.href)}
			{@const active = page.url.pathname.startsWith(tab.href)}
			<li class="flex-1">
				<a
					href={tab.href}
					class={cn(
						'flex h-full flex-col items-center justify-center gap-0.5 text-[11px] font-medium transition-colors',
						active ? 'text-primary' : 'text-muted-foreground'
					)}
					aria-current={active ? 'page' : undefined}
				>
					<tab.icon class="size-[22px]" strokeWidth={active ? 2.4 : 1.8} />
					{tab.label}
				</a>
			</li>
		{/each}
	</ul>
</nav>
