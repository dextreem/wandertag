import axios, { type AxiosError } from 'axios';
import { publicEnv } from '$lib/env';
import { getKeycloak, getValidAccessToken } from '../keycloak.js';

export const http = axios.create({
	headers: { 'Content-Type': 'application/json' }
});

// Resolved per request rather than baked in at import time. An unset
// PUBLIC_API_URL used to leave `baseURL` undefined, which axios treats as "relative
// to the current origin" — so every call silently hit the SvelteKit server instead
// of the API and came back as HTML 404s. Now it throws and says which variable is
// missing.
http.interceptors.request.use((config) => {
	config.baseURL = publicEnv.apiUrl;
	return config;
});

http.interceptors.request.use(async (config) => {
	const token = await getValidAccessToken();
	if (token) config.headers.Authorization = `Bearer ${token}`;
	return config;
});

http.interceptors.response.use(
	(res) => res,
	async (error: AxiosError) => {
		// Only a 401 on a request we *thought* was authenticated means the session
		// died. A 401 while browsing anonymously is expected, and bouncing such a
		// visitor to a login screen would be hostile.
		if (error.response?.status === 401 && getKeycloak().authenticated) {
			await getKeycloak().login();
		}
		return Promise.reject(error);
	}
);

export const api = {
	get: <T>(url: string, params?: Record<string, unknown>) =>
		http.get<T>(url, { params }).then((res) => res.data),
	post: <T>(url: string, body?: unknown) => http.post<T>(url, body).then((res) => res.data),
	put: <T>(url: string, body?: unknown) => http.put<T>(url, body).then((res) => res.data),
	patch: <T>(url: string, body?: unknown) => http.patch<T>(url, body).then((res) => res.data),
	delete: <T>(url: string) => http.delete<T>(url).then((res) => res.data)
};
