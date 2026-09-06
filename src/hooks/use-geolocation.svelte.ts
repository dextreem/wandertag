/**
 * The single source of "where am I" for the whole app.
 *
 * Wraps `watchPosition` in runes so any component can read the live position
 * without each one requesting permission separately. Every geo-gated action
 * (dropping a note, uncovering a pin) reads from here, so there is exactly one
 * place where a position enters the app.
 */

export interface Position {
	lat: number;
	lon: number;
	accuracyM: number | null;
	timestamp: number;
}

export type GeoStatus =
	| 'idle'
	| 'requesting'
	| 'watching'
	| 'denied'
	| 'unavailable'
	| 'error'
	/** A manually pinned position is in force; the real watch is suspended. */
	| 'override';

/** Where a manual override is remembered, so it survives a reload. */
const OVERRIDE_KEY = 'wandertag:dev-location';

const WATCH_OPTIONS: PositionOptions = {
	enableHighAccuracy: true,
	// Outdoors on a phone, a fix a few seconds old is fine and saves battery.
	maximumAge: 5_000,
	timeout: 20_000
};

class GeolocationState {
	position = $state<Position | null>(null);
	status = $state<GeoStatus>('idle');
	errorMessage = $state<string | null>(null);

	#watchId: number | null = null;

	/**
	 * A manually pinned position, for development.
	 *
	 * Desktop browsers have no GPS and fall back to a network lookup that is often
	 * unavailable — Brave in particular does not use Google's location service — so
	 * on a laptop the app can simply never get a fix. Rather than making that a
	 * dead end, a position can be pinned by hand.
	 *
	 * This is not a security hole: the server already treats client coordinates as
	 * untrusted, measures distance against the stored geometry and runs the
	 * plausibility check in `GeoValidationService`. Anyone could already post
	 * whatever coordinates they liked. The UI for it is still dev-only, because in
	 * production it is a confusing thing to expose.
	 */
	override = $state<Position | null>(null);

	/** True once we have a fix good enough to act on. */
	hasFix = $derived(this.position !== null);

	/** Accuracy bucket, for the "GPS weak" hint in the UI. */
	quality = $derived.by<'good' | 'fair' | 'poor' | 'unknown'>(() => {
		const accuracy = this.position?.accuracyM;
		if (accuracy == null) return 'unknown';
		if (accuracy <= 20) return 'good';
		if (accuracy <= 50) return 'fair';
		return 'poor';
	});

	/** Restores a pinned position from a previous session, if there is one. */
	restoreOverride() {
		try {
			const raw = localStorage.getItem(OVERRIDE_KEY);
			if (!raw) return;
			const parsed = JSON.parse(raw) as { lat: number; lon: number };
			if (Number.isFinite(parsed.lat) && Number.isFinite(parsed.lon)) {
				this.setOverride(parsed.lat, parsed.lon);
			}
		} catch {
			// Blocked or corrupt storage is not worth failing over.
		}
	}

	/** Pins the position by hand and suspends the real watch. */
	setOverride(lat: number, lon: number) {
		this.stop();
		this.override = { lat, lon, accuracyM: 5, timestamp: Date.now() };
		this.position = this.override;
		this.status = 'override';
		this.errorMessage = null;
		try {
			localStorage.setItem(OVERRIDE_KEY, JSON.stringify({ lat, lon }));
		} catch {
			// Non-fatal: the pin just will not survive a reload.
		}
	}

	/** Drops the pinned position and hands control back to the device. */
	clearOverride() {
		this.override = null;
		this.position = null;
		this.status = 'idle';
		try {
			localStorage.removeItem(OVERRIDE_KEY);
		} catch {
			// Non-fatal.
		}
		this.start();
	}

	start() {
		// A pinned position wins: starting the watch would immediately overwrite it.
		if (this.override) {
			this.position = this.override;
			this.status = 'override';
			return;
		}
		if (this.#watchId !== null) return;
		if (typeof navigator === 'undefined' || !navigator.geolocation) {
			this.status = 'unavailable';
			this.errorMessage = 'Dieses Gerät unterstützt keine Standortbestimmung.';
			return;
		}

		this.status = this.position ? 'watching' : 'requesting';
		this.#watchId = navigator.geolocation.watchPosition(
			(fix) => {
				this.position = {
					lat: fix.coords.latitude,
					lon: fix.coords.longitude,
					accuracyM: Number.isFinite(fix.coords.accuracy) ? fix.coords.accuracy : null,
					timestamp: fix.timestamp
				};
				this.status = 'watching';
				this.errorMessage = null;
			},
			(error) => {
				if (error.code === error.PERMISSION_DENIED) {
					this.status = 'denied';
					this.errorMessage = 'Standortzugriff verweigert.';
				} else {
					this.status = 'error';
					this.errorMessage = error.message;
				}
			},
			WATCH_OPTIONS
		);
	}

	stop() {
		if (this.#watchId !== null) {
			navigator.geolocation.clearWatch(this.#watchId);
			this.#watchId = null;
		}
		if (!this.override) this.status = 'idle';
	}
}

export const geolocation = new GeolocationState();

/** Metres between two coordinates (haversine) — for client-side distance hints only. */
export function distanceMetres(a: Position, bLat: number, bLon: number): number {
	const R = 6_371_008.8;
	const dLat = ((bLat - a.lat) * Math.PI) / 180;
	const dLon = ((bLon - a.lon) * Math.PI) / 180;
	const h =
		Math.sin(dLat / 2) ** 2 +
		Math.cos((a.lat * Math.PI) / 180) * Math.cos((bLat * Math.PI) / 180) * Math.sin(dLon / 2) ** 2;
	return 2 * R * Math.asin(Math.min(1, Math.sqrt(h)));
}
