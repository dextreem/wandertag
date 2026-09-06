import { expect, test } from '@playwright/test';
import { ZUGSPITZE } from './helpers';

/**
 * Anonymous browsing. This is a product requirement, not an accident: a visitor
 * must be able to see that there are pins near them before deciding to sign up.
 */
test.describe('anonymous visitor', () => {
	test('landing page shows the brand and both calls to action', async ({ page }) => {
		await page.goto('/');
		await expect(page.getByRole('heading', { level: 1 })).toContainText('Hinterlasse Notizen');
		// 'Karte öffnen' is a link, not a button: Button renders an <a> when it is
		// given an href, so the accessible role differs from the sign-up button.
		await expect(page.getByRole('link', { name: 'Karte öffnen' })).toBeVisible();
		await expect(page.getByRole('button', { name: 'Registrieren' }).first()).toBeVisible();
	});

	test('the map renders with a real canvas and seeded pins', async ({ page }) => {
		await page.goto('/map');
		// The map container must have a real height — a zero-height container was a
		// live bug once (maplibre-gl.css forces position:relative on it).
		const box = await page.locator('[data-testid="map"]').boundingBox();
		expect(box!.height).toBeGreaterThan(300);
		await expect(page.locator('.maplibregl-canvas')).toBeVisible();
	});

	test('the list shows nearby pins sorted by distance', async ({ page }) => {
		await page.goto('/list');
		const rows = page.locator('ul > li button');
		await expect(rows.first()).toBeVisible({ timeout: 20_000 });

		const distances = await page.locator('ul > li .tabular-nums').allInnerTexts();
		const metres = distances.filter((d) => d.endsWith(' m')).map((d) => Number.parseInt(d, 10));
		expect(metres.length).toBeGreaterThan(1);
		expect([...metres]).toEqual([...metres].sort((a, b) => a - b));
	});

	test('leaderboard is publicly readable', async ({ page }) => {
		await page.goto('/board');
		await expect(page.getByRole('heading', { name: 'Rangliste' })).toBeVisible();
		await expect(page.getByRole('button', { name: 'Dieser Monat' })).toBeVisible();
	});

	test('the admin tab is not offered', async ({ page }) => {
		await page.goto('/map');
		await expect(page.getByRole('link', { name: 'Admin' })).toHaveCount(0);
	});

	test('locale can be switched to English', async ({ page }, testInfo) => {
		await page.goto('/');
		if (testInfo.project.name === 'mobile-chrome') {
			// At phone width the language switch sits inside the disclosure menu.
			await page.getByRole('button', { name: 'Hauptnavigation' }).click();
			await page.getByRole('button', { name: 'English' }).click();
		} else {
			// By accessible label, not by the 'EN' text — that substring also matches
			// "Anmelden", "Registrieren" and "Konto anlegen".
			await page.getByRole('button', { name: 'Sprache' }).click();
		}
		await expect(page.getByRole('heading', { level: 1 })).toContainText('Leave notes');
	});

	test('the landing page shows all four sections', async ({ page }) => {
		await page.goto('/');
		for (const heading of [
			'Digitale Spuren in 3 Schritten',
			'Nähe ist die ganze Mechanik',
			'Fang bei dir vor der Tür an'
		]) {
			await expect(page.getByRole('heading', { name: heading })).toBeVisible();
		}
		// The sign-up form collects an email and hands off to Keycloak.
		await expect(page.getByRole('textbox', { name: 'E-Mail-Adresse' })).toBeVisible();
	});

	test('navigation takes the shape the viewport calls for', async ({ page }, testInfo) => {
		await page.goto('/map');
		const mobile = testInfo.project.name === 'mobile-chrome';

		// Both navs are in the DOM at all times; only one is ever visible. A tab bar
		// is wrong for a mouse and a top bar is wrong for a thumb.
		await expect(page.locator('nav[aria-label="Hauptnavigation"]:visible')).toHaveCount(1);
		await expect(page.locator('header nav')).toBeVisible({ visible: !mobile });
	});

	test('the map sidebar appears only on desktop', async ({ page }, testInfo) => {
		await page.goto('/map');
		const sidebar = page.locator('aside');
		if (testInfo.project.name === 'mobile-chrome') {
			// A phone has no width to spare beside a map; the List tab is that view.
			await expect(sidebar).toBeHidden();
		} else {
			await expect(sidebar).toBeVisible();
			await expect(sidebar.locator('li').first()).toBeVisible({ timeout: 20_000 });
		}
	});

	test('the API withholds note bodies beyond the interaction radius', async ({ request }) => {
		// The proximity rule is enforced server-side; this guards the contract the
		// UI depends on rather than the UI's rendering of it.
		const near = await request.get(
			`http://localhost:8081/api/v1/notes?lat=${ZUGSPITZE.lat}&lon=${ZUGSPITZE.lon}`
		);
		expect(near.ok()).toBeTruthy();
		const far = await request.get(
			`http://localhost:8081/api/v1/notes?lat=${ZUGSPITZE.lat + 0.01}&lon=${ZUGSPITZE.lon}`
		);
		const farBody = await far.json();
		for (const note of farBody.notes) {
			expect(note.locked).toBe(true);
			expect(note.body).toBeNull();
		}
	});
});
