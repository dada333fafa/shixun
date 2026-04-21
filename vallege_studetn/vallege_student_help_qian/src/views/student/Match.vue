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

      <!-- 标签页切换 -->
      <div class="match-tabs">
        <button 
          class="tab-btn"
          :class="{ active: activeTab === 'pending' }"
          @click="activeTab = 'pending'"
        >
          待处理
        </button>
        <button 
          class="tab-btn"
          :class="{ active: activeTab === 'approved' }"
          @click="activeTab = 'approved'"
        >
          已通过
        </button>
        <button 
          class="tab-btn"
          :class="{ active: activeTab === 'rejected' }"
          @click="activeTab = 'rejected'"
        >
          已拒绝
        </button>
      </div>

      <!-- 匹配列表 -->
      <div class="match-list">
        <div v-if="loading" class="loading-state">
          <div class="loading-spinner"></div>
          <p>加载中...</p>
        </div>

        <div v-else-if="filteredMatches.length === 0" class="empty-state">
          <div class="empty-icon">📋</div>
          <div class="empty-text">暂无匹配记录</div>
          <div class="empty-hint">去教师选择页面发送辅导请求吧</div>
          <router-link to="/student/teacher-selection" class="btn-go">
            去选择教师
          </router-link>
        </div>

        <div v-else class="matches-container">
          <div 
            v-for="match in filteredMatches" 
            :key="match._id"
            class="match-item"
          >
            <div class="match-item-header">
              <div class="match-item-title">
                {{ match.teacherUser?.name || match.teacher?.name || match.teacherName || '未知教师' }}
              </div>
              <div 
                class="match-item-status"
                :class="getStatusClass(match.status)"
              >
                {{ getStatusText(match.status) }}
              </div>
            </div>
            
            <div class="match-item-details">
              <p><strong>请求时间：</strong>{{ formatDate(match.createdAt) }}</p>
              <p v-if="match.requestMessage"><strong>请求说明：</strong>{{ match.requestMessage }}</p>
              <p v-if="match.message"><strong>请求说明：</strong>{{ match.message }}</p>
              <p v-if="match.status === 'approved' && match.approvedAt">
                <strong>通过时间：</strong>{{ formatDate(match.approvedAt) }}
              </p>
              <p v-if="match.status === 'rejected' && match.rejectedAt">
                <strong>拒绝时间：</strong>{{ formatDate(match.rejectedAt) }}
              </p>
              <p v-if="match.rejectReason">
                <strong>拒绝原因：</strong>{{ match.rejectReason }}
              </p>
            </div>
            
            <div class="match-item-actions">
              <button 
                v-if="match.status === 'pending'"
                class="btn btn-cancel"
                @click="cancelMatchRequest(match._id)"
              >
                取消请求
              </button>
              <button 
                v-if="match.status === 'approved'"
                class="btn btn-chat"
                @click="goToChat(match)"
              >
                💬 开始聊天
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
import { getCurrentUser, getMatches, cancelMatchRequest as cancelMatch } from '@/utils/api'

const router = useRouter()
const currentUser = ref(null)
const loading = ref(false)
const matches = ref([])
const activeTab = ref('pending')

onMounted(async () => {
  try {
    currentUser.value = await getCurrentUser()
    await loadMatches()
  } catch (error) {
    console.error('初始化失败:', error)
    alert('加载页面失败，请重新登录')
    router.push('/login')
  }
})

async function loadMatches() {
  try {
    loading.value = true
    const result = await getMatches()
    console.log('获取到的匹配数据:', result)
    // 后端直接返回数组，不是 { matches: [...] }
    matches.value = Array.isArray(result) ? result : (result.matches || [])
    console.log('匹配列表数量:', matches.value.length)
  } catch (error) {
    console.error('加载匹配列表失败:', error)
    alert('加载匹配列表失败: ' + error.message)
  } finally {
    loading.value = false
  }
}

const filteredMatches = computed(() => {
  return matches.value.filter(match => match.status === activeTab.value)
})

function getStatusText(status) {
  const statusMap = {
    'pending': '待处理',
    'approved': '已通过',
    'rejected': '已拒绝'
  }
  return statusMap[status] || '未知'
}

function getStatusClass(status) {
  const classMap = {
    'pending': 'status-pending',
    'approved': 'status-approved',
    'rejected': 'status-rejected'
  }
  return classMap[status] || ''
}

function formatDate(dateString) {
  if (!dateString) return ''
  const date = new Date(dateString)
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  const hours = String(date.getHours()).padStart(2, '0')
  const minutes = String(date.getMinutes()).padStart(2, '0')
  return `${year}-${month}-${day} ${hours}:${minutes}`
}

async function cancelMatchRequest(matchId) {
  if (!confirm('确定要取消这个辅导请求吗？')) {
    return
  }
  
  try {
    await cancelMatch(matchId)
    alert('请求已取消')
    await loadMatches()
  } catch (error) {
    console.error('取消请求失败:', error)
    alert('取消请求失败: ' + error.message)
  }
}

function goToChat(match) {
  const teacherId = match.teacher?._id || match.teacherId
  if (teacherId) {
    router.push('/student/chat')
  } else {
    alert('无法找到教师信息')
  }
}

function handleLogout() {
  localStorage.removeItem('token')
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

.match-tabs {
  display: flex;
  gap: 10px;
  margin-bottom: 20px;
}

.tab-btn {
  padding: 10px 20px;
  background: white;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.3s ease;
}

.tab-btn:hover {
  border-color: #4CAF50;
  color: #4CAF50;
}

.tab-btn.active {
  background: #4CAF50;
  color: white;
  border-color: #4CAF50;
}

.match-list {
  background: white;
  padding: 25px;
  border-radius: 10px;
  box-shadow: 0 4px 6px rgba(0,0,0,0.05);
}

.loading-state {
  text-align: center;
  padding: 40px;
  color: #999;
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #f3f3f3;
  border-top: 4px solid #4CAF50;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 20px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.empty-state {
  text-align: center;
  padding: 60px 20px;
  color: #999;
}

.empty-icon {
  font-size: 4em;
  margin-bottom: 20px;
}

.empty-text {
  font-size: 1.2em;
  margin-bottom: 10px;
}

.empty-hint {
  font-size: 0.9em;
  margin-bottom: 20px;
}

.btn-go {
  display: inline-block;
  padding: 10px 20px;
  background: #4CAF50;
  color: white;
  text-decoration: none;
  border-radius: 8px;
  font-weight: bold;
  transition: all 0.3s ease;
}

.btn-go:hover {
  background: #45a049;
  transform: translateY(-2px);
}

.matches-container {
  display: grid;
  gap: 15px;
}

.match-item {
  padding: 20px;
  border-bottom: 1px solid #e0e0e0;
  transition: all 0.3s ease;
}

.match-item:hover {
  background-color: #f9f9f9;
}

.match-item:last-child {
  border-bottom: none;
}

.match-item-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.match-item-title {
  font-weight: bold;
  font-size: 1.1em;
  color: #333;
}

.match-item-status {
  padding: 5px 10px;
  border-radius: 15px;
  font-size: 0.8em;
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

.match-item-details {
  margin-bottom: 15px;
}

.match-item-details p {
  margin-bottom: 5px;
  font-size: 0.9em;
  line-height: 1.5;
}

.match-item-actions {
  display: flex;
  gap: 10px;
}

.btn {
  padding: 8px 16px;
  border: none;
  border-radius: 5px;
  font-size: 0.9em;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-cancel {
  background: #dc3545;
  color: white;
}

.btn-cancel:hover {
  background: #c82333;
  transform: translateY(-2px);
}

.btn-chat {
  background: #4CAF50;
  color: white;
}

.btn-chat:hover {
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
  
  .match-tabs {
    flex-wrap: wrap;
  }
}
</style>
