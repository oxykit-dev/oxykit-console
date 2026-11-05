import type { RouteLocationNormalized, RouteLocationRaw } from 'vue-router'
import { modules } from '@/modules'
import { defaultPostLoginRoute } from '@mail/features/identity/roles'
import { safeReturnUrl } from '@/shell/session'

/** Render, Flow, and Mail screens need a session. `/login` does not. */
export function needsSession(to: Pick<RouteLocationNormalized, 'name' | 'meta'>): boolean {
  if (to.name === 'login') return false
  if (to.name === 'render' || to.name === 'flow' || to.name === 'home') return true
  return to.meta.requiresAuth === true
}

export function loginLocation(returnPath: string): RouteLocationRaw {
  return { name: 'login', query: { returnUrl: returnPath } }
}

/** Where to go after a session exists. `returnUrl` wins when it is same-origin. */
export function afterLoginLocation(
  roles: readonly string[] | null | undefined,
  returnUrl?: unknown,
): RouteLocationRaw {
  const next = safeReturnUrl(returnUrl)
  if (next && next !== '/login') return next
  if (modules.mail) return { name: defaultPostLoginRoute(roles) }
  if (modules.render) return { name: 'render' }
  if (modules.flow) return { name: 'flow' }
  return { name: 'modules' }
}
