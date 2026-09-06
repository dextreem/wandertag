import { createMutation, createQuery, useQueryClient } from '@tanstack/svelte-query';
import { adminService, type AdminPinQuery } from './service';
import type { Paged } from '../types-paged';
import type { PinDetail } from '../pins/types';
import type { AdminActivity, AdminUser, AdminViolation } from './types';

export const adminKeys = {
	all: ['admin'] as const,
	pins: (params: AdminPinQuery) => [...adminKeys.all, 'pins', params] as const,
	users: () => [...adminKeys.all, 'users'] as const,
	activity: (limit: number) => [...adminKeys.all, 'activity', limit] as const,
	violations: () => [...adminKeys.all, 'violations'] as const
};

/** Searchable, filterable, paged pins for the admin table. */
export const useAdminPins = (getParams: () => AdminPinQuery | undefined) =>
	createQuery(() => {
		const params = getParams();
		return {
			queryKey: adminKeys.pins(params ?? {}),
			queryFn: () => adminService.pins(params!),
			enabled: !!params,
			// Keeps the previous page visible while the next one loads, so paging does
			// not flash an empty table.
			placeholderData: (previous: Paged<PinDetail> | undefined) => previous
		};
	});

export const useAdminUsers = (getEnabled: () => boolean) =>
	createQuery<AdminUser[]>(() => ({
		queryKey: adminKeys.users(),
		queryFn: () => adminService.users(),
		enabled: getEnabled()
	}));

export const useAdminActivity = (getEnabled: () => boolean, limit = 50) =>
	createQuery<AdminActivity[]>(() => ({
		queryKey: adminKeys.activity(limit),
		queryFn: () => adminService.activity(limit),
		enabled: getEnabled(),
		// The feed is the "what is everyone doing" view, so keep it reasonably live.
		refetchInterval: 30_000
	}));

export const useAdminViolations = (getEnabled: () => boolean) =>
	createQuery<AdminViolation[]>(() => ({
		queryKey: adminKeys.violations(),
		queryFn: () => adminService.violations(),
		enabled: getEnabled()
	}));

export const useSetUserActive = () => {
	const queryClient = useQueryClient();
	return createMutation(() => ({
		mutationFn: ({ userId, active }: { userId: string; active: boolean }) =>
			adminService.setActive(userId, active),
		onSuccess: () => queryClient.invalidateQueries({ queryKey: adminKeys.all })
	}));
};

export const useUnblockUser = () => {
	const queryClient = useQueryClient();
	return createMutation(() => ({
		mutationFn: (userId: string) => adminService.unblock(userId),
		onSuccess: () => queryClient.invalidateQueries({ queryKey: adminKeys.all })
	}));
};
