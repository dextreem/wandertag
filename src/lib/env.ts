import { env } from '$env/dynamic/public';

/**
 * Public runtime configuration, read through one checked accessor.
 *
 * `$env/dynamic/public` is resolved at runtime, so everything it hands back is
 * genuinely `string | undefined`. SvelteKit narrows those types only when a `.env`
 * happens to exist at `svelte-kit sync` time, which made `npm run check` pass on a
 * developer machine and fail on a clean checkout in CI — the type was right and the
 * code was ignoring it.
 *
 * Reading through `required()` fixes both halves at once:
 *
 *  - the exported values are `string`, because absence throws, so type checking no
 *    longer depends on which files a particular machine happens to have;
 *  - a missing variable names itself, instead of surfacing as an opaque keycloak-js
 *    error during `init()` or an axios client quietly issuing relative URLs against
 *    whatever origin served the page.
 *
 * Accessors are lazy on purpose. Throwing at import time would break SSR and
 * prerendering during a build that has no environment yet; throwing on first use
 * puts the error where someone can act on it.
 */
// The parameter is a template-literal type, not a bare `string`: SvelteKit types
// `$env/dynamic/public` with an index signature keyed on `PUBLIC_${string}`, so a
// plain string cannot index it — and this way a typo like `API_URL` (no prefix) is
// a compile error rather than an undefined lookup at runtime.
function required(name: `PUBLIC_${string}`): string {
	const value = env[name];
	if (!value) {
		throw new Error(`${name} is not set. Copy .env.example to .env — see the README quick start.`);
	}
	return value;
}

export const publicEnv = {
	get apiUrl(): string {
		return required('PUBLIC_API_URL');
	},
	get keycloakUrl(): string {
		return required('PUBLIC_KEYCLOAK_URL');
	},
	get keycloakRealm(): string {
		return required('PUBLIC_KEYCLOAK_REALM');
	},
	get keycloakClientId(): string {
		return required('PUBLIC_KEYCLOAK_CLIENT_ID');
	}
};
