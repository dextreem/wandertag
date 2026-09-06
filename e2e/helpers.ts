import type { Page } from '@playwright/test';

export const API = 'http://localhost:8081/api/v1';
export const KEYCLOAK_TOKEN_URL =
	'http://localhost:8181/realms/wandertag/protocol/openid-connect/token';

/** Zugspitze summit — where the seeded Alpine pins are. */
export const ZUGSPITZE = { lat: 47.42136, lon: 10.9863 };

/**
 * Signs in through the real Keycloak login form.
 *
 * Deliberately not a stubbed token: the PKCE redirect, the audience mapper and the
 * `check-sso` init are exactly the parts most likely to break, and only a real
 * round trip exercises them.
 */
export async function login(page: Page, username: string, password: string) {
	await page.goto('/profile');
	await page
		.getByRole('button', { name: /Anmelden|Sign in/ })
		.first()
		.click();

	await page.waitForURL(/localhost:8181/, { timeout: 30_000 });
	await page.locator('#username').fill(username);
	await page.locator('#password').fill(password);
	await page.locator('#kc-login').click();

	// Keycloak redirects back with `#code=...` in the fragment, and keycloak-js
	// exchanges it during `auth.init()`, then strips the hash. Navigating before
	// that finishes throws the code away and leaves the session unauthenticated —
	// so wait for the cleaned URL, not merely for the redirect to land.
	await page.waitForURL((url) => url.host === 'localhost:5173' && !url.hash, {
		timeout: 30_000
	});
	await page.waitForLoadState('networkidle');

	// Where Keycloak returns to depends on which login button was clicked, and the
	// header's differs from the page's. Navigate explicitly so callers get a known
	// starting point. Safe now that the redirect above has completed — navigating
	// mid-exchange would discard the authorisation code.
	await page.goto('/profile');
	await page.waitForLoadState('networkidle');
}

/** A bearer token obtained directly, for arranging fixtures without the UI. */
export async function directToken(username: string, password: string): Promise<string> {
	const body = new URLSearchParams({
		grant_type: 'password',
		client_id: 'wandertag-frontend',
		username,
		password
	});
	const res = await fetch(KEYCLOAK_TOKEN_URL, {
		method: 'POST',
		headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
		body
	});
	const json = await res.json();
	return json.access_token;
}
