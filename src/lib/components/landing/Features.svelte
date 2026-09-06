<script lang="ts">
	import { MapPinned, Footprints, Trophy } from '@lucide/svelte';
	import { useConfig } from '$api/config/queries';
	import { t, i18n } from '$lib/i18n/index.svelte';
	import { formatDistance } from '$lib/utils';

	/**
	 * Replaces dropnote's pricing tiers, which WanderTag does not have — inventing
	 * a subscription for the landing page would be advertising something the app
	 * cannot deliver. These are the three real mechanics instead.
	 *
	 * The two distances come from `GET /api/v1/config`, so the copy follows the
	 * server's configured radii rather than repeating them as literals.
	 */
	const configQuery = useConfig();
	const config = $derived(configQuery.data);

	const icons = [MapPinned, Footprints, Trophy];

	const cards = $derived(
		t().landing.features.map((feature, i) => ({
			title: feature.title,
			text:
				typeof feature.text === 'function'
					? feature.text(
							formatDistance(
								i === 0 ? (config?.geo.revealRadiusM ?? 1000) : (config?.geo.interactRadiusM ?? 50),
								i18n.locale
							)
						)
					: feature.text,
			Icon: icons[i]
		}))
	);
</script>

<section id="features" class="landing-section bg-primary-subtle">
	<div class="landing-inner flex flex-col gap-8 md:gap-12">
		<header class="flex flex-col gap-2 text-center">
			<p class="landing-eyebrow">{t().landing.eyebrowFeatures}</p>
			<h2 class="text-2xl font-bold tracking-tight sm:text-3xl lg:text-4xl">
				{t().landing.featuresTitle}
			</h2>
		</header>

		<div class="grid gap-4 md:grid-cols-3 md:gap-6">
			{#each cards as card (card.title)}
				<article class="border-border bg-surface flex flex-col gap-3 rounded-xl border p-5">
					<div class="bg-primary-subtle text-primary grid size-10 place-items-center rounded-lg">
						<card.Icon class="size-5" />
					</div>
					<h3 class="font-bold">{card.title}</h3>
					<p class="text-muted-foreground text-sm leading-relaxed">{card.text}</p>
				</article>
			{/each}
		</div>
	</div>
</section>
