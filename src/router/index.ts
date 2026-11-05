import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router'
import { modules } from '@/modules'
import { useAuthStore } from '@mail/features/identity'
import { guardMail, mailRoutes } from '@mail/router'
import { afterLoginLocation, loginLocation, needsSession } from '@/router/gate'

export function createAppRouter() {
  const routes: RouteRecordRaw[] = []

  routes.push({
    path: '/login',
    name: 'login',
    component: () => import('@/shell/LoginView.vue'),
  })

  if (modules.mail) {
    routes.push({
      path: '/',
      component: () => import('@mail/MailFrame.vue'),
      meta: { mail: true },
      children: mailRoutes,
    })
  } else {
    routes.push({
      path: '/',
      name: 'modules',
      component: () => import('@/HomeView.vue'),
      meta: { studio: true },
    })
  }

  if (modules.render) {
    routes.push({
      path: '/render',
      name: 'render',
      component: () => import('@render/features/studio/StudioView.vue'),
      meta: { studio: true },
    })
  }

  if (modules.flow) {
    routes.push({
      path: '/flow',
      name: 'flow',
      component: () => import('@flow/features/jobs/JobsView.vue'),
      meta: { studio: true },
    })
  }

  const router = createRouter({
    history: createWebHistory(import.meta.env.BASE_URL),
    routes,
  })

  router.beforeEach((to) => {
    if (to.path.startsWith('/render') && !modules.render) return '/'
    if (to.path.startsWith('/flow') && !modules.flow) return '/'

    const auth = useAuthStore()
    if (to.name === 'login' && auth.isLoggedIn) {
      return afterLoginLocation(auth.user?.roles, to.query.returnUrl)
    }
    if (!auth.isLoggedIn && needsSession(to)) return loginLocation(to.fullPath)
    if (to.meta.mail) return guardMail(to)
    return true
  })

  return router
}
