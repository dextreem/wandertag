<script lang="ts">
	import './layout.css';
	import { QueryClient, QueryClientProvider } from '@tanstack/svelte-query';
	import { Toaster } from 'svelte-sonner';
	import { onMount } from 'svelte';
	import { auth } from '$hooks/use-auth.svelte';
	import { theme } from '$hooks/use-theme.svelte';
	import { i18n } from '$lib/i18n/index.svelte';

	let { children } = $props();

	const queryClient = new QueryClient({
		defaultOptions: {
			queries: {
				// Outdoors on mobile data, refetching on every window focus is a waste
				// of battery and bandwidth; the map refetches on movement instead.
				refetchOnWindowFocus: false,
				retry: 1,
				staleTime: 30_000
			}
		}
	});

	onMount(() => {
		theme.init();
		i18n.init();
		auth.init();
	});
</script>

<QueryClientProvider client={queryClient}>
	{@render children()}
	<Toaster position="top-center" richColors />
</QueryClientProvider>
