export type FriendshipStatus = 'PENDING' | 'ACCEPTED' | 'DECLINED';

export interface Friend {
	friendshipId: number;
	userId: string;
	displayName: string;
	status: FriendshipStatus;
	/** True when *you* share your position with them. */
	youShare: boolean;
	/** True when *they* share their position with you. */
	theyShare: boolean;
	/** True when this request is waiting on your answer. */
	awaitingYourAnswer: boolean;
	discoveryCount: number;
	currentStreak: number;
	createdAt: string;
}

/**
 * A friend's last known position.
 *
 * `at` is when it was recorded, not "now". There is no background tracking, so the
 * UI must show the age rather than imply live movement.
 */
export interface FriendPosition {
	userId: string;
	displayName: string;
	lat: number;
	lon: number;
	at: string;
}
