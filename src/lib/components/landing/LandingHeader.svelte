<script lang="ts">
	import { Menu, X } from '@lucide/svelte';
	import { resolve } from '$app/paths';
	import { auth } from '$hooks/use-auth.svelte';
	import { t, i18n } from '$lib/i18n/index.svelte';
	import Logo from '$lib/components/ui/Logo.svelte';
	import Button from '$lib/components/ui/Button.svelte';

	/**
	 * Marketing header: anchor links on desktop, a disclosure menu on mobile.
	 *
	 * Separate from the app's `AppHeader` on purpose — this one sells, that one
	 * navigates. Sharing a component would mean one of the two compromising.
	 */
	let open = $state(false);

	/** In-page section anchors. */
	const links = $derived([
		{ hash: '#how', label: t().landing.navHow },
		{ hash: '#features', label: t().landing.navFeatures },
		{ hash: '#signup', label: t().landing.navSignup }
	]);
</script>

<header
	class="border-border bg-background/90 sticky top-0 z-40 border-b backdrop-blur-md"
	style="padding-top: var(--safe-top)"
>
	<div class="landing-inner flex items-center gap-4 px-5 py-3 md:px-8">
		<a href={resolve('/')} class="shrink-0"><Logo /></a>

		<nav class="ml-auto hidden items-center gap-6 md:flex">
			{#each links as link (link.hash)}
				<a
					href={link.hash}
					class="text-muted-foreground hover:text-primary text-sm font-medium transition-colors"
				>
					{link.label}
				</a>
			{/each}
		</nav>

		<div class="ml-auto flex items-center gap-2 md:ml-0">
			<button
				class="text-muted-foreground hover:text-primary hidden text-sm font-medium md:block"
				onclick={() => i18n.set(i18n.locale === 'de' ? 'en' : 'de')}
				aria-label={t().profile.language}
			>
				{i18n.locale === 'de' ? 'EN' : 'DE'}
			</button>

			{#if auth.isAuthenticated}
				<Button size="sm" href="/map">{t().heroCta}</Button>
			{:else}
				<Button
					size="sm"
					variant="ghost"
					class="hidden md:inline-flex"
					onclick={() => auth.login()}
				>
					{t().auth.login}
				</Button>
				<Button size="sm" onclick={() => auth.register()}>{t().auth.register}</Button>
			{/if}

			<button
				class="touch-target text-foreground grid place-items-center rounded-lg md:hidden"
				onclick={() => (open = !open)}
				aria-label={t().nav.label}
				aria-expanded={open}
			>
				{#if open}<X class="size-5" />{:else}<Menu class="size-5" />{/if}
			</button>
		</div>
	</div>

	{#if open}
		<nav class="border-border flex flex-col gap-1 border-t px-5 pb-3 md:hidden">
			{#each links as link (link.hash)}
				<a
					href={link.hash}
					class="touch-target text-muted-foreground flex items-center text-sm font-medium"
					onclick={() => (open = false)}
				>
					{link.label}
				</a>
			{/each}
			<button
				class="touch-target text-muted-foreground flex items-center text-sm font-medium"
				onclick={() => {
					i18n.set(i18n.locale === 'de' ? 'en' : 'de');
					open = false;
				}}
			>
				{i18n.locale === 'de' ? 'English' : 'Deutsch'}
			</button>
		</nav>
	{/if}
</header>
