const STORAGE_KEY = 'wandertag:theme';

export type Theme = 'light' | 'dark' | 'system';

class ThemeState {
	theme = $state<Theme>('system');

	init() {
		try {
			const stored = localStorage.getItem(STORAGE_KEY) as Theme | null;
			if (stored === 'light' || stored === 'dark' || stored === 'system') this.theme = stored;
		} catch {
			// Private mode or blocked storage — the system default is a fine fallback.
		}
		this.apply();

		window
			.matchMedia('(prefers-color-scheme: dark)')
			.addEventListener('change', () => this.theme === 'system' && this.apply());
	}

	set(theme: Theme) {
		this.theme = theme;
		try {
			localStorage.setItem(STORAGE_KEY, theme);
		} catch {
			// Non-fatal: the choice just will not survive a reload.
		}
		this.apply();
	}

	private apply() {
		const dark =
			this.theme === 'dark' ||
			(this.theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);
		document.documentElement.classList.toggle('dark', dark);
	}
}

export const theme = new ThemeState();
