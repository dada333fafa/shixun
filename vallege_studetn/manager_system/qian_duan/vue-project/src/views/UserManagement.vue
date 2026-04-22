<template>
  <div class="container">
    <Sidebar />
    
    <div class="main-content">
      <div class="header">
        <h1>用户管理</h1>
        <div class="user-info">
          <span>欢迎，{{ userName }}</span>
          <div class="user-avatar">{{ userInitial }}</div>
        </div>
      </div>
      
      <div class="search-filter">
        <div class="search-group">
          <label for="search">搜索：</label>
          <input type="text" id="search" v-model="filters.search" placeholder="输入用户名或姓名">
        </div>
        <div class="search-group">
          <label for="role">角色：</label>
          <select id="role" v-model="filters.role">
            <option value="">全部</option>
            <option value="teacher">教师</option>
            <option value="student">学生</option>
            <option value="parent">家长</option>
            <option value="admin">管理员</option>
          </select>
        </div>
        <div class="search-group">
          <label for="status">状态：</label>
          <select id="status" v-model="filters.status">
            <option value="">全部</option>
            <option value="active">活跃</option>
            <option value="inactive">禁用</option>
          </select>
        </div>
        <button class="btn btn-primary" @click="loadUsers">搜索</button>
        <button class="btn btn-secondary" @click="resetFilters">重置</button>
        <button class="btn btn-primary" @click="showAddUserDialog">添加用户</button>
      </div>
      
      <div class="user-management">
        <h3>用户列表</h3>
        <table class="user-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>用户名</th>
              <th>真实姓名</th>
              <th>角色</th>
              <th>状态</th>
              <th>注册时间</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="user in users" :key="user._id">
              <td>{{ user.id }}</td>
              <td>{{ user.username }}</td>
              <td>{{ user.name }}</td>
              <td><span :class="['user-role', getRoleClass(user.role)]">{{ getRoleName(user.role) }}</span></td>
              <td><span :class="['user-status', user.isActive ? 'status-active' : 'status-inactive']">{{ user.isActive ? '活跃' : '禁用' }}</span></td>
              <td>{{ formatDate(user.createdAt) }}</td>
              <td>
                <button class="btn btn-primary" @click="editUser(user)">编辑</button>
                <button class="btn btn-secondary" @click="toggleUserStatus(user)">{{ user.isActive ? '禁用' : '启用' }}</button>
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
    </div>
    
    <!-- 添加/编辑用户模态框 -->
    <div v-if="showModal" class="modal-overlay" @click.self="closeModal">
      <div class="modal">
        <div class="modal-header">
          <h2>{{ isEditMode ? '编辑用户' : '添加用户' }}</h2>
          <button class="close-btn" @click="closeModal">&times;</button>
        </div>
        
        <form @submit.prevent="handleSubmit" class="modal-body">
          <div class="form-group">
            <label for="username">用户名 *</label>
            <input 
              type="text" 
              id="username" 
              v-model="userForm.username" 
              placeholder="请输入用户名"
              required
              :disabled="isEditMode"
            />
          </div>
          
          <div class="form-group">
            <label for="name">真实姓名 *</label>
            <input 
              type="text" 
              id="name" 
              v-model="userForm.name" 
              placeholder="请输入真实姓名"
              required
            />
          </div>
          
          <div class="form-group">
            <label for="email">邮箱</label>
            <input 
              type="email" 
              id="email" 
              v-model="userForm.email" 
              placeholder="请输入邮箱"
            />
          </div>
          
          <div class="form-group">
            <label for="phone">手机号</label>
            <input 
              type="tel" 
              id="phone" 
              v-model="userForm.phone" 
              placeholder="请输入手机号"
            />
          </div>
          
          <div class="form-group">
            <label for="role">角色 *</label>
            <select id="role" v-model="userForm.role" required>
              <option value="">请选择角色</option>
              <option value="teacher">教师</option>
              <option value="student">学生</option>
              <option value="parent">家长</option>
              <option value="admin">管理员</option>
            </select>
          </div>
          
          <div class="form-group" v-if="!isEditMode">
            <label for="password">密码 *</label>
            <input 
              type="password" 
              id="password" 
              v-model="userForm.password" 
              placeholder="请输入密码(至少6位)"
              required
              minlength="6"
            />
          </div>
          
          <div class="form-group" v-if="!isEditMode">
            <label for="confirmPassword">确认密码 *</label>
            <input 
              type="password" 
              id="confirmPassword" 
              v-model="userForm.confirmPassword" 
              placeholder="请再次输入密码"
              required
            />
          </div>
          
          <div class="error-message" v-if="errorMessage">
            {{ errorMessage }}
          </div>
          
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" @click="closeModal">取消</button>
            <button type="submit" class="btn btn-primary" :disabled="loading">
              {{ loading ? '保存中...' : '保存' }}
            </button>
          </div>
        </form>
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
const users = ref([])
const filters = ref({
  search: '',
  role: '',
  status: ''
})
const currentPage = ref(1)
const totalPages = ref(1)
const pageSize = 10

// 模态框相关
const showModal = ref(false)
const isEditMode = ref(false)
const loading = ref(false)
const errorMessage = ref('')
const userForm = ref({
  username: '',
  name: '',
  email: '',
  phone: '',
  role: '',
  password: '',
  confirmPassword: ''
})
const editingUserId = ref(null)

onMounted(() => {
  const user = JSON.parse(localStorage.getItem('user') || '{}')
  if (user.name) {
    userName.value = user.name
    userInitial.value = user.name.charAt(0)
  }
  loadUsers()
})

const loadUsers = async () => {
  try {
    const params = {
      page: currentPage.value,
      limit: pageSize,
      ...filters.value
    }
    const response = await axios.get('/api/users', { params })
    users.value = response.data.users
    totalPages.value = Math.ceil(response.data.total / pageSize)
  } catch (error) {
    console.error('加载用户失败:', error)
    if (error.response?.status === 403) {
      alert('登录已过期或权限不足，请重新登录')
      localStorage.clear()
      window.location.href = '/login'
    }
  }
}

const resetFilters = () => {
  filters.value = {
    search: '',
    role: '',
    status: ''
  }
  currentPage.value = 1
  loadUsers()
}

const changePage = (page) => {
  if (page >= 1 && page <= totalPages.value) {
    currentPage.value = page
    loadUsers()
  }
}

const toggleUserStatus = async (user) => {
  try {
    await axios.put(`/api/users/${user._id}/status`, {
      isActive: !user.isActive
    })
    user.isActive = !user.isActive
  } catch (error) {
    alert('操作失败')
  }
}

const showAddUserDialog = () => {
  isEditMode.value = false
  editingUserId.value = null
  userForm.value = {
    username: '',
    name: '',
    email: '',
    phone: '',
    role: '',
    password: '',
    confirmPassword: ''
  }
  errorMessage.value = ''
  showModal.value = true
}

const editUser = (user) => {
  isEditMode.value = true
  editingUserId.value = user._id
  userForm.value = {
    username: user.username,
    name: user.name,
    email: user.email || '',
    phone: user.phone || '',
    role: user.role,
    password: '',
    confirmPassword: ''
  }
  errorMessage.value = ''
  showModal.value = true
}

const closeModal = () => {
  showModal.value = false
  errorMessage.value = ''
  userForm.value = {
    username: '',
    name: '',
    email: '',
    phone: '',
    role: '',
    password: '',
    confirmPassword: ''
  }
}

const handleSubmit = async () => {
  errorMessage.value = ''
  
  // 验证密码
  if (!isEditMode.value) {
    if (userForm.value.password !== userForm.value.confirmPassword) {
      errorMessage.value = '两次输入的密码不一致'
      return
    }
    if (userForm.value.password.length < 6) {
      errorMessage.value = '密码长度至少为6位'
      return
    }
  }
  
  loading.value = true
  
  try {
    if (isEditMode.value) {
      // 编辑用户
      await axios.put(`/api/users/${editingUserId.value}`, {
        name: userForm.value.name,
        email: userForm.value.email,
        phone: userForm.value.phone,
        role: userForm.value.role
      })
      alert('用户信息更新成功')
    } else {
      // 添加新用户
      await axios.post('/api/users', {
        username: userForm.value.username,
        name: userForm.value.name,
        email: userForm.value.email,
        phone: userForm.value.phone,
        role: userForm.value.role,
        password: userForm.value.password
      })
      alert('用户添加成功')
    }
    
    closeModal()
    loadUsers() // 重新加载用户列表
  } catch (error) {
    errorMessage.value = error.response?.data?.message || '操作失败，请稍后重试'
  } finally {
    loading.value = false
  }
}

const getRoleClass = (role) => {
  const roleMap = {
    teacher: 'role-teacher',
    student: 'role-student',
    parent: 'role-parent',
    admin: 'role-admin'
  }
  return roleMap[role] || ''
}

const getRoleName = (role) => {
  const nameMap = {
    teacher: '教师',
    student: '学生',
    parent: '家长',
    admin: '管理员'
  }
  return nameMap[role] || role
}

const formatDate = (dateString) => {
  if (!dateString) return ''
  const date = new Date(dateString)
  return date.toISOString().split('T')[0]
}
</script>

<style scoped>
.container {
  display: flex;
  min-height: 100vh;
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
  color: #9C27B0;
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
  background: #9C27B0;
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
  box-shadow: 0 4px 6px rgba(0,0,0,0.05);
  margin-bottom: 20px;
  display: flex;
  flex-wrap: wrap;
  gap: 15px;
  align-items: center;
}

.search-group {
  display: flex;
  align-items: center;
  gap: 10px;
}

.search-group label {
  font-weight: bold;
  color: #555;
}

.search-group input,
.search-group select {
  padding: 8px 12px;
  border: 2px solid #e0e0e0;
  border-radius: 5px;
  font-size: 1em;
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
  background: #9C27B0;
  color: white;
}

.btn-primary:hover {
  background: #7B1FA2;
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

.user-management {
  background: white;
  padding: 25px;
  border-radius: 10px;
  box-shadow: 0 4px 6px rgba(0,0,0,0.05);
}

.user-management h3 {
  color: #9C27B0;
  margin-bottom: 20px;
  font-size: 1.3em;
}

.user-table {
  width: 100%;
  border-collapse: collapse;
}

.user-table th,
.user-table td {
  padding: 12px;
  text-align: left;
  border-bottom: 1px solid #e0e0e0;
}

.user-table th {
  background-color: #f9f9f9;
  font-weight: bold;
  color: #9C27B0;
}

.user-table tr:hover {
  background-color: #f9f9f9;
}

.user-role {
  padding: 5px 10px;
  border-radius: 15px;
  font-size: 0.8em;
  font-weight: bold;
}

.role-teacher {
  background-color: #E3F2FD;
  color: #1976D2;
}

.role-student {
  background-color: #E8F5E8;
  color: #388E3C;
}

.role-parent {
  background-color: #FFF3E0;
  color: #F57C00;
}

.role-admin {
  background-color: #F3E5F5;
  color: #7B1FA2;
}

.user-status {
  padding: 5px 10px;
  border-radius: 15px;
  font-size: 0.8em;
  font-weight: bold;
}

.status-active {
  background-color: #E8F5E8;
  color: #388E3C;
}

.status-inactive {
  background-color: #FFEBEE;
  color: #C62828;
}

.pagination {
  margin-top: 20px;
  display: flex;
  justify-content: center;
  gap: 10px;
}

.pagination button {
  padding: 8px 12px;
  border: 1px solid #e0e0e0;
  background: white;
  border-radius: 5px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.pagination button:hover:not(:disabled) {
  background: #f0f0f0;
}

.pagination button.active {
  background: #9C27B0;
  color: white;
  border-color: #9C27B0;
}

.pagination button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* 模态框样式 */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal {
  background: white;
  border-radius: 10px;
  width: 90%;
  max-width: 500px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
}

.modal-header {
  padding: 20px;
  border-bottom: 1px solid #e0e0e0;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.modal-header h2 {
  color: #9C27B0;
  margin: 0;
  font-size: 1.5em;
}

.close-btn {
  background: none;
  border: none;
  font-size: 2em;
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
  color: #555;
  font-weight: bold;
}

.form-group input,
.form-group select {
  width: 100%;
  padding: 10px;
  border: 2px solid #e0e0e0;
  border-radius: 5px;
  font-size: 1em;
  transition: border-color 0.3s ease;
}

.form-group input:focus,
.form-group select:focus {
  outline: none;
  border-color: #9C27B0;
}

.form-group input:disabled {
  background-color: #f5f5f5;
  cursor: not-allowed;
}

.error-message {
  color: #f44336;
  background-color: #ffebee;
  padding: 10px;
  border-radius: 5px;
  margin-bottom: 15px;
  text-align: center;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 20px;
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
  
  .nav-menu li {
    margin-bottom: 0;
  }
  
  .search-filter {
    flex-direction: column;
    align-items: stretch;
  }
  
  .search-group {
    flex-direction: column;
    align-items: stretch;
  }
  
  .user-table {
    font-size: 0.9em;
  }
  
  .user-table th,
  .user-table td {
    padding: 8px;
  }
}
</style>
