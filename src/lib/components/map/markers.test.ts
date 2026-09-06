import { describe, expect, it } from 'vitest';
import type { PinMarker } from '$api/pins/types';
import { metresPerPixel, pinState, pinsToGeoJson, roundPosition, viewportRadiusM } from './markers';

function pin(overrides: Partial<PinMarker> = {}): PinMarker {
	return {
		id: 1,
		source: 'OSM',
		category: 'PEAK',
		name: 'Zugspitze',
		lat: 47.421,
		lon: 10.9853,
		elevationM: 2962,
		featured: false,
		distanceM: 40,
		noteCount: 0,
		discovered: false,
		discoveredByAnyone: false,
		locked: false,
		...overrides
	};
}

describe('pinState', () => {
	it('reports a pin the user has claimed as discovered', () => {
		expect(pinState(pin({ discovered: true, discoveredByAnyone: true }))).toBe('discovered');
	});

	it('reports a pin nobody has reached as undiscovered', () => {
		expect(pinState(pin({ discovered: false, discoveredByAnyone: false }))).toBe('undiscovered');
	});

	it('reports a pin others have reached as available', () => {
		expect(pinState(pin({ discovered: false, discoveredByAnyone: true }))).toBe('available');
	});

	it('prefers the user own discovery over the global flag', () => {
		expect(pinState(pin({ discovered: true, discoveredByAnyone: false }))).toBe('discovered');
	});
});

describe('pinsToGeoJson', () => {
	it('emits coordinates as [lon, lat]', () => {
		// This is the axis order that the dropnote prototype got wrong. GeoJSON and
		// PostGIS agree on lon-first; a regression here silently moves every marker.
		const fc = pinsToGeoJson([pin()]);
		expect(fc.features[0].geometry.coordinates).toEqual([10.9853, 47.421]);
	});

	it('carries the marker state through to the feature properties', () => {
		const fc = pinsToGeoJson([pin({ noteCount: 3, locked: true })]);
		expect(fc.features[0].properties).toMatchObject({
			id: 1,
			name: 'Zugspitze',
			state: 'undiscovered',
			noteCount: 3,
			locked: true
		});
	});
});

describe('user-created pins', () => {
	it('carries USER through as the source', () => {
		// The paint expression keys off `source`, so this is what makes a place a
		// person made read as a human trace rather than as terrain.
		const fc = pinsToGeoJson([pin({ source: 'USER', name: 'Gipfelkreuz' })]);
		expect(fc.features[0].properties.source).toBe('USER');
	});
});

describe('metresPerPixel', () => {
	it('shrinks with latitude at a fixed zoom', () => {
		// Web Mercator: a pixel covers less ground the further from the equator.
		expect(metresPerPixel(47.42, 14)).toBeLessThan(metresPerPixel(0, 14));
	});

	it('halves for each zoom level', () => {
		expect(metresPerPixel(47.42, 15) / metresPerPixel(47.42, 14)).toBeCloseTo(0.5, 6);
	});
});

describe('viewportRadiusM', () => {
	it('grows as the map zooms out', () => {
		const zoomedIn = viewportRadiusM(47.42, 16, 390, 600);
		const zoomedOut = viewportRadiusM(47.42, 12, 390, 600);
		expect(zoomedOut).toBeGreaterThan(zoomedIn);
	});

	it('covers the visible diagonal, so nothing on screen is missed', () => {
		// Half the diagonal of a 390x600 viewport is ~358 px. At zoom 14 and 47 deg
		// north a pixel is ~6.4 m, so the radius should be a few kilometres.
		const radius = viewportRadiusM(47.42, 14, 390, 600);
		expect(radius).toBeGreaterThan(2000);
		expect(radius).toBeLessThan(3000);
	});
});

describe('roundPosition', () => {
	it('snaps to a grid so GPS jitter does not invalidate the query cache', () => {
		expect(roundPosition(47.421037, 10.985312)).toEqual({ lat: 47.421, lon: 10.985 });
		// Two fixes a few metres apart must round to the same key.
		expect(roundPosition(47.42101, 10.98531)).toEqual(roundPosition(47.42149, 10.98549));
	});
});
