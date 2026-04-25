<template>
  <div class="teacher-resources">
    <header>
      <div class="header-content">
        <div class="logo">
          <img src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='white'%3E%3Cpath d='M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5'/%3E%3C/svg%3E" alt="乡村助学平台">
          乡村助学平台
        </div>
        <nav class="nav">
          <router-link to="/teacher/dashboard">首页</router-link>
          <router-link to="/teacher/match-management">匹配管理</router-link>
          <router-link to="/teacher/chat">聊天</router-link>
          <router-link to="/teacher/resources">资源管理</router-link>
          <router-link to="/teacher/psychological">心理支持</router-link>
          <a href="#" @click.prevent="handleLogout">退出</a>
        </nav>
        <div class="user-info">
          <span>{{ userDisplayName }}</span>
          <div class="user-avatar">{{ userInitial }}</div>
        </div>
      </div>
    </header>
    
    <div class="section">
      <h2>
        <img src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%23667eea'%3E%3Cpath d='M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z'/%3E%3C/svg%3E" alt="上传资源">
        上传教学资源
      </h2>
      <div class="upload-section">
        <div class="upload-icon">
          <img src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='white'%3E%3Cpath d='M19.35 10.04C18.67 6.59 15.64 4 12 4 9.11 4 6.6 5.64 5.35 8.04 2.34 8.36 0 10.91 0 14c0 3.31 2.69 6 6 6h13c2.76 0 5-2.24 5-5 0-2.64-2.05-4.78-4.65-4.96zM19 18H6c-2.21 0-4-1.79-4-4 0-2.05 1.53-3.76 3.56-3.97l1.07-.11.5-.95C8.08 7.14 9.94 6 12 6c2.62 0 4.88 1.86 5.39 4.43l.3 1.5 1.53.11c1.56.1 2.78 1.41 2.78 2.96 0 1.65-1.35 3-3 3zm-5.55-8h-2.9v3H8l4 4 4-4h-2.55z'/%3E%3C/svg%3E" alt="上传">
        </div>
        <h3>上传教学资源</h3>
        <p>支持上传课件、教案、习题等教学资料,帮助学生更好地学习</p>
        <button class="upload-btn" @click="showUploadDialog = true">选择文件</button>
      </div>
    </div>
    
    <!-- 上传对话框 -->
    <div class="modal-overlay" v-if="showUploadDialog" @click="closeUploadDialog">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h3>上传教学资源</h3>
          <button class="close-btn" @click="closeUploadDialog">&times;</button>
        </div>
        <div class="modal-body">
          <div class="form-group">
            <label>资源标题 *</label>
            <input 
              type="text" 
              v-model="uploadForm.title" 
              placeholder="请输入资源标题"
              class="form-input"
            >
          </div>
          <div class="form-group">
            <label>资源描述</label>
            <textarea 
              v-model="uploadForm.description" 
              placeholder="请输入资源描述"
              class="form-textarea"
            ></textarea>
          </div>
          <div class="form-group">
            <label>资源类型 *</label>
            <div class="type-selector">
              <button 
                v-for="type in resourceTypes" 
                :key="type"
                class="type-btn"
                :class="{ active: uploadForm.type === type }"
                @click="uploadForm.type = type"
              >
                {{ type }}
              </button>
            </div>
          </div>
          <div class="form-group">
            <label>选择文件 *</label>
            <input 
              type="file" 
              ref="fileInput"
              @change="handleFileSelect"
              class="form-file"
            >
            <div v-if="uploadForm.fileName" class="file-info">
              已选择: {{ uploadForm.fileName }} ({{ uploadForm.fileSize }})
            </div>
          </div>
          <div class="form-group">
            <label>下载密码（可选）</label>
            <input 
              type="password" 
              v-model="uploadForm.downloadPassword" 
              placeholder="设置下载密码，留空则无需密码"
              class="form-input"
            >
            <p class="form-hint">💡 设置后学生需要输入密码才能下载此资源</p>
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn btn-cancel" @click="closeUploadDialog">取消</button>
          <button class="btn btn-primary" @click="submitUpload" :disabled="uploading">{{ uploading ? '上传中...' : '确认上传' }}</button>
        </div>
      </div>
    </div>
    
    <!-- 编辑对话框 -->
    <div class="modal-overlay" v-if="showEditDialog" @click="closeEditDialog">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h3>编辑教学资源</h3>
          <button class="close-btn" @click="closeEditDialog">&times;</button>
        </div>
        <div class="modal-body">
          <div class="form-group">
            <label>资源标题 *</label>
            <input 
              type="text" 
              v-model="editForm.title" 
              placeholder="请输入资源标题"
              class="form-input"
            >
          </div>
          <div class="form-group">
            <label>资源描述</label>
            <textarea 
              v-model="editForm.description" 
              placeholder="请输入资源描述"
              class="form-textarea"
            ></textarea>
          </div>
          <div class="form-group">
            <label>资源类型 *</label>
            <div class="type-selector">
              <button 
                v-for="type in resourceTypes" 
                :key="type"
                class="type-btn"
                :class="{ active: editForm.type === type }"
                @click="editForm.type = type"
              >
                {{ type }}
              </button>
            </div>
          </div>
          <div class="form-group">
            <label>当前关联文件</label>
            <div class="current-file-info">
              <span class="file-name">📁 {{ editingResource?.fileName || '无文件' }}</span>
              <button 
                v-if="editingResource?.fileName"
                class="btn-remove-file" 
                @click="removeCurrentFile"
                title="删除当前文件"
              >
                🗑️ 删除文件
              </button>
            </div>
          </div>
          <div class="form-group">
            <label>上传新文件（可选）</label>
            <input 
              type="file" 
              ref="editFileInput"
              @change="handleEditFileSelect"
              class="form-file"
            >
            <div v-if="editForm.fileName" class="file-info">
              已选择新文件: {{ editForm.fileName }} ({{ editForm.fileSize }})
            </div>
            <p class="form-hint">💡 上传新文件将替换当前文件，留空则保留原文件</p>
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn btn-cancel" @click="closeEditDialog">取消</button>
          <button class="btn btn-primary" @click="submitEdit" :disabled="editing">{{ editing ? '保存中...' : '确认修改' }}</button>
        </div>
      </div>
    </div>
    
    <div class="section">
      <h2>
        <img src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%23667eea'%3E%3Cpath d='M20 2H4c-1.1 0-1.99.9-1.99 2L2 22l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-7 12h-2v-2h2v2zm0-4h-2V6h2v4z'/%3E%3C/svg%3E" alt="资源管理">
        资源管理
      </h2>
      <div class="resource-filter">
        <button 
          v-for="filter in filters" 
          :key="filter"
          class="filter-btn"
          :class="{ active: selectedFilter === filter }"
          @click="selectedFilter = filter"
        >
          {{ filter }}
        </button>
      </div>
      <div class="resource-grid">
        <div 
          v-for="resource in filteredResources" 
          :key="resource.id"
          class="resource-card"
        >
          <div class="resource-icon">
            <img :src="resource.icon" :alt="resource.type">
          </div>
          <h3>{{ resource.title }}</h3>
          <p class="resource-desc">{{ resource.description }}</p>
          <div class="resource-meta">
            <span>📅 {{ resource.date }}</span>
            <span>📦 {{ resource.size }}</span>
          </div>
          <div class="resource-type-tag">📄 {{ resource.type }}</div>
          <div class="resource-actions">
            <button class="action-btn primary" @click="handleDownload(resource)">下载</button>
            <button class="action-btn" @click="handleEdit(resource)">编辑</button>
            <button class="action-btn danger" @click="handleDelete(resource)">删除</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const API_BASE_URL = '/api/v1'

// 从 localStorage 获取用户信息
const userInfo = ref(null)
const token = ref('')

onMounted(async () => {
  // 加载用户信息
  const userStr = localStorage.getItem('user')
  if (userStr) {
    userInfo.value = JSON.parse(userStr)
  }
  
  // 从 localStorage 单独获取 token
  token.value = localStorage.getItem('token') || ''
  
  // 从数据库加载资源数据
  await loadResources()
})

// 获取用户姓氏（用于头像显示）
const userInitial = computed(() => {
  if (userInfo.value && userInfo.value.name) {
    return userInfo.value.name.charAt(0)
  }
  return '李'
})

// 获取用户称呼
const userDisplayName = computed(() => {
  if (userInfo.value && userInfo.value.name) {
    return userInfo.value.name
  }
  return '李老师'
})

const selectedFilter = ref('全部')
const filters = ['全部', '课件', '教案', '习题', '视频']
const resourceTypes = ['课件', '教案', '习题', '视频']

// 上传对话框
const showUploadDialog = ref(false)
const uploading = ref(false)
const fileInput = ref(null)
const uploadForm = ref({
  title: '',
  description: '',
  type: '课件',
  file: null,
  fileName: '',
  fileSize: '',
  downloadPassword: ''
})

// 编辑对话框
const showEditDialog = ref(false)
const editingResource = ref(null)
const editFileInput = ref(null)
const editing = ref(false)
const editForm = ref({
  title: '',
  description: '',
  type: '课件',
  file: null,
  fileName: '',
  fileSize: '',
  removeFile: false
})

// 资源列表
const resources = ref([])

// 加载资源列表
const loadResources = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/resources`, {
      headers: {
        'Authorization': `Bearer ${token.value}`
      }
    })
    
    const data = await response.json()
    console.log('API Response:', data)
    
    if (data.status === 'success') {
      // 资源类型映射
      const typeMap = {
        'courseware': '课件',
        'lesson_plan': '教案',
        'exercise': '习题',
        'video': '视频',
        'other': '其他'
      }
      
      // 图标映射
      const icons = {
        '课件': "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='white'%3E%3Cpath d='M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 2 2h8c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z'/%3E%3C/svg%3E",
        '教案': "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='white'%3E%3Cpath d='M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-5 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z'/%3E%3C/svg%3E",
        '习题': "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='white'%3E%3Cpath d='M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-7 14h-2v-4H8v-2h2V9h2v2h2v2h-2v4z'/%3E%3C/svg%3E",
        '视频': "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='white'%3E%3Cpath d='M10 16.5l4-4-4-4v8zM12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z'/%3E%3C/svg%3E"
      }
      
      resources.value = data.data.resources.map(r => {
        const typeName = typeMap[r.resource_type] || r.resource_type
        return {
          id: r.id,
          title: r.title,
          description: r.description || '暂无描述',
          type: typeName,
          date: new Date(r.upload_date).toISOString().split('T')[0],
          size: r.file_size ? formatFileSize(r.file_size) : '未知大小',
          icon: icons[typeName] || icons['课件'],
          filePath: r.file_path,
          fileName: r.file_name
        }
      })
      console.log('Loaded resources:', resources.value)
    }
  } catch (error) {
    console.error('加载资源列表失败:', error)
  }
}

// 格式化文件大小
const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

const filteredResources = computed(() => {
  if (selectedFilter.value === '全部') return resources.value
  return resources.value.filter(r => r.type === selectedFilter.value)
})

const handleFileSelect = (event) => {
  const file = event.target.files[0]
  if (file) {
    uploadForm.value.file = file
    uploadForm.value.fileName = file.name
    uploadForm.value.fileSize = formatFileSize(file.size)
  }
}

const closeUploadDialog = () => {
  showUploadDialog.value = false
  uploadForm.value = {
    title: '',
    description: '',
    type: '课件',
    file: null,
    fileName: '',
    fileSize: '',
    downloadPassword: ''
  }
  if (fileInput.value) {
    fileInput.value.value = ''
  }
}

const submitUpload = async () => {
  // 表单验证
  if (!uploadForm.value.title) {
    alert('请输入资源标题')
    return
  }
  if (!uploadForm.value.type) {
    alert('请选择资源类型')
    return
  }
  if (!uploadForm.value.file) {
    alert('请选择文件')
    return
  }
  
  try {
    uploading.value = true
    
    // 资源类型映射
    const typeMap = {
      '课件': 'courseware',
      '教案': 'lesson_plan',
      '习题': 'exercise',
      '视频': 'video'
    }
    
    // 创建 FormData
    const formData = new FormData()
    formData.append('title', uploadForm.value.title)
    formData.append('description', uploadForm.value.description || '')
    formData.append('resource_type', typeMap[uploadForm.value.type])
    // 使用 btoa 编码原始文件名，避免 UTF-8 编码问题
    const originalName = uploadForm.value.file.name
    const encodedFilename = btoa(unescape(encodeURIComponent(originalName)))
    formData.append('original_filename', encodedFilename)
    formData.append('file', uploadForm.value.file)
    // 添加下载密码（如果有）
    if (uploadForm.value.downloadPassword) {
      formData.append('downloadPassword', uploadForm.value.downloadPassword)
    }
    
    const response = await fetch(`${API_BASE_URL}/resources`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token.value}`
      },
      body: formData
    })
    
    const data = await response.json()
    if (data.status === 'success') {
      alert('资源上传成功！')
      closeUploadDialog()
      await loadResources()  // 重新加载资源列表
    } else {
      alert('上传失败: ' + data.message)
    }
  } catch (error) {
    alert('上传失败，请稍后重试')
    console.error('上传错误:', error)
  } finally {
    uploading.value = false
  }
}

const handleDownload = async (resource) => {
  console.log('下载资源:', resource)
  
  if (!resource.filePath) {
    alert(`下载: ${resource.title}\n\n提示: 该资源没有上传文件`)
    return
  }
  
  // 确保 filePath 以 / 开头
  let cleanPath = resource.filePath
  if (!cleanPath.startsWith('/')) {
    cleanPath = '/' + cleanPath
  }
  
  // 从服务器下载文件
  const downloadUrl = `${API_BASE_URL.replace('/api/v1', '')}${cleanPath}`
  console.log('下载URL:', downloadUrl)
  
  try {
    // 使用 fetch 获取文件内容
    const response = await fetch(downloadUrl)
    if (!response.ok) {
      throw new Error('下载失败: ' + response.status)
    }
    
    const blob = await response.blob()
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    // 直接使用原始文件名
    link.download = resource.fileName || resource.title
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    window.URL.revokeObjectURL(url)
    console.log('下载成功:', resource.title)
  } catch (error) {
    console.error('下载失败:', error)
    alert('下载失败: ' + error.message)
  }
}

const handleEdit = (resource) => {
  console.log('Editing resource:', resource)
  editingResource.value = resource
  editForm.value = {
    title: resource.title || '',
    description: resource.description === '暂无描述' ? '' : (resource.description || ''),
    type: resource.type || '课件',
    file: null,
    fileName: '',
    fileSize: '',
    removeFile: false
  }
  console.log('Edit form:', editForm.value)
  showEditDialog.value = true
}

const closeEditDialog = () => {
  showEditDialog.value = false
  editingResource.value = null
  editForm.value = {
    title: '',
    description: '',
    type: '课件',
    file: null,
    fileName: '',
    fileSize: '',
    removeFile: false
  }
  if (editFileInput.value) {
    editFileInput.value.value = ''
  }
}

const handleEditFileSelect = (event) => {
  const file = event.target.files[0]
  if (file) {
    editForm.value.file = file
    editForm.value.fileName = file.name
    editForm.value.fileSize = formatFileSize(file.size)
    editForm.value.removeFile = false
  }
}

const removeCurrentFile = () => {
  if (confirm('确定要删除当前关联的文件吗？')) {
    editForm.value.removeFile = true
    editForm.value.file = null
    editForm.value.fileName = ''
    editForm.value.fileSize = ''
    alert('文件将在保存时删除')
  }
}

const submitEdit = async () => {
  if (!editForm.value.title) {
    alert('请输入资源标题')
    return
  }
  if (!editForm.value.type) {
    alert('请选择资源类型')
    return
  }
  
  try {
    editing.value = true
    
    // 资源类型映射
    const typeMap = {
      '课件': 'courseware',
      '教案': 'lesson_plan',
      '习题': 'exercise',
      '视频': 'video'
    }
    
    // 如果上传了新文件，使用 FormData
    if (editForm.value.file) {
      const formData = new FormData()
      formData.append('title', editForm.value.title)
      formData.append('description', editForm.value.description || '')
      formData.append('resource_type', typeMap[editForm.value.type])
      formData.append('file', editForm.value.file)
      
      const originalName = editForm.value.file.name
      const encodedFilename = btoa(unescape(encodeURIComponent(originalName)))
      formData.append('original_filename', encodedFilename)
      
      const response = await fetch(`${API_BASE_URL}/resources/${editingResource.value.id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token.value}`
        },
        body: formData
      })
      
      const data = await response.json()
      if (data.status === 'success') {
        alert('资源编辑成功！')
        closeEditDialog()
        await loadResources()
      } else {
        alert('编辑失败: ' + data.message)
      }
    } else {
      // 没有上传新文件，只更新信息
      const response = await fetch(`${API_BASE_URL}/resources/${editingResource.value.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token.value}`
        },
        body: JSON.stringify({
          title: editForm.value.title,
          description: editForm.value.description || '',
          resource_type: typeMap[editForm.value.type],
          remove_file: editForm.value.removeFile
        })
      })
      
      const data = await response.json()
      if (data.status === 'success') {
        alert('资源编辑成功！')
        closeEditDialog()
        await loadResources()
      } else {
        alert('编辑失败: ' + data.message)
      }
    }
  } catch (error) {
    alert('编辑失败，请稍后重试')
    console.error('编辑错误:', error)
  } finally {
    editing.value = false
  }
}

const handleDelete = async (resource) => {
  if (confirm(`确定要删除 "${resource.title}" 吗?`)) {
    try {
      const response = await fetch(`${API_BASE_URL}/resources/${resource.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token.value}`
        }
      })
      
      const data = await response.json()
      if (data.status === 'success') {
        alert('删除成功！')
        await loadResources()  // 重新加载资源列表
      } else {
        alert('删除失败: ' + data.message)
      }
    } catch (error) {
      alert('删除失败，请稍后重试')
      console.error('删除错误:', error)
    }
  }
}

// 退出登录
const handleLogout = () => {
  localStorage.removeItem('token')
  localStorage.removeItem('user')
  console.log('👋 已退出登录')
  router.push('/login')
}
</script>

<style scoped>
.teacher-resources {
  font-family: 'Arial', sans-serif;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  min-height: 100vh;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 20px;
  border-radius: 15px;
  margin-bottom: 30px;
  box-shadow: 0 10px 30px rgba(0,0,0,0.1);
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.logo {
  font-size: 24px;
  font-weight: bold;
  display: flex;
  align-items: center;
  gap: 10px;
}

.logo img {
  width: 40px;
  height: 40px;
}

.nav {
  display: flex;
  gap: 20px;
}

.nav a {
  color: white;
  text-decoration: none;
  font-weight: bold;
  transition: transform 0.3s ease;
}

.nav a:hover,
.nav a.router-link-active {
  transform: translateY(-3px);
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
  background: white;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #667eea;
  font-weight: bold;
}

.section {
  background: white;
  border-radius: 15px;
  padding: 30px;
  margin-bottom: 30px;
  box-shadow: 0 10px 30px rgba(0,0,0,0.1);
}

.section h2 {
  color: #333;
  margin-bottom: 20px;
  font-size: 24px;
  display: flex;
  align-items: center;
  gap: 10px;
}

.section h2 img {
  width: 24px;
  height: 24px;
}

.upload-section {
  background: #f9f9f9;
  border-radius: 10px;
  padding: 30px;
  text-align: center;
  border: 2px dashed #e0e0e0;
  margin-bottom: 30px;
  transition: all 0.3s ease;
}

.upload-section:hover {
  border-color: #667eea;
  background: #f0f4ff;
}

.upload-icon {
  width: 80px;
  height: 80px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 20px;
}

.upload-icon img {
  width: 40px;
  height: 40px;
  filter: brightness(0) invert(1);
}

.upload-section h3 {
  color: #333;
  margin-bottom: 10px;
}

.upload-section p {
  color: #666;
  margin-bottom: 20px;
}

.upload-btn {
  padding: 12px 30px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 25px;
  cursor: pointer;
  font-weight: bold;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.upload-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(102, 126, 234, 0.4);
}

.resource-filter {
  display: flex;
  gap: 15px;
  margin-bottom: 20px;
  flex-wrap: wrap;
}

.filter-btn {
  padding: 10px 20px;
  border: 1px solid #e0e0e0;
  background: white;
  border-radius: 20px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.filter-btn.active {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border-color: #667eea;
}

.resource-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
}

.resource-card {
  background: #f9f9f9;
  border-radius: 10px;
  padding: 20px;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  border: 1px solid #e0e0e0;
}

.resource-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 20px rgba(0,0,0,0.1);
}

.resource-icon {
  width: 60px;
  height: 60px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 15px;
}

.resource-icon img {
  width: 30px;
  height: 30px;
  filter: brightness(0) invert(1);
}

.resource-card h3 {
  color: #333;
  margin-bottom: 10px;
  font-size: 18px;
}

.resource-card p,
.resource-card .resource-desc {
  color: #666;
  margin-bottom: 15px;
  font-size: 14px;
  line-height: 1.5;
}

.resource-type-tag {
  display: inline-block;
  padding: 4px 12px;
  background: #f0f4ff;
  color: #667eea;
  border-radius: 12px;
  font-size: 12px;
  margin-bottom: 12px;
}

.resource-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 12px;
  color: #999;
  margin-bottom: 15px;
}

.resource-actions {
  display: flex;
  gap: 10px;
}

.action-btn {
  padding: 8px 16px;
  border: 1px solid #e0e0e0;
  background: white;
  border-radius: 20px;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.3s ease;
}

.action-btn:hover {
  background: #f0f0f0;
}

.action-btn.danger {
  color: #e53e3e;
  border-color: #e53e3e;
}

.action-btn.danger:hover {
  background: #e53e3e;
  color: white;
}

.action-btn.primary {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border-color: #667eea;
}

.action-btn.primary:hover {
  background: linear-gradient(135deg, #5a6fd8 0%, #6a4393 100%);
}

@media (max-width: 768px) {
  .container {
    padding: 10px;
  }
  
  .header-content {
    flex-direction: column;
    gap: 15px;
    text-align: center;
  }
  
  .nav {
    flex-wrap: wrap;
    justify-content: center;
  }
  
  .section {
    padding: 20px;
  }
  
  .upload-section {
    padding: 20px;
  }
  
  .resource-filter {
    justify-content: center;
  }
  
  .resource-grid {
    grid-template-columns: 1fr;
  }
}

/* 模态对话框样式 */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  background: white;
  border-radius: 15px;
  width: 90%;
  max-width: 500px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
}

.modal-header {
  padding: 20px;
  border-bottom: 1px solid #e0e0e0;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.modal-header h3 {
  margin: 0;
  color: #333;
  font-size: 20px;
}

.close-btn {
  background: none;
  border: none;
  font-size: 28px;
  color: #999;
  cursor: pointer;
  line-height: 1;
  padding: 0;
  width: 30px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.close-btn:hover {
  color: #333;
}

.modal-body {
  padding: 20px;
}

.form-group {
  margin-bottom: 20px;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  color: #333;
  font-weight: 600;
  font-size: 14px;
}

.form-input,
.form-textarea {
  width: 100%;
  padding: 12px;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  font-size: 14px;
  transition: border-color 0.3s ease;
}

.form-input:focus,
.form-textarea:focus {
  outline: none;
  border-color: #667eea;
}

.form-textarea {
  min-height: 80px;
  resize: vertical;
}

.type-selector {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.type-btn {
  padding: 8px 20px;
  border: 2px solid #e0e0e0;
  background: white;
  border-radius: 20px;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 14px;
  color: #666;
}

.type-btn:hover {
  border-color: #667eea;
  color: #667eea;
}

.type-btn.active {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border-color: #667eea;
}

.form-file {
  width: 100%;
  padding: 10px;
  border: 2px dashed #e0e0e0;
  border-radius: 8px;
  cursor: pointer;
}

.file-info {
  margin-top: 10px;
  padding: 8px 12px;
  background: #f0f4ff;
  border-radius: 6px;
  color: #667eea;
  font-size: 13px;
}

.current-file-info {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px;
  background: #f9f9f9;
  border-radius: 8px;
  border: 1px solid #e0e0e0;
}

.current-file-info .file-name {
  color: #666;
  font-size: 14px;
}

.btn-remove-file {
  padding: 6px 12px;
  background: #fff;
  border: 1px solid #e53e3e;
  color: #e53e3e;
  border-radius: 6px;
  cursor: pointer;
  font-size: 13px;
  transition: all 0.3s ease;
}

.btn-remove-file:hover {
  background: #e53e3e;
  color: white;
}

.form-hint {
  margin-top: 8px;
  color: #999;
  font-size: 12px;
  font-style: italic;
}

.modal-footer {
  padding: 20px;
  border-top: 1px solid #e0e0e0;
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}

.btn {
  padding: 10px 24px;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-cancel {
  background: #f0f0f0;
  color: #666;
}

.btn-cancel:hover {
  background: #e0e0e0;
}

.btn-primary {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.btn-primary:hover:not(:disabled) {
  opacity: 0.9;
  transform: translateY(-1px);
}

.btn-primary:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
</style>
