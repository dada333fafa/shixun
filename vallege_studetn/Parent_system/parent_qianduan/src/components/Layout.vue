<template>
  <div class="container">
    <div class="sidebar">
      <h2>家长中心</h2>
      <ul class="nav-menu">
        <li><router-link to="/parent/dashboard" :class="{ active: $route.path === '/parent/dashboard' }">仪表盘</router-link></li>
        <li><router-link to="/child-management" :class="{ active: $route.path === '/child-management' }">孩子管理</router-link></li>
        <li><router-link to="/teacher-communication" :class="{ active: $route.path === '/teacher-communication' }">教师沟通</router-link></li>
        <li><router-link to="/learning-report" :class="{ active: $route.path === '/learning-report' }">学习报告</router-link></li>
        <li><router-link to="/psychological-status" :class="{ active: $route.path === '/psychological-status' }">心理状态</router-link></li>
        <li><router-link to="/match-confirmation" :class="{ active: $route.path === '/match-confirmation' }">匹配确认</router-link></li>
        <li><router-link to="/login">退出登录</router-link></li>
      </ul>
    </div>
    
    <div class="main-content">
      <div class="header">
        <h1>{{ title }}</h1>
        <div class="user-info">
          <span>欢迎，{{ userName }}</span>
          <div class="user-avatar">{{ userAvatar }}</div>
        </div>
      </div>
      
      <slot></slot>
    </div>
  </div>
</template>

<script>
export default {
  name: 'Layout',
  props: {
    title: {
      type: String,
      required: true
    }
  },
  computed: {
    userName() {
      const userStr = localStorage.getItem('user')
      if (userStr) {
        const user = JSON.parse(userStr)
        return user.name || '家长'
      }
      return '家长'
    },
    userAvatar() {
      const name = this.userName
      return name ? name.charAt(0) : '家'
    }
  }
}
</script>

<style scoped>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

.container {
  display: flex;
  min-height: 100vh;
  width: 100%;
}

.sidebar {
  width: 250px;
  min-width: 250px;
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

.nav-menu a.active {
  background-color: rgba(255,255,255,0.3);
  font-weight: bold;
}

.main-content {
  flex: 1;
  padding: 30px;
  width: 100%;
  overflow-y: auto;
}

.header {
  background: white;
  padding: 20px 30px;
  border-radius: 10px;
  box-shadow: 0 2px 5px rgba(0,0,0,0.1);
  margin-bottom: 30px;
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
    min-width: 100%;
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