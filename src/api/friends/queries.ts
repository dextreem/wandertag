import { createMutation, createQuery, useQueryClient } from '@tanstack/svelte-query';
import { friendService } from './service';
import type { Friend, FriendPosition } from './types';

export const friendKeys = {
	all: ['friends'] as const,
	list: () => [...friendKeys.all, 'list'] as const,
	positions: () => [...friendKeys.all, 'positions'] as const
};

export const useFriends = (getEnabled: () => boolean) =>
	createQuery<Friend[]>(() => ({
		queryKey: friendKeys.list(),
		queryFn: () => friendService.list(),
		enabled: getEnabled()
	}));

/**
 * Positions of friends who share with you.
 *
 * Polled rather than pushed: positions only change when a friend acts in the app,
 * so a slow refresh is honest about the data and costs nothing.
 */
export const useFriendPositions = (getEnabled: () => boolean) =>
	createQuery<FriendPosition[]>(() => ({
		queryKey: friendKeys.positions(),
		queryFn: () => friendService.positions(),
		enabled: getEnabled(),
		refetchInterval: 60_000,
		staleTime: 30_000
	}));

const invalidateFriends = (queryClient: ReturnType<typeof useQueryClient>) => () =>
	queryClient.invalidateQueries({ queryKey: friendKeys.all });

export const useRequestFriend = () => {
	const queryClient = useQueryClient();
	return createMutation(() => ({
		mutationFn: (displayName: string) => friendService.request(displayName),
		onSuccess: invalidateFriends(queryClient)
	}));
};

export const useAnswerFriend = () => {
	const queryClient = useQueryClient();
	return createMutation(() => ({
		// Accept returns the updated friendship, decline returns nothing. The caller
		// only refetches, so the result is discarded rather than unioned.
		mutationFn: async ({ id, accept }: { id: number; accept: boolean }) => {
			if (accept) await friendService.accept(id);
			else await friendService.decline(id);
		},
		onSuccess: invalidateFriends(queryClient)
	}));
};

export const useSetSharing = () => {
	const queryClient = useQueryClient();
	return createMutation(() => ({
		mutationFn: ({ id, share }: { id: number; share: boolean }) =>
			friendService.setSharing(id, share),
		onSuccess: invalidateFriends(queryClient)
	}));
};

export const useRemoveFriend = () => {
	const queryClient = useQueryClient();
	return createMutation(() => ({
		mutationFn: (id: number) => friendService.remove(id),
		onSuccess: invalidateFriends(queryClient)
	}));
};
