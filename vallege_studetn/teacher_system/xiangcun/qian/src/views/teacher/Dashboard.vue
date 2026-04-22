<template>
  <div class="teacher-layout teacher-dashboard">
    <aside class="sidebar">
      <h2>教师中心</h2>
      <ul class="nav-menu">
        <li><router-link to="/teacher/dashboard" class="active">仪表盘</router-link></li>
        <li><router-link to="/teacher/students">学生管理</router-link></li>
        <li><router-link to="/teacher/chat">聊天沟通</router-link></li>
        <li><router-link to="/teacher/resources">教学资源</router-link></li>
        <li><router-link to="/teacher/psychological">心理辅导</router-link></li>
        <li><router-link to="/teacher/ai-match">AI匹配</router-link></li>
        <li><router-link to="/teacher/match-management">匹配管理</router-link></li>
        <li><router-link to="/login">退出登录</router-link></li>
      </ul>
    </aside>
    
    <main class="main-content">
      <div class="header">
        <h1>教师仪表盘</h1>
        <div class="user-info">
          <span>{{ welcomeText }}</span>
          <div class="user-avatar">{{ userInitial }}</div>
        </div>
      </div>
      
      <div class="dashboard-cards">
        <div class="card">
          <div class="card-icon">👨‍🎓</div>
          <h3>辅导学生</h3>
          <p>当前辅导 <strong>{{ stats.activeStudents }}</strong> 名学生</p>
          <p>待处理请求 <strong>{{ stats.pendingRequests }}</strong> 个</p>
        </div>
        
        <div class="card">
          <div class="card-icon">📚</div>
          <h3>教学资源</h3>
          <p>已上传资源: <strong>{{ stats.resourcesCount }}</strong> 份</p>
          <p>本周新增: 0 份</p>
        </div>
        
        <div class="card">
          <div class="card-icon">💬</div>
          <h3>消息通知</h3>
          <p>未读消息: <strong>{{ stats.unreadMessages }}</strong> 条</p>
          <p>待处理请求: <strong>{{ stats.pendingRequests }}</strong> 个</p>
        </div>
      </div>
      
      <div class="student-list">
        <h3>我的学生</h3>
        <div 
          v-for="student in students" 
          :key="student.id"
          class="student-item"
        >
          <div class="student-avatar">{{ student.name[0] }}</div>
          <div class="student-info">
            <div class="student-name">{{ student.name }}</div>
            <div class="student-grade">{{ student.grade }}</div>
          </div>
          <span 
            class="student-status" 
            :class="student.status === '活跃' ? 'status-active' : 'status-pending'"
          >
            {{ student.status }}
          </span>
          <button class="btn btn-primary" @click="handleAction(student)">
            {{ student.status === '活跃' ? '沟通' : '确认' }}
          </button>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'

const API_BASE_URL = 'http://localhost:3000/api/v1'
const router = useRouter()

// 从 localStorage 获取用户信息
const userInfo = ref(null)
const token = ref('')

// 真实数据
const stats = ref({
  activeStudents: 0,
  pendingRequests: 0,
  resourcesCount: 0,
  unreadMessages: 0
})

const students = ref([])

onMounted(async () => {
  // 加载用户信息
  const userStr = localStorage.getItem('user')
  if (userStr) {
    userInfo.value = JSON.parse(userStr)
    token.value = userInfo.value.token || ''
  }
  
  // 加载仪表盘数据
  await loadDashboard()
})

// 加载仪表盘数据
const loadDashboard = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/teachers/dashboard`, {
      headers: {
        'Authorization': `Bearer ${token.value}`
      }
    })
    
    if (response.ok) {
      const data = await response.json()
      if (data.status === 'success' && data.data) {
        // 更新统计数据
        stats.value = data.data.stats || stats.value
        // 更新学生列表
        students.value = (data.data.students || []).map(s => ({
          id: s.id,
          name: s.name,
          grade: s.grade || '未设置',
          status: s.status || '活跃'
        }))
      }
    }
  } catch (error) {
    console.error('加载仪表盘数据失败:', error)
  }
}

// 获取用户姓氏（用于头像显示）
const userInitial = computed(() => {
  if (userInfo.value && userInfo.value.name) {
    return userInfo.value.name.charAt(0)
  }
  return '李'
})

// 获取完整称呼
const welcomeText = computed(() => {
  if (userInfo.value && userInfo.value.name) {
    return `欢迎，${userInfo.value.name}`
  }
  return '欢迎，李老师'
})

const handleAction = (student) => {
  if (student.status === '活跃') {
    router.push(`/teacher/chat?student=${student.id}`)
  } else {
    alert('确认学生: ' + student.name)
  }
}
</script>

<style scoped>
/* 强制全屏 - 覆盖全局样式 */
.teacher-dashboard {
  position: fixed !important;
  top: 0 !important;
  left: 0 !important;
  right: 0 !important;
  bottom: 0 !important;
  width: 100vw !important;
  max-width: none !important;
  margin: 0 !important;
  padding: 0 !important;
}

.teacher-dashboard {
  display: flex;
  min-height: 100vh;
  height: 100vh;
  font-family: 'Arial', sans-serif;
  background-color: #f0f8ff;
  color: #333;
}

.sidebar {
  width: 220px;
  background: linear-gradient(135deg, #2196F3, #1976D2);
  color: white;
  padding: 30px 20px;
  display: flex;
  flex-direction: column;
  flex-shrink: 0;
}

.sidebar h2 {
  margin-bottom: 40px;
  text-align: center;
  font-size: 24px;
  font-weight: 700;
  color: white;
}

.nav-menu {
  list-style: none;
  padding: 0;
  margin: 0;
}

.nav-menu li {
  margin-bottom: 8px;
}

.nav-menu a {
  display: block;
  padding: 12px 16px;
  color: white;
  text-decoration: none;
  border-radius: 8px;
  transition: all 0.3s ease;
  font-size: 17px;
}

.nav-menu a:hover,
.nav-menu a.router-link-active {
  background-color: rgba(255,255,255,0.2);
}

.nav-menu a.active {
  background-color: rgba(255,255,255,0.3);
}

.main-content {
  flex: 1;
  padding: 24px 32px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
}

.header {
  background: white;
  padding: 24px;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.08);
  margin-bottom: 24px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header h1 {
  color: #2196F3;
  font-size: 28px;
  font-weight: 600;
  margin: 0;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 15px;
}

.user-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: #2196F3;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: bold;
  font-size: 16px;
}

.dashboard-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 20px;
  margin-bottom: 30px;
}

.card {
  background: white;
  padding: 25px;
  border-radius: 10px;
  box-shadow: 0 4px 6px rgba(0,0,0,0.05);
  transition: all 0.3s ease;
}

.card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 15px rgba(0,0,0,0.1);
}

.card h3 {
  color: #2196F3;
  margin-bottom: 15px;
  font-size: 1.3em;
}

.card-icon {
  font-size: 2.5em;
  margin-bottom: 15px;
  color: #2196F3;
}

.student-list {
  background: white;
  padding: 25px;
  border-radius: 10px;
  box-shadow: 0 4px 6px rgba(0,0,0,0.05);
}

.student-list h3 {
  color: #2196F3;
  margin-bottom: 20px;
  font-size: 1.3em;
}

.student-item {
  display: flex;
  align-items: center;
  padding: 15px;
  border-bottom: 1px solid #e0e0e0;
  transition: all 0.3s ease;
}

.student-item:hover {
  background-color: #f9f9f9;
}

.student-avatar {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  background: #E3F2FD;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #2196F3;
  font-weight: bold;
  margin-right: 15px;
}

.student-info {
  flex: 1;
}

.student-name {
  font-weight: bold;
  margin-bottom: 5px;
}

.student-grade {
  font-size: 0.9em;
  color: #666;
}

.student-status {
  padding: 5px 10px;
  border-radius: 15px;
  font-size: 0.8em;
  font-weight: bold;
}

.status-active {
  background-color: #d4edda;
  color: #155724;
}

.status-pending {
  background-color: #fff3cd;
  color: #856404;
}

.btn {
  padding: 8px 16px;
  border: none;
  border-radius: 5px;
  font-size: 0.9em;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.3s ease;
  margin-left: 10px;
}

.btn-primary {
  background: #2196F3;
  color: white;
}

.btn-primary:hover {
  background: #1976D2;
  transform: translateY(-2px);
}

@media (max-width: 768px) {
  .teacher-dashboard {
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
  
  .dashboard-cards {
    grid-template-columns: 1fr;
  }
}
</style>
