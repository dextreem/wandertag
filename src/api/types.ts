/** Shared shapes mirroring the backend DTOs in `com.extrain.wandertag.api.dto`. */

/**
 * Who put a pin on the map. `USER` pins are created by dropping a note where no
 * place existed yet — a note never exists without a pin.
 */
export type PinSource = 'OSM' | 'ADMIN' | 'USER';

export type PinCategory =
	| 'PEAK'
	| 'VIEWPOINT'
	| 'ALPINE_HUT'
	| 'WILDERNESS_HUT'
	| 'SHELTER'
	| 'RUINS'
	| 'CASTLE'
	| 'MONUMENT'
	| 'MEMORIAL'
	| 'SPRING'
	| 'WATERFALL'
	| 'CAVE'
	| 'OBSERVATION_TOWER'
	| 'DRINKING_WATER'
	| 'OTHER';

export interface Coordinates {
	lat: number;
	lon: number;
}
