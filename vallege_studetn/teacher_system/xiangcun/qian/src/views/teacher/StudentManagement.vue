<template>
  <div class="teacher-layout teacher-student-management">
    <aside class="sidebar">
      <h2>教师中心</h2>
      <ul class="nav-menu">
        <li><router-link to="/teacher/dashboard">仪表盘</router-link></li>
        <li><router-link to="/teacher/students" class="active">学生管理</router-link></li>
        <li><router-link to="/teacher/chat">聊天沟通</router-link></li>
        <li><router-link to="/teacher/resources">教学资源</router-link></li>
        <li><router-link to="/teacher/psychological">心理辅导</router-link></li>
        <li><router-link to="/teacher/ai-match">AI匹配</router-link></li>
        <li><router-link to="/teacher/match-management">匹配管理</router-link></li>
        <li><a href="#" @click.prevent="handleLogout">退出登录</a></li>
      </ul>
    </aside>
    
    <main class="main-content">
      <div class="header">
        <h1>学生管理</h1>
        <div class="user-info">
          <span>{{ welcomeText }}</span>
          <div class="user-avatar">{{ userInitial }}</div>
        </div>
      </div>
      
      <div class="search-box">
        <form class="search-form" @submit.prevent="handleSearch">
          <input 
            type="text" 
            v-model="searchQuery"
            placeholder="搜索学生姓名、年级..."
          >
          <button type="submit">搜索</button>
        </form>
      </div>
      
      <div class="student-table">
        <table>
          <thead>
            <tr>
              <th>学生姓名</th>
              <th>年级</th>
              <th>科目</th>
              <th>状态</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="student in filteredStudents" :key="student.id">
              <td>{{ student.name }}</td>
              <td>{{ student.grade }}</td>
              <td>{{ student.subject }}</td>
              <td>
                <span 
                  class="status-badge" 
                  :class="getStatusClass(student.status)"
                >
                  {{ student.status }}
                </span>
              </td>
              <td>
                <button 
                  class="btn btn-primary" 
                  @click="handleChat(student)"
                  v-if="student.status === '活跃'"
                >
                  沟通
                </button>
                <button 
                  class="btn btn-primary" 
                  @click="handleConfirm(student)"
                  v-if="student.status === '待确认'"
                >
                  确认
                </button>
                <button 
                  class="btn btn-primary" 
                  @click="handleActivate(student)"
                  v-if="student.status === '未激活'"
                >
                  激活
                </button>
                <button 
                  class="btn btn-success" 
                  @click="openEvaluationDialog(student)"
                  v-if="student.status === '活跃'"
                >
                  评价
                </button>
                <button class="btn btn-secondary" @click="handleDetail(student)">详情</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </main>

    <!-- 评价对话框 -->
    <div v-if="showEvaluationDialog" class="modal-overlay" @click="closeEvaluationDialog">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h3>给学生评价</h3>
          <button class="close-btn" @click="closeEvaluationDialog">×</button>
        </div>
        <div class="modal-body">
          <div class="form-group">
            <label>学生姓名：</label>
            <span>{{ currentStudent?.name }}</span>
          </div>
          <div class="form-group">
            <label for="score">分数（0-100）：</label>
            <input 
              type="number" 
              id="score" 
              v-model.number="evaluationForm.score" 
              min="0" 
              max="100"
              placeholder="请输入分数"
            />
          </div>
          <div class="form-group">
            <label for="comment">评语：</label>
            <textarea 
              id="comment" 
              v-model="evaluationForm.comment" 
              rows="5"
              placeholder="请输入评语..."
            ></textarea>
          </div>
          <div class="form-group">
            <label for="subject">科目：</label>
            <select id="subject" v-model="evaluationForm.subject">
              <option value="综合">综合</option>
              <option value="数学">数学</option>
              <option value="语文">语文</option>
              <option value="英语">英语</option>
              <option value="物理">物理</option>
              <option value="化学">化学</option>
            </select>
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn btn-secondary" @click="closeEvaluationDialog">取消</button>
          <button class="btn btn-primary" @click="submitEvaluation" :disabled="isSubmitting">
            {{ isSubmitting ? '提交中...' : '提交评价' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'

const API_BASE_URL = '/api/v1'
const router = useRouter()
const searchQuery = ref('')

// 退出登录
const handleLogout = () => {
  localStorage.removeItem('token')
  localStorage.removeItem('user')
  console.log('👋 已退出登录')
  router.push('/login')
}

// 从 localStorage 获取用户信息
const userInfo = ref(null)
const token = ref('')

// 评价对话框相关
const showEvaluationDialog = ref(false)
const currentStudent = ref(null)
const isSubmitting = ref(false)
const evaluationForm = ref({
  score: '',
  comment: '',
  subject: '综合'
})

onMounted(async () => {
  const userStr = localStorage.getItem('user')
  if (userStr) {
    userInfo.value = JSON.parse(userStr)
  }
  
  // 从 localStorage 单独获取 token
  token.value = localStorage.getItem('token') || ''
  
  // 加载真实学生数据
  await loadStudents()
})

// 加载真实学生列表
const loadStudents = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/students`, {
      headers: {
        'Authorization': `Bearer ${token.value}`
      }
    })
    
    if (response.ok) {
      const data = await response.json()
      if (data.status === 'success' && data.data.students) {
        students.value = data.data.students.map(s => ({
          id: s.user_id,
          studentId: s.id,
          name: s.name,
          grade: s.grade || '未设置',
          subject: '未设置',
          status: s.status || '活跃',
          school: s.school || '',
          address: s.address || ''
        }))
      }
    } else {
      console.error('获取学生列表失败，状态码:', response.status)
    }
  } catch (error) {
    console.error('获取学生列表失败:', error)
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

const students = ref([])

const filteredStudents = computed(() => {
  if (!searchQuery.value) return students.value
  const query = searchQuery.value.toLowerCase()
  return students.value.filter(s => 
    s.name.toLowerCase().includes(query) || 
    s.grade.toLowerCase().includes(query)
  )
})

const getStatusClass = (status) => {
  const classes = {
    '活跃': 'status-active',
    '待确认': 'status-pending',
    '未激活': 'status-inactive'
  }
  return classes[status] || ''
}

const handleSearch = () => {
  console.log('搜索:', searchQuery.value)
}

const handleChat = (student) => {
  router.push(`/teacher/chat?student=${student.id}`)
}

const handleConfirm = (student) => {
  alert(`确认学生 ${student.name} 的辅导请求`)
}

const handleActivate = (student) => {
  alert(`激活学生 ${student.name} 的账户`)
}

const handleDetail = (student) => {
  alert(`查看 ${student.name} 的详细信息`)
}

// 打开评价对话框
const openEvaluationDialog = async (student) => {
  currentStudent.value = student
  showEvaluationDialog.value = true
  
  // 尝试加载已有的评价
  try {
    const response = await fetch(`${API_BASE_URL}/teacher-evaluations/student/${student.studentId}/my-evaluation`, {
      headers: {
        'Authorization': `Bearer ${token.value}`
      }
    })
    
    if (response.ok) {
      const data = await response.json()
      if (data.data) {
        evaluationForm.value.score = data.data.score
        evaluationForm.value.comment = data.data.comment
        evaluationForm.value.subject = data.data.subject || '综合'
      } else {
        // 重置表单
        evaluationForm.value = {
          score: '',
          comment: '',
          subject: '综合'
        }
      }
    }
  } catch (error) {
    console.error('加载评价失败:', error)
  }
}

// 关闭评价对话框
const closeEvaluationDialog = () => {
  showEvaluationDialog.value = false
  currentStudent.value = null
  evaluationForm.value = {
    score: '',
    comment: '',
    subject: '综合'
  }
}

// 提交评价
const submitEvaluation = async () => {
  // 修复：分数为0时也会被判断为falsy，需要明确检查是否为null或undefined
  if (evaluationForm.value.score === null || evaluationForm.value.score === undefined || evaluationForm.value.score === '' || !evaluationForm.value.comment) {
    alert('请填写分数和评语')
    return
  }
  
  if (evaluationForm.value.score < 0 || evaluationForm.value.score > 100) {
    alert('分数必须在0-100之间')
    return
  }
  
  isSubmitting.value = true
  
  console.log('📤 提交评价数据:', {
    studentId: currentStudent.value.studentId,
    score: evaluationForm.value.score,
    comment: evaluationForm.value.comment,
    subject: evaluationForm.value.subject
  })
  
  try {
    const response = await fetch(`${API_BASE_URL}/teacher-evaluations`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token.value}`
      },
      body: JSON.stringify({
        studentId: currentStudent.value.studentId,
        score: evaluationForm.value.score,
        comment: evaluationForm.value.comment,
        subject: evaluationForm.value.subject
      })
    })
    
    const data = await response.json()
    
    if (response.ok && data.status === 'success') {
      alert('评价保存成功！')
      closeEvaluationDialog()
    } else {
      alert(data.message || '保存失败')
    }
  } catch (error) {
    console.error('保存评价失败:', error)
    alert('保存失败，请重试')
  } finally {
    isSubmitting.value = false
  }
}
</script>

<style scoped>
/* 强制全屏 - 覆盖全局样式 */
.teacher-student-management {
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

.teacher-student-management {
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

.search-box {
  background: white;
  padding: 24px;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.08);
  margin-bottom: 24px;
}

.search-form {
  display: flex;
  gap: 12px;
}

.search-form input {
  flex: 1;
  padding: 12px 16px;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  font-size: 15px;
  transition: border-color 0.3s ease;
}

.search-form input:focus {
  outline: none;
  border-color: #2196F3;
}

.search-form button {
  padding: 12px 32px;
  background: #2196F3;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 15px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
}

.search-form button:hover {
  background: #1976D2;
}

.student-table {
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.08);
  overflow: hidden;
  flex: 1;
}

table {
  width: 100%;
  border-collapse: collapse;
}

th, td {
  padding: 16px 20px;
  text-align: left;
  border-bottom: 1px solid #f0f0f0;
}

th {
  background: #fafafa;
  font-weight: 600;
  color: #333;
  font-size: 15px;
}

tr:hover {
  background: #fafafa;
}

.status-badge {
  padding: 6px 16px;
  border-radius: 20px;
  font-size: 13px;
  font-weight: 500;
  display: inline-block;
}

.status-active {
  background: #d4edda;
  color: #155724;
}

.status-pending {
  background: #fff3cd;
  color: #856404;
}

.status-inactive {
  background: #f8d7da;
  color: #721c24;
}

.btn {
  padding: 8px 20px;
  border: none;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  margin-right: 8px;
}

.btn-primary {
  background: #2196F3;
  color: white;
}

.btn-primary:hover {
  background: #1976D2;
}

.btn-secondary {
  background: #6c757d;
  color: white;
}

.btn-secondary:hover {
  background: #5a6268;
}

.btn-success {
  background: #28a745;
  color: white;
}

.btn-success:hover {
  background: #218838;
}

/* 模态框样式 */
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
  border-radius: 12px;
  width: 90%;
  max-width: 600px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
}

.modal-header {
  padding: 24px;
  border-bottom: 1px solid #e0e0e0;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.modal-header h3 {
  margin: 0;
  color: #2196F3;
  font-size: 20px;
}

.close-btn {
  background: none;
  border: none;
  font-size: 28px;
  cursor: pointer;
  color: #999;
  line-height: 1;
  padding: 0;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
  transition: all 0.3s ease;
}

.close-btn:hover {
  background: #f0f0f0;
  color: #333;
}

.modal-body {
  padding: 24px;
}

.form-group {
  margin-bottom: 20px;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  font-weight: 500;
  color: #333;
}

.form-group input,
.form-group textarea,
.form-group select {
  width: 100%;
  padding: 12px;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  font-size: 14px;
  transition: border-color 0.3s ease;
}

.form-group input:focus,
.form-group textarea:focus,
.form-group select:focus {
  outline: none;
  border-color: #2196F3;
}

.form-group textarea {
  resize: vertical;
  font-family: inherit;
}

.modal-footer {
  padding: 20px 24px;
  border-top: 1px solid #e0e0e0;
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

@media (max-width: 768px) {
  .teacher-student-management {
    flex-direction: column;
    height: auto;
  }
  
  .sidebar {
    width: 100%;
    padding: 20px;
  }
  
  .nav-menu {
    display: flex;
    overflow-x: auto;
    gap: 10px;
  }
  
  .nav-menu li {
    margin-bottom: 0;
  }
  
  .main-content {
    padding: 20px;
  }
  
  .search-form {
    flex-direction: column;
  }
  
  table {
    font-size: 14px;
  }
  
  th, td {
    padding: 12px;
  }
}
</style>
