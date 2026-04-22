import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  {
    path: '/',
    name: 'Home',
    redirect: '/login'
  },
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/Login.vue')
  },
  {
    path: '/register',
    name: 'Register',
    component: () => import('@/views/Register.vue')
  },
  {
    path: '/student/dashboard',
    name: 'StudentDashboard',
    component: () => import('@/views/student/Dashboard.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/student/teacher-selection',
    name: 'StudentTeacherSelection',
    component: () => import('@/views/student/TeacherSelection.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/student/chat',
    name: 'StudentChat',
    component: () => import('@/views/student/Chat.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/student/resources',
    name: 'StudentResources',
    component: () => import('@/views/student/Resources.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/student/psychological',
    name: 'StudentPsychological',
    component: () => import('@/views/student/Psychological.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/student/ai-recommendation',
    name: 'StudentAIRecommendation',
    component: () => import('@/views/student/AIRecommendation.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/student/match',
    name: 'StudentMatch',
    component: () => import('@/views/student/Match.vue'),
    meta: { requiresAuth: true }
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// 路由守卫
router.beforeEach((to, from, next) => {
  const token = localStorage.getItem('token')
  
  console.log('路由跳转:', { from: from.path, to: to.path, hasToken: !!token })
  
  if (to.meta.requiresAuth && !token) {
    console.log('未登录，重定向到登录页')
    next('/login')
  } else {
    next()
  }
})

export default router
