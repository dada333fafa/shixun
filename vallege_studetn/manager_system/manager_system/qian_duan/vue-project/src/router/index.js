import { createRouter, createWebHistory } from 'vue-router'

// 认证相关
import Login from '../views/auth/Login.vue'
import ForgotPassword from '../views/auth/ForgotPassword.vue'

// 通用页面
import Home from '../views/pages/Home.vue'
import About from '../views/pages/About.vue'

const routes = [
  {
    path: '/',
    name: 'Home',
    component: Home
  },
  {
    path: '/about',
    name: 'About',
    component: About
  },
  {
    path: '/login',
    name: 'Login',
    component: Login
  },
  {
    path: '/forgot-password',
    name: 'ForgotPassword',
    component: ForgotPassword
  },
  {
    path: '/admin/dashboard',
    name: 'AdminDashboard',
    component: () => import('../views/AdminDashboard.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/admin/users',
    name: 'UserManagement',
    component: () => import('../views/UserManagement.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/admin/content',
    name: 'ContentManagement',
    component: () => import('../views/ContentManagement.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/admin/ai-config',
    name: 'AIConfiguration',
    component: () => import('../views/AIConfiguration.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/admin/settings',
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
