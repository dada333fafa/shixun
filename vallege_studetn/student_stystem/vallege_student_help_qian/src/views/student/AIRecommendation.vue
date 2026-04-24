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
        <router-link to="/student/ai-recommendation" class="active">AI推荐</router-link>
        <router-link to="/student/match">匹配管理</router-link>
        <router-link to="/student/parent-requests">家长请求</router-link>
        <a href="#" @click.prevent="handleLogout">退出登录</a>
      </nav>
    </aside>

    <!-- 主内容区 -->
    <main class="main-content">
      <header class="header">
        <h1>AI智能推荐</h1>
        <div class="user-info">
          <span>欢迎，{{ currentUser?.name || currentUser?.username }}</span>
          <div class="user-avatar">{{ (currentUser?.name || currentUser?.username || '用').charAt(0) }}</div>
        </div>
      </header>

      <!-- AI智能匹配 -->
      <section class="recommendation-section">
        <h2>🤖 AI智能教师匹配</h2>
        <p>输入您的学习信息，AI系统将为您智能匹配最适合的辅导老师。</p>
        
        <div class="match-form">
          <div class="form-group">
            <label for="grade">年级</label>
            <select id="grade" v-model="matchForm.grade">
              <option value="">请选择年级</option>
              <option value="一年级">一年级</option>
              <option value="二年级">二年级</option>
              <option value="三年级">三年级</option>
              <option value="四年级">四年级</option>
              <option value="五年级">五年级</option>
              <option value="六年级">六年级</option>
              <option value="初一">初一</option>
              <option value="初二">初二</option>
              <option value="初三">初三</option>
            </select>
          </div>
          
          <div class="form-group">
            <label for="learningNeeds">学习需求</label>
            <textarea 
              id="learningNeeds" 
              v-model="matchForm.learningNeeds"
              placeholder="请描述您的学习需求，例如：数学基础薄弱、需要提高英语成绩等"
              rows="4"
            ></textarea>
          </div>
          
          <div class="form-group">
            <label for="teacherPersonality">期望教师性格（选填）</label>
            <textarea 
              id="teacherPersonality" 
              v-model="matchForm.teacherPersonality"
              placeholder="请描述您期望的教师性格，例如：耐心细致、幽默风趣、严格认真、温和亲切等"
              rows="3"
            ></textarea>
          </div>
          
          <button class="btn-generate" @click="generateMatch" :disabled="loading || !isFormValid">
            {{ loading ? '匹配中...' : '✨ 开始AI匹配' }}
          </button>
        </div>
      </section>

      <!-- 匹配结果 -->
      <section v-if="matchedTeachers.length > 0" class="recommendation-section">
        <h2>📋 为您推荐的老师</h2>
        
        <div class="recommendations-list">
          <div 
            v-for="(teacher, index) in matchedTeachers" 
            :key="index"
            class="recommendation-card"
          >
            <div class="rec-header">
              <div class="rec-icon">👨‍🏫</div>
              <div class="rec-info">
                <h3>{{ teacher.name }}</h3>
                <div class="rec-type">{{ teacher.subject }}</div>
              </div>
              <div class="match-score">匹配度: {{ teacher.matchScore }}%</div>
            </div>
            
            <div class="rec-content">
              <p><strong>教育背景：</strong>{{ teacher.education }}</p>
              <p><strong>教学经验：</strong>{{ teacher.experience }}</p>
              <p><strong>教师评分：</strong>{{ teacher.rating }}/5.0</p>
              
              <div v-if="teacher.reason" class="rec-reason">
                <strong>推荐理由：</strong>{{ teacher.reason }}
              </div>
            </div>
            
            <div class="rec-actions">
              <button class="btn-action" @click="requestTutoring(teacher)">
                申请辅导
              </button>
            </div>
          </div>
        </div>
      </section>

      <!-- 暂无匹配结果提示 -->
      <section v-if="!loading && matchedTeachers.length === 0 && hasSearched" class="empty-state">
        <div class="empty-icon">😕</div>
        <div class="empty-text">未找到合适的老师</div>
        <div class="empty-hint">请尝试调整您的学习需求，或联系管理员获取更多帮助</div>
      </section>
      
      <section v-if="!loading && !hasSearched" class="empty-state">
        <div class="empty-icon">🤖</div>
        <div class="empty-text">还没有进行AI匹配</div>
        <div class="empty-hint">填写上方表单，让AI为您匹配最适合的老师</div>
      </section>
    </main>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { getCurrentUser } from '@/utils/api'

const router = useRouter()
const currentUser = ref(null)
const loading = ref(false)
const hasSearched = ref(false)
const matchedTeachers = ref([])

// 匹配表单
const matchForm = ref({
  grade: '',
  learningNeeds: '',
  teacherPersonality: ''
})

// 计算表单是否有效
const isFormValid = computed(() => {
  return matchForm.value.grade && matchForm.value.learningNeeds.trim()
})

onMounted(async () => {
  try {
    currentUser.value = await getCurrentUser()
  } catch (error) {
    console.error('初始化失败:', error)
    alert('加载页面失败，请重新登录')
    router.push('/login')
  }
})

async function generateMatch() {
  if (!isFormValid.value) {
    alert('请填写完整的年级和学习需求')
    return
  }
  
  try {
    loading.value = true
    hasSearched.value = true
    
    // 调用后端AI匹配API
    // 学生端 token 是单独保存的
    const token = localStorage.getItem('token');
    
    if (!token) {
      alert('请先登录');
      return;
    }
    
    const response = await fetch('http://localhost:3000/api/v1/ai/match-student', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-auth-token': token
      },
      body: JSON.stringify({
        grade: matchForm.value.grade,
        learningNeeds: matchForm.value.learningNeeds,
        teacherPersonality: matchForm.value.teacherPersonality
      })
    })
    
    if (!response.ok) {
      throw new Error('匹配失败')
    }
    
    const data = await response.json()
    
    if (data.success && data.matchedTeachers) {
      matchedTeachers.value = data.matchedTeachers
      if (matchedTeachers.value.length === 0) {
        alert('未找到合适的老师，请尝试调整您的需求')
      } else {
        alert(`找到 ${matchedTeachers.value.length} 位合适的老师！`)
      }
    } else {
      throw new Error(data.message || '匹配失败')
    }
  } catch (error) {
    console.error('AI匹配失败:', error)
    alert('匹配失败: ' + error.message)
  } finally {
    loading.value = false
  }
}

async function requestTutoring(teacher) {
  try {
    const response = await fetch('http://localhost:3000/api/matches/request', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-auth-token': localStorage.getItem('token')
      },
      body: JSON.stringify({
        teacherId: teacher.id,
        message: `您好，我对您的${teacher.subject}教学很感兴趣，希望能得到您的辅导。`
      })
    })
    
    if (!response.ok) {
      throw new Error('申请失败')
    }
    
    const data = await response.json()
    alert('辅导申请已发送，等待教师确认')
    
    // 跳转到匹配管理页面
    router.push('/student/match')
  } catch (error) {
    console.error('申请辅导失败:', error)
    alert('申请失败: ' + error.message)
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

.recommendation-section {
  background: white;
  padding: 25px;
  border-radius: 10px;
  box-shadow: 0 4px 6px rgba(0,0,0,0.05);
  margin-bottom: 20px;
}

.recommendation-section h2 {
  color: #4CAF50;
  margin-bottom: 20px;
  font-size: 1.5em;
}

.recommendation-section p {
  line-height: 1.6;
  margin-bottom: 20px;
}

.match-form {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.form-group label {
  font-weight: bold;
  color: #333;
  font-size: 1em;
}

.form-group select,
.form-group textarea {
  padding: 12px;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  font-size: 1em;
  font-family: inherit;
  transition: all 0.3s ease;
}

.form-group select:focus,
.form-group textarea:focus {
  outline: none;
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.form-group textarea {
  resize: vertical;
  min-height: 100px;
}

.btn-generate {
  width: 100%;
  padding: 15px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 1.1em;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-generate:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 4px 10px rgba(102, 126, 234, 0.4);
}

.btn-generate:disabled {
  background: #cccccc;
  cursor: not-allowed;
}

.recommendations-list {
  display: grid;
  gap: 20px;
}

.recommendation-card {
  background: #f9f9f9;
  padding: 20px;
  border-radius: 10px;
  border-left: 4px solid #667eea;
  transition: all 0.3s ease;
}

.recommendation-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 6px 12px rgba(0,0,0,0.1);
}

.rec-header {
  display: flex;
  align-items: center;
  gap: 15px;
  margin-bottom: 15px;
  position: relative;
}

.rec-icon {
  font-size: 2.5em;
}

.rec-info h3 {
  color: #667eea;
  margin-bottom: 5px;
}

.rec-type {
  font-size: 0.8em;
  color: #666;
  background: #e8eaf6;
  display: inline-block;
  padding: 2px 8px;
  border-radius: 10px;
}

.match-score {
  position: absolute;
  right: 0;
  top: 50%;
  transform: translateY(-50%);
  background: linear-gradient(135deg, #667eea, #764ba2);
  color: white;
  padding: 8px 15px;
  border-radius: 20px;
  font-weight: bold;
  font-size: 0.9em;
}

.rec-content {
  margin-bottom: 15px;
}

.rec-content p {
  line-height: 1.6;
  margin-bottom: 10px;
}

.rec-details {
  margin-top: 15px;
  padding: 15px;
  background: white;
  border-radius: 8px;
}

.rec-details h4 {
  color: #667eea;
  margin-bottom: 10px;
}

.rec-details ul {
  padding-left: 20px;
}

.rec-details li {
  margin-bottom: 5px;
  line-height: 1.5;
}

.rec-reason {
  margin-top: 15px;
  padding: 10px;
  background: #fff3cd;
  border-left: 3px solid #ffc107;
  border-radius: 5px;
  font-size: 0.9em;
}

.rec-actions {
  margin-top: 15px;
}

.btn-action {
  padding: 10px 20px;
  background: #667eea;
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-action:hover {
  background: #5568d3;
  transform: translateY(-2px);
}

.suggestions-list {
  display: grid;
  gap: 15px;
}

.suggestion-item {
  display: flex;
  align-items: flex-start;
  gap: 15px;
  padding: 15px;
  background: #f9f9f9;
  border-radius: 8px;
}

.suggestion-icon {
  font-size: 1.5em;
}

.suggestion-content p {
  margin: 0;
  line-height: 1.6;
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
}
</style>
