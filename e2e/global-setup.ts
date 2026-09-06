import { execFileSync } from 'node:child_process';

const BACKEND = new URL('../../wandertag-backend', import.meta.url).pathname;

/**
 * Clears the anti-cheat ledger before the suite runs.
 *
 * The tests spoof positions far apart — the Zugspitze in one spec, Saarland in
 * another — and the app quite correctly treats a 250 km hop in seconds as
 * impossible. Left alone, one run's positions make the next run's legitimate
 * actions look like cheating, and after three the account is blocked for a day.
 *
 * This resets only the moderation state. Pins, notes and discoveries are left in
 * place, since the specs assert against the seeded data.
 */
export default function globalSetup() {
	const sql = [
		'DELETE FROM position_claims;',
		'DELETE FROM position_violations;',
		'UPDATE user_profiles SET blocked_until = NULL, block_reason = NULL, active = TRUE;'
	].join(' ');

	try {
		execFileSync(
			'docker',
			[
				'compose',
				'exec',
				'-T',
				'postgres',
				'psql',
				'-U',
				'postgres',
				'-d',
				'wandertag',
				'-q',
				'-c',
				sql
			],
			{ cwd: BACKEND, stdio: 'pipe' }
		);
		console.log('[global-setup] anti-cheat state reset');
	} catch (error) {
		// Not fatal: the suite still runs, it just may hit a stale block. Say so
		// loudly rather than failing with a confusing assertion later.
		console.warn(
			'[global-setup] could not reset anti-cheat state — is the backend stack up?',
			error instanceof Error ? error.message : error
		);
	}
}
