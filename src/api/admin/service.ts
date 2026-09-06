import { api } from '../api';
import type { Paged } from '../types-paged';
import type { PinDetail } from '../pins/types';
import type { PinCategory, PinSource } from '../types';
import type { AdminActivity, AdminUser, AdminViolation } from './types';

export interface AdminPinQuery {
	query?: string;
	category?: PinCategory;
	source?: PinSource;
	hidden?: boolean;
	page?: number;
	size?: number;
}

export const adminService = {
	pins: (params: AdminPinQuery) => api.get<Paged<PinDetail>>('/admin/pins', { ...params }),
	users: () => api.get<AdminUser[]>('/admin/users'),
	activity: (limit = 50) => api.get<AdminActivity[]>('/admin/activity', { limit }),
	violations: () => api.get<AdminViolation[]>('/admin/violations'),
	setActive: (userId: string, active: boolean) =>
		api.put<AdminUser>(`/admin/users/${userId}/active`, { active }),
	unblock: (userId: string) => api.post<AdminUser>(`/admin/users/${userId}/unblock`)
};
