<script lang="ts">
	import { Search, X } from '@lucide/svelte';
	import { t } from '$lib/i18n/index.svelte';

	/**
	 * Debounced search input.
	 *
	 * Debounced rather than search-on-enter because the lists behind it are paged
	 * server-side: typing "burg" would otherwise fire four queries against 14k rows.
	 */
	interface Props {
		onchange: (value: string) => void;
		placeholder?: string;
		delayMs?: number;
	}

	let { onchange, placeholder, delayMs = 300 }: Props = $props();

	/*
	 * The input owns its text. There is deliberately no value prop: the parent hears
	 * about changes through [onchange], and pushing text back in would fight the
	 * debounce mid-keystroke. Every caller starts empty, so nothing needs seeding.
	 */
	let local = $state('');
	let timer: ReturnType<typeof setTimeout> | null = null;

	function push(next: string) {
		local = next;
		if (timer) clearTimeout(timer);
		timer = setTimeout(() => onchange(next.trim()), delayMs);
	}

	function clear() {
		if (timer) clearTimeout(timer);
		local = '';
		onchange('');
	}
</script>

<div class="relative">
	<Search
		class="text-muted-foreground pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2"
	/>
	<input
		value={local}
		oninput={(event) => push(event.currentTarget.value)}
		placeholder={placeholder ?? t().paging.searchPlaceholder}
		aria-label={t().paging.search}
		class="border-border-strong bg-surface focus:border-primary min-h-11 w-full rounded-lg border pr-10 pl-9 text-base focus:outline-none"
	/>
	{#if local}
		<button
			class="text-muted-foreground hover:text-foreground absolute top-1/2 right-2 -translate-y-1/2 p-1.5"
			onclick={clear}
			aria-label={t().paging.clear}
		>
			<X class="size-4" />
		</button>
	{/if}
</div>
