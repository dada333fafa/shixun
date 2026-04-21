<script setup>
import { ref, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'

const route = useRoute()
const router = useRouter()

const menuItems = [
  { name: '仪表盘', path: '/parent-dashboard', icon: '📊' },
  { name: '孩子管理', path: '/child-management', icon: '👨‍👩‍👧‍👦' },
  { name: '教师沟通', path: '/teacher-communication', icon: '💬' },
  { name: '学习报告', path: '/learning-report', icon: '📈' },
  { name: '心理状态', path: '/psychological-status', icon: '❤️' },
  { name: '匹配确认', path: '/match-confirmation', icon: '✅' }
]

// 获取当前登录用户信息
const currentUser = computed(() => {
  // 每次访问时都从localStorage重新获取，确保数据是最新的
  const userStr = localStorage.getItem('user')
  return userStr ? JSON.parse(userStr) : null
})

// 获取用户名，用于显示
const userName = computed(() => {
  if (currentUser.value) {
    return currentUser.value.name || '家长'
  }
  return '家长'
})

// 获取用户头像显示的第一个字符
const userAvatar = computed(() => {
  if (currentUser.value && currentUser.value.name) {
    return currentUser.value.name.charAt(0)
  }
  return '家'
})

// 判断当前是否在前台页面（首页、登录、注册等）
const isFrontendPage = computed(() => {
  const frontendPaths = ['/', '/about', '/login', '/register', '/forgot-password']
  return frontendPaths.includes(route.path)
})

const isActive = (path) => {
  return route.path === path
}

const handleLogout = () => {
  // 退出登录逻辑
  localStorage.removeItem('user')
  router.push('/login')
}
</script>

<template>
  <!-- 前台页面：首页、登录、注册等 - 不使用侧边栏布局 -->
  <router-view v-if="isFrontendPage" />
  
  <!-- 后台页面：家长中心 - 使用侧边栏布局 -->
  <div v-else class="container">
    <div class="sidebar">
      <h2>家长中心</h2>
      <ul class="nav-menu">
        <li v-for="item in menuItems" :key="item.path">
          <router-link :to="item.path" :class="{ active: isActive(item.path) }">
            <span class="menu-icon">{{ item.icon }}</span>
            <span>{{ item.name }}</span>
          </router-link>
        </li>
        <li>
          <a href="#" @click.prevent="handleLogout" class="logout-link">
            <span class="menu-icon">🚪</span>
            <span>退出登录</span>
          </a>
        </li>
      </ul>
    </div>
    
    <div class="main-content">
      <div class="header">
        <h1>
          {{ menuItems.find(item => item.path === route.path)?.name || '家长中心' }}
        </h1>
        <div class="user-info">
          <span>欢迎，{{ userName }}</span>
          <div class="user-avatar">{{ userAvatar }}</div>
        </div>
      </div>
      
      <router-view />
    </div>
  </div>
</template>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: 'Arial', sans-serif;
  background-color: #f0f8ff;
  color: #333;
}

.container {
  display: flex;
  min-height: 100vh;
}

.sidebar {
  width: 250px;
  background: linear-gradient(135deg, #FF9800, #F57C00);
  color: white;
  padding: 20px;
  box-shadow: 2px 0 5px rgba(0,0,0,0.1);
}

.sidebar h2 {
  margin-bottom: 30px;
  text-align: center;
  font-size: 1.5em;
}

.nav-menu {
  list-style: none;
}

.nav-menu li {
  margin-bottom: 10px;
}

.nav-menu a,
.nav-menu router-link {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px;
  color: white;
  text-decoration: none;
  border-radius: 8px;
  transition: all 0.3s ease;
}

.nav-menu a:hover,
.nav-menu router-link:hover {
  background-color: rgba(255,255,255,0.2);
  transform: translateX(5px);
}

.nav-menu a.active,
.nav-menu router-link.active {
  background-color: rgba(255,255,255,0.3);
  font-weight: bold;
}

.menu-icon {
  font-size: 1.2em;
}

.logout-link {
  margin-top: 20px;
  border-top: 1px solid rgba(255,255,255,0.2);
  padding-top: 20px;
  display: flex;
  align-items: center;
  gap: 10px;
  color: white;
  text-decoration: none;
  border-radius: 8px;
  transition: all 0.3s ease;
}

.logout-link:hover {
  background-color: rgba(255,255,255,0.2);
  transform: translateX(5px);
}

.main-content {
  flex: 1;
  padding: 20px;
}

.header {
  background: white;
  padding: 20px;
  border-radius: 10px;
  box-shadow: 0 2px 5px rgba(0,0,0,0.1);
  margin-bottom: 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header h1 {
  color: #FF9800;
  font-size: 1.8em;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 10px;
}

.user-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: #FF9800;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: bold;
}

@media (max-width: 768px) {
  .container {
    flex-direction: column;
  }
  
  .sidebar {
    width: 100%;
    padding: 10px;
  }
  
  .nav-menu {
    display: flex;
    overflow-x: auto;
    gap: 10px;
  }
  
  .nav-menu li {
    margin-bottom: 0;
  }
}
</style>