import { describe, expect, it } from 'vitest';
import { formatDistance } from './index';

describe('formatDistance', () => {
	it('uses whole metres below a kilometre', () => {
		expect(formatDistance(40)).toBe('40 m');
		expect(formatDistance(999.4)).toBe('999 m');
	});

	it('switches to kilometres with one decimal', () => {
		expect(formatDistance(1500, 'en')).toBe('1.5 km');
	});

	it('drops the decimal past ten kilometres', () => {
		expect(formatDistance(24_600, 'en')).toBe('25 km');
	});

	it('uses a comma as the decimal separator in German', () => {
		expect(formatDistance(1500, 'de')).toBe('1,5 km');
	});
});
