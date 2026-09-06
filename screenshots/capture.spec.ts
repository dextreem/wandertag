import { test, expect, type Page } from '@playwright/test';
import { login } from '../e2e/helpers';

/**
 * Captures the README's screenshots against the running stack.
 *
 * Run with `npm run screenshots` while the backend, PostGIS and Keycloak are up.
 * Every shot is taken from a real session — signed in through Keycloak, with a
 * spoofed position near the demo pin — so the README cannot drift into showing a
 * UI that no longer exists.
 */
const OUT = 'docs/screenshots';

/** The map needs its tiles and its GeoJSON before it is worth photographing. */
async function settleMap(page: Page) {
	await expect(page.getByTestId('map')).toBeVisible({ timeout: 30_000 });
	await page.waitForLoadState('networkidle');
	await page.waitForTimeout(2500);
}

async function shoot(page: Page, name: string, project: string) {
	await page.screenshot({ path: `${OUT}/${project}-${name}.png` });
}

test.describe('screenshots', () => {
	test('capture the app', async ({ page }, testInfo) => {
		const project = testInfo.project.name;

		// 1. The landing page, signed out.
		await page.goto('/');
		await page.waitForLoadState('networkidle');
		await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
		await shoot(page, 'landing', project);

		// 2. Signed in as a regular user.
		await login(page, 'hiker', 'hiker');

		await page.goto('/map');
		await settleMap(page);
		await shoot(page, 'map', project);

		// 3. The legend, which is the map's whole visual vocabulary.
		await page.getByRole('button', { name: /Zeichenerklärung anzeigen/ }).click();
		await page.waitForTimeout(400);
		await shoot(page, 'map-legend', project);
		await page
			.getByRole('button', { name: /Schließen/ })
			.first()
			.click();

		// 4. A pin sheet with a note on it — the core loop in one picture.
		await page.goto('/list');
		await page.waitForLoadState('networkidle');
		await expect(page.locator('main ul > li').first()).toBeVisible({ timeout: 30_000 });
		await shoot(page, 'list', project);

		await page.locator('main ul > li button').first().click();
		await expect(page.getByRole('dialog')).toBeVisible({ timeout: 15_000 });
		await page.waitForTimeout(800);
		await shoot(page, 'pin-sheet', project);
		await page
			.getByRole('button', { name: /Schließen/ })
			.first()
			.click();

		// 5. Leaderboard and profile — the gamification surfaces.
		await page.goto('/board');
		await page.waitForLoadState('networkidle');
		await page.waitForTimeout(600);
		await shoot(page, 'board', project);

		await page.goto('/profile');
		await page.waitForLoadState('networkidle');
		await page.waitForTimeout(600);
		await shoot(page, 'profile', project);

		// 6. Friends, with sharing off by default.
		await page.goto('/friends');
		await page.waitForLoadState('networkidle');
		await page.waitForTimeout(600);
		await shoot(page, 'friends', project);
	});

	test('capture the admin surface', async ({ page }, testInfo) => {
		const project = testInfo.project.name;

		await login(page, 'admin', 'admin');
		await page.goto('/admin');
		await expect(page.locator('main ul > li').first()).toBeVisible({ timeout: 30_000 });
		await page.waitForTimeout(600);
		await shoot(page, 'admin-pins', project);

		await page.getByRole('button', { name: 'Nutzer', exact: true }).click();
		await expect(page.getByText('hiker')).toBeVisible({ timeout: 20_000 });
		await page.waitForTimeout(400);
		await shoot(page, 'admin-users', project);

		await page.getByRole('button', { name: 'Aktivität', exact: true }).click();
		await expect(page.locator('main ul > li').first()).toBeVisible({ timeout: 20_000 });
		await page.waitForTimeout(400);
		await shoot(page, 'admin-activity', project);
	});
});
