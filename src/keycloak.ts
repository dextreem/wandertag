import Keycloak from 'keycloak-js';
import { env } from '$env/dynamic/public';

const { PUBLIC_KEYCLOAK_URL, PUBLIC_KEYCLOAK_REALM, PUBLIC_KEYCLOAK_CLIENT_ID } = env;

let keycloakInstance: Keycloak | null = null;

export function getKeycloak(): Keycloak {
	if (keycloakInstance) return keycloakInstance;

	keycloakInstance = new Keycloak({
		url: PUBLIC_KEYCLOAK_URL,
		realm: PUBLIC_KEYCLOAK_REALM,
		clientId: PUBLIC_KEYCLOAK_CLIENT_ID
	});

	return keycloakInstance;
}

/**
 * A token that is valid for at least the next 30 seconds, refreshed if needed.
 *
 * Returns `undefined` rather than throwing for an anonymous visitor: most of
 * WanderTag's read endpoints are public, so an unauthenticated request is a normal
 * case, not an error.
 */
export async function getValidAccessToken(): Promise<string | undefined> {
	const kc = getKeycloak();
	if (!kc.authenticated) return undefined;

	try {
		await kc.updateToken(30);
	} catch {
		// The refresh token is gone or expired — a full login is the only way back.
		await kc.login();
		return undefined;
	}

	return kc.token;
}
