import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

/** Merge Tailwind classes, letting later classes win over earlier conflicting ones. */
export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
}

/** Metres up close, kilometres further out. Mirrors the backend's rounding. */
export function formatDistance(metres: number, locale: 'de' | 'en' = 'de'): string {
	if (metres < 1000) return `${Math.round(metres)} m`;
	const km = (metres / 1000).toFixed(metres < 10_000 ? 1 : 0);
	return `${locale === 'de' ? km.replace('.', ',') : km} km`;
}

export function formatDate(iso: string, locale: 'de' | 'en' = 'de'): string {
	return new Date(iso).toLocaleDateString(locale === 'de' ? 'de-DE' : 'en-GB', {
		day: '2-digit',
		month: 'short',
		year: 'numeric'
	});
}
