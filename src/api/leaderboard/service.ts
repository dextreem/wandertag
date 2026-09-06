import { api } from '../api';
import type { LeaderboardResponse, LeaderboardScope } from './types';

export const leaderboardService = {
	get: (scope: LeaderboardScope, limit = 50) =>
		api.get<LeaderboardResponse>('/leaderboard', { scope, limit })
};
