import { describe, expect, it } from 'vitest';
import { detectPlatform, navigationUrl } from './navigation';

describe('detectPlatform', () => {
	it('detects Android', () => {
		expect(detectPlatform('Mozilla/5.0 (Linux; Android 14; Pixel 7)')).toBe('android');
	});

	it('detects iPhone', () => {
		expect(detectPlatform('Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X)')).toBe('ios');
	});

	it('treats a touch-capable Macintosh as iOS', () => {
		// Modern iPads report a desktop user agent; touch points are what give them
		// away, and getting this wrong sends iPad users to the desktop link.
		expect(detectPlatform('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)', 5)).toBe('ios');
	});

	it('treats a real Mac as desktop', () => {
		expect(detectPlatform('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)', 0)).toBe('other');
	});
});

describe('navigationUrl', () => {
	const lat = 49.191788;
	const lon = 7.141897;

	it('uses a geo: URI on Android so the system chooser appears', () => {
		expect(navigationUrl('android', lat, lon)).toBe('geo:49.191788,7.141897?q=49.191788,7.141897');
	});

	it('labels the Android destination when a name is given', () => {
		expect(navigationUrl('android', lat, lon, 'Vor der Haustür')).toContain(
			'?q=49.191788,7.141897(Vor%20der%20Haust%C3%BCr)'
		);
	});

	it('asks Apple Maps for walking directions', () => {
		const url = navigationUrl('ios', lat, lon);
		expect(url).toBe('https://maps.apple.com/?daddr=49.191788,7.141897&dirflg=w');
	});

	it('asks Google Maps for walking directions elsewhere', () => {
		const url = navigationUrl('other', lat, lon);
		expect(url).toContain('travelmode=walking');
		expect(url).toContain('destination=49.191788,7.141897');
	});

	it('keeps six decimals — roughly 0.1 m, well under the interaction radius', () => {
		expect(navigationUrl('other', 49.1917881234, 7.1418971234)).toContain('49.191788,7.141897');
	});
});
