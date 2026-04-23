import { createRouter, createWebHistory } from 'vue-router'

// 认证相关
import Login from '../views/auth/Login.vue'
import Register from '../views/auth/Register.vue'
import ForgotPassword from '../views/auth/ForgotPassword.vue'

// 学生相关
import StudentDashboard from '../views/student/Dashboard.vue'
import StudentTeacherSelection from '../views/student/TeacherSelection.vue'
import StudentChat from '../views/student/Chat.vue'
import StudentResources from '../views/student/Resources.vue'
import StudentPsychological from '../views/student/Psychological.vue'
import StudentAIRecommendation from '../views/student/AIRecommendation.vue'
import StudentMatch from '../views/student/Match.vue'
import StudentParentRequests from '../views/student/ParentRequests.vue'

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
  // 学生路由
  {
    path: '/student/dashboard',
    name: 'StudentDashboard',
    component: StudentDashboard
  },
  {
    path: '/student/teacher-selection',
    name: 'StudentTeacherSelection',
    component: StudentTeacherSelection
  },
  {
    path: '/student/chat',
    name: 'StudentChat',
    component: StudentChat
  },
  {
    path: '/student/resources',
    name: 'StudentResources',
    component: StudentResources
  },
  {
    path: '/student/psychological',
    name: 'StudentPsychological',
    component: StudentPsychological
  },
  {
    path: '/student/ai-recommendation',
    name: 'StudentAIRecommendation',
    component: StudentAIRecommendation
  },
  {
    path: '/student/match',
    name: 'StudentMatch',
    component: StudentMatch
  },
  {
    path: '/student/parent-requests',
    name: 'StudentParentRequests',
    component: StudentParentRequests
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

export default router
