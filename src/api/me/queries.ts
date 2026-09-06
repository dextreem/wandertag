import { createMutation, createQuery, useQueryClient } from '@tanstack/svelte-query';
import { meService, type HistoryQuery } from './service';
import type { Paged } from '../types-paged';
import type { AdminActivity } from '../admin/types';
import type { NoteResponse } from '../notes/types';
import type { Profile, UpdateProfileRequest } from './types';

export const meKeys = {
	all: ['me'] as const,
	discoveries: (params: unknown) => [...meKeys.all, 'discoveries', params] as const,
	notes: (params: unknown) => [...meKeys.all, 'notes', params] as const
};

/**
 * The signed-in user's profile and stats.
 *
 * Also the provisioning trigger: the backend creates the local profile row on
 * first call, so this runs right after login and before anything else needs it.
 */
export const useMe = (getEnabled: () => boolean) =>
	createQuery<Profile>(() => ({
		queryKey: meKeys.all,
		queryFn: () => meService.get(),
		enabled: getEnabled()
	}));

export const useUpdateProfile = () => {
	const queryClient = useQueryClient();
	return createMutation(() => ({
		mutationFn: (body: UpdateProfileRequest) => meService.update(body),
		onSuccess: (data) => queryClient.setQueryData(meKeys.all, data)
	}));
};

/** Your own discoveries, paged and searchable — the profile's drill-down. */
export const useMyDiscoveries = (
	getParams: () => (HistoryQuery & { firstBloodOnly?: boolean }) | undefined
) =>
	createQuery(() => {
		const params = getParams();
		return {
			queryKey: meKeys.discoveries(params ?? {}),
			queryFn: () => meService.discoveries(params!),
			enabled: !!params,
			placeholderData: (previous: Paged<AdminActivity> | undefined) => previous
		};
	});

/** Your own notes, paged and searchable. */
export const useMyNotes = (getParams: () => HistoryQuery | undefined) =>
	createQuery(() => {
		const params = getParams();
		return {
			queryKey: meKeys.notes(params ?? {}),
			queryFn: () => meService.notes(params!),
			enabled: !!params,
			placeholderData: (previous: Paged<NoteResponse> | undefined) => previous
		};
	});
