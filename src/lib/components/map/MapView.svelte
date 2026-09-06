<script lang="ts">
	import { onMount } from 'svelte';
	import maplibregl, { type GeoJSONSource, type Map as MapLibreMap } from 'maplibre-gl';
	import 'maplibre-gl/dist/maplibre-gl.css';
	import { LocateFixed, Plus, Minus } from '@lucide/svelte';
	import type { PinMarker } from '$api/pins/types';
	import { geolocation } from '$hooks/use-geolocation.svelte';
	import { t } from '$lib/i18n/index.svelte';
	import { cn } from '$lib/utils';
	import { MARKER_COLORS, friendsToGeoJson, pinsToGeoJson, viewportRadiusM } from './markers';

	interface Props {
		styleUrl: string;
		attribution: string;
		pins: PinMarker[];
		/** Radius in metres to draw as the interaction ring around the user. */
		interactRadiusM: number;
		/** Friends who share their position with you. Empty when nobody does. */
		friends?: { userId: string; displayName: string; lat: number; lon: number; at: string }[];
		onPinClick: (pinId: number) => void;
		/** Fires when the visible area changes, so the caller can widen its query. */
		onViewportChange?: (centre: { lat: number; lon: number }, radiusM: number) => void;
		/** Admin only: long-press to place a pin at these coordinates. */
		onLongPress?: (coords: { lat: number; lon: number }) => void;
	}

	let {
		styleUrl,
		attribution,
		pins,
		interactRadiusM,
		friends = [],
		onPinClick,
		onViewportChange,
		onLongPress
	}: Props = $props();

	let container: HTMLDivElement;
	let map = $state<MapLibreMap | null>(null);
	let styleLoaded = $state(false);
	/** True while the map is showing the user's position, so "recentre" can hide. */
	let followingUser = $state(true);

	const PIN_SOURCE = 'wandertag-pins';
	const USER_SOURCE = 'wandertag-user';
	const FRIEND_SOURCE = 'wandertag-friends';
	const LONG_PRESS_MS = 600;
	const LONG_PRESS_TOLERANCE_PX = 10;

	onMount(() => {
		map = new maplibregl.Map({
			container,
			style: styleUrl,
			center: [10.9853, 47.421],
			zoom: 13,
			attributionControl: false,
			// Rotation is disabled: a rotated map is disorienting when you are
			// navigating by it on foot, and it makes the marker labels harder to read.
			pitchWithRotate: false,
			dragRotate: false,
			touchZoomRotate: true
		});
		map.touchZoomRotate.disableRotation();

		map.addControl(
			new maplibregl.AttributionControl({ compact: true, customAttribution: attribution }),
			'bottom-left'
		);

		map.on('load', () => {
			addSourcesAndLayers();
			styleLoaded = true;
			emitViewport();
		});

		map.on('moveend', emitViewport);
		// Any manual pan breaks the follow-the-user behaviour until recentred.
		map.on('dragstart', () => (followingUser = false));

		setUpLongPress();

		return () => {
			map?.remove();
			map = null;
		};
	});

	function addSourcesAndLayers() {
		if (!map) return;

		map.addSource(PIN_SOURCE, { type: 'geojson', data: pinsToGeoJson([]) });
		map.addSource(USER_SOURCE, {
			type: 'geojson',
			data: { type: 'FeatureCollection', features: [] }
		});
		map.addSource(FRIEND_SOURCE, { type: 'geojson', data: friendsToGeoJson([]) });

		// The interaction radius, drawn as a real circle on the ground so the rule is
		// visible rather than something the user has to infer from error messages.
		map.addLayer({
			id: 'user-radius',
			type: 'circle',
			source: USER_SOURCE,
			paint: {
				'circle-color': MARKER_COLORS.user,
				'circle-opacity': 0.1,
				'circle-stroke-color': MARKER_COLORS.user,
				'circle-stroke-opacity': 0.4,
				'circle-stroke-width': 1,
				// metres → pixels, recomputed per zoom level via an interpolation over
				// the Mercator scale so the circle stays geographically accurate.
				'circle-radius': [
					'interpolate',
					['exponential', 2],
					['zoom'],
					10,
					['/', ['*', interactRadiusM, 256 * 2 ** 10], 40075016.686],
					20,
					['/', ['*', interactRadiusM, 256 * 2 ** 20], 40075016.686]
				]
			}
		});

		// Friends sit above the places but below your own dot: you must always be the
		// easiest thing to find on your own map.
		map.addLayer({
			id: 'friends',
			type: 'circle',
			source: FRIEND_SOURCE,
			paint: {
				'circle-radius': 7,
				'circle-color': MARKER_COLORS.friend,
				'circle-stroke-width': 3,
				'circle-stroke-color': '#f7f4ed',
				// A position older than an hour fades, so the map never implies that a
				// friend is standing where they were this morning.
				'circle-opacity': ['interpolate', ['linear'], ['get', 'ageMinutes'], 0, 1, 60, 1, 240, 0.45]
			}
		});

		map.addLayer({
			id: 'friend-labels',
			type: 'symbol',
			source: FRIEND_SOURCE,
			layout: {
				'text-field': ['get', 'displayName'],
				'text-font': ['Noto Sans Regular'],
				'text-size': 11,
				'text-offset': [0, 1.3],
				'text-anchor': 'top',
				'text-allow-overlap': false,
				'text-optional': true
			},
			paint: {
				'text-color': '#2c5b62',
				'text-halo-color': '#f7f4ed',
				'text-halo-width': 1.5
			}
		});

		map.addLayer({
			id: 'user-dot',
			type: 'circle',
			source: USER_SOURCE,
			paint: {
				'circle-radius': 7,
				'circle-color': MARKER_COLORS.user,
				'circle-stroke-width': 3,
				'circle-stroke-color': '#f7f4ed'
			}
		});

		// Undiscovered pins are hollow and rare: "nobody has been here" is the most
		// motivating state on the map, so it gets the most distinctive treatment.
		// Curated (admin-placed) pins carry a second, wider ring so they stand apart
		// from the ~14k imported from OpenStreetMap. Drawn first, so it sits behind.
		map.addLayer({
			id: 'pins-admin-ring',
			type: 'circle',
			source: PIN_SOURCE,
			filter: ['in', ['get', 'source'], ['literal', ['ADMIN', 'USER']]],
			paint: {
				'circle-radius': ['case', ['get', 'featured'], 15, 13],
				'circle-color': 'rgba(0,0,0,0)',
				'circle-stroke-width': 2,
				// A user-created place gets the same outer ring, in the people colour:
				// "somebody made this" is the same kind of statement as "curated".
				'circle-stroke-color': [
					'match',
					['get', 'source'],
					'USER',
					MARKER_COLORS.noteStroke,
					MARKER_COLORS.adminRing
				],
				'circle-stroke-opacity': ['case', ['get', 'locked'], 0.5, 0.9]
			}
		});

		map.addLayer({
			id: 'pins',
			type: 'circle',
			source: PIN_SOURCE,
			paint: {
				'circle-radius': ['case', ['get', 'featured'], 11, 9],
				// Source is checked before state: on a map of ~14k sage and tan POIs,
				// "a person made this place" is the more useful thing to see at a
				// glance than whether it has been claimed.
				'circle-color': [
					'case',
					['==', ['get', 'source'], 'USER'],
					MARKER_COLORS.note,
					[
						'match',
						['get', 'state'],
						'discovered',
						MARKER_COLORS.discovered,
						'undiscovered',
						'#f7f4ed',
						MARKER_COLORS.available
					]
				],
				'circle-stroke-width': [
					'case',
					['==', ['get', 'state'], 'undiscovered'],
					['case', ['==', ['get', 'source'], 'USER'], 2, 3],
					2
				],
				'circle-stroke-color': [
					'case',
					['==', ['get', 'source'], 'USER'],
					'#f7f4ed',
					['match', ['get', 'state'], 'undiscovered', MARKER_COLORS.undiscovered, '#f7f4ed']
				],
				// Locked pins are dimmed: present, but not yet actionable.
				'circle-opacity': ['case', ['get', 'locked'], 0.65, 1]
			}
		});

		map.addLayer({
			id: 'pin-labels',
			type: 'symbol',
			source: PIN_SOURCE,
			layout: {
				'text-field': ['get', 'name'],
				// Explicit font stack: the basemap style's default is
				// "Open Sans Regular,Arial Unicode MS Regular", which the tile host
				// does not actually serve (404), so our labels would fall back to
				// locally-rendered glyphs and look inconsistent. "Noto Sans Regular"
				// is available from the same glyph endpoint.
				'text-font': ['Noto Sans Regular'],
				'text-size': 11,
				'text-offset': [0, 1.4],
				'text-anchor': 'top',
				'text-max-width': 9,
				// Never hide a label behind another: on a dense Alpine map, half the
				// pins would go nameless.
				'text-allow-overlap': false,
				'text-optional': true
			},
			paint: {
				'text-color': '#22291e',
				'text-halo-color': '#f7f4ed',
				'text-halo-width': 1.5
			},
			// Labels only once zoomed in enough to be readable rather than a smear.
			minzoom: 12
		});

		map.addLayer({
			id: 'note-count',
			type: 'symbol',
			source: PIN_SOURCE,
			filter: ['>', ['get', 'noteCount'], 0],
			layout: {
				'text-field': ['to-string', ['get', 'noteCount']],
				'text-font': ['Noto Sans Regular'],
				'text-size': 10,
				'text-offset': [0.9, -0.9],
				'text-allow-overlap': true
			},
			paint: {
				'text-color': '#f7f4ed',
				'text-halo-color': MARKER_COLORS.note,
				'text-halo-width': 2
			}
		});

		map.on('click', 'pins', (event) => {
			const id = event.features?.[0]?.properties?.id;
			if (typeof id === 'number') onPinClick(id);
		});
		map.on('mouseenter', 'pins', () => map && (map.getCanvas().style.cursor = 'pointer'));
		map.on('mouseleave', 'pins', () => map && (map.getCanvas().style.cursor = ''));
	}

	/**
	 * Long-press to place a pin (admins only).
	 *
	 * Implemented with raw pointer events and a movement tolerance so it cannot be
	 * triggered by a pan: MapLibre has no long-press event of its own, and a
	 * mis-fired pin placement on a map is annoying to undo.
	 */
	function setUpLongPress() {
		if (!map || !onLongPress) return;
		let timer: ReturnType<typeof setTimeout> | null = null;
		let origin: { x: number; y: number } | null = null;

		const cancel = () => {
			if (timer) clearTimeout(timer);
			timer = null;
			origin = null;
		};

		map.on('mousedown', (event) => {
			origin = event.point;
			timer = setTimeout(
				() => onLongPress?.({ lat: event.lngLat.lat, lon: event.lngLat.lng }),
				LONG_PRESS_MS
			);
		});
		map.on('touchstart', (event) => {
			origin = event.point;
			timer = setTimeout(
				() => onLongPress?.({ lat: event.lngLat.lat, lon: event.lngLat.lng }),
				LONG_PRESS_MS
			);
		});
		const onMove = (event: { point: { x: number; y: number } }) => {
			if (!origin) return;
			if (Math.hypot(event.point.x - origin.x, event.point.y - origin.y) > LONG_PRESS_TOLERANCE_PX)
				cancel();
		};
		map.on('mousemove', onMove);
		map.on('touchmove', onMove);
		map.on('mouseup', cancel);
		map.on('touchend', cancel);
	}

	function emitViewport() {
		if (!map || !onViewportChange) return;
		const centre = map.getCenter();
		const canvas = map.getCanvas();
		onViewportChange(
			{ lat: centre.lat, lon: centre.lng },
			viewportRadiusM(centre.lat, map.getZoom(), canvas.clientWidth, canvas.clientHeight)
		);
	}

	function setData(sourceId: string, data: GeoJSON.FeatureCollection) {
		const source = map?.getSource(sourceId) as GeoJSONSource | undefined;
		source?.setData(data);
	}

	export function zoomIn() {
		map?.zoomIn();
	}

	export function zoomOut() {
		map?.zoomOut();
	}

	export function recentre() {
		const position = geolocation.position;
		if (!map || !position) return;
		followingUser = true;
		map.easeTo({ center: [position.lon, position.lat], zoom: Math.max(map.getZoom(), 15) });
	}

	// Push marker data into the map whenever the query results change.
	$effect(() => {
		if (!styleLoaded) return;
		setData(PIN_SOURCE, pinsToGeoJson(pins));
	});

	// Friend positions come from a polled query, so push them like the other sources.
	$effect(() => {
		if (!styleLoaded) return;
		setData(FRIEND_SOURCE, friendsToGeoJson(friends));
	});

	// Follow the user until they pan away, then leave the view where they put it.
	$effect(() => {
		const position = geolocation.position;
		if (!styleLoaded || !map || !position) return;

		setData(USER_SOURCE, {
			type: 'FeatureCollection',
			features: [
				{
					type: 'Feature',
					geometry: { type: 'Point', coordinates: [position.lon, position.lat] },
					properties: {}
				}
			]
		});

		if (followingUser) map.easeTo({ center: [position.lon, position.lat], duration: 500 });
	});
</script>

<div class="map-shell relative min-h-0 flex-1">
	<!-- Explicit h-full/w-full rather than `absolute inset-0`: maplibre-gl.css sets
	     `position: relative` on .maplibregl-map, which overrides the absolute
	     positioning and makes `inset-0` inert, collapsing the container to 0 px. -->
	<div bind:this={container} class="h-full w-full" data-testid="map"></div>

	<!--
		Map controls, stacked bottom-right above the tab bar. MapLibre's own
		NavigationControl is deliberately unused: it brings its own visual language,
		and these have to match the app's buttons.
	-->
	<div
		class="absolute right-3 z-10 flex flex-col gap-2"
		style="bottom: calc(0.75rem + var(--bottom-nav-height))"
	>
		<div class="bg-surface flex flex-col overflow-hidden rounded-full shadow-lg">
			<button
				class="text-foreground hover:bg-surface-sunken grid size-11 place-items-center"
				onclick={zoomIn}
				aria-label={t().zoom.in}
			>
				<Plus class="size-5" />
			</button>
			<div class="bg-border mx-2 h-px"></div>
			<button
				class="text-foreground hover:bg-surface-sunken grid size-11 place-items-center"
				onclick={zoomOut}
				aria-label={t().zoom.out}
			>
				<Minus class="size-5" />
			</button>
		</div>

		{#if geolocation.position}
			<button
				class={cn(
					'grid size-11 place-items-center rounded-full shadow-lg transition-colors',
					followingUser ? 'bg-primary text-primary-foreground' : 'bg-surface text-primary'
				)}
				onclick={recentre}
				aria-label={t().map.recenter}
				aria-pressed={followingUser}
			>
				<LocateFixed class="size-5" />
			</button>
		{/if}
	</div>
</div>

<style>
	:global(.dark) .map-shell :global(.maplibregl-canvas) {
		filter: brightness(0.82) saturate(0.85);
	}

	/* The attribution and controls are our chrome, not the map, so they keep their
	   own colours and stay readable. */
	:global(.dark) .map-shell :global(.maplibregl-ctrl) {
		filter: none;
	}
</style>
