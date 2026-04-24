<template>
  <div class="sidebar">
    <h2>管理员中心</h2>
    <ul class="nav-menu">
      <li><router-link to="/admin/dashboard" :class="{ active: currentRoute === 'dashboard' }">仪表盘</router-link></li>
      <li><router-link to="/admin/users" :class="{ active: currentRoute === 'users' }">用户管理</router-link></li>
      <li><router-link to="/admin/content" :class="{ active: currentRoute === 'content' }">内容管理</router-link></li>
      <li><router-link to="/admin/ai-config" :class="{ active: currentRoute === 'ai-config' }">AI配置</router-link></li>
      <li><router-link to="/admin/settings" :class="{ active: currentRoute === 'settings' }">系统设置</router-link></li>
      <li><a href="#" @click.prevent="handleLogout">退出登录</a></li>
    </ul>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'

const route = useRoute()
const router = useRouter()

const currentRoute = computed(() => {
  const path = route.path
  if (path === '/admin/dashboard') return 'dashboard'
  if (path === '/admin/users') return 'users'
  if (path === '/admin/content') return 'content'
  if (path === '/admin/ai-config') return 'ai-config'
  if (path === '/admin/settings') return 'settings'
  return ''
})

const handleLogout = () => {
  localStorage.removeItem('token')
  localStorage.removeItem('user')
  router.push('/login')
}
</script>

<style scoped>
.sidebar {
  width: 250px;
  background: linear-gradient(135deg, #9C27B0, #7B1FA2);
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

.nav-menu a {
  display: block;
  padding: 12px;
  color: white;
  text-decoration: none;
  border-radius: 8px;
  transition: all 0.3s ease;
}

.nav-menu a:hover {
  background-color: rgba(255,255,255,0.2);
  transform: translateX(5px);
}

.nav-menu a.router-link-active,
.nav-menu a.active {
  background-color: rgba(255,255,255,0.3);
  font-weight: bold;
}
</style>
