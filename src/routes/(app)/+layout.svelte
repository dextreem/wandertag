<script lang="ts">
	import { onMount } from 'svelte';
	import BottomNav from '$lib/components/ui/BottomNav.svelte';
	import TopNav from '$lib/components/ui/TopNav.svelte';
	import { geolocation } from '$hooks/use-geolocation.svelte';

	let { children } = $props();

	/**
	 * The location watch is started once, here, for the whole app shell rather than
	 * per page — a single `watchPosition` means one permission prompt and one GPS
	 * consumer, and the position survives navigation between tabs.
	 */
	onMount(() => {
		// Restore a dev-pinned position *before* starting the watch. A direct load of
		// any tab creates a fresh store, so this has to happen in the shared shell
		// rather than on the map page alone.
		if (import.meta.env.DEV) geolocation.restoreOverride();
		geolocation.start();
		return () => geolocation.stop();
	});
</script>

<!--
	h-dvh, not min-h-dvh: the map fills its container with an absolutely positioned
	canvas, so a merely *minimum* height leaves `flex-1` resolving against zero
	content height and the map renders 0 px tall. Every flex child down to the map
	also needs min-h-0 to be allowed to shrink into that definite height.

	Navigation swaps shape at md: a tab bar under the thumb on a phone, a header
	bar under the cursor on a desktop.
-->
<div class="flex h-dvh flex-col overflow-hidden">
	<TopNav />

	<main
		class="flex min-h-0 flex-1 flex-col overflow-y-auto"
		style="padding-bottom: var(--bottom-nav-height)"
	>
		{@render children()}
	</main>

	<BottomNav />
</div>
