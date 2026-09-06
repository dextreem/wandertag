export type LeaderboardScope = 'GLOBAL' | 'MONTHLY';

export interface LeaderboardEntry {
	rank: number;
	userId: string;
	displayName: string;
	discoveryCount: number;
	firstBloodCount: number;
	currentStreak: number;
	/** True for the signed-in user's own row, so the UI can highlight it. */
	isMe: boolean;
}

export interface LeaderboardResponse {
	scope: LeaderboardScope;
	entries: LeaderboardEntry[];
}
