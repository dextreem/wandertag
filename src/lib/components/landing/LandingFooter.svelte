<script lang="ts">
	import { t } from '$lib/i18n/index.svelte';
	import Logo from '$lib/components/ui/Logo.svelte';

	const year = new Date().getFullYear();
</script>

<footer
	class="border-border bg-surface-sunken border-t"
	style="padding-bottom: calc(1.5rem + var(--safe-bottom))"
>
	<div
		class="landing-inner flex flex-col items-center gap-3 px-5 pt-6 text-center md:flex-row md:justify-between md:px-8 md:text-left"
	>
		<Logo />
		<p class="text-muted-foreground text-xs">{t().common.attribution}</p>
		<p class="text-muted-foreground text-xs">{t().landing.footerRights(year)}</p>
	</div>
</footer>
