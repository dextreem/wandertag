import { api } from '../api';
import type {
	CreatePinRequest,
	DiscoverPinRequest,
	DiscoveryResult,
	NearbyPinsParams,
	PinDetail,
	PinMarkersResponse,
	UpdatePinRequest
} from './types';

export const pinService = {
	nearby: (params: NearbyPinsParams) => api.get<PinMarkersResponse>('/pins', { ...params }),

	detail: (id: number, position?: { lat: number; lon: number }) =>
		api.get<PinDetail>(`/pins/${id}`, position ? { ...position } : undefined),

	discover: (id: number, body: DiscoverPinRequest) =>
		api.post<DiscoveryResult>(`/pins/${id}/discover`, body),

	create: (body: CreatePinRequest) => api.post<PinDetail>('/pins', body),

	update: (id: number, body: UpdatePinRequest) => api.patch<PinDetail>(`/pins/${id}`, body),

	remove: (id: number) => api.delete<void>(`/pins/${id}`)
};
