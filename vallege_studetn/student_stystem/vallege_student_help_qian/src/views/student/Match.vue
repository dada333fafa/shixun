<template>
  <div class="container">
    <!-- 侧边栏 -->
    <aside class="sidebar">
      <h2>学生中心</h2>
      <nav class="nav-menu">
        <router-link to="/student/dashboard">仪表盘</router-link>
        <router-link to="/student/teacher-selection">教师选择</router-link>
        <router-link to="/student/chat">聊天沟通</router-link>
        <router-link to="/student/resources">学习资源</router-link>
        <router-link to="/student/psychological">心理支持</router-link>
        <router-link to="/student/ai-recommendation">AI推荐</router-link>
        <router-link to="/student/match" class="active">匹配管理</router-link>
        <a href="#" @click.prevent="handleLogout">退出登录</a>
      </nav>
    </aside>

    <!-- 主内容区 -->
    <main class="main-content">
      <header class="header">
        <h1>匹配管理</h1>
        <div class="user-info">
          <span>欢迎，{{ currentUser?.name || currentUser?.username }}</span>
          <div class="user-avatar">{{ (currentUser?.name || currentUser?.username || '用').charAt(0) }}</div>
        </div>
      </header>

      <!-- 统计卡片 -->
      <div class="stats-cards">
        <div class="stat-card">
          <div class="stat-icon">📝</div>
          <div class="stat-info">
            <div class="stat-number">{{ stats.pending }}</div>
            <div class="stat-label">待确认</div>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon">✅</div>
          <div class="stat-info">
            <div class="stat-number">{{ stats.approved }}</div>
            <div class="stat-label">已接受</div>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon">❌</div>
          <div class="stat-info">
            <div class="stat-number">{{ stats.rejected }}</div>
            <div class="stat-label">已拒绝</div>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon">👥</div>
          <div class="stat-info">
            <div class="stat-number">{{ stats.total }}</div>
            <div class="stat-label">总请求数</div>
          </div>
        </div>
      </div>

      <!-- 匹配列表 -->
      <div class="match-list">
        <h3>我的辅导请求</h3>
        
        <div v-if="loading" class="loading-message">
          加载中...
        </div>
        
        <div v-else-if="matches.length === 0" class="no-matches">
          <p>还没有发送任何辅导请求</p>
          <router-link to="/student/teacher-selection" class="btn-primary">
            去选择教师
          </router-link>
        </div>
        
        <div v-else class="matches-container">
          <div 
            v-for="match in matches" 
            :key="match._id"
            class="match-item"
          >
            <div class="match-header">
              <div class="teacher-info">
                <div class="teacher-avatar">
                  {{ getTeacherInitial(match) }}
                </div>
                <div class="teacher-details">
                  <h4>{{ getTeacherName(match) }}</h4>
                  <p class="teacher-subject">{{ getTeacherSubject(match) }}</p>
                </div>
              </div>
              <span 
                class="match-status" 
                :class="getStatusClass(match.status)"
              >
                {{ getStatusText(match.status) }}
              </span>
            </div>
            
            <div class="match-body">
              <div class="request-info">
                <p><strong>辅导需求：</strong>{{ match.requestMessage || '未填写' }}</p>
                <p><strong>发送时间：</strong>{{ formatDate(match.createdAt) }}</p>
                <p v-if="match.matchedAt"><strong>确认时间：</strong>{{ formatDate(match.matchedAt) }}</p>
              </div>
            </div>
            
            <div class="match-actions">
              <button 
                v-if="match.status === 'pending'"
                class="btn btn-secondary"
                @click="cancelMatch(match._id)"
              >
                取消请求
              </button>
              <button 
                v-if="match.status === 'approved' || match.status === 'active'"
                class="btn btn-primary"
                @click="goToChat(match)"
              >
                开始聊天
              </button>
            </div>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'

const API_BASE_URL = '/api/v1'
const router = useRouter()

const currentUser = ref(null)
const matches = ref([])
const loading = ref(false)

const stats = computed(() => {
  return {
    pending: matches.value.filter(m => m.status === 'pending').length,
    approved: matches.value.filter(m => m.status === 'approved').length,
    rejected: matches.value.filter(m => m.status === 'rejected').length,
    total: matches.value.length
  }
})

onMounted(async () => {
  try {
    currentUser.value = await getCurrentUser()
    await loadMatches()
  } catch (error) {
    console.error('初始化页面失败:', error)
    alert('加载页面失败，请重新登录')
    router.push('/login')
  }
})

function getCurrentUser() {
  const userStr = localStorage.getItem('user')
  if (userStr) {
    return JSON.parse(userStr)
  }
  return null
}

async function loadMatches() {
  try {
    loading.value = true
    const user = getCurrentUser()
    // 从 localStorage 直接获取 token，而不是从 user 对象中获取
    const token = localStorage.getItem('token') || user?.token || ''
    
    console.log(' 学生加载匹配数据...')
    console.log('🔑 Token:', token ? token.substring(0, 20) + '...' : '无')
    
    // 使用学生专用的匹配路由
    const response = await fetch(`${API_BASE_URL}/matches`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
    
    console.log('📡 响应状态:', response.status, response.statusText)
    
    if (response.ok) {
      const data = await response.json()
      console.log('📦 后端返回数据:', JSON.stringify(data, null, 2))
      console.log('📊 数据数量:', Array.isArray(data) ? data.length : '不是数组')
      
      matches.value = Array.isArray(data) ? data : []
    } else {
      const errorData = await response.json()
      console.error('❌ 加载匹配数据失败:', response.status, errorData)
    }
  } catch (error) {
    console.error('❌ 加载匹配数据异常:', error)
  } finally {
    loading.value = false
  }
}

function getTeacherInitial(match) {
  const teacher = match.teacher?.user || match.teacher || {}
  const name = teacher.name || '教师'
  return name.charAt(0)
}

function getTeacherName(match) {
  const teacher = match.teacher?.user || match.teacher || {}
  return teacher.name || '未知教师'
}

function getTeacherSubject(match) {
  const teacher = match.teacher || {}
  return teacher.subject || '未设置科目'
}

function getStatusText(status) {
  const statusMap = {
    'pending': '待确认',
    'approved': '已接受',
    'rejected': '已拒绝',
    'active': '匹配中',
    'completed': '已完成'
  }
  return statusMap[status] || status
}

function getStatusClass(status) {
  const classes = {
    'pending': 'status-pending',
    'approved': 'status-approved',
    'rejected': 'status-rejected',
    'active': 'status-approved',
    'completed': 'status-completed'
  }
  return classes[status] || ''
}

function formatDate(dateStr) {
  if (!dateStr) return ''
  const date = new Date(dateStr)
  return date.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
}

async function cancelMatch(matchId) {
  if (!confirm('确定要取消这个辅导请求吗？')) {
    return
  }
  
  try {
    const user = getCurrentUser()
    const token = user?.token || ''
    
    const response = await fetch(`${API_BASE_URL}/matches/${matchId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
    
    if (response.ok) {
      alert('已取消请求')
      await loadMatches()
    } else {
      const errorData = await response.json()
      alert('取消失败: ' + (errorData.msg || '未知错误'))
    }
  } catch (error) {
    console.error('取消请求失败:', error)
    alert('取消失败: ' + error.message)
  }
}

function goToChat(match) {
  const teacherId = match.teacher?.user?._id || match.teacher?._id
  if (teacherId) {
    router.push(`/student/chat?teacher=${teacherId}`)
  }
}

function handleLogout() {
  localStorage.removeItem('token')
  localStorage.removeItem('user')
  router.push('/login')
}
</script>

<style scoped>
.container {
  display: flex;
  min-height: 100vh;
}

.sidebar {
  width: 250px;
  background: linear-gradient(135deg, #4CAF50, #45a049);
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
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.nav-menu a,
.nav-menu .router-link-active,
.nav-menu .router-link-exact-active {
  display: block;
  padding: 12px;
  color: white;
  text-decoration: none;
  border-radius: 8px;
  transition: all 0.3s ease;
  cursor: pointer;
}

.nav-menu a:hover,
.nav-menu .router-link-active:hover,
.nav-menu .router-link-exact-active:hover {
  background-color: rgba(255,255,255,0.2);
  transform: translateX(5px);
}

.nav-menu .router-link-active,
.nav-menu .router-link-exact-active {
  background-color: rgba(255,255,255,0.3);
  font-weight: bold;
}

.main-content {
  flex: 1;
  padding: 20px 20px 20px 0;
  overflow-y: auto;
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
  color: #4CAF50;
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
  background: #4CAF50;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: bold;
}

.stats-cards {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 15px;
  margin-bottom: 20px;
}

.stat-card {
  background: white;
  padding: 20px;
  border-radius: 10px;
  box-shadow: 0 2px 5px rgba(0,0,0,0.1);
  display: flex;
  align-items: center;
  gap: 15px;
}

.stat-icon {
  font-size: 2em;
}

.stat-number {
  font-size: 1.8em;
  font-weight: bold;
  color: #4CAF50;
}

.stat-label {
  color: #666;
  font-size: 0.9em;
}

.match-list {
  background: white;
  padding: 25px;
  border-radius: 10px;
  box-shadow: 0 2px 5px rgba(0,0,0,0.1);
}

.match-list h3 {
  color: #4CAF50;
  margin-bottom: 20px;
  font-size: 1.4em;
}

.loading-message {
  text-align: center;
  padding: 40px;
  color: #999;
  font-size: 1.1em;
}

.no-matches {
  text-align: center;
  padding: 40px;
  color: #999;
}

.no-matches p {
  margin-bottom: 20px;
  font-size: 1.1em;
}

.btn-primary {
  display: inline-block;
  padding: 12px 24px;
  background: #4CAF50;
  color: white;
  text-decoration: none;
  border-radius: 8px;
  font-weight: bold;
  transition: all 0.3s ease;
}

.btn-primary:hover {
  background: #45a049;
  transform: translateY(-2px);
}

.matches-container {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.match-item {
  border: 2px solid #e0e0e0;
  border-radius: 10px;
  padding: 20px;
  transition: all 0.3s ease;
}

.match-item:hover {
  border-color: #4CAF50;
  box-shadow: 0 4px 8px rgba(76, 175, 80, 0.1);
}

.match-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
}

.teacher-info {
  display: flex;
  align-items: center;
  gap: 15px;
}

.teacher-avatar {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  background: #E8F5E8;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #4CAF50;
  font-size: 1.3em;
  font-weight: bold;
}

.teacher-details h4 {
  color: #4CAF50;
  margin-bottom: 5px;
}

.teacher-subject {
  color: #666;
  font-size: 0.9em;
}

.match-status {
  padding: 6px 12px;
  border-radius: 15px;
  font-size: 0.85em;
  font-weight: bold;
}

.status-pending {
  background-color: #fff3cd;
  color: #856404;
}

.status-approved {
  background-color: #d4edda;
  color: #155724;
}

.status-rejected {
  background-color: #f8d7da;
  color: #721c24;
}

.status-completed {
  background-color: #d1ecf1;
  color: #0c5460;
}

.match-body {
  background: #f9f9f9;
  padding: 15px;
  border-radius: 8px;
  margin-bottom: 15px;
}

.request-info p {
  margin-bottom: 8px;
  color: #555;
}

.request-info p:last-child {
  margin-bottom: 0;
}

.match-actions {
  display: flex;
  gap: 10px;
  justify-content: flex-end;
}

.btn {
  padding: 8px 16px;
  border: none;
  border-radius: 6px;
  font-size: 0.9em;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-secondary {
  background: #e0e0e0;
  color: #333;
}

.btn-secondary:hover {
  background: #bdbdbd;
  transform: translateY(-2px);
}

.btn-primary-action {
  background: #4CAF50;
  color: white;
}

.btn-primary-action:hover {
  background: #45a049;
  transform: translateY(-2px);
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
  
  .stats-cards {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .match-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 10px;
  }
  
  .match-actions {
    justify-content: flex-start;
  }
}
</style>
