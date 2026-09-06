import { getKeycloak } from '../keycloak.js';
import { roles } from './use-roles.svelte.js';

/** The bits of the signed-in user the UI actually needs. */
export interface CurrentUser {
	id: string;
	username: string;
	email: string | null;
}

class AuthState {
	isAuthenticated = $state(false);
	isChecking = $state(true);
	user = $state<CurrentUser | null>(null);

	/**
	 * `check-sso` rather than `login-required`: WanderTag is browsable anonymously,
	 * so a visitor who is not signed in must land on the map, not on Keycloak.
	 */
	async init() {
		try {
			const kc = getKeycloak();

			const authenticated = await kc.init({
				onLoad: 'check-sso',
				pkceMethod: 'S256',
				checkLoginIframe: false,
				// Without this, `check-sso` redirects the whole page to Keycloak on
				// every anonymous visit and returns with `#error=login_required` — a
				// flash of nothing before the landing page can paint. The static page
				// keeps that check inside a hidden iframe.
				silentCheckSsoRedirectUri: window.location.origin + '/silent-check-sso.html'
			});

			this.isAuthenticated = authenticated;

			if (authenticated) {
				// Read identity from the access token rather than calling
				// `loadUserProfile()`. That hits Keycloak's *account* API, which needs
				// the account client roles to be granted and returns 403 otherwise —
				// and a failure there was enough to drop an authenticated user back to
				// anonymous. The token already carries everything the UI shows, and it
				// is the same claim (`preferred_username`) the backend uses for
				// attribution, so the two can never disagree.
				const claims = kc.tokenParsed as
					{ sub?: string; preferred_username?: string; name?: string; email?: string } | undefined;
				this.user = {
					id: claims?.sub ?? '',
					username: claims?.preferred_username ?? claims?.name ?? claims?.email ?? '',
					email: claims?.email ?? null
				};
				roles.syncRoles();
			}

			// Strip the OAuth fragment Keycloak leaves behind after the redirect.
			if (window.location.hash) {
				window.history.replaceState(null, '', window.location.pathname + window.location.search);
			}
		} catch (error) {
			console.error('Keycloak init failed:', error);
			this.isAuthenticated = false;
		} finally {
			this.isChecking = false;
		}
	}

	async login(redirectPath = '/map') {
		await getKeycloak().login({ redirectUri: window.location.origin + redirectPath });
	}

	/**
	 * Sends the user to Keycloak's registration page.
	 *
	 * [loginHint] prefills the email field there, so an address collected on the
	 * landing page is not asked for a second time. Account creation stays entirely
	 * in Keycloak — it owns password policy, verification and duplicate handling.
	 */
	async register(redirectPath = '/map', loginHint?: string) {
		await getKeycloak().register({
			redirectUri: window.location.origin + redirectPath,
			...(loginHint ? { loginHint } : {})
		});
	}

	async logout() {
		const kc = getKeycloak();
		this.isAuthenticated = false;
		this.user = null;
		roles.clear();
		await kc.logout({ redirectUri: window.location.origin + '/' });
	}
}

export const auth = new AuthState();
