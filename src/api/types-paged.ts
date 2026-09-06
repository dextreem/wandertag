/**
 * A page of results, matching the backend's `PageResponse`.
 *
 * Deliberately not Spring Data's serialised `Page`: that leaks a large, unstable
 * shape into the API contract. This is only what a pager needs.
 */
export interface Paged<T> {
	items: T[];
	page: number;
	size: number;
	totalItems: number;
	totalPages: number;
}
