import { api } from '../api';
import type { Paged } from '../types-paged';
import type { AdminActivity } from '../admin/types';
import type { NoteResponse } from '../notes/types';
import type { Profile, UpdateProfileRequest } from './types';

export interface HistoryQuery {
	query?: string;
	page?: number;
	size?: number;
}

export const meService = {
	get: () => api.get<Profile>('/me'),
	update: (body: UpdateProfileRequest) => api.patch<Profile>('/me', body),

	/** The list behind the "pins uncovered" / "first ascents" tiles. */
	discoveries: (params: HistoryQuery & { firstBloodOnly?: boolean }) =>
		api.get<Paged<AdminActivity>>('/me/discoveries', { ...params }),

	/** The list behind the "notes" tile. */
	notes: (params: HistoryQuery) => api.get<Paged<NoteResponse>>('/me/notes', { ...params })
};
