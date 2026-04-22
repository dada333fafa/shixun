import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  {
    path: '/login',
    name: 'Login',
    component: () => import('../views/Login.vue')
  },
  {
    path: '/register',
    name: 'Register',
    component: () => import('../views/Register.vue')
  },
  {
    path: '/',
    redirect: '/dashboard'
  },
  {
    path: '/dashboard',
    name: 'Dashboard',
    component: () => import('../views/AdminDashboard.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/users',
    name: 'UserManagement',
    component: () => import('../views/UserManagement.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/content',
    name: 'ContentManagement',
    component: () => import('../views/ContentManagement.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/ai-config',
    name: 'AIConfiguration',
    component: () => import('../views/AIConfiguration.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/settings',
    name: 'SystemSettings',
    component: () => import('../views/SystemSettings.vue'),
    meta: { requiresAuth: true }
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

router.beforeEach((to, from, next) => {
  const isAuthenticated = localStorage.getItem('token')
  if (to.meta.requiresAuth && !isAuthenticated) {
    next('/login')
  } else {
    next()
  }
})

export default router
