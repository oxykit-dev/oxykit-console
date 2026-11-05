import type { NavigationGuardReturn, RouteLocationNormalized, RouteRecordRaw } from 'vue-router'
import { useAuthStore } from '@mail/features/identity'
import { canAccessApiKeysUi, canViewDashboard, defaultPostLoginRoute } from '@mail/features/identity'
import { afterLoginLocation, loginLocation } from '@/router/gate'

declare module 'vue-router' {
  interface RouteMeta {
    requiresAuth?: boolean
    roles?: string[]
    /** Mail screens. The shell nav shows the account menu. */
    mail?: boolean
    /** Render or Flow studio layout. */
    studio?: boolean
  }
}

export const mailRoutes: RouteRecordRaw[] = [
  {
    path: '',
    name: 'home',
    component: () => import('./features/identity/views/HomeView.vue'),
  },
  {
    path: 'dashboard',
    name: 'dashboard',
    meta: { requiresAuth: true, roles: ['Admin', 'User'] },
    component: () => import('./features/dashboard/views/DashboardView.vue'),
  },
  {
    path: 'apikeys',
    name: 'apikeys',
    meta: { requiresAuth: true, roles: ['Admin', 'User'] },
    component: () => import('./features/apikeys/views/ApiKeysView.vue'),
  },
  {
    path: 'users',
    name: 'users',
    meta: { requiresAuth: true, roles: ['Admin'] },
    component: () => import('./features/users/views/UsersView.vue'),
  },
  {
    path: 'ops',
    name: 'ops',
    meta: { requiresAuth: true, roles: ['Admin'] },
    component: () => import('./features/ops/views/OpsView.vue'),
  },
  {
    path: 'templates',
    name: 'templates',
    meta: { requiresAuth: true, roles: ['Admin'] },
    component: () => import('./features/templates/views/TemplatesView.vue'),
  },
  {
    path: 'profile',
    name: 'profile',
    meta: { requiresAuth: true },
    component: () => import('./features/users/views/ProfileView.vue'),
  },
]

export function guardMail(to: RouteLocationNormalized): NavigationGuardReturn {
  const auth = useAuthStore()
  const userRoles = auth.user?.roles ?? []

  if (to.meta.requiresAuth && !auth.isLoggedIn) {
    return loginLocation(to.fullPath)
  }

  const roles = to.meta.roles
  if (roles?.length) {
    if (!roles.some((role) => userRoles.includes(role))) {
      return { name: defaultPostLoginRoute(userRoles) }
    }
  }

  if (to.name === 'home' && auth.isLoggedIn) {
    return afterLoginLocation(userRoles, to.query.returnUrl)
  }

  if (to.name === 'dashboard' && !canViewDashboard(userRoles)) {
    return { name: 'profile' }
  }
  if (to.name === 'apikeys' && !canAccessApiKeysUi(userRoles)) {
    return { name: 'profile' }
  }

  return true
}
