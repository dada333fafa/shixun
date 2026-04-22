<template>
  <div class="teacher-layout teacher-ai-match">
    <aside class="sidebar">
      <h2>教师中心</h2>
      <ul class="nav-menu">
        <li><router-link to="/teacher/dashboard">仪表盘</router-link></li>
        <li><router-link to="/teacher/students">学生管理</router-link></li>
        <li><router-link to="/teacher/chat">聊天沟通</router-link></li>
        <li><router-link to="/teacher/resources">教学资源</router-link></li>
        <li><router-link to="/teacher/psychological">心理辅导</router-link></li>
        <li><router-link to="/teacher/ai-match" class="active">AI匹配</router-link></li>
        <li><router-link to="/teacher/match-management">匹配管理</router-link></li>
        <li><router-link to="/login">退出登录</router-link></li>
      </ul>
    </aside>
    
    <main class="main-content">
      <div class="header">
        <h1>AI智能匹配</h1>
        <div class="user-info">
          <span>{{ welcomeText }}</span>
          <div class="user-avatar">{{ userInitial }}</div>
        </div>
      </div>
      
      <div class="ai-section">
        <h2>
          <img src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%232196F3'%3E%3Cpath d='M9.4 16.6L4.8 12l4.6-4.6L8 6l-6 6 6 6 1.4-1.4zm5.2 0l4.6-4.6-4.6-4.6L16 6l6 6-6 6-1.4-1.4z'/%3E%3C/svg%3E" alt="AI匹配">
          智能匹配设置
        </h2>
        <form class="ai-form" @submit.prevent="generateRecommendations">
          <div class="form-group">
            <label for="subject">教授科目</label>
            <select id="subject" v-model="form.subject">
              <option value="math">数学</option>
              <option value="chinese">语文</option>
              <option value="english">英语</option>
              <option value="physics">物理</option>
              <option value="chemistry">化学</option>
            </select>
          </div>
          <div class="form-group">
            <label for="grade">目标年级</label>
            <select id="grade" v-model="form.grade">
              <option value="1">一年级</option>
              <option value="2">二年级</option>
              <option value="3">三年级</option>
              <option value="4">四年级</option>
              <option value="5">五年级</option>
              <option value="6">六年级</option>
            </select>
          </div>
          <div class="form-group">
            <label for="experience">教学经验</label>
            <select id="experience" v-model="form.experience">
              <option value="1">1年以下</option>
              <option value="2">1-3年</option>
              <option value="3">3-5年</option>
              <option value="4">5年以上</option>
            </select>
          </div>
          <div class="form-group">
            <label for="availability">可辅导时间</label>
            <input 
              type="text" 
              id="availability" 
              v-model="form.availability"
              placeholder="例如:周末上午"
            >
          </div>
        </form>
        <button class="btn-ai" @click="generateRecommendations">生成推荐</button>
        
        <div class="recommendations" v-if="recommendations.length > 0">
          <h3>推荐学生</h3>
          <div 
            v-for="student in recommendations" 
            :key="student.id"
            class="student-card"
          >
            <div class="student-avatar">{{ student.name[0] }}</div>
            <div class="student-info">
              <div class="student-name">{{ student.name }}</div>
              <div class="student-details">
                {{ student.grade }} | {{ student.subject }} | {{ student.performance }}
              </div>
              <div class="match-score">匹配度:{{ student.matchScore }}%</div>
            </div>
            <button class="btn btn-primary" @click="inviteStudent(student)">邀请</button>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'

// 从 localStorage 获取用户信息
const userInfo = ref(null)

onMounted(() => {
  const userStr = localStorage.getItem('user')
  if (userStr) {
    userInfo.value = JSON.parse(userStr)
  }
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

const form = reactive({
  subject: 'math',
  grade: '3',
  experience: '2',
  availability: ''
})

const recommendations = ref([])

const generateRecommendations = async () => {
  // 模拟AI匹配过程
  alert('正在生成推荐,请稍候...')
  
  setTimeout(() => {
    recommendations.value = [
      {
        id: 1,
        name: '小明',
        grade: '三年级',
        subject: '数学',
        performance: '学习成绩中等',
        matchScore: 95
      },
      {
        id: 2,
        name: '小红',
        grade: '四年级',
        subject: '数学',
        performance: '学习成绩优秀',
        matchScore: 90
      },
      {
        id: 3,
        name: '小刚',
        grade: '五年级',
        subject: '数学',
        performance: '学习成绩待提高',
        matchScore: 85
      }
    ]
    alert('推荐生成完成!')
  }, 1500)
}

const inviteStudent = (student) => {
  alert(`邀请 ${student.name} 进行辅导`)
}
</script>

<style scoped>
/* 强制全屏 - 覆盖全局样式 */
.teacher-ai-match {
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

.teacher-ai-match {
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

.ai-section {
  background: white;
  padding: 30px;
  border-radius: 10px;
  box-shadow: 0 4px 6px rgba(0,0,0,0.05);
  margin-bottom: 30px;
}

.ai-section h2 {
  color: #2196F3;
  margin-bottom: 20px;
  font-size: 1.5em;
  display: flex;
  align-items: center;
  gap: 10px;
}

.ai-section h2 img {
  width: 24px;
  height: 24px;
}

.ai-form {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 20px;
  margin-bottom: 30px;
}

.form-group {
  display: flex;
  flex-direction: column;
}

.form-group label {
  margin-bottom: 5px;
  font-weight: bold;
  color: #555;
}

.form-group select,
.form-group input {
  padding: 12px;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  font-size: 1em;
  transition: all 0.3s ease;
}

.form-group select:focus,
.form-group input:focus {
  outline: none;
  border-color: #2196F3;
  box-shadow: 0 0 0 3px rgba(33, 150, 243, 0.1);
}

.btn-ai {
  padding: 15px 30px;
  background: linear-gradient(135deg, #2196F3, #1976D2);
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 1.1em;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.3s ease;
  margin-top: 20px;
}

.btn-ai:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 10px rgba(33, 150, 243, 0.3);
}

.recommendations {
  background: #f9f9f9;
  padding: 20px;
  border-radius: 10px;
  margin-top: 30px;
}

.recommendations h3 {
  color: #2196F3;
  margin-bottom: 20px;
}

.student-card {
  background: white;
  padding: 20px;
  border-radius: 10px;
  box-shadow: 0 2px 5px rgba(0,0,0,0.05);
  margin-bottom: 15px;
  display: flex;
  align-items: center;
  gap: 20px;
}

.student-avatar {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  background: #E3F2FD;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #2196F3;
  font-weight: bold;
  font-size: 1.5em;
}

.student-info {
  flex: 1;
}

.student-name {
  font-weight: bold;
  font-size: 1.1em;
  margin-bottom: 5px;
}

.student-details {
  font-size: 0.9em;
  color: #666;
  margin-bottom: 10px;
}

.match-score {
  font-size: 0.9em;
  color: #2196F3;
  font-weight: bold;
}

.btn {
  padding: 8px 16px;
  border: none;
  border-radius: 5px;
  font-size: 14px;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.3s ease;
  margin-right: 5px;
}

.btn-primary {
  background: #2196F3;
  color: white;
}

.btn-primary:hover {
  background: #1976D2;
}

@media (max-width: 768px) {
  .teacher-ai-match {
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
  
  .ai-form {
    grid-template-columns: 1fr;
  }
  
  .student-card {
    flex-direction: column;
    text-align: center;
  }
}
</style>
