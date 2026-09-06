<script lang="ts">
	import { ArrowRight } from '@lucide/svelte';
	import { resolve } from '$app/paths';
	import { auth } from '$hooks/use-auth.svelte';
	import { t } from '$lib/i18n/index.svelte';
	import Button from '$lib/components/ui/Button.svelte';

	/**
	 * Sign-up section, in dropnote's shape: eyebrow, heading, and a single-field
	 * form.
	 *
	 * The email is collected here but the account is created in Keycloak, which the
	 * form hands off to with the address prefilled. Keycloak stays the only place
	 * credentials exist — reimplementing registration against its Admin API would
	 * mean duplicating password policy, email verification and error handling, and
	 * would bypass the very flows that make it the identity authority.
	 */
	let email = $state('');

	function onSubmit(event: SubmitEvent) {
		event.preventDefault();
		// `loginHint` prefills the username/email field on Keycloak's registration
		// page, so the address typed here is not asked for twice.
		auth.register('/map', email.trim() || undefined);
	}
</script>

<section id="signup" class="landing-section bg-background">
	<div class="landing-inner flex max-w-xl flex-col items-center gap-6 text-center">
		<header class="flex flex-col gap-2">
			<p class="landing-eyebrow">{t().landing.eyebrowSignup}</p>
			<h2 class="text-2xl font-bold tracking-tight sm:text-3xl lg:text-4xl">
				{t().landing.signupTitle}
			</h2>
			<p class="text-muted-foreground text-[15px] leading-relaxed">{t().landing.signupLead}</p>
		</header>

		<form class="flex w-full flex-col gap-3" onsubmit={onSubmit}>
			<label class="flex flex-col gap-1 text-left">
				<span class="text-sm font-medium">{t().landing.emailLabel}</span>
				<input
					bind:value={email}
					type="email"
					autocomplete="email"
					required
					placeholder={t().landing.emailPlaceholder}
					class="border-border-strong bg-surface placeholder:text-muted-foreground focus:border-primary min-h-12 rounded-lg border
					       px-3 text-base focus:outline-none"
				/>
			</label>

			<Button type="submit" size="lg" full>
				{t().landing.signupCta}
				<ArrowRight class="size-4" />
			</Button>
			<p class="text-muted-foreground text-xs">{t().landing.signupHint}</p>
		</form>

		<div class="flex flex-wrap items-center justify-center gap-x-2 gap-y-1 text-sm">
			<span class="text-muted-foreground">{t().landing.alreadyMember}</span>
			<button class="text-primary font-medium underline" onclick={() => auth.login()}>
				{t().auth.login}
			</button>
			<span class="text-muted-foreground">·</span>
			<a class="text-primary font-medium underline" href={resolve('/map')}>
				{t().landing.browseInstead}
			</a>
		</div>
	</div>
</section>
