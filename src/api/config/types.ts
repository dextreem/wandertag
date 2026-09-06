export interface GeoConfig {
	/** Default radius in metres within which markers appear. */
	revealRadiusM: number;
	/** Radius in metres within which notes can be read and pins discovered. */
	interactRadiusM: number;
	/** Largest radius the server honours on a `radiusM` request. */
	maxRevealRadiusM: number;
	maxAccuracyM: number;
}

export interface MapConfig {
	styleUrl: string;
	attribution: string;
}

export interface AppConfig {
	geo: GeoConfig;
	map: MapConfig;
	supportedLocales: string[];
}
