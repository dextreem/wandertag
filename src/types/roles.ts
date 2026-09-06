/** Realm roles defined in `docker/keycloak/wandertag-realm.json`. */
export enum UserRole {
	USER = 'user',
	ADMIN = 'admin'
}

export const ADMIN_ROLES: UserRole[] = [UserRole.ADMIN];
