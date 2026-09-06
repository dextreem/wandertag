import { de, type Messages } from './de';
import { en } from './en';

export type Locale = 'de' | 'en';

const LOCALES: Record<Locale, Messages> = { de, en };
const STORAGE_KEY = 'wandertag:locale';

/**
 * Active locale and messages.
 *
 * German is the default — the product has a German name and a DACH-shaped POI
 * dataset — but the browser's own preference wins on a first visit, and an
 * explicit choice in the profile wins over both and is persisted.
 */
class I18nState {
	locale = $state<Locale>('de');

	/** The message catalogue for the active locale. Read this in components as `t()`. */
	messages = $derived(LOCALES[this.locale]);

	init() {
		const stored = readStoredLocale();
		if (stored) {
			this.locale = stored;
			return;
		}
		const browser = typeof navigator !== 'undefined' ? navigator.language.slice(0, 2) : 'de';
		this.locale = browser === 'en' ? 'en' : 'de';
	}

	set(locale: Locale) {
		this.locale = locale;
		try {
			localStorage.setItem(STORAGE_KEY, locale);
		} catch {
			// Non-fatal: the choice just will not survive a reload.
		}
		if (typeof document !== 'undefined') document.documentElement.lang = locale;
	}
}

function readStoredLocale(): Locale | null {
	try {
		const value = localStorage.getItem(STORAGE_KEY);
		return value === 'de' || value === 'en' ? value : null;
	} catch {
		return null;
	}
}

export const i18n = new I18nState();

/** Shorthand for the active catalogue: `t().nav.map`. */
export const t = () => i18n.messages;
