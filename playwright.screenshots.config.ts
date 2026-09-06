import { defineConfig, devices } from '@playwright/test';

/**
 * Screenshot capture for the README — deliberately a separate config from
 * `playwright.config.ts`.
 *
 * These are not tests: they navigate the real stack and save PNGs, they are slow,
 * and a failure here means "the picture did not come out", not "the app is broken".
 * Keeping them out of the test project means `npm run test:e2e` stays a signal
 * about behaviour, and the shots are regenerated on purpose with
 * `npm run screenshots`.
 */
export default defineConfig({
	testDir: './screenshots',
	fullyParallel: false,
	workers: 1,
	retries: 0,
	reporter: 'list',
	timeout: 120_000,
	use: {
		baseURL: 'http://localhost:5173',
		locale: 'de-DE',
		// Zugspitze summit — a public landmark with seeded pins around it, and the
		// same position the e2e suite uses.
		//
		// Deliberately NOT the maintainer's own location. A screenshot of this app is
		// location data: the basemap names the surrounding streets, the position dot
		// sits on them, and the nearby list gives landmarks with exact distances. An
		// earlier set of captures was taken from a real home address and had to be
		// deleted from a public repository.
		geolocation: { latitude: 47.42136, longitude: 10.9863 },
		permissions: ['geolocation'],
		// A crisp 2× capture, because a README rendered on a retina screen makes a
		// 1× screenshot look like a mistake.
		deviceScaleFactor: 2
	},
	// Starts the dev server like the e2e config does. Without it the capture only
	// worked when a server happened to be running already, which is how it broke the
	// moment a stale one was killed.
	webServer: {
		command: 'npm run dev -- --port 5173',
		url: 'http://localhost:5173',
		reuseExistingServer: true,
		timeout: 120_000
	},
	projects: [
		{
			// Chromium with a phone viewport, matching `playwright.config.ts`: the
			// WebKit build these device presets default to is not installed, and the
			// point here is the layout, not the engine.
			name: 'mobile',
			use: {
				...devices['Desktop Chrome'],
				viewport: { width: 390, height: 844 },
				deviceScaleFactor: 2,
				isMobile: false,
				hasTouch: true
			}
		},
		{ name: 'desktop', use: { viewport: { width: 1440, height: 900 }, deviceScaleFactor: 2 } }
	]
});
