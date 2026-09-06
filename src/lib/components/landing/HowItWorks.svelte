<script lang="ts">
	import { t } from '$lib/i18n/index.svelte';
	import HowRow from './HowRow.svelte';
</script>

<section id="how" class="landing-section bg-background">
	<div class="landing-inner flex flex-col gap-10 md:gap-16">
		<header class="flex flex-col gap-2 text-center">
			<p class="landing-eyebrow">{t().landing.eyebrowHow}</p>
			<h2 class="text-2xl font-bold tracking-tight sm:text-3xl lg:text-4xl">
				{t().landing.howTitle}
			</h2>
		</header>

		{#each t().landing.steps as step, i (step.number)}
			<HowRow {...step} inverted={i % 2 === 1} />
		{/each}
	</div>
</section>
