export interface Stats {
	discoveryCount: number;
	firstBloodCount: number;
	noteCount: number;
	currentStreak: number;
	longestStreak: number;
	lastActivityDate: string | null;
	discoveriesThisMonth: number;
}

export interface Profile {
	userId: string;
	displayName: string;
	email: string | null;
	locale: string;
	isAdmin: boolean;
	stats: Stats;
}

export interface UpdateProfileRequest {
	locale?: string;
}
