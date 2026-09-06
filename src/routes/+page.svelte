<script lang="ts">
	import { t } from '$lib/i18n/index.svelte';
	import LandingHeader from '$lib/components/landing/LandingHeader.svelte';
	import Hero from '$lib/components/landing/Hero.svelte';
	import HowItWorks from '$lib/components/landing/HowItWorks.svelte';
	import Features from '$lib/components/landing/Features.svelte';
	import SignUpSection from '$lib/components/landing/SignUpSection.svelte';
	import LandingFooter from '$lib/components/landing/LandingFooter.svelte';

	/**
	 * Marketing landing page, following dropnote's structure: hero, how it works,
	 * a reasons section in place of its pricing tiers, then sign-up.
	 */
</script>

<svelte:head>
	<title>WanderTag — {t().tagline}</title>
	<meta name="description" content={t().heroLead} />
</svelte:head>

<div class="flex min-h-dvh flex-col">
	<LandingHeader />
	<main class="flex-1">
		<Hero />
		<HowItWorks />
		<Features />
		<SignUpSection />
	</main>
	<LandingFooter />
</div>
