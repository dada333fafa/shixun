<template>
  <div class="container">
    <!-- 侧边栏 -->
    <aside class="sidebar">
      <h2>学生中心</h2>
      <nav class="nav-menu">
        <router-link to="/student/dashboard">仪表盘</router-link>
        <router-link to="/student/teacher-selection">教师选择</router-link>
        <router-link to="/student/chat">聊天沟通</router-link>
        <router-link to="/student/resources" class="active">学习资源</router-link>
        <router-link to="/student/psychological">心理支持</router-link>
        <router-link to="/student/ai-recommendation">AI推荐</router-link>
        <router-link to="/student/match">匹配管理</router-link>
        <a href="#" @click.prevent="handleLogout">退出登录</a>
      </nav>
    </aside>

    <!-- 主内容区 -->
    <main class="main-content">
      <header class="header">
        <h1>学习资源</h1>
        <div class="user-info">
          <span>欢迎，{{ currentUser?.name || currentUser?.username }}</span>
          <div class="user-avatar">{{ (currentUser?.name || currentUser?.username || '用').charAt(0) }}</div>
        </div>
      </header>

      <!-- 搜索和筛选 -->
      <div class="search-filter">
        <div class="search-bar">
          <input 
            type="text" 
            v-model="searchKeyword"
            @input="filterResources"
            placeholder="搜索学习资源（标题或描述）"
          >
          <button @click="filterResources">搜索</button>
        </div>
        <div class="filters">
          <div class="filter-item">
            <label>科目</label>
            <select v-model="subjectFilter" @change="filterResources">
              <option value="">全部科目</option>
              <option value="math">数学</option>
              <option value="chinese">语文</option>
              <option value="english">英语</option>
              <option value="physics">物理</option>
              <option value="chemistry">化学</option>
              <option value="biology">生物</option>
            </select>
          </div>
          <div class="filter-item">
            <label>资源类型</label>
            <select v-model="typeFilter" @change="filterResources">
              <option value="">全部类型</option>
              <option value="courseware">课件</option>
              <option value="lesson_plan">教案</option>
              <option value="exercise">练习</option>
              <option value="video">视频</option>
              <option value="other">其他</option>
            </select>
          </div>
        </div>
      </div>

      <!-- 资源列表 -->
      <div class="resources-grid">
        <div 
          v-for="resource in filteredResources" 
          :key="resource._id"
          class="resource-card"
        >
          <div class="resource-header">
            <div class="resource-icon">{{ getResourceIcon(resource.resourceType) }}</div>
            <div class="resource-info">
              <h3>{{ resource.title }}</h3>
              <div class="resource-meta">
                {{ resource.teacher?.subject || '未知科目' }} · 
                {{ resource.teacher?.user?.name || '教师' }} · 
                {{ getResourceTypeName(resource.resourceType) }}
              </div>
            </div>
          </div>
          <div class="resource-description">
            {{ resource.description || '暂无描述' }}
          </div>
          <div class="resource-tags">
            <span class="tag">{{ getResourceTypeName(resource.resourceType) }}</span>
            <span class="tag">{{ formatDate(resource.createdAt) }}</span>
          </div>
          <button class="btn-download" @click="handleDownload(resource._id)">
            {{ getResourceIcon(resource.resourceType) }} 下载资源
          </button>
        </div>

        <div v-if="filteredResources.length === 0" class="no-resources">
          <div class="no-resources-icon">📚</div>
          <div class="no-resources-text">暂无学习资源</div>
          <div class="no-resources-hint">请尝试调整搜索条件或筛选器</div>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { getCurrentUser, getResources, downloadResource } from '@/utils/api'

const router = useRouter()
const currentUser = ref(null)
const allResources = ref([])
const filteredResources = ref([])

const searchKeyword = ref('')
const subjectFilter = ref('')
const typeFilter = ref('')

onMounted(async () => {
  try {
    currentUser.value = await getCurrentUser()
    await loadResources()
  } catch (error) {
    console.error('初始化失败:', error)
    alert('加载页面失败，请重新登录')
    router.push('/login')
  }
})

async function loadResources() {
  try {
    const resources = await getResources()
    allResources.value = resources
    filteredResources.value = resources
  } catch (error) {
    console.error('加载资源失败:', error)
    alert('加载资源失败: ' + error.message)
  }
}

function filterResources() {
  const keyword = searchKeyword.value.toLowerCase().trim()
  
  filteredResources.value = allResources.value.filter(resource => {
    // 关键词搜索
    if (keyword) {
      const title = (resource.title || '').toLowerCase()
      const description = (resource.description || '').toLowerCase()
      if (!title.includes(keyword) && !description.includes(keyword)) {
        return false
      }
    }
    
    // 科目筛选
    if (subjectFilter.value) {
      const teacher = resource.teacher || {}
      const subject = (teacher.subject || '').toLowerCase()
      const subjectMap = {
        'math': '数学',
        'chinese': '语文',
        'english': '英语',
        'physics': '物理',
        'chemistry': '化学',
        'biology': '生物'
      }
      const chineseSubject = subjectMap[subjectFilter.value] || subjectFilter.value
      if (!subject.includes(chineseSubject)) {
        return false
      }
    }
    
    // 资源类型筛选
    if (typeFilter.value && resource.resourceType !== typeFilter.value) {
      return false
    }
    
    return true
  })
}

function getResourceIcon(type) {
  const icons = {
    'courseware': '📊',
    'lesson_plan': '📝',
    'exercise': '✏️',
    'video': '🎥',
    'other': '📄'
  }
  return icons[type] || '📄'
}

function getResourceTypeName(type) {
  const names = {
    'courseware': '课件',
    'lesson_plan': '教案',
    'exercise': '练习',
    'video': '视频',
    'other': '其他'
  }
  return names[type] || '其他'
}

function formatDate(dateString) {
  if (!dateString) return ''
  const date = new Date(dateString)
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

async function handleDownload(resourceId) {
  try {
    const result = await downloadResource(resourceId)
    const resource = result.resource
    
    alert(`资源准备完成：\n\n标题：${resource.title}\n类型：${resource.resourceType}\n教师：${resource.teacherName}\n\n注意：由于没有实际文件，这里只是模拟下载。`)
  } catch (error) {
    console.error('下载失败:', error)
    alert('下载失败: ' + error.message)
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

.search-filter {
  background: white;
  padding: 20px;
  border-radius: 10px;
  box-shadow: 0 2px 5px rgba(0,0,0,0.1);
  margin-bottom: 20px;
}

.search-bar {
  display: flex;
  gap: 10px;
  margin-bottom: 15px;
}

.search-bar input {
  flex: 1;
  padding: 10px;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  font-size: 1em;
}

.search-bar button {
  padding: 10px 20px;
  background: #4CAF50;
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.3s ease;
}

.search-bar button:hover {
  background: #45a049;
  transform: translateY(-2px);
}

.filters {
  display: flex;
  gap: 15px;
  flex-wrap: wrap;
}

.filter-item {
  display: flex;
  flex-direction: column;
}

.filter-item label {
  margin-bottom: 5px;
  font-weight: bold;
  color: #555;
}

.filter-item select {
  padding: 8px;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  font-size: 1em;
}

.resources-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
}

.resource-card {
  background: white;
  padding: 20px;
  border-radius: 10px;
  box-shadow: 0 4px 6px rgba(0,0,0,0.05);
  transition: all 0.3s ease;
}

.resource-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 15px rgba(0,0,0,0.1);
}

.resource-header {
  display: flex;
  align-items: center;
  gap: 15px;
  margin-bottom: 15px;
}

.resource-icon {
  font-size: 2.5em;
  color: #4CAF50;
}

.resource-info h3 {
  color: #4CAF50;
  margin-bottom: 5px;
}

.resource-meta {
  font-size: 0.8em;
  color: #666;
}

.resource-description {
  margin-bottom: 15px;
  font-size: 0.9em;
  line-height: 1.5;
}

.resource-tags {
  margin-bottom: 15px;
}

.tag {
  display: inline-block;
  padding: 3px 8px;
  background: #E8F5E8;
  color: #4CAF50;
  border-radius: 10px;
  font-size: 0.7em;
  margin-right: 5px;
  margin-bottom: 5px;
}

.btn-download {
  width: 100%;
  padding: 10px;
  background: #4CAF50;
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-download:hover {
  background: #45a049;
  transform: translateY(-2px);
}

.no-resources {
  grid-column: 1 / -1;
  text-align: center;
  padding: 60px 20px;
  color: #999;
}

.no-resources-icon {
  font-size: 4em;
  margin-bottom: 20px;
}

.no-resources-text {
  font-size: 1.2em;
  margin-bottom: 10px;
}

.no-resources-hint {
  font-size: 0.9em;
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
  
  .filters {
    flex-direction: column;
  }
  
  .resources-grid {
    grid-template-columns: 1fr;
  }
}
</style>
