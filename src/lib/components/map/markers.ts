import type { PinMarker } from '$api/pins/types';

/**
 * The three marker states, which are the whole visual language of the map.
 *
 * `undiscovered` is the one that does the work: an outlined, hollow marker reads as
 * "nothing here yet" and is what turns an empty region into something to go and
 * claim, rather than a blank screen.
 */
export type PinState = 'undiscovered' | 'available' | 'discovered';

export function pinState(pin: PinMarker): PinState {
	if (pin.discovered) return 'discovered';
	if (!pin.discoveredByAnyone) return 'undiscovered';
	return 'available';
}

/**
 * Palette tokens duplicated as literals, because MapLibre paint expressions cannot
 * read CSS custom properties. Keep in step with `src/routes/layout.css`.
 *
 * The map has two colour families and the split carries meaning:
 *
 *  - **sage and tan are places.** A point of interest that exists whether or not
 *    anyone has been there. Tan hollow = nobody has claimed it yet; sage filled =
 *    claimed.
 *  - **teal is people.** Your own position, and the notes people have left. Teal is
 *    deliberately outside the brand families so a human trace never reads as
 *    terrain.
 *
 * Admin-placed pins share the place colours but carry a second outer ring, so a
 * curated pin is distinguishable from the ~14k imported from OpenStreetMap.
 *
 * A `USER` pin — a place that exists because somebody stood there and wrote
 * something — is drawn in the people colours instead of the place colours. There is
 * no separate note marker any more: a note always belongs to a pin, so the pin *is*
 * the note's marker, and drawing both stacked two circles on one spot.
 */
export const MARKER_COLORS = {
	discovered: '#5a6c50', // sage-600 — a place you have claimed
	available: '#8fa28a', // sage-400 — a place someone else has claimed
	undiscovered: '#c8a96b', // tan-400 — hollow: nobody has been here
	adminRing: '#8a6f33', // tan-600 — the extra ring on a curated pin
	note: '#4f8a93', // teal — a note a person left
	noteStroke: '#2c5b62', // darker teal, so a note reads as a pin not a blob
	user: '#3f6b72', // slate-teal — you
	friend: '#7fb3ba' // pale teal — a friend, same family as you, clearly not you
} as const;

export interface PinFeatureProperties {
	id: number;
	name: string;
	category: string;
	/**
	 * 'OSM', 'ADMIN' or 'USER'. Curated pins get a second ring; user-created ones
	 * are drawn teal, because they are a human trace rather than terrain.
	 */
	source: string;
	state: PinState;
	noteCount: number;
	locked: boolean;
	distanceM: number;
	featured: boolean;
}

export function pinsToGeoJson(
	pins: PinMarker[]
): GeoJSON.FeatureCollection<GeoJSON.Point, PinFeatureProperties> {
	return {
		type: 'FeatureCollection',
		features: pins.map((pin) => ({
			type: 'Feature',
			// GeoJSON is [lon, lat] — the same axis order PostGIS uses, and the same
			// place the dropnote prototype got it wrong. Never write [lat, lon] here.
			geometry: { type: 'Point', coordinates: [pin.lon, pin.lat] },
			properties: {
				id: pin.id,
				name: pin.name,
				category: pin.category,
				source: pin.source,
				state: pinState(pin),
				noteCount: pin.noteCount,
				locked: pin.locked,
				distanceM: pin.distanceM,
				featured: pin.featured
			}
		}))
	};
}

/**
 * Metres per pixel at a given latitude and zoom, for turning the visible map into
 * a request radius. Web Mercator: the ground covered by a tile shrinks with
 * latitude, so the cosine term is not optional at Alpine latitudes.
 */
export function metresPerPixel(lat: number, zoom: number): number {
	return (156543.03392 * Math.cos((lat * Math.PI) / 180)) / 2 ** zoom;
}

/**
 * Radius, in metres, that covers the visible map.
 *
 * This is what makes zooming out *be* the radius control: the user widens their
 * view and the next request asks for a wider radius, clamped server-side. No
 * setting to find, which is what rural coverage actually needs.
 */
export function viewportRadiusM(
	lat: number,
	zoom: number,
	widthPx: number,
	heightPx: number
): number {
	const halfDiagonalPx = Math.hypot(widthPx, heightPx) / 2;
	return Math.round(halfDiagonalPx * metresPerPixel(lat, zoom));
}

/**
 * Rounds a position to a grid, for building a stable query *cache key*.
 *
 * Never round a position that is sent to the server: at 3 decimal places this
 * quantises to roughly 111 m, which is meaningless against a 50 m interaction
 * radius — an 11 m pin reported 25 m, and a pin just inside the radius could round
 * to just outside it and come back locked. The per-domain query-key factories do
 * the rounding; the request carries full precision.
 */
export function roundPosition(
	lat: number,
	lon: number,
	decimals = 3
): { lat: number; lon: number } {
	const factor = 10 ** decimals;
	return { lat: Math.round(lat * factor) / factor, lon: Math.round(lon * factor) / factor };
}

export interface FriendFeatureProperties {
	userId: string;
	displayName: string;
	/** Minutes since the position was recorded, for the staleness label. */
	ageMinutes: number;
}

/**
 * Friend positions.
 *
 * Kept in the "people" colour family but a paler teal than your own dot: a friend
 * has to be unmistakably not-you, while still not reading as terrain. The age is
 * carried through because these are last-known positions, not live tracking, and
 * the map must not imply otherwise.
 */
export function friendsToGeoJson(
	friends: { userId: string; displayName: string; lat: number; lon: number; at: string }[],
	now = Date.now()
): GeoJSON.FeatureCollection<GeoJSON.Point, FriendFeatureProperties> {
	return {
		type: 'FeatureCollection',
		features: friends.map((friend) => ({
			type: 'Feature',
			geometry: { type: 'Point', coordinates: [friend.lon, friend.lat] },
			properties: {
				userId: friend.userId,
				displayName: friend.displayName,
				ageMinutes: Math.max(0, Math.round((now - new Date(friend.at).getTime()) / 60_000))
			}
		}))
	};
}
