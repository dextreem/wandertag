export interface NoteResponse {
	id: number;
	/** Never null: a note only exists as part of a place. */
	pinId: number;
	title: string;
	/**
	 * Null when the reader is outside the interaction radius. Authors and admins
	 * always get the body, so a bad note can be read and moderated from anywhere.
	 */
	body: string | null;
	authorId: string;
	authorName: string;
	lat: number;
	lon: number;
	readCount: number;
	createdAt: string;
	distanceM: number | null;
	locked: boolean;
	rating: Rating;
}

/** Aggregate rating for a note. `yours` is null until you have rated it. */
export interface Rating {
	average: number | null;
	votes: number;
	yours: number | null;
}

export interface RateNoteRequest {
	stars: number;
	/** Rating requires being there, so the position is checked like any other claim. */
	lat: number;
	lon: number;
}

export interface NotesResponse {
	notes: NoteResponse[];
	appliedRadiusM: number;
	interactRadiusM: number;
}

export interface NearbyNotesParams {
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

export interface CreateNoteRequest {
	title: string;
	body?: string | null;
	/** Anchor to an existing pin — requires standing at it. */
	pinId?: number | null;
	/**
	 * Name for the place this note creates, used only when `pinId` is null. Falls
	 * back to the note's title server-side.
	 */
	pinName?: string | null;
	lat: number;
	lon: number;
	accuracyM?: number | null;
}
