import axios from 'axios';

/** The error envelope every WanderTag endpoint returns (see `ErrorResponse.kt`). */
export interface ApiErrorBody {
	error: string;
	message: string;
}

export type ApiErrorCode =
	| 'NOT_FOUND'
	| 'CONFLICT'
	| 'VALIDATION_ERROR'
	| 'BAD_REQUEST'
	| 'TOO_FAR_AWAY'
	| 'IMPLAUSIBLE_POSITION'
	| 'INTERNAL_ERROR'
	| 'UNKNOWN';

export function apiErrorCode(error: unknown): ApiErrorCode {
	if (axios.isAxiosError<ApiErrorBody>(error)) {
		return (error.response?.data?.error as ApiErrorCode) ?? 'UNKNOWN';
	}
	return 'UNKNOWN';
}

export function apiErrorMessage(error: unknown): string | undefined {
	if (axios.isAxiosError<ApiErrorBody>(error)) return error.response?.data?.message;
	return undefined;
}

/** True when the server refused because the user is not close enough. */
export function isTooFarAway(error: unknown): boolean {
	return apiErrorCode(error) === 'TOO_FAR_AWAY';
}
