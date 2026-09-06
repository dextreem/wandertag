/**
 * Hand off to whatever maps app the device actually has.
 *
 * WanderTag deliberately does not navigate itself. As a PWA it cannot: iOS
 * suspends JavaScript when the screen locks, there is no reliable background
 * geolocation, and continuous high-accuracy GPS drains the battery. A dedicated
 * maps app does all of that properly and has better footpath data, so the honest
 * move is to send the user there with the destination pre-filled.
 */

export type NavPlatform = 'ios' | 'android' | 'other';

/**
 * Which link form to use.
 *
 * `maxTouchPoints` is what separates an iPad from a Mac: modern iPads report a
 * desktop user agent, so sniffing "Macintosh" alone sends iPad users to the
 * desktop link.
 */
export function detectPlatform(userAgent: string, maxTouchPoints = 0): NavPlatform {
	if (/android/i.test(userAgent)) return 'android';
	if (/iphone|ipad|ipod/i.test(userAgent)) return 'ios';
	if (/macintosh/i.test(userAgent) && maxTouchPoints > 1) return 'ios';
	return 'other';
}

/**
 * A walking-directions URL for the platform.
 *
 * - **Android** gets a `geo:` URI, which opens the system chooser — so OsmAnd,
 *   Organic Maps or Google Maps all work, whichever the user prefers for trails.
 *   `geo:` has no travel-mode parameter; the chosen app decides.
 * - **iOS** gets an Apple Maps universal link with `dirflg=w` (walk). The
 *   universal form is used rather than `maps://` so it still resolves in a
 *   desktop browser and in an in-app webview.
 * - **Everything else** gets Google Maps with `travelmode=walking`.
 */
export function navigationUrl(
	platform: NavPlatform,
	lat: number,
	lon: number,
	label?: string
): string {
	const coords = `${lat.toFixed(6)},${lon.toFixed(6)}`;

	if (platform === 'android') {
		const query = label ? `${coords}(${encodeURIComponent(label)})` : coords;
		return `geo:${coords}?q=${query}`;
	}

	if (platform === 'ios') {
		return `https://maps.apple.com/?daddr=${coords}&dirflg=w`;
	}

	return `https://www.google.com/maps/dir/?api=1&destination=${coords}&travelmode=walking`;
}

/** Convenience for the browser: detect and build in one call. */
export function walkingDirectionsUrl(lat: number, lon: number, label?: string): string {
	const platform =
		typeof navigator === 'undefined'
			? 'other'
			: detectPlatform(navigator.userAgent, navigator.maxTouchPoints);
	return navigationUrl(platform, lat, lon, label);
}
