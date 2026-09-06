import adapter from '@sveltejs/adapter-node';
import { relative, sep } from 'node:path';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	compilerOptions: {
		// Runes mode everywhere except node_modules. Can be dropped in Svelte 6.
		runes: ({ filename }) => {
			const relativePath = relative(import.meta.dirname, filename);
			const pathSegments = relativePath.toLowerCase().split(sep);
			return pathSegments.includes('node_modules') ? undefined : true;
		}
	},
	kit: {
		adapter: adapter(),
		alias: {
			$api: 'src/api',
			$hooks: 'src/hooks',
			$types: 'src/types'
		},
		// The app is a client-rendered PWA: geolocation, MapLibre and Keycloak PKCE
		// all live in the browser, and there is nothing to gain from rendering a map
		// shell on the server. Prerendering the shell keeps first paint instant.
		serviceWorker: { register: false }
	}
};

export default config;
