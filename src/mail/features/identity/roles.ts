/** Mirror Mail AppRoles: Sender is send-only; dashboard is Admin|User. */

export function canViewDashboard(roles: readonly string[] | null | undefined): boolean {
  if (!roles?.length) return false
  return roles.includes('Admin') || roles.includes('User')
}

export function canAccessApiKeysUi(roles: readonly string[] | null | undefined): boolean {
  // Own-key list is any Bearer user; hide from Sender-only so they are not pushed at ops UI.
  return canViewDashboard(roles)
}

export function defaultPostLoginRoute(
  roles: readonly string[] | null | undefined,
): 'dashboard' | 'profile' {
  return canViewDashboard(roles) ? 'dashboard' : 'profile'
}
