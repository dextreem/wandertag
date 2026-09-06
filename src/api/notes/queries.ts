import { createMutation, createQuery, useQueryClient } from '@tanstack/svelte-query';
import { noteService } from './service';
import type { CreateNoteRequest, NearbyNotesParams, RateNoteRequest } from './types';
import { pinKeys } from '../pins/queries';
import { meKeys } from '../me/queries';

/** See `pinKeys.nearby`: rounded for cache stability, precise on the wire. */
const nearbyKey = (params?: NearbyNotesParams) =>
	params && {
		lat: params.lat.toFixed(3),
		lon: params.lon.toFixed(3),
		areaLat: params.areaLat?.toFixed(3),
		areaLon: params.areaLon?.toFixed(3),
		radiusM: params.radiusM
	};

export const noteKeys = {
	all: ['notes'] as const,
	nearby: (params?: NearbyNotesParams) => [...noteKeys.all, 'nearby', nearbyKey(params)] as const,
	detail: (id: number, position?: { lat: number; lon: number }) =>
		[...noteKeys.all, 'detail', id, position] as const
};

export const useNearbyNotes = (getParams: () => NearbyNotesParams | undefined) =>
	createQuery(() => {
		const params = getParams();
		return {
			queryKey: noteKeys.nearby(params),
			queryFn: () => noteService.nearby(params!),
			enabled: !!params,
			staleTime: 30_000
		};
	});

export const useNote = (
	getId: () => number | undefined,
	getPosition: () => { lat: number; lon: number } | undefined
) =>
	createQuery(() => {
		const id = getId();
		const position = getPosition();
		return {
			queryKey: noteKeys.detail(id!, position),
			queryFn: () => noteService.read(id!, position),
			enabled: !!id
		};
	});

/** Dropping a note also touches the pin it is anchored to and the author's stats. */
export const useCreateNote = () => {
	const queryClient = useQueryClient();
	return createMutation(() => ({
		mutationFn: (body: CreateNoteRequest) => noteService.create(body),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: noteKeys.all });
			queryClient.invalidateQueries({ queryKey: pinKeys.all });
			queryClient.invalidateQueries({ queryKey: meKeys.all });
		}
	}));
};

export const useDeleteNote = () => {
	const queryClient = useQueryClient();
	return createMutation(() => ({
		mutationFn: (id: number) => noteService.remove(id),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: noteKeys.all });
			queryClient.invalidateQueries({ queryKey: pinKeys.all });
			queryClient.invalidateQueries({ queryKey: meKeys.all });
		}
	}));
};

/**
 * Rates a note.
 *
 * Invalidates pins too: a pin sheet renders its notes' ratings, so a new score has
 * to show up there as well as in the note itself.
 */
export const useRateNote = () => {
	const queryClient = useQueryClient();
	return createMutation(() => ({
		mutationFn: ({ id, body }: { id: number; body: RateNoteRequest }) => noteService.rate(id, body),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: noteKeys.all });
			queryClient.invalidateQueries({ queryKey: pinKeys.all });
		}
	}));
};
