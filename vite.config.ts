import { sveltekit } from '@sveltejs/kit/vite';
import { SvelteKitPWA } from '@vite-pwa/sveltekit';
import tailwindcss from '@tailwindcss/vite';
import { defineConfig } from 'vite';

export default defineConfig({
	plugins: [
		tailwindcss(),
		sveltekit(),
		SvelteKitPWA({
			registerType: 'autoUpdate',
			// The app shell only. Map tiles are deliberately excluded: a vector
			// basemap is far too large to precache, and a stale cached tile is
			// worse than a fresh fetch.
			workbox: {
				globPatterns: ['**/*.{js,css,html,svg,png,woff2}'],
				navigateFallback: '/'
			},
			manifest: {
				name: 'WanderTag',
				short_name: 'WanderTag',
				description: 'Hinterlasse Notizen, wo du warst. Entdecke, was andere hinterlassen haben.',
				lang: 'de',
				start_url: '/map',
				scope: '/',
				display: 'standalone',
				orientation: 'portrait',
				background_color: '#f7f4ed',
				theme_color: '#5a6c50',
				icons: [
					{ src: '/icon-192.png', sizes: '192x192', type: 'image/png' },
					{ src: '/icon-512.png', sizes: '512x512', type: 'image/png' },
					{
						src: '/icon-512-maskable.png',
						sizes: '512x512',
						type: 'image/png',
						purpose: 'maskable'
					}
				]
			}
		})
	]
});
