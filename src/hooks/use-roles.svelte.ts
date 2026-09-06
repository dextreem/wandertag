import { getKeycloak } from '../keycloak.js';
import { ADMIN_ROLES, UserRole } from '../types/roles.js';

class RoleState {
	roles = $state<UserRole[]>([]);

	isAdmin = $derived(this.roles.some((r) => ADMIN_ROLES.includes(r)));
	isUser = $derived(this.roles.includes(UserRole.USER));

	/**
	 * Reads realm roles out of the parsed access token.
	 *
	 * This drives what the UI *offers*, never what it is *allowed* to do — every
	 * admin action is re-checked by `@PreAuthorize` on the server, because a token
	 * parsed in the browser is only ever a hint.
	 */
	syncRoles() {
		const realmRoles = getKeycloak().realmAccess?.roles ?? [];
		this.roles = realmRoles.filter((r): r is UserRole =>
			Object.values(UserRole).includes(r as UserRole)
		);
	}

	clear() {
		this.roles = [];
	}
}

export const roles = new RoleState();
