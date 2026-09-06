import { defineConfig } from 'vitest/config';
import { svelte } from '@sveltejs/vite-plugin-svelte';
import { svelteTesting } from '@testing-library/svelte/vite';

/**
 * Unit tests only — pure logic in `src/lib` and `src/api`. Anything that needs a
 * real map, a real GPS fix or a real Keycloak redirect is covered by Playwright
 * instead, where those things actually exist.
 */
export default defineConfig({
	plugins: [svelte(), svelteTesting()],
	test: {
		environment: 'jsdom',
		include: ['src/**/*.{test,spec}.{js,ts}'],
		globals: true
	},
	resolve: {
		alias: {
			$api: new URL('./src/api', import.meta.url).pathname,
			$hooks: new URL('./src/hooks', import.meta.url).pathname,
			$lib: new URL('./src/lib', import.meta.url).pathname,
			$types: new URL('./src/types', import.meta.url).pathname
		}
	}
});
