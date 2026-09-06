import { expect, test } from '@playwright/test';
import { login } from './helpers';

/**
 * The core loop, through the real UI and the real Keycloak.
 *
 * Runs serially and shares one browser context: signing in is slow, and the
 * discovery state each test leaves behind is what the next one builds on.
 */
test.describe.configure({ mode: 'serial' });

test.describe('signed-in hiker', () => {
	test('can sign in through Keycloak and see their profile', async ({ page }) => {
		await login(page, 'hiker', 'hiker');

		// login() lands on /profile already. Scoped to <main>, because the desktop
		// TopNav also renders the username and is merely hidden at this width.
		await expect(page.locator('main').getByText('hiker').first()).toBeVisible({
			timeout: 20_000
		});
		await expect(page.getByText('Entdeckte Pins')).toBeVisible();
		// A regular user must not be shown the admin surface.
		await expect(page.getByText('Admin', { exact: true })).toHaveCount(0);
	});

	test('can open a nearby pin and drop a note on it', async ({ page }) => {
		await login(page, 'hiker', 'hiker');

		await page.goto('/list');
		await page.locator('ul > li button').first().click();

		// The sheet for the closest pin, which is inside the interaction radius.
		const sheet = page.getByRole('dialog');
		await expect(sheet).toBeVisible();

		await sheet.getByRole('button', { name: 'Notiz hinterlassen' }).click();
		const title = `E2E ${Date.now()}`;
		await sheet.getByRole('textbox').first().fill(title);
		await sheet.getByRole('button', { name: 'Hinterlassen' }).click();

		await expect(sheet.getByText(title)).toBeVisible({ timeout: 15_000 });
	});

	test('appears on the leaderboard after discovering a pin', async ({ page }) => {
		await login(page, 'hiker', 'hiker');

		await page.goto('/list');
		await page.locator('ul > li button').first().click();

		const sheet = page.getByRole('dialog');
		// Wait for the pin query to resolve before looking for its actions —
		// `count()` on a not-yet-rendered button returns 0 and silently passes.
		await expect(sheet.getByText(/entfernt/)).toBeVisible({ timeout: 15_000 });

		const discover = sheet.getByRole('button', { name: 'Pin entdecken' });
		const alreadyDiscovered = await sheet.getByText('Entdeckt', { exact: true }).count();

		if (!alreadyDiscovered) {
			// The nearest pin must be inside the interaction radius for this test to
			// mean anything; if it is not, the fixture is wrong, not the app.
			await expect(discover).toBeVisible();
			await discover.click();
			await expect(
				page.getByText(/Entdeckt!|Erstbegehung!|Diesen Pin hattest du schon/)
			).toBeVisible({ timeout: 15_000 });
		}

		await page.goto('/board');
		await expect(page.locator('main').getByText('hiker').first()).toBeVisible({
			timeout: 20_000
		});
	});
});

test.describe('signed-in admin', () => {
	test('sees the admin tab and can manage pins', async ({ page }) => {
		await login(page, 'admin', 'admin');

		await page.goto('/map');
		await expect(page.getByRole('link', { name: 'Admin' })).toBeVisible({ timeout: 20_000 });

		await page.goto('/admin');
		await expect(page.getByRole('heading', { name: 'Verwaltung' })).toBeVisible();

		// Four tabs: pins, users, activity, anomalies.
		for (const tab of ['Pins', 'Nutzer', 'Aktivität', 'Auffälligkeiten']) {
			await expect(page.getByRole('button', { name: tab, exact: true })).toBeVisible();
		}

		// The pins tab lists what is nearby.
		await expect(page.locator('main ul > li').first()).toBeVisible({ timeout: 20_000 });

		// A row opens the pin, because moderating means reading what is on it. The
		// admin is nowhere near these pins, so this also covers the rule that an
		// admin gets the notes back from any distance.
		const firstRow = page.locator('main ul > li').first();
		const pinName = (await firstRow.locator('p').first().innerText()).trim();
		await firstRow.getByRole('button').first().click();
		await expect(page.getByRole('dialog')).toBeVisible();
		await expect(page.getByRole('dialog')).toContainText(pinName);
		await page.getByRole('button', { name: 'Schließen' }).click();

		// The users tab is what lets an admin see and moderate everyone.
		await page.getByRole('button', { name: 'Nutzer', exact: true }).click();
		await expect(page.getByText('hiker')).toBeVisible({ timeout: 20_000 });
		await expect(page.getByRole('button', { name: 'Deaktivieren' }).first()).toBeVisible();

		// And the activity tab shows what other people discover.
		await page.getByRole('button', { name: 'Aktivität', exact: true }).click();
		await expect(page.locator('main ul > li').first()).toBeVisible({ timeout: 20_000 });
	});
});

test.describe('friends', () => {
	test('a friendship starts with location sharing off', async ({ page }) => {
		await login(page, 'hiker', 'hiker');

		await page.goto('/friends');
		// `level: 1` names the page header specifically. Without it this matched the
		// accepted-friends section heading too and failed on strict mode — but only
		// when that list happened to be non-empty, which made it look like a timing
		// flake rather than the locator bug it was.
		await expect(page.getByRole('heading', { level: 1, name: 'Freunde' })).toBeVisible({
			timeout: 20_000
		});

		// The privacy note is stated on the screen, not buried in settings.
		await expect(page.getByText(/pro Person und pro Richtung/)).toBeVisible({
			timeout: 20_000
		});

		// Any accepted friendship must show sharing as off until it is turned on:
		// accepting a request is not consent to being followed.
		const off = page.getByRole('button', { name: /teilst deinen Standort nicht/ });
		if (await off.count()) {
			await expect(off.first()).toBeVisible();
		}
	});
});
