import { api } from '../api';
import type { AppConfig } from './types';

export const configService = {
	get: () => api.get<AppConfig>('/config')
};
