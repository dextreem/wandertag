<script lang="ts">
	import { ArrowRight } from '@lucide/svelte';
	import { auth } from '$hooks/use-auth.svelte';
	import { t } from '$lib/i18n/index.svelte';
	import Button from '$lib/components/ui/Button.svelte';

	/**
	 * Two-column hero on desktop, stacked on mobile — dropnote's proportions.
	 * The illustration comes second in the DOM so a phone leads with the words.
	 */
</script>

<section class="landing-section bg-primary-subtle">
	<div class="landing-inner grid items-center gap-10 md:grid-cols-2 md:gap-14">
		<div class="flex flex-col gap-5">
			<h1 class="text-3xl leading-[1.1] font-bold tracking-tight sm:text-4xl lg:text-5xl">
				{t().tagline}
			</h1>
			<p class="text-muted-foreground max-w-prose text-[15px] leading-relaxed md:text-base">
				{t().heroLead}
			</p>
			<div class="flex flex-col gap-2 sm:flex-row">
				<Button size="lg" href="/map">
					{t().heroCta}
					<ArrowRight class="size-4" />
				</Button>
				{#if !auth.isAuthenticated}
					<Button size="lg" variant="secondary" onclick={() => auth.register()}>
						{t().auth.register}
					</Button>
				{/if}
			</div>
		</div>

		<img
			src="/location_app.svg"
			alt=""
			aria-hidden="true"
			class="mx-auto w-full max-w-sm md:max-w-none"
		/>
	</div>
</section>
