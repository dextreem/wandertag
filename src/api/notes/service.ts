import { api } from '../api';
import type {
	CreateNoteRequest,
	NearbyNotesParams,
	NoteResponse,
	NotesResponse,
	RateNoteRequest,
	Rating
} from './types';

export const noteService = {
	nearby: (params: NearbyNotesParams) => api.get<NotesResponse>('/notes', { ...params }),

	read: (id: number, position?: { lat: number; lon: number }) =>
		api.get<NoteResponse>(`/notes/${id}`, position ? { ...position } : undefined),

	create: (body: CreateNoteRequest) => api.post<NoteResponse>('/notes', body),

	remove: (id: number) => api.delete<void>(`/notes/${id}`),
	rate: (id: number, body: RateNoteRequest) => api.put<Rating>(`/notes/${id}/rating`, body),
	removeRating: (id: number) => api.delete<Rating>(`/notes/${id}/rating`)
};
