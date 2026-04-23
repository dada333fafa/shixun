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
        <router-link to="/student/match">匹配管理</router-link>
        <router-link to="/student/parent-requests" class="active">家长请求</router-link>
        <a href="#" @click.prevent="handleLogout">退出登录</a>
      </nav>
    </aside>

    <!-- 主内容区 -->
    <main class="main-content">
      <header class="header">
        <h1>家长添加请求</h1>
        <div class="user-info">
          <span>欢迎，{{ currentUser?.name || currentUser?.username }}</span>
          <div class="user-avatar">{{ (currentUser?.name || currentUser?.username || '用').charAt(0) }}</div>
        </div>
      </header>
    
    <!-- 统计卡片 -->
    <div class="stats-cards">
      <div class="stat-card">
        <div class="stat-icon">📨</div>
        <div class="stat-info">
          <div class="stat-number">{{ pendingCount }}</div>
          <div class="stat-label">待处理</div>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon">✅</div>
        <div class="stat-info">
          <div class="stat-number">{{ acceptedCount }}</div>
          <div class="stat-label">已接受</div>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon">❌</div>
        <div class="stat-info">
          <div class="stat-number">{{ rejectedCount }}</div>
          <div class="stat-label">已拒绝</div>
        </div>
      </div>
    </div>

    <!-- 待处理请求列表 -->
    <div class="requests-section">
      <h2>待处理的请求</h2>
      
      <div v-if="loading" class="loading-message">
        加载中...
      </div>
      
      <div v-else-if="pendingRequests.length === 0" class="no-requests">
        <p>暂无待处理的家长请求</p>
      </div>
      
      <div v-else class="requests-list">
        <div 
          v-for="request in pendingRequests" 
          :key="request._id"
          class="request-item"
        >
          <div class="request-header">
            <div class="parent-info">
              <div class="parent-avatar">
                {{ getParentInitial(request) }}
              </div>
              <div class="parent-details">
                <h4>{{ getParentName(request) }}</h4>
                <p class="request-time">发送时间：{{ formatDate(request.createdAt) }}</p>
              </div>
            </div>
            <span class="request-status status-pending">待处理</span>
          </div>
          
          <div class="request-body">
            <p><strong>请求消息：</strong>{{ request.message || '无' }}</p>
          </div>
          
          <div class="request-actions">
            <button 
              class="btn btn-accept"
              @click="acceptRequest(request._id)"
            >
              ✓ 接受
            </button>
            <button 
              class="btn btn-reject"
              @click="rejectRequest(request._id)"
            >
              ✗ 拒绝
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- 已处理的请求列表 -->
    <div class="requests-section processed-section">
      <h2>已处理的请求</h2>
      
      <div v-if="processedRequests.length === 0" class="no-requests">
        <p>暂无已处理的请求</p>
      </div>
      
      <div v-else class="requests-list">
        <div 
          v-for="request in processedRequests" 
          :key="request._id"
          class="request-item processed"
        >
          <div class="request-header">
            <div class="parent-info">
              <div class="parent-avatar">
                {{ getParentInitial(request) }}
              </div>
              <div class="parent-details">
                <h4>{{ getParentName(request) }}</h4>
                <p class="request-time">发送时间：{{ formatDate(request.createdAt) }}</p>
              </div>
            </div>
            <span 
              class="request-status" 
              :class="request.status === 'accepted' ? 'status-accepted' : 'status-rejected'"
            >
              {{ request.status === 'accepted' ? '已接受' : '已拒绝' }}
            </span>
          </div>
          
          <div class="request-body">
            <p><strong>请求消息：</strong>{{ request.message || '无' }}</p>
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
const pendingRequests = ref([])
const processedRequests = ref([])
const loading = ref(false)

const pendingCount = computed(() => pendingRequests.value.length)
const acceptedCount = computed(() => processedRequests.value.filter(r => r.status === 'accepted').length)
const rejectedCount = computed(() => processedRequests.value.filter(r => r.status === 'rejected').length)

onMounted(async () => {
  try {
    currentUser.value = await getCurrentUser()
    await loadRequests()
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

function handleLogout() {
  localStorage.removeItem('token')
  localStorage.removeItem('user')
  router.push('/login')
}

async function loadRequests() {
  try {
    loading.value = true
    const user = getCurrentUser()
    const token = localStorage.getItem('token') || user?.token || ''
    
    console.log('📥 加载家长请求...')
    
    // 获取所有请求（待处理 + 已处理）
    const response = await fetch(`/api/parents/children/student/requests/${user.id}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
    
    if (response.ok) {
      const data = await response.json()
      if (data.success) {
        pendingRequests.value = data.requests || []
        processedRequests.value = data.processedRequests || []
        
        console.log(`✅ 加载完成：${pendingRequests.value.length} 条待处理，${processedRequests.value.length} 条已处理`)
      }
    } else {
      console.error('❌ 加载请求失败:', response.status)
    }
    
  } catch (error) {
    console.error('❌ 加载请求失败:', error)
    alert('加载请求失败')
  } finally {
    loading.value = false
  }
}

function getParentInitial(request) {
  const parent = request.parent?.user || request.parent || {}
  const name = parent.name || '家长'
  return name.charAt(0)
}

function getParentName(request) {
  const parent = request.parent?.user || request.parent || {}
  return parent.name || '未知家长'
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

async function acceptRequest(requestId) {
  if (!confirm('确定要接受这个家长请求吗？')) {
    return
  }
  
  try {
    const user = getCurrentUser()
    // 优先从localStorage获取token，其次从user对象获取
    const token = localStorage.getItem('token') || user?.token || ''
    
    console.log('📤 接受请求，requestId:', requestId)
    console.log('🔑 Token:', token ? token.substring(0, 20) + '...' : '无token')
    
    if (!token) {
      alert('未登录，请先登录')
      return
    }
    
    // 使用 /api 前缀
    const response = await fetch(`/api/parents/children/requests/${requestId}/accept`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    })
    
    const data = await response.json()
    console.log('📥 响应数据:', data)
    
    if (response.ok && data.success) {
      alert('已接受家长请求')
      await loadRequests()
    } else {
      alert('操作失败: ' + (data.message || '未知错误'))
    }
  } catch (error) {
    console.error('接受请求失败:', error)
    alert('操作失败: ' + error.message)
  }
}

async function rejectRequest(requestId) {
  if (!confirm('确定要拒绝这个家长请求吗？')) {
    return
  }
  
  try {
    const user = getCurrentUser()
    // 优先从localStorage获取token，其次从user对象获取
    const token = localStorage.getItem('token') || user?.token || ''
    
    console.log('📤 拒绝请求，requestId:', requestId)
    console.log('🔑 Token:', token ? token.substring(0, 20) + '...' : '无token')
    
    if (!token) {
      alert('未登录，请先登录')
      return
    }
    
    // 使用 /api 前缀
    const response = await fetch(`/api/parents/children/requests/${requestId}/reject`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    })
    
    const data = await response.json()
    console.log('📥 响应数据:', data)
    
    if (response.ok && data.success) {
      alert('已拒绝家长请求')
      await loadRequests()
    } else {
      alert('操作失败: ' + (data.message || '未知错误'))
    }
  } catch (error) {
    console.error('拒绝请求失败:', error)
    alert('操作失败: ' + error.message)
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
  background: linear-gradient(135deg, #4CAF50, #45a049);
  color: white;
  padding: 20px;
  box-shadow: 2px 0 5px rgba(0,0,0,0.1);
}

.sidebar h2 {
  margin-bottom: 30px;
  text-align: center;
  font-size: 1.6em;
  font-weight: bold;
  color: #ffffff;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.3);
  letter-spacing: 2px;
}

.nav-menu {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.nav-menu a,
.nav-menu router-link {
  display: block;
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

.parent-requests-container {
  padding: 0;
  max-width: 100%;
  margin: 0;
}

h1 {
  color: #4CAF50;
  margin-bottom: 30px;
  font-size: 2em;
}

h2 {
  color: #4CAF50;
  margin-bottom: 20px;
  font-size: 1.5em;
}

.stats-cards {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
  margin-bottom: 30px;
}

.stat-card {
  background: white;
  padding: 25px;
  border-radius: 10px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  display: flex;
  align-items: center;
  gap: 15px;
  transition: transform 0.3s ease;
}

.stat-card:hover {
  transform: translateY(-5px);
}

.stat-icon {
  font-size: 2.5em;
}

.stat-number {
  font-size: 2em;
  font-weight: bold;
  color: #4CAF50;
}

.stat-label {
  color: #666;
  font-size: 0.9em;
}

.requests-section {
  background: white;
  padding: 30px;
  border-radius: 10px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  margin-bottom: 30px;
}

.processed-section {
  opacity: 0.95;
}

.loading-message {
  text-align: center;
  padding: 40px;
  color: #999;
  font-size: 1.1em;
}

.no-requests {
  text-align: center;
  padding: 40px;
  color: #999;
  font-size: 1.1em;
}

.requests-list {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.request-item {
  border: 2px solid #e0e0e0;
  border-radius: 10px;
  padding: 25px;
  transition: all 0.3s ease;
}

.request-item:hover {
  border-color: #4CAF50;
  box-shadow: 0 4px 12px rgba(76, 175, 80, 0.15);
}

.request-item.processed {
  background: #f9f9f9;
}

.request-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
}

.parent-info {
  display: flex;
  align-items: center;
  gap: 15px;
}

.parent-avatar {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  background: #E8F5E9;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #4CAF50;
  font-size: 1.3em;
  font-weight: bold;
}

.parent-details h4 {
  color: #4CAF50;
  margin-bottom: 5px;
  font-size: 1.1em;
}

.request-time {
  color: #666;
  font-size: 0.9em;
}

.request-status {
  padding: 6px 15px;
  border-radius: 20px;
  font-size: 0.85em;
  font-weight: bold;
}

.status-pending {
  background-color: #fff3cd;
  color: #856404;
}

.status-accepted {
  background-color: #d4edda;
  color: #155724;
}

.status-rejected {
  background-color: #f8d7da;
  color: #721c24;
}

.request-body {
  background: #f5f5f5;
  padding: 15px 20px;
  border-radius: 8px;
  margin-bottom: 15px;
}

.request-body p {
  margin: 0;
  color: #555;
  line-height: 1.6;
}

.request-actions {
  display: flex;
  gap: 12px;
  justify-content: flex-end;
}

.btn {
  padding: 10px 25px;
  border: none;
  border-radius: 6px;
  font-size: 0.95em;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-accept {
  background: #4CAF50;
  color: white;
}

.btn-accept:hover {
  background: #45a049;
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(76, 175, 80, 0.3);
}

.btn-reject {
  background: #f44336;
  color: white;
}

.btn-reject:hover {
  background: #da190b;
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(244, 67, 54, 0.3);
}

@media (max-width: 768px) {
  .container {
    flex-direction: column;
  }
  
  .sidebar {
    width: 100%;
    min-width: 100%;
  }
  
  .stats-cards {
    grid-template-columns: 1fr;
  }
  
  .request-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 10px;
  }
  
  .request-actions {
    justify-content: flex-start;
  }
}
</style>
