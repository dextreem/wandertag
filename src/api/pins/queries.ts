import { createMutation, createQuery, useQueryClient } from '@tanstack/svelte-query';
import { pinService } from './service';
import type {
	CreatePinRequest,
	DiscoverPinRequest,
	NearbyPinsParams,
	UpdatePinRequest
} from './types';
import { meKeys } from '../me/queries';
import { leaderboardKeys } from '../leaderboard/queries';
import { adminKeys } from '../admin/queries';

/**
 * Cache key for a nearby query.
 *
 * The coordinates are rounded *here only* — to keep GPS jitter and tiny pans from
 * invalidating the cache every frame — while the request itself carries the precise
 * position. Rounding what we send would quantise it to roughly 111 m, which is
 * useless against a 50 m interaction radius.
 */
const nearbyKey = (params?: NearbyPinsParams) =>
	params && {
		lat: params.lat.toFixed(3),
		lon: params.lon.toFixed(3),
		areaLat: params.areaLat?.toFixed(3),
		areaLon: params.areaLon?.toFixed(3),
		radiusM: params.radiusM
	};

export const pinKeys = {
	all: ['pins'] as const,
	nearby: (params?: NearbyPinsParams) => [...pinKeys.all, 'nearby', nearbyKey(params)] as const,
	detail: (id: number, position?: { lat: number; lon: number }) =>
		[...pinKeys.all, 'detail', id, position] as const
};

/**
 * Pins around a position.
 *
 * The query key includes the rounded position and radius, so panning the map
 * refetches while small GPS jitter does not — see `roundPosition` in the map
 * component for where that rounding happens.
 */
export const useNearbyPins = (getParams: () => NearbyPinsParams | undefined) =>
	createQuery(() => {
		const params = getParams();
		return {
			queryKey: pinKeys.nearby(params),
			queryFn: () => pinService.nearby(params!),
			enabled: !!params,
			staleTime: 30_000
		};
	});

export const usePin = (
	getId: () => number | undefined,
	getPosition: () => { lat: number; lon: number } | undefined
) =>
	createQuery(() => {
		const id = getId();
		const position = getPosition();
		return {
			queryKey: pinKeys.detail(id!, position),
			queryFn: () => pinService.detail(id!, position),
			enabled: !!id
		};
	});

/**
 * Claims a pin.
 *
 * Invalidates the profile and both leaderboards as well as the pin lists, because
 * one discovery changes the counter, the streak and the ranking all at once.
 */
export const useDiscoverPin = () => {
	const queryClient = useQueryClient();
	return createMutation(() => ({
		mutationFn: ({ id, body }: { id: number; body: DiscoverPinRequest }) =>
			pinService.discover(id, body),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: pinKeys.all });
			queryClient.invalidateQueries({ queryKey: meKeys.all });
			queryClient.invalidateQueries({ queryKey: leaderboardKeys.all });
		}
	}));
};

/**
 * Everything a pin write invalidates.
 *
 * `adminKeys` matters as much as `pinKeys`: the admin table is cached under its own
 * key, so without this a star or hide toggle changed the data but the row kept its
 * old appearance until a reload.
 */
const invalidatePins = (queryClient: ReturnType<typeof useQueryClient>) => () => {
	queryClient.invalidateQueries({ queryKey: pinKeys.all });
	queryClient.invalidateQueries({ queryKey: adminKeys.all });
};

export const useCreatePin = () => {
	const queryClient = useQueryClient();
	return createMutation(() => ({
		mutationFn: (body: CreatePinRequest) => pinService.create(body),
		onSuccess: invalidatePins(queryClient)
	}));
};

export const useUpdatePin = () => {
	const queryClient = useQueryClient();
	return createMutation(() => ({
		mutationFn: ({ id, body }: { id: number; body: UpdatePinRequest }) =>
			pinService.update(id, body),
		onSuccess: invalidatePins(queryClient)
	}));
};

export const useDeletePin = () => {
	const queryClient = useQueryClient();
	return createMutation(() => ({
		mutationFn: (id: number) => pinService.remove(id),
		onSuccess: invalidatePins(queryClient)
	}));
};
