import { createRouter, createWebHistory } from 'vue-router'
import Home from '../views/Home.vue'
import About from '../views/About.vue'
import Login from '../views/Login.vue'
import Register from '../views/Register.vue'
import ForgotPassword from '../views/ForgotPassword.vue'
import ParentDashboard from '../views/ParentDashboard.vue'
import ParentChildManagement from '../views/ParentChildManagement.vue'
import ParentTeacherCommunication from '../views/ParentTeacherCommunication.vue'
import ParentLearningReport from '../views/ParentLearningReport.vue'
import ParentPsychologicalStatus from '../views/ParentPsychologicalStatus.vue'
import ParentMatchConfirmation from '../views/ParentMatchConfirmation.vue'

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
  {
    path: '/parent-dashboard',
    name: 'ParentDashboard',
    component: ParentDashboard
  },
  {
    path: '/child-management',
    name: 'ParentChildManagement',
    component: ParentChildManagement
  },
  {
    path: '/teacher-communication',
    name: 'ParentTeacherCommunication',
    component: ParentTeacherCommunication
  },
  {
    path: '/learning-report',
    name: 'ParentLearningReport',
    component: ParentLearningReport
  },
  {
    path: '/psychological-status',
    name: 'ParentPsychologicalStatus',
    component: ParentPsychologicalStatus
  },
  {
    path: '/match-confirmation',
    name: 'ParentMatchConfirmation',
    component: ParentMatchConfirmation
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router