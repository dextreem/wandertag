import type { PinCategory, PinSource } from '../types';

export interface AdminUser {
	userId: string;
	displayName: string;
	email: string | null;
	active: boolean;
	deactivatedAt: string | null;
	blocked: boolean;
	blockedUntil: string | null;
	blockReason: string | null;
	/** Violations inside the current escalation window — the signal to act on. */
	recentViolations: number;
	discoveryCount: number;
	firstBloodCount: number;
	noteCount: number;
	currentStreak: number;
	longestStreak: number;
	lastActivityDate: string | null;
	createdAt: string;
}

export interface AdminActivity {
	id: number;
	userId: string;
	displayName: string;
	pinId: number;
	pinName: string;
	category: PinCategory;
	source: PinSource;
	firstBlood: boolean;
	distanceM: number;
	discoveredAt: string;
}

export interface AdminViolation {
	id: number;
	userId: string;
	distanceM: number;
	elapsedS: number;
	speedMps: number;
	detectedAt: string;
}
