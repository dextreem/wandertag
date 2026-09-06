<script lang="ts">
	interface Props {
		number: string;
		title: string;
		text: string;
		img: string;
		alt: string;
		/** Mirror the layout so consecutive rows alternate on desktop. */
		inverted?: boolean;
	}

	let { number, title, text, img, alt, inverted = false }: Props = $props();
</script>

<!--
	Alternating two-column rows, as in dropnote's "how it works". On mobile the
	grid collapses to one column and `order` is ignored, so the text always comes
	before its illustration regardless of which side it sits on at desktop width.
-->
<div class="grid items-center gap-6 md:grid-cols-2 md:gap-12">
	<div class={inverted ? 'md:order-2' : ''}>
		<div class="flex items-start gap-4">
			<span
				class="text-border-strong text-5xl leading-none font-bold tabular-nums select-none md:text-6xl"
				aria-hidden="true"
			>
				{number}
			</span>
			<div class="flex flex-col gap-2 pt-1">
				<h3 class="text-primary text-lg font-bold uppercase md:text-xl">{title}</h3>
				<p class="text-muted-foreground max-w-prose text-[15px] leading-relaxed">{text}</p>
			</div>
		</div>
	</div>

	<img
		src={img}
		{alt}
		class={'mx-auto w-full max-w-xs md:max-w-sm ' + (inverted ? 'md:order-1' : '')}
	/>
</div>
