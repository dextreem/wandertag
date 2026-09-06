<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLAnchorAttributes, HTMLButtonAttributes } from 'svelte/elements';
	import { resolve } from '$app/paths';
	import { cn } from '$lib/utils';

	type Variant = 'primary' | 'secondary' | 'ghost' | 'danger';
	type Size = 'sm' | 'md' | 'lg';

	interface Props extends Omit<HTMLButtonAttributes & HTMLAnchorAttributes, 'href'> {
		variant?: Variant;
		size?: Size;
		/** Stretch to the container width — the default for bottom-sheet actions. */
		full?: boolean;
		loading?: boolean;
		/**
		 * Render as a link instead of a button. An app route (starting with `/`) is
		 * passed through `resolve()`; anchors and external URLs are used verbatim.
		 */
		href?: string;
		children: Snippet;
	}

	let {
		variant = 'primary',
		size = 'md',
		full = false,
		loading = false,
		disabled,
		href,
		class: className,
		children,
		...rest
	}: Props = $props();

	const variants: Record<Variant, string> = {
		primary: 'bg-primary text-primary-foreground hover:bg-primary-hover active:brightness-95',
		secondary: 'bg-surface text-foreground border border-border-strong hover:bg-surface-sunken',
		ghost: 'text-foreground hover:bg-surface-sunken',
		danger: 'bg-danger text-white hover:brightness-110'
	};

	// min-h keeps every size a comfortable thumb target, which matters more than
	// visual tightness on a phone held one-handed outdoors.
	const sizes: Record<Size, string> = {
		sm: 'min-h-9 px-3 text-sm gap-1.5',
		md: 'min-h-11 px-4 text-[15px] gap-2',
		lg: 'min-h-12 px-5 text-base gap-2'
	};

	const classes = $derived(
		cn(
			'inline-flex items-center justify-center rounded-lg font-medium transition-colors',
			'disabled:pointer-events-none disabled:opacity-50',
			variants[variant],
			sizes[size],
			full && 'w-full',
			className
		)
	);

	/*
	 * `resolve()` is an overloaded function typed to the generated union of route
	 * ids, so it cannot accept a plain `string`. Button is deliberately generic
	 * over any destination — an app route, an `#anchor`, or an external URL — so
	 * the signature is widened once, here, rather than casting at every call site.
	 * A wrong route still surfaces as a 404 in development.
	 */
	const resolveRoute = resolve as unknown as (path: string) => string;

	const resolvedHref = $derived(
		href === undefined ? undefined : href.startsWith('/') ? resolveRoute(href) : href
	);
</script>

{#if resolvedHref !== undefined}
	<!-- Already resolved above; the rule only recognises a literal resolve() here. -->
	<!-- eslint-disable-next-line svelte/no-navigation-without-resolve -->
	<a class={classes} href={resolvedHref} {...rest}>
		{@render children()}
	</a>
{:else}
	<button class={classes} disabled={disabled || loading} {...rest}>
		{#if loading}
			<span
				class="size-4 animate-spin rounded-full border-2 border-current border-t-transparent"
				aria-hidden="true"
			></span>
		{/if}
		{@render children()}
	</button>
{/if}
