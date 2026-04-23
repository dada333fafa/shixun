<template>
  <div class="container">
    <Sidebar />
    
    <div class="main-content">
      <div class="header">
        <h1>内容管理</h1>
        <div class="user-info">
          <span>欢迎，{{ userName }}</span>
          <div class="user-avatar">{{ userInitial }}</div>
        </div>
      </div>
      
      <div class="content-tabs">
        <div class="tabs">
          <div 
            v-for="tab in tabs" 
            :key="tab.id"
            :class="['tab', { active: activeTab === tab.id }]"
            @click="activeTab = tab.id"
          >
            {{ tab.name }}
          </div>
        </div>
      </div>
      
      <div class="search-filter" v-if="activeTab === 'resources'">
        <div class="search-group">
          <label for="search">搜索：</label>
          <input type="text" id="search" v-model="filters.search" placeholder="输入资源标题">
        </div>
        <div class="search-group">
          <label for="resource-type">资源类型：</label>
          <select id="resource-type" v-model="filters.type">
            <option value="">全部</option>
            <option value="courseware">课件</option>
            <option value="lesson_plan">教案</option>
            <option value="exercise">习题</option>
            <option value="video">视频</option>
            <option value="other">其他</option>
          </select>
        </div>
        <button class="btn btn-primary" @click="loadResources">搜索</button>
        <button class="btn btn-secondary" @click="resetFilters">重置</button>
        <button class="btn btn-primary" @click="uploadResource">上传资源</button>
      </div>
      
      <!-- 教学资源 -->
      <div class="content-management" v-if="activeTab === 'resources'">
        <h3>教学资源列表</h3>
        <table class="resource-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>标题</th>
              <th>类型</th>
              <th>上传教师</th>
              <th>上传时间</th>
              <th>下载次数</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="resource in resources" :key="resource._id">
              <td>{{ resource.id }}</td>
              <td>{{ resource.title }}</td>
              <td><span :class="['resource-type', getTypeClass(resource.resourceType)]">{{ getTypeName(resource.resourceType) }}</span></td>
              <td>{{ resource.teacherName }}</td>
              <td>{{ formatDate(resource.uploadDate) }}</td>
              <td>{{ resource.downloadCount || 0 }}</td>
              <td>
                <button class="btn btn-primary" @click="editResource(resource)">编辑</button>
                <button class="btn btn-secondary" @click="deleteResource(resource)">删除</button>
                <button class="btn btn-secondary" @click="downloadResource(resource)">下载</button>
              </td>
            </tr>
          </tbody>
        </table>
        
        <div class="pagination">
          <button @click="changePage(currentPage - 1)" :disabled="currentPage === 1">上一页</button>
          <button 
            v-for="page in totalPages" 
            :key="page"
            @click="changePage(page)"
            :class="{ active: currentPage === page }"
          >
            {{ page }}
          </button>
          <button @click="changePage(currentPage + 1)" :disabled="currentPage === totalPages">下一页</button>
        </div>
      </div>
      
      <!-- 学习资料 -->
      <div class="content-management" v-if="activeTab === 'materials'">
        <h3>学习资料管理</h3>
        <div class="materials-grid">
          <div class="material-card" v-for="material in materials" :key="material.id">
            <div class="material-icon">📚</div>
            <h4>{{ material.title }}</h4>
            <p class="material-desc">{{ material.description }}</p>
            <div class="material-meta">
              <span>📄 {{ material.fileType }}</span>
              <span>📊 {{ material.fileSize }}</span>
              <span>👁️ {{ material.views }} 次浏览</span>
            </div>
            <div class="material-actions">
              <button class="btn btn-primary" @click="editMaterial(material)">编辑</button>
              <button class="btn btn-secondary" @click="deleteMaterial(material)">删除</button>
              <button class="btn btn-secondary" @click="downloadMaterial(material)">下载</button>
            </div>
          </div>
        </div>
        <div class="action-buttons">
          <button class="btn btn-primary" @click="uploadMaterial">上传新资料</button>
        </div>
      </div>
      
      <!-- 公告管理 -->
      <div class="content-management" v-if="activeTab === 'announcements'">
        <h3>公告管理</h3>
        <table class="announcement-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>标题</th>
              <th>类型</th>
              <th>优先级</th>
              <th>发布状态</th>
              <th>发布时间</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="announcement in announcements" :key="announcement.id">
              <td>{{ announcement.id }}</td>
              <td>{{ announcement.title }}</td>
              <td><span :class="['ann-type', `ann-${announcement.type}`]">{{ getAnnTypeName(announcement.type) }}</span></td>
              <td><span :class="['ann-priority', `priority-${announcement.priority}`]">{{ getPriorityName(announcement.priority) }}</span></td>
              <td><span :class="['ann-status', `status-${announcement.status}`]">{{ getStatusName(announcement.status) }}</span></td>
              <td>{{ formatDate(announcement.publishDate) }}</td>
              <td>
                <button class="btn btn-primary" @click="editAnnouncement(announcement)">编辑</button>
                <button class="btn btn-secondary" @click="deleteAnnouncement(announcement)">删除</button>
                <button class="btn btn-secondary" @click="toggleAnnouncementStatus(announcement)">{{ announcement.status === 'published' ? '下线' : '发布' }}</button>
              </td>
            </tr>
          </tbody>
        </table>
        <div class="action-buttons">
          <button class="btn btn-primary" @click="createAnnouncement">发布新公告</button>
        </div>
      </div>
      
      <!-- 轮播图管理 -->
      <div class="content-management" v-if="activeTab === 'banners'">
        <h3>轮播图管理</h3>
        <div class="banners-grid">
          <div class="banner-card" v-for="banner in banners" :key="banner.id">
            <div class="banner-preview">
              <img :src="banner.image" :alt="banner.title" />
              <div class="banner-overlay">
                <span class="banner-order">#{{ banner.order }}</span>
              </div>
            </div>
            <div class="banner-info">
              <h4>{{ banner.title }}</h4>
              <p class="banner-desc">{{ banner.description }}</p>
              <div class="banner-meta">
                <span>️ {{ banner.width }}×{{ banner.height }}</span>
                <span :class="['banner-status', `status-${banner.isActive ? 'active' : 'inactive'}`]">{{ banner.isActive ? '启用' : '禁用' }}</span>
              </div>
              <div class="banner-actions">
                <button class="btn btn-primary" @click="editBanner(banner)">编辑</button>
                <button class="btn btn-secondary" @click="deleteBanner(banner)">删除</button>
                <button class="btn btn-secondary" @click="toggleBannerStatus(banner)">{{ banner.isActive ? '禁用' : '启用' }}</button>
              </div>
            </div>
          </div>
        </div>
        <div class="action-buttons">
          <button class="btn btn-primary" @click="uploadBanner">上传新轮播图</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import Sidebar from '../components/Sidebar.vue'
import axios from 'axios'

const userName = ref('管理员')
const userInitial = ref('管')
const activeTab = ref('resources')
const tabs = [
  { id: 'resources', name: '教学资源' },
  { id: 'materials', name: '学习资料' },
  { id: 'announcements', name: '公告管理' },
  { id: 'banners', name: '轮播图' }
]
const resources = ref([])
const filters = ref({ search: '', type: '' })
const currentPage = ref(1)
const totalPages = ref(1)

// 学习资料数据
const materials = ref([
  { id: 1, title: '初中数学公式大全', description: '初中三年所有数学公式整理', fileType: 'PDF', fileSize: '2.5MB', views: 1234 },
  { id: 2, title: '英语单词记忆法', description: '高效记忆英语单词的方法总结', fileType: 'DOC', fileSize: '1.8MB', views: 892 },
  { id: 3, title: '物理实验操作指南', description: '初中物理实验步骤和注意事项', fileType: 'PDF', fileSize: '5.2MB', views: 567 },
  { id: 4, title: '语文阅读理解技巧', description: '提高阅读理解能力的实用技巧', fileType: 'DOC', fileSize: '3.1MB', views: 2156 }
])

// 公告数据
const announcements = ref([
  { id: 1, title: '2026年春季学期开学通知', type: 'notice', priority: 'high', status: 'published', publishDate: '2026-03-01' },
  { id: 2, title: '关于举办乡村教师培训活动的通知', type: 'activity', priority: 'medium', status: 'published', publishDate: '2026-03-15' },
  { id: 3, title: '平台系统维护通知', type: 'system', priority: 'low', status: 'draft', publishDate: '2026-04-01' },
  { id: 4, title: '暑期夏令营活动报名通知', type: 'activity', priority: 'medium', status: 'published', publishDate: '2026-04-10' }
])

// 轮播图数据
const banners = ref([
  { id: 1, title: '欢迎来到乡村助学平台', description: '为乡村孩子提供优质教育资源', image: 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=800&h=300&fit=crop', width: 800, height: 300, order: 1, isActive: true },
  { id: 2, title: '新学期开始啦', description: '2026年春季学期课程上线', image: 'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=800&h=300&fit=crop', width: 800, height: 300, order: 2, isActive: true },
  { id: 3, title: '教师培训活动', description: '乡村教师专业能力提升培训', image: 'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=800&h=300&fit=crop', width: 800, height: 300, order: 3, isActive: false },
  { id: 4, title: '图书捐赠活动', description: '爱心传递,知识共享', image: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=800&h=300&fit=crop', width: 800, height: 300, order: 4, isActive: true }
])

onMounted(() => {
  const user = JSON.parse(localStorage.getItem('user') || '{}')
  if (user.name) {
    userName.value = user.name
    userInitial.value = user.name.charAt(0)
  }
  loadResources()
})

const loadResources = async () => {
  try {
    const response = await axios.get('/resources', { params: { ...filters.value, page: currentPage.value } })
    resources.value = response.data.resources
    totalPages.value = Math.ceil(response.data.total / 10)
  } catch (error) {
    console.error('加载资源失败:', error)
  }
}

const resetFilters = () => {
  filters.value = { search: '', type: '' }
  currentPage.value = 1
  loadResources()
}

const changePage = (page) => {
  if (page >= 1 && page <= totalPages.value) {
    currentPage.value = page
    loadResources()
  }
}

const uploadResource = () => alert('上传资源功能待实现')
const editResource = (r) => alert(`编辑资源: ${r.title}`)
const deleteResource = (r) => { if(confirm('确定删除?')) alert('删除成功') }
const downloadResource = (r) => alert(`下载: ${r.title}`)

// 学习资料功能
const uploadMaterial = () => alert('上传新资料功能待实现')
const editMaterial = (m) => alert(`编辑资料: ${m.title}`)
const deleteMaterial = (m) => { if(confirm('确定删除?')) alert('删除成功') }
const downloadMaterial = (m) => alert(`下载: ${m.title}`)

// 公告管理功能
const createAnnouncement = () => alert('发布新公告功能待实现')
const editAnnouncement = (a) => alert(`编辑公告: ${a.title}`)
const deleteAnnouncement = (a) => { if(confirm('确定删除?')) alert('删除成功') }
const toggleAnnouncementStatus = (a) => {
  a.status = a.status === 'published' ? 'draft' : 'published'
  alert(`公告已${a.status === 'published' ? '发布' : '下线'}`)
}

const getAnnTypeName = (type) => {
  const map = { notice: '通知', activity: '活动', system: '系统', other: '其他' }
  return map[type] || type
}

const getPriorityName = (priority) => {
  const map = { high: '高', medium: '中', low: '低' }
  return map[priority] || priority
}

const getStatusName = (status) => {
  const map = { published: '已发布', draft: '草稿', offline: '已下线' }
  return map[status] || status
}

// 轮播图功能
const uploadBanner = () => alert('上传新轮播图功能待实现')
const editBanner = (b) => alert(`编辑轮播图: ${b.title}`)
const deleteBanner = (b) => { if(confirm('确定删除?')) alert('删除成功') }
const toggleBannerStatus = (b) => {
  b.isActive = !b.isActive
  alert(`轮播图已${b.isActive ? '启用' : '禁用'}`)
}

const getTypeClass = (type) => `type-${type}`
const getTypeName = (type) => {
  const map = { courseware: '课件', lesson_plan: '教案', exercise: '习题', video: '视频', other: '其他' }
  return map[type] || type
}
const formatDate = (d) => d ? new Date(d).toISOString().split('T')[0] : ''
</script>

<style scoped>
.container { display: flex; min-height: 100vh; }
.main-content { flex: 1; padding: 20px; }
.header { background: white; padding: 20px; border-radius: 10px; box-shadow: 0 2px 5px rgba(0,0,0,0.1); margin-bottom: 20px; display: flex; justify-content: space-between; align-items: center; }
.header h1 { color: #9C27B0; font-size: 1.8em; }
.user-info { display: flex; align-items: center; gap: 10px; }
.user-avatar { width: 40px; height: 40px; border-radius: 50%; background: #9C27B0; display: flex; align-items: center; justify-content: center; color: white; font-weight: bold; }
.content-tabs { background: white; padding: 20px; border-radius: 10px; box-shadow: 0 4px 6px rgba(0,0,0,0.05); margin-bottom: 20px; }
.tabs { display: flex; gap: 20px; margin-bottom: 20px; }
.tab { padding: 10px 20px; border-radius: 8px; cursor: pointer; transition: all 0.3s ease; font-weight: bold; }
.tab.active { background-color: #9C27B0; color: white; }
.tab:hover { background-color: #f0f0f0; }
.search-filter { background: white; padding: 20px; border-radius: 10px; box-shadow: 0 4px 6px rgba(0,0,0,0.05); margin-bottom: 20px; display: flex; flex-wrap: wrap; gap: 15px; align-items: center; }
.search-group { display: flex; align-items: center; gap: 10px; }
.search-group label { font-weight: bold; color: #555; }
.search-group input, .search-group select { padding: 8px 12px; border: 2px solid #e0e0e0; border-radius: 5px; font-size: 1em; }
.btn { padding: 8px 16px; border: none; border-radius: 5px; font-size: 0.9em; font-weight: bold; cursor: pointer; transition: all 0.3s ease; }
.btn-primary { background: #9C27B0; color: white; }
.btn-primary:hover { background: #7B1FA2; transform: translateY(-2px); }
.btn-secondary { background: #e0e0e0; color: #333; }
.btn-secondary:hover { background: #bdbdbd; transform: translateY(-2px); }
.content-management { background: white; padding: 25px; border-radius: 10px; box-shadow: 0 4px 6px rgba(0,0,0,0.05); }
.content-management h3 { color: #9C27B0; margin-bottom: 20px; font-size: 1.3em; }
.resource-table, .announcement-table { width: 100%; border-collapse: collapse; }
.resource-table th, .resource-table td, .announcement-table th, .announcement-table td { padding: 12px; text-align: left; border-bottom: 1px solid #e0e0e0; }
.resource-table th, .announcement-table th { background-color: #f9f9f9; font-weight: bold; color: #9C27B0; }
.resource-table tr:hover, .announcement-table tr:hover { background-color: #f9f9f9; }
.resource-type, .ann-type, .ann-priority, .ann-status { padding: 5px 10px; border-radius: 15px; font-size: 0.8em; font-weight: bold; display: inline-block; }
.type-courseware { background-color: #E3F2FD; color: #1976D2; }
.type-lesson-plan { background-color: #E8F5E8; color: #388E3C; }
.type-exercise { background-color: #FFF3E0; color: #F57C00; }
.type-video { background-color: #F3E5F5; color: #7B1FA2; }
.type-other { background-color: #E0F7FA; color: #00838F; }
.ann-notice { background-color: #E3F2FD; color: #1976D2; }
.ann-activity { background-color: #FFF3E0; color: #F57C00; }
.ann-system { background-color: #F3E5F5; color: #7B1FA2; }
.ann-other { background-color: #E0F7FA; color: #00838F; }
.priority-high { background-color: #FFEBEE; color: #C62828; }
.priority-medium { background-color: #FFF3E0; color: #F57C00; }
.priority-low { background-color: #E8F5E9; color: #388E3C; }
.status-published { background-color: #E8F5E9; color: #388E3C; }
.status-draft { background-color: #F5F5F5; color: #757575; }
.status-offline { background-color: #FFEBEE; color: #C62828; }
.pagination { margin-top: 20px; display: flex; justify-content: center; gap: 10px; }
.pagination button { padding: 8px 12px; border: 1px solid #e0e0e0; background: white; border-radius: 5px; cursor: pointer; transition: all 0.3s ease; }
.pagination button:hover:not(:disabled) { background: #f0f0f0; }
.pagination button.active { background: #9C27B0; color: white; border-color: #9C27B0; }
.pagination button:disabled { opacity: 0.5; cursor: not-allowed; }
.action-buttons { margin-top: 20px; display: flex; gap: 10px; }

/* 学习资料样式 */
.materials-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 20px; margin-bottom: 20px; }
.material-card { background: white; border: 2px solid #e0e0e0; border-radius: 10px; padding: 20px; transition: all 0.3s ease; }
.material-card:hover { border-color: #9C27B0; transform: translateY(-3px); box-shadow: 0 5px 15px rgba(0,0,0,0.1); }
.material-icon { font-size: 3em; margin-bottom: 15px; }
.material-card h4 { color: #333; margin-bottom: 10px; font-size: 1.1em; }
.material-desc { color: #666; font-size: 0.9em; margin-bottom: 15px; line-height: 1.5; }
.material-meta { display: flex; gap: 15px; font-size: 0.85em; color: #888; margin-bottom: 15px; }
.material-actions { display: flex; gap: 10px; }

/* 轮播图样式 */
.banners-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(350px, 1fr)); gap: 20px; margin-bottom: 20px; }
.banner-card { background: white; border: 2px solid #e0e0e0; border-radius: 10px; overflow: hidden; transition: all 0.3s ease; }
.banner-card:hover { border-color: #9C27B0; transform: translateY(-3px); box-shadow: 0 5px 15px rgba(0,0,0,0.1); }
.banner-preview { position: relative; width: 100%; height: 150px; background: #f0f0f0; }
.banner-preview img { width: 100%; height: 100%; object-fit: cover; }
.banner-overlay { position: absolute; top: 10px; right: 10px; background: rgba(156, 39, 176, 0.9); color: white; padding: 5px 10px; border-radius: 5px; font-weight: bold; }
.banner-info { padding: 20px; }
.banner-info h4 { color: #333; margin-bottom: 10px; font-size: 1.1em; }
.banner-desc { color: #666; font-size: 0.9em; margin-bottom: 15px; line-height: 1.5; }
.banner-meta { display: flex; gap: 15px; font-size: 0.85em; color: #888; margin-bottom: 15px; }
.banner-status { font-weight: bold; }
.banner-status.status-active { color: #388E3C; }
.banner-status.status-inactive { color: #C62828; }
.banner-actions { display: flex; gap: 10px; }
@media (max-width: 768px) { .container { flex-direction: column; } .sidebar { width: 100%; padding: 10px; } .nav-menu { display: flex; overflow-x: auto; gap: 10px; } .nav-menu li { margin-bottom: 0; } .tabs { overflow-x: auto; flex-wrap: nowrap; } .search-filter { flex-direction: column; align-items: stretch; } .search-group { flex-direction: column; align-items: stretch; } .resource-table { font-size: 0.9em; } .resource-table th, .resource-table td { padding: 8px; } }
</style>
