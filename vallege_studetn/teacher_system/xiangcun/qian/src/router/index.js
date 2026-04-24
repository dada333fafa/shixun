import { createRouter, createWebHistory } from 'vue-router'

// 认证相关
import Login from '../views/auth/Login.vue'
import Register from '../views/auth/Register.vue'
import ForgotPassword from '../views/auth/ForgotPassword.vue'

// 教师相关
import TeacherDashboard from '../views/teacher/Dashboard.vue'
import TeacherStudentManagement from '../views/teacher/StudentManagement.vue'
import TeacherChat from '../views/teacher/Chat.vue'
import TeacherResources from '../views/teacher/Resources.vue'
import TeacherPsychological from '../views/teacher/Psychological.vue'
import TeacherAIMatch from '../views/teacher/AIMatch.vue'
import TeacherMatchManagement from '../views/teacher/MatchManagement.vue'

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
    path: '/register',
    name: 'Register',
    component: Register
  },
  {
    path: '/forgot-password',
    name: 'ForgotPassword',
    component: ForgotPassword
  },
  // 教师路由
  {
    path: '/teacher/dashboard',
    name: 'TeacherDashboard',
    component: TeacherDashboard
  },
  {
    path: '/teacher/students',
    name: 'TeacherStudentManagement',
    component: TeacherStudentManagement
  },
  {
    path: '/teacher/chat',
    name: 'TeacherChat',
    component: TeacherChat
  },
  {
    path: '/teacher/resources',
    name: 'TeacherResources',
    component: TeacherResources
  },
  {
    path: '/teacher/psychological',
    name: 'TeacherPsychological',
    component: TeacherPsychological
  },
  {
    path: '/teacher/ai-match',
    name: 'TeacherAIMatch',
    component: TeacherAIMatch
  },
  {
    path: '/teacher/match-management',
    name: 'TeacherMatchManagement',
    component: TeacherMatchManagement
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// 全局路由守卫 - 检查登录状态
router.beforeEach((to, from, next) => {
  // 需要登录的路由
  const requiresAuth = to.path.startsWith('/teacher/')
  
  // 获取 token
  const token = localStorage.getItem('token')
  
  if (requiresAuth && !token) {
    // 需要登录但没有 token，跳转到登录页
    next('/login')
  } else if (to.path === '/login' && token) {
    // 已登录但访问登录页，跳转到仪表盘
    next('/teacher/dashboard')
  } else {
    // 正常访问
    next()
  }
})

export default router
