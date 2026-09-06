import { createQuery } from '@tanstack/svelte-query';
import { leaderboardService } from './service';
import type { LeaderboardResponse, LeaderboardScope } from './types';

export const leaderboardKeys = {
	all: ['leaderboard'] as const,
	scope: (scope: LeaderboardScope) => [...leaderboardKeys.all, scope] as const
};

export const useLeaderboard = (getScope: () => LeaderboardScope) =>
	createQuery<LeaderboardResponse>(() => {
		const scope = getScope();
		return {
			queryKey: leaderboardKeys.scope(scope),
			queryFn: () => leaderboardService.get(scope),
			staleTime: 60_000
		};
	});
