import type { PinCategory, PinSource } from '../types';
import type { NoteResponse } from '../notes/types';

export interface PinMarker {
	id: number;
	source: PinSource;
	category: PinCategory;
	name: string;
	lat: number;
	lon: number;
	elevationM: number | null;
	featured: boolean;
	distanceM: number;
	noteCount: number;
	/** Whether the signed-in user has already uncovered this pin. */
	discovered: boolean;
	/** False means nobody has been here — first blood is still available. */
	discoveredByAnyone: boolean;
	/** True when the user is too far away to interact. */
	locked: boolean;
}

export interface PinMarkersResponse {
	pins: PinMarker[];
	/** The radius the server actually applied, after clamping. */
	appliedRadiusM: number;
	interactRadiusM: number;
}

export interface PinDetail {
	id: number;
	source: PinSource;
	category: PinCategory;
	name: string;
	description: string | null;
	lat: number;
	lon: number;
	elevationM: number | null;
	featured: boolean;
	hidden: boolean;
	distanceM: number | null;
	locked: boolean;
	noteCount: number;
	discovered: boolean;
	discoveredByAnyone: boolean;
	notes: NoteResponse[];
}

export interface NearbyPinsParams {
	/** The user's own position — distances and `locked` are measured from here. */
	lat: number;
	lon: number;
	/**
	 * Centre of the area being looked at (the map viewport). Lets the map show what
	 * is on screen without changing how far anything is from the user. Omit to
	 * search around the user.
	 */
	areaLat?: number;
	areaLon?: number;
	radiusM?: number;
}

export interface DiscoverPinRequest {
	lat: number;
	lon: number;
	accuracyM?: number | null;
}

export interface DiscoveryResult {
	pinId: number;
	pinName: string;
	distanceM: number;
	firstBlood: boolean;
	newlyDiscovered: boolean;
	discoveryCount: number;
	firstBloodCount: number;
	currentStreak: number;
	longestStreak: number;
}

export interface CreatePinRequest {
	name: string;
	description?: string | null;
	category: PinCategory;
	lat: number;
	lon: number;
	elevationM?: number | null;
	featured?: boolean;
}

export interface UpdatePinRequest {
	name?: string;
	description?: string | null;
	category?: PinCategory;
	lat?: number;
	lon?: number;
	elevationM?: number | null;
	featured?: boolean;
	hidden?: boolean;
}
