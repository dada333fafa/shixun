<template>
  <div class="teacher-layout teacher-match-management">
    <aside class="sidebar">
      <h2>教师中心</h2>
      <ul class="nav-menu">
        <li><router-link to="/teacher/dashboard">仪表盘</router-link></li>
        <li><router-link to="/teacher/students">学生管理</router-link></li>
        <li><router-link to="/teacher/chat">聊天沟通</router-link></li>
        <li><router-link to="/teacher/resources">教学资源</router-link></li>
        <li><router-link to="/teacher/psychological">心理辅导</router-link></li>
        <li><router-link to="/teacher/ai-match">AI匹配</router-link></li>
        <li><router-link to="/teacher/match-management" class="active">匹配管理</router-link></li>
        <li><router-link to="/login">退出登录</router-link></li>
      </ul>
    </aside>
    
    <main class="main-content">
      <div class="header">
        <h1>匹配管理</h1>
        <div class="user-info">
          <span>{{ welcomeText }}</span>
          <div class="user-avatar">{{ userInitial }}</div>
        </div>
      </div>
      
      <div class="match-tabs">
        <button 
          v-for="tab in tabs" 
          :key="tab.key"
          class="tab-btn"
          :class="{ active: activeTab === tab.key }"
          @click="switchTab(tab.key)"
        >
          {{ tab.label }}
        </button>
      </div>
      
      <div class="match-list">
        <div v-if="loading" class="loading-message">
          加载中...
        </div>
        <div 
          v-else
          v-for="match in filteredMatches" 
          :key="match.id"
          class="match-item"
        >
          <div class="match-item-header">
            <div class="match-item-title">{{ match.title }}</div>
            <span 
              class="match-item-status" 
              :class="getStatusClass(match.status)"
            >
              {{ match.statusText }}
            </span>
          </div>
          <div class="match-item-details">
            <p v-for="(detail, index) in match.details" :key="index">📝 {{ detail }}</p>
          </div>
          <div class="student-info">
            <h4>学生信息</h4>
            <p v-for="(info, index) in match.studentInfo" :key="index">👨‍🎓 {{ info }}</p>
          </div>
          <div class="match-item-actions">
            <button 
              v-for="action in match.actions" 
              :key="action.label"
              class="btn"
              :class="action.class"
              @click="handleAction(action.type, match.id)"
            >
              {{ action.label }}
            </button>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'

const API_BASE_URL = '/api/v1'

// 从 localStorage 获取用户信息
const userInfo = ref(null)
const token = ref('')

onMounted(async () => {
  const userStr = localStorage.getItem('user')
  if (userStr) {
    userInfo.value = JSON.parse(userStr)
    token.value = userInfo.value.token || ''
  }
  
  // 加载真实匹配数据
  await loadMatches()
})

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

const activeTab = ref('received')
const tabs = [
  { key: 'received', label: '收到的请求' },
  { key: 'sent', label: '发送的邀请' },
  { key: 'matched', label: '已匹配' }
]

const matches = ref([])
const loading = ref(false)

// 加载匹配数据
const loadMatches = async () => {
  try {
    loading.value = true
    console.log('🔄 加载匹配数据...')
    console.log('🔑 Token:', token.value ? token.value.substring(0, 20) + '...' : '无')
    
    const response = await fetch(`${API_BASE_URL}/matches/teacher/all`, {
      headers: {
        'Authorization': `Bearer ${token.value}`
      }
    })
    
    console.log('📡 响应状态:', response.status, response.statusText)
    
    if (response.ok) {
      const data = await response.json()
      console.log('📦 后端返回数据:', JSON.stringify(data, null, 2))
      
      if (data.msg === '获取成功' && data.data) {
        console.log('✅ 匹配记录数量:', data.data.length)
        matches.value = data.data.map(m => {
          // 根据匹配请求的发起方确定标题
          const requestFrom = m.requestFrom === 'student' ? '学生' : '教师'
          const studentInfo = m.student?.user || m.student || {}
          const studentName = studentInfo.name || '未知学生'
          const studentGrade = m.student?.grade || '未设置'
          
          return {
            id: m._id,
            title: `${requestFrom}发起 - ${studentName}（${studentGrade}）`,
            status: m.status,
            statusText: getStatusText(m.status),
            details: [
              `发起方：${requestFrom}`,
              `辅导需求：${m.requestMessage || '未填写'}`,
              `发送时间：${formatDate(m.createdAt)}`,
              m.matchedAt ? `确认时间：${formatDate(m.matchedAt)}` : ''
            ].filter(Boolean),
            studentInfo: [
              `姓名：${studentName}`,
              `年级：${studentGrade}`,
              `学校：${m.student?.school || '未设置'}`
            ],
            actions: m.status === 'pending' ? [
              { type: 'accept', label: '接受', class: 'btn-primary' },
              { type: 'reject', label: '拒绝', class: 'btn-danger' }
            ] : [
              { type: 'details', label: '查看详情', class: 'btn-primary' }
            ]
          }
        })
        console.log('✅ 前端渲染数据数量:', matches.value.length)
      } else {
        console.warn('⚠️ 数据格式不正确:', data)
      }
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

const filteredMatches = computed(() => {
  // 根据当前标签页过滤匹配数据
  if (activeTab.value === 'received') {
    // 收到的请求：所有学生发起的请求
    return matches.value.filter(m => m.title.includes('学生发起'))
  } else if (activeTab.value === 'sent') {
    // 发送的邀请：教师发起的请求
    return matches.value.filter(m => m.title.includes('教师发起'))
  } else if (activeTab.value === 'matched') {
    // 已匹配：状态为approved或active
    return matches.value.filter(m => m.status === 'approved' || m.status === 'active')
  }
  return matches.value
})

const switchTab = (tab) => {
  activeTab.value = tab
}

const getStatusText = (status) => {
  const statusMap = {
    'pending': '待确认',
    'approved': '已接受',
    'rejected': '已拒绝',
    'active': '匹配中',
    'completed': '已完成'
  }
  return statusMap[status] || status
}

const getStatusClass = (status) => {
  const classes = {
    'pending': 'status-pending',
    'approved': 'status-approved',
    'rejected': 'status-rejected',
    'active': 'status-approved',
    'completed': 'status-rejected'
  }
  return classes[status] || ''
}

const formatDate = (dateStr) => {
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

const handleAction = async (type, id) => {
  try {
    switch(type) {
      case 'accept':
        if (confirm('确定要接受这个辅导请求吗？')) {
          const response = await fetch(`${API_BASE_URL}/matches/${id}/approve`, {
            method: 'PUT',
            headers: {
              'Authorization': `Bearer ${token.value}`,
              'Content-Type': 'application/json'
            }
          })
          
          if (response.ok) {
            const data = await response.json()
            alert(data.msg || '已接受辅导请求')
            await loadMatches() // 重新加载数据
          } else {
            const errorData = await response.json()
            alert('操作失败: ' + (errorData.msg || '未知错误'))
          }
        }
        break
      case 'reject':
        if (confirm('确定要拒绝这个辅导请求吗？')) {
          const response = await fetch(`${API_BASE_URL}/matches/${id}/reject`, {
            method: 'PUT',
            headers: {
              'Authorization': `Bearer ${token.value}`,
              'Content-Type': 'application/json'
            }
          })
          
          if (response.ok) {
            const data = await response.json()
            alert(data.msg || '已拒绝辅导请求')
            await loadMatches() // 重新加载数据
          } else {
            const errorData = await response.json()
            alert('操作失败: ' + (errorData.msg || '未知错误'))
          }
        }
        break
      case 'details':
        alert('查看匹配详情功能开发中')
        break
    }
  } catch (error) {
    console.error('操作失败:', error)
    alert('操作失败: ' + error.message)
  }
}
</script>

<style scoped>
/* 强制全屏 - 覆盖全局样式 */
.teacher-match-management {
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

.teacher-match-management {
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

.tab-btn.active {
  background: #2196F3;
  color: white;
  border-color: #2196F3;
}

.match-list {
  background: white;
  padding: 25px;
  border-radius: 10px;
  box-shadow: 0 4px 6px rgba(0,0,0,0.05);
}

.match-item {
  padding: 20px;
  border-bottom: 1px solid #e0e0e0;
  transition: all 0.3s ease;
}

.match-item:hover {
  background-color: #f9f9f9;
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

.match-item-details p {
  margin-bottom: 5px;
  font-size: 0.9em;
}

.student-info {
  background: #f9f9f9;
  padding: 15px;
  border-radius: 8px;
  margin-bottom: 15px;
}

.student-info h4 {
  margin-bottom: 10px;
  color: #2196F3;
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

.btn-primary {
  background: #2196F3;
  color: white;
}

.btn-primary:hover {
  background: #1976D2;
  transform: translateY(-2px);
}

.btn-secondary {
  background: #e0e0e0;
  color: #333;
}

.btn-secondary:hover {
  background: #bdbdbd;
  transform: translateY(-2px);
}

.btn-danger {
  background: #f44336;
  color: white;
}

.btn-danger:hover {
  background: #d32f2f;
  transform: translateY(-2px);
}

.loading-message {
  text-align: center;
  padding: 40px;
  color: #999;
  font-size: 1.1em;
}

@media (max-width: 768px) {
  .teacher-match-management {
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
  
  .match-tabs {
    flex-wrap: wrap;
  }
  
  .match-item-actions {
    flex-direction: column;
  }
}
</style>
