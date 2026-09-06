import { api } from '../api';
import type { Friend, FriendPosition } from './types';

export const friendService = {
	list: () => api.get<Friend[]>('/friends'),
	request: (displayName: string) => api.post<Friend>('/friends', { displayName }),
	accept: (id: number) => api.post<Friend>(`/friends/${id}/accept`),
	decline: (id: number) => api.post<void>(`/friends/${id}/decline`),
	setSharing: (id: number, share: boolean) => api.put<Friend>(`/friends/${id}/sharing`, { share }),
	remove: (id: number) => api.delete<void>(`/friends/${id}`),
	positions: () => api.get<FriendPosition[]>('/friends/positions')
};
