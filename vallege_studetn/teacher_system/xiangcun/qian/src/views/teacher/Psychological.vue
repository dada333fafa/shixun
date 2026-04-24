<template>
  <div class="teacher-psychological">
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
        <img src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%23667eea'%3E%3Cpath d='M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-5.5-2.5l7.51-3.49L17.5 6.5 9.99 9.99 6.5 17.5zm5.5-6.6c.61 0 1.1.49 1.1 1.1s-.49 1.1-1.1 1.1-1.1-.49-1.1-1.1.49-1.1 1.1-1.1z'/%3E%3C/svg%3E" alt="心理支持">
        心理支持服务
      </h2>
      <div class="counselor-grid">
        <div 
          v-for="counselor in counselors" 
          :key="counselor._id || counselor.id"
          class="counselor-card"
        >
          <div class="counselor-avatar">{{ counselor.name[0] }}</div>
          <div class="counselor-info">
            <h3>{{ counselor.name }}</h3>
            <p>{{ counselor.title }}</p>
            <div class="counselor-specialty">
              <span 
                v-for="specialty in counselor.specialties" 
                :key="specialty"
                class="specialty-tag"
              >
                {{ specialty }}
              </span>
            </div>
            <div class="counselor-actions">
              <button class="action-btn primary" @click="contactCounselor(counselor)">联系</button>
              <button class="action-btn" @click="viewCounselorDetail(counselor)">查看详情</button>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <div class="section">
      <h2>
        <img src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%23667eea'%3E%3Cpath d='M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z'/%3E%3C/svg%3E" alt="学生心理状态">
        学生心理状态
      </h2>
      <div class="student-list">
        <h3>需要心理支持的学生</h3>
        <table class="student-table">
          <thead>
            <tr>
              <th>学生姓名</th>
              <th>年级</th>
              <th>心理状态</th>
              <th>需求描述</th>
              <th>状态</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="student in students" :key="student.id">
              <td>{{ student.name }}</td>
              <td>{{ student.grade }}</td>
              <td>{{ student.condition }}</td>
              <td>{{ student.description }}</td>
              <td>
                <span class="status-badge" :class="student.status">
                  {{ getStatusText(student.status) }}
                </span>
              </td>
              <td>
                <button 
                  class="action-btn primary" 
                  @click="handleStudentAction(student)"
                >
                  {{ getActionText(student.status) }}
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
    
    <!-- 心理师详情弹窗 -->
    <div class="modal-overlay" v-if="showDetailModal" @click="closeDetailModal">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h3>心理师详情</h3>
          <button class="close-btn" @click="closeDetailModal">&times;</button>
        </div>
        <div class="modal-body" v-if="selectedCounselor">
          <div class="counselor-detail-header">
            <div class="counselor-large-avatar">{{ selectedCounselor.name[0] }}</div>
            <div class="counselor-basic-info">
              <h2>{{ selectedCounselor.name }}</h2>
              <p class="title">{{ selectedCounselor.title }}</p>
            </div>
          </div>
          <div class="detail-section">
            <h4>专业领域</h4>
            <div class="specialty-list">
              <span 
                v-for="specialty in selectedCounselor.specialties" 
                :key="specialty"
                class="specialty-tag"
              >
                {{ specialty }}
              </span>
            </div>
          </div>
          <div class="detail-section">
            <h4>个人简介</h4>
            <p>{{ selectedCounselor.bio }}</p>
          </div>
          <div class="detail-section">
            <h4>工作经验</h4>
            <p>{{ selectedCounselor.experience }}</p>
          </div>
          <div class="detail-section">
            <h4>联系方式</h4>
            <p>📧 邮箱：{{ selectedCounselor.email }}</p>
            <p>📱 电话：{{ selectedCounselor.phone }}</p>
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn btn-cancel" @click="closeDetailModal">关闭</button>
          <button class="btn btn-primary" @click="contactFromDetail">立即联系</button>
        </div>
      </div>
    </div>
    
    <!-- 联系心理师弹窗 -->
    <div class="modal-overlay" v-if="showContactModal" @click="closeContactModal">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h3>联系 {{ selectedCounselor?.name }}</h3>
          <button class="close-btn" @click="closeContactModal">&times;</button>
        </div>
        <div class="modal-body">
          <div class="contact-form">
            <div class="form-group">
              <label>咨询主题</label>
              <input 
                type="text" 
                v-model="contactForm.subject"
                placeholder="请输入咨询主题"
                class="form-input"
              >
            </div>
            <div class="form-group">
              <label>咨询内容</label>
              <textarea 
                v-model="contactForm.message"
                placeholder="请描述您需要咨询的问题..."
                class="form-textarea"
                rows="5"
              ></textarea>
            </div>
            <div class="form-group">
              <label>紧急程度</label>
              <select v-model="contactForm.urgency" class="form-input">
                <option value="normal">一般</option>
                <option value="urgent">紧急</option>
                <option value="very-urgent">非常紧急</option>
              </select>
            </div>
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn btn-cancel" @click="closeContactModal">取消</button>
          <button class="btn btn-primary" @click="submitContact">发送消息</button>
        </div>
      </div>
    </div>
    
    <!-- 学生咨询详情弹窗 -->
    <div class="modal-overlay" v-if="showStudentModal" @click="closeStudentModal">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h3>{{ studentModalTitle }}</h3>
          <button class="close-btn" @click="closeStudentModal">&times;</button>
        </div>
        <div class="modal-body" v-if="selectedStudent">
          <div class="student-info-section">
            <h4>学生信息</h4>
            <p><strong>姓名：</strong>{{ selectedStudent.name }}</p>
            <p><strong>年级：</strong>{{ selectedStudent.grade }}</p>
            <p><strong>心理状态：</strong>{{ selectedStudent.condition }}</p>
            <p><strong>需求描述：</strong>{{ selectedStudent.description }}</p>
          </div>
          <div class="student-info-section" v-if="studentActionType === 'schedule'">
            <h4>安排心理咨询</h4>
            <div class="form-group">
              <label>选择心理师</label>
              <select v-model="scheduleForm.counselorId" class="form-input">
                <option value="">请选择心理师</option>
                <option v-for="c in counselors" :key="c.id" :value="c.id">
                  {{ c.name }} - {{ c.title }}
                </option>
              </select>
            </div>
            <div class="form-group">
              <label>咨询时间</label>
              <input type="datetime-local" v-model="scheduleForm.time" class="form-input">
            </div>
            <div class="form-group">
              <label>咨询方式</label>
              <select v-model="scheduleForm.method" class="form-input">
                <option value="video">视频咨询</option>
                <option value="voice">语音咨询</option>
                <option value="text">文字咨询</option>
              </select>
            </div>
            <div class="form-group">
              <label>备注说明</label>
              <textarea v-model="scheduleForm.notes" class="form-textarea" rows="3"></textarea>
            </div>
          </div>
          <div class="student-info-section" v-if="studentActionType === 'progress'">
            <h4>咨询进度</h4>
            <div class="progress-timeline">
              <div class="timeline-item">
                <div class="timeline-dot"></div>
                <div class="timeline-content">
                  <p><strong>初次咨询</strong></p>
                  <p class="time">2024-04-15 14:00</p>
                  <p>已安排张心理师进行初次咨询</p>
                </div>
              </div>
              <div class="timeline-item">
                <div class="timeline-dot"></div>
                <div class="timeline-content">
                  <p><strong>跟进咨询</strong></p>
                  <p class="time">2024-04-22 14:00</p>
                  <p>待进行第二次跟进咨询</p>
                </div>
              </div>
            </div>
          </div>
          <div class="student-info-section" v-if="studentActionType === 'records'">
            <h4>咨询记录</h4>
            <div class="record-item">
              <p><strong>咨询日期：</strong>2024-04-10</p>
              <p><strong>心理师：</strong>李心理师</p>
              <p><strong>咨询内容：</strong>情绪管理指导，教授深呼吸和放松技巧</p>
              <p><strong>咨询结果：</strong>学生情绪有所缓解，建议继续跟进</p>
            </div>
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn btn-cancel" @click="closeStudentModal">关闭</button>
          <button 
            v-if="studentActionType === 'schedule'" 
            class="btn btn-primary" 
            @click="submitSchedule"
          >
            确认安排
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { counselorAPI } from '../../api'

const router = useRouter()
const API_BASE_URL = '/api/v1'

// 从 localStorage 获取用户信息
const userInfo = ref(null)
const token = ref('')

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

// 心理咨询师列表
const counselors = ref([
  {
    id: 1,
    name: '张医生',
    title: '资深心理咨询师',
    specialties: ['焦虑症', '抑郁症', '青少年心理'],
    bio: '擅长青少年心理健康咨询，有15年临床经验。',
    experience: '15年心理咨询经验',
    email: 'zhang.counselor@example.com',
    phone: '13800001234'
  },
  {
    id: 2,
    name: '李医生',
    title: '青少年心理专家',
    specialties: ['学习压力', '人际关系', '自信心建设'],
    bio: '专注于青少年学习压力疏导和人际关系改善。',
    experience: '10年青少年心理辅导经验',
    email: 'li.counselor@example.com',
    phone: '13900005678'
  },
  {
    id: 3,
    name: '王医生',
    title: '心理健康教育师',
    specialties: ['情绪管理', '心理危机干预', '家庭教育'],
    bio: '长期从事学校心理健康教育工作，擅长情绪管理和心理危机干预。',
    experience: '8年学校心理辅导经验',
    email: 'wang.counselor@example.com',
    phone: '13700009012'
  }
])

const students = ref([])

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
        const psychologicalConditions = ['情绪低落', '焦虑', '孤独感', '学习压力大', '注意力不集中', '自卑']
        const descriptions = [
          '最近学习压力大,情绪不稳定',
          '对考试感到焦虑,影响睡眠',
          '父母外出打工,感到孤独',
          '作业完成困难,经常发呆',
          '上课走神,无法集中注意力',
          '觉得自己不如别人,缺乏自信'
        ]
        const statuses = ['pending', 'active', 'completed']
        
        students.value = data.data.students.map((s, index) => ({
          id: s.user_id || s.id,
          name: s.name,
          grade: s.grade || '五年级',
          condition: psychologicalConditions[index % psychologicalConditions.length],
          description: descriptions[index % descriptions.length],
          status: statuses[index % statuses.length]
        }))
      }
    }
  } catch (error) {
    console.error('获取学生列表失败:', error)
  }
}

// 模态框状态
const showDetailModal = ref(false)
const showContactModal = ref(false)
const showStudentModal = ref(false)
const selectedCounselor = ref(null)
const selectedStudent = ref(null)
const studentActionType = ref('') // schedule, progress, records

const studentModalTitle = computed(() => {
  const titles = {
    schedule: '安排心理咨询',
    progress: '咨询进度',
    records: '咨询记录'
  }
  return titles[studentActionType.value] || '学生详情'
})

const getStatusText = (status) => {
  const texts = {
    pending: '待处理',
    active: '进行中',
    completed: '已完成'
  }
  return texts[status] || status
}

const getActionText = (status) => {
  const texts = {
    pending: '安排咨询',
    active: '查看进度',
    completed: '查看记录'
  }
  return texts[status] || '查看'
}

const contactForm = ref({
  subject: '',
  message: '',
  urgency: 'normal'
})

const scheduleForm = ref({
  counselorId: '',
  time: '',
  method: 'video',
  notes: ''
})

const contactCounselor = (counselor) => {
  selectedCounselor.value = counselor
  showContactModal.value = true
  contactForm.value = {
    subject: '',
    message: '',
    urgency: 'normal'
  }
}

const viewCounselorDetail = (counselor) => {
  selectedCounselor.value = counselor
  showDetailModal.value = true
}

const closeDetailModal = () => {
  showDetailModal.value = false
  selectedCounselor.value = null
}

const closeContactModal = () => {
  showContactModal.value = false
  selectedCounselor.value = null
}

const contactFromDetail = () => {
  closeDetailModal()
  setTimeout(() => {
    contactCounselor(selectedCounselor.value)
  }, 100)
}

const submitContact = async () => {
  if (!contactForm.value.subject) {
    alert('请输入咨询主题')
    return
  }
  if (!contactForm.value.message) {
    alert('请输入咨询内容')
    return
  }
  
  try {
    // TODO: 调用后端API发送消息
    console.log('发送消息:', {
      counselorId: selectedCounselor.value.id,
      ...contactForm.value
    })
    
    alert('消息发送成功！心理师会尽快回复您。')
    closeContactModal()
  } catch (error) {
    alert('发送失败，请稍后重试')
    console.error('发送消息错误:', error)
  }
}

const handleStudentAction = (student) => {
  selectedStudent.value = student
  showStudentModal.value = true
  
  if (student.status === 'pending') {
    studentActionType.value = 'schedule'
    scheduleForm.value = {
      counselorId: '',
      time: '',
      method: 'video',
      notes: ''
    }
  } else if (student.status === 'active') {
    studentActionType.value = 'progress'
  } else if (student.status === 'completed') {
    studentActionType.value = 'records'
  }
}

const closeStudentModal = () => {
  showStudentModal.value = false
  selectedStudent.value = null
}

const submitSchedule = async () => {
  if (!scheduleForm.value.counselorId) {
    alert('请选择心理师')
    return
  }
  if (!scheduleForm.value.time) {
    alert('请选择咨询时间')
    return
  }
  
  try {
    const selectedCounselor = counselors.value.find(c => c.id === scheduleForm.value.counselorId)
    
    const response = await fetch(`${API_BASE_URL}/psychological-schedules`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token.value}`
      },
      body: JSON.stringify({
        studentId: selectedStudent.value.id,
        counselorId: scheduleForm.value.counselorId,
        counselorName: selectedCounselor.name,
        counselorTitle: selectedCounselor.title,
        counselorContact: selectedCounselor.phone || selectedCounselor.contact,
        counselorPhone: selectedCounselor.phone || '',
        counselorEmail: selectedCounselor.email || '',
        counselorSpecialties: selectedCounselor.specialties || [],
        counselorBio: selectedCounselor.bio || '',
        scheduleTime: scheduleForm.value.time,
        method: scheduleForm.value.method,
        notes: scheduleForm.value.notes,
        studentCondition: selectedStudent.value.condition,
        studentDescription: selectedStudent.value.description
      })
    })
    
    const data = await response.json()
    
    if (response.ok && data.status === 'success') {
      // 更新学生状态为进行中
      const student = students.value.find(s => s.id === selectedStudent.value.id)
      if (student) {
        student.status = 'active'
      }
      
      alert('咨询安排成功！学生已收到通知。')
      closeStudentModal()
    } else {
      alert('安排失败: ' + (data.message || '未知错误'))
    }
  } catch (error) {
    alert('安排失败，请稍后重试')
    console.error('安排咨询错误:', error)
  }
}

onMounted(async () => {
  const userStr = localStorage.getItem('user')
  if (userStr) {
    userInfo.value = JSON.parse(userStr)
  }
  
  // 从 localStorage 单独获取 token
  token.value = localStorage.getItem('token') || ''
  
  await loadStudents()
})

// 退出登录
const handleLogout = () => {
  localStorage.removeItem('token')
  localStorage.removeItem('user')
  console.log('👋 已退出登录')
  router.push('/login')
}
</script>

<style scoped>
.teacher-psychological {
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

.counselor-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
}

.counselor-card {
  background: #f9f9f9;
  border-radius: 10px;
  padding: 20px;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  border: 1px solid #e0e0e0;
}

.counselor-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 20px rgba(0,0,0,0.1);
}

.counselor-avatar {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 20px;
  color: white;
  font-weight: bold;
  font-size: 24px;
}

.counselor-info h3 {
  color: #333;
  margin-bottom: 10px;
  text-align: center;
}

.counselor-info p {
  color: #666;
  margin-bottom: 15px;
  text-align: center;
  font-size: 14px;
}

.counselor-specialty {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  justify-content: center;
  margin-bottom: 15px;
}

.specialty-tag {
  padding: 5px 12px;
  background: #e3f2fd;
  color: #1976d2;
  border-radius: 15px;
  font-size: 12px;
}

.counselor-actions {
  display: flex;
  gap: 10px;
  justify-content: center;
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

.action-btn.primary {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border-color: #667eea;
}

.action-btn.primary:hover {
  background: linear-gradient(135deg, #5a6fd8 0%, #6a4393 100%);
}

.student-list {
  margin-top: 30px;
}

.student-list h3 {
  color: #333;
  margin-bottom: 20px;
}

.student-table {
  width: 100%;
  border-collapse: collapse;
  background: white;
  border-radius: 10px;
  overflow: hidden;
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
}

.student-table th,
.student-table td {
  padding: 15px;
  text-align: left;
  border-bottom: 1px solid #e0e0e0;
}

.student-table th {
  background: #f9f9f9;
  font-weight: bold;
  color: #333;
}

.student-table tr:hover {
  background: #f5f5f5;
}

.status-badge {
  padding: 5px 12px;
  border-radius: 15px;
  font-size: 12px;
  font-weight: bold;
}

.status-badge.pending {
  background: #fff3cd;
  color: #856404;
}

.status-badge.active {
  background: #d4edda;
  color: #155724;
}

.status-badge.completed {
  background: #e2e3e5;
  color: #383d41;
}

/* 模态框样式 */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 20px;
}

.modal-content {
  background: white;
  border-radius: 15px;
  width: 100%;
  max-width: 700px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  animation: slideIn 0.3s ease;
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateY(-20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 24px;
  border-bottom: 1px solid #e0e0e0;
}

.modal-header h3 {
  color: #333;
  margin: 0;
  font-size: 1.3em;
}

.close-btn {
  background: none;
  border: none;
  font-size: 28px;
  color: #999;
  cursor: pointer;
  padding: 0;
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  transition: all 0.3s ease;
}

.close-btn:hover {
  background: #f5f5f5;
  color: #333;
}

.modal-body {
  padding: 24px;
}

.modal-footer {
  padding: 16px 24px;
  border-top: 1px solid #e0e0e0;
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

.btn {
  padding: 10px 24px;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-cancel {
  background: #f5f5f5;
  color: #666;
}

.btn-cancel:hover {
  background: #e0e0e0;
}

.btn-primary {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
}

/* 心理师详情样式 */
.counselor-detail-header {
  display: flex;
  align-items: center;
  gap: 20px;
  margin-bottom: 24px;
  padding-bottom: 20px;
  border-bottom: 1px solid #e0e0e0;
}

.counselor-large-avatar {
  width: 100px;
  height: 100px;
  border-radius: 50%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 40px;
  font-weight: bold;
  flex-shrink: 0;
}

.counselor-basic-info h2 {
  color: #333;
  margin: 0 0 8px 0;
  font-size: 1.5em;
}

.counselor-basic-info .title {
  color: #666;
  margin: 0;
  font-size: 14px;
}

.detail-section {
  margin-bottom: 20px;
}

.detail-section h4 {
  color: #333;
  margin: 0 0 12px 0;
  font-size: 1em;
  font-weight: 600;
}

.detail-section p {
  color: #666;
  line-height: 1.8;
  margin: 0 0 8px 0;
}

.specialty-list {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

/* 联系表单样式 */
.contact-form {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.form-group label {
  font-weight: 600;
  color: #333;
  font-size: 14px;
}

.form-input,
.form-textarea {
  padding: 10px 14px;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  font-size: 14px;
  font-family: inherit;
  transition: all 0.3s ease;
}

.form-input:focus,
.form-textarea:focus {
  outline: none;
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.form-textarea {
  resize: vertical;
  min-height: 80px;
}

/* 学生信息样式 */
.student-info-section {
  margin-bottom: 24px;
}

.student-info-section h4 {
  color: #333;
  margin: 0 0 12px 0;
  padding-bottom: 8px;
  border-bottom: 2px solid #667eea;
  font-size: 1em;
}

.student-info-section p {
  color: #666;
  margin: 0 0 8px 0;
  line-height: 1.6;
}

.student-info-section strong {
  color: #333;
}

/* 时间线样式 */
.progress-timeline {
  padding-left: 20px;
}

.timeline-item {
  position: relative;
  padding-left: 30px;
  padding-bottom: 24px;
  border-left: 2px solid #e0e0e0;
}

.timeline-item:last-child {
  padding-bottom: 0;
}

.timeline-dot {
  position: absolute;
  left: -7px;
  top: 4px;
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: #667eea;
  border: 2px solid white;
  box-shadow: 0 0 0 2px #667eea;
}

.timeline-content {
  background: #f9f9f9;
  padding: 12px 16px;
  border-radius: 8px;
}

.timeline-content p {
  margin: 4px 0;
}

.timeline-content .time {
  color: #999;
  font-size: 12px;
}

/* 咨询记录样式 */
.record-item {
  background: #f9f9f9;
  padding: 16px;
  border-radius: 8px;
  border-left: 4px solid #667eea;
}

.record-item p {
  margin: 6px 0;
  line-height: 1.6;
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
  
  .counselor-grid {
    grid-template-columns: 1fr;
  }
  
  .student-table {
    font-size: 14px;
  }
  
  .student-table th,
  .student-table td {
    padding: 10px;
  }
}
</style>
