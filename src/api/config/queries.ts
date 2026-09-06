import { createQuery } from '@tanstack/svelte-query';
import { configService } from './service';
import type { AppConfig } from './types';

export const configKeys = {
	all: ['config'] as const
};

/**
 * Server-side geo and map settings.
 *
 * Nothing in the UI hardcodes a radius — it all comes from here, so raising
 * `GEO_REVEAL_RADIUS_M` on the backend changes the app's behaviour and its copy
 * without a frontend release. Cached for the session since it only changes on a
 * server restart.
 */
export const useConfig = () =>
	createQuery<AppConfig>(() => ({
		queryKey: configKeys.all,
		queryFn: () => configService.get(),
		staleTime: Infinity,
		gcTime: Infinity
	}));
