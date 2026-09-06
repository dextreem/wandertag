import { defineConfig, devices } from '@playwright/test';

/**
 * E2E runs against the real stack: the SvelteKit dev server, the Spring Boot API,
 * PostGIS and Keycloak. Nothing is mocked, because the things worth testing here
 * — a PKCE redirect, a GPS-gated discovery, a PostGIS radius — only exist when
 * those services are actually running.
 *
 * Start the backend first:
 *   cd ../wandertag-backend && make local-setup && make run
 */
export default defineConfig({
	testDir: './e2e',
	// Clears the anti-cheat ledger, so one run's spoofed positions do not make the
	// next run's actions look like teleporting.
	globalSetup: './e2e/global-setup.ts',
	fullyParallel: false,
	// Discovery state is per-user and persistent, so parallel workers would race
	// over the same seeded accounts.
	workers: 1,
	retries: process.env.CI ? 1 : 0,
	reporter: process.env.CI ? 'github' : 'list',
	timeout: 60_000,
	use: {
		baseURL: 'http://localhost:5173',
		locale: 'de-DE',
		trace: 'retain-on-failure',
		// Zugspitze summit — inside the interaction radius of the seeded pins there.
		geolocation: { latitude: 47.42136, longitude: 10.9863 },
		permissions: ['geolocation']
	},
	// Both shapes are tested, because the navigation, the detail panel and the map
	// sidebar are genuinely different components above and below the md breakpoint.
	projects: [
		{ name: 'mobile-chrome', use: { ...devices['Pixel 7'] } },
		{
			name: 'desktop-chrome',
			use: { ...devices['Desktop Chrome'], viewport: { width: 1440, height: 900 } }
		}
	],
	webServer: {
		command: 'npm run dev -- --port 5173',
		url: 'http://localhost:5173',
		reuseExistingServer: true,
		timeout: 60_000
	}
});
