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
        <router-link to="/student/psychological" class="active">心理支持</router-link>
        <router-link to="/student/ai-recommendation">AI推荐</router-link>
        <router-link to="/student/match">匹配管理</router-link>
        <a href="#" @click.prevent="handleLogout">退出登录</a>
      </nav>
    </aside>

    <!-- 主内容区 -->
    <main class="main-content">
      <header class="header">
        <h1>心理支持</h1>
        <div class="user-info">
          <span>欢迎，{{ currentUser?.name || currentUser?.username }}</span>
          <div class="user-avatar">{{ (currentUser?.name || currentUser?.username || '用').charAt(0) }}</div>
        </div>
      </header>

      <!-- 心理评估表单 -->
      <section class="psychological-section">
        <h2>🧠 心理健康自评</h2>
        <p>请根据最近一周的情况，如实回答以下问题。这将帮助我们更好地了解您的心理状态，并提供适当的支持。</p>
        
        <form @submit.prevent="submitAssessment">
          <div class="assessment-form">
            <div v-for="(question, index) in questions" :key="index" class="question-item">
              <label>{{ index + 1 }}. {{ question.text }}</label>
              <div class="options">
                <label v-for="(option, optIndex) in question.options" :key="optIndex" class="option-label">
                  <input 
                    type="radio" 
                    :name="`q${index}`" 
                    :value="optIndex + 1"
                    v-model="answers[index]"
                    required
                  >
                  {{ option }}
                </label>
              </div>
            </div>
            
            <button type="submit" class="btn-submit" :disabled="loading">
              {{ loading ? '提交中...' : '提交评估' }}
            </button>
          </div>
        </form>
      </section>

      <!-- 最新评估结果 -->
      <section v-if="latestAssessment" class="psychological-section">
        <h2>📊 最新评估结果</h2>
        <div class="result-card">
          <div class="result-header">
            <div class="result-score">{{ getDisplayScore() }}</div>
            <div class="result-level">{{ getDisplayLevel() }}</div>
          </div>
          <div class="result-details">
            <p><strong>评估时间：</strong>{{ formatDate(latestAssessment.assessmentDate || latestAssessment.createdAt) }}</p>
            <p><strong>情绪状态：</strong>{{ getEmotionalStateText(latestAssessment.emotionalState) }}</p>
            <p><strong>焦虑水平：</strong>{{ latestAssessment.anxietyLevel }}/10</p>
            <p><strong>抑郁水平：</strong>{{ latestAssessment.depressionLevel }}/10</p>
            <p><strong>建议：</strong>{{ latestAssessment.recommendation || latestAssessment.suggestion || '暂无建议' }}</p>
          </div>
        </div>
      </section>

      <!-- 心理咨询师列表 -->
      <section class="psychological-section">
        <h2>👨‍⚕️ 专业心理咨询师</h2>
        <div class="counselor-list">
          <div v-for="counselor in counselors" :key="counselor.id" class="counselor-card">
            <div class="counselor-header">
              <div class="counselor-avatar">{{ counselor.name.charAt(0) }}</div>
              <div class="counselor-info">
                <h3>{{ counselor.name }}</h3>
                <div class="counselor-title">{{ counselor.title }}</div>
              </div>
            </div>
            <div class="counselor-details">
              <p>🎓 资质：{{ counselor.qualification }}</p>
              <p>💼 经验：{{ counselor.experience }}</p>
              <p>📞 联系方式：{{ counselor.contact }}</p>
            </div>
            <button class="btn-contact" @click="contactCounselor(counselor)">
              联系咨询师
            </button>
          </div>
        </div>
      </section>

      <!-- 心理支持资源 -->
      <section class="psychological-section">
        <h2>📚 心理支持资源</h2>
        <div class="resources-list">
          <div v-for="resource in supportResources" :key="resource.id" class="resource-item">
            <div class="resource-icon">{{ resource.icon }}</div>
            <div class="resource-content">
              <h3>{{ resource.title }}</h3>
              <p>{{ resource.description }}</p>
            </div>
            <button class="btn-view" @click="viewResource(resource)">查看</button>
          </div>
        </div>
      </section>
    </main>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { getCurrentUser, submitPsychologicalAssessment, getLatestAssessment } from '@/utils/api'

const router = useRouter()
const currentUser = ref(null)
const loading = ref(false)
const latestAssessment = ref(null)

// 心理评估问题
const questions = [
  {
    text: '我感到心情愉快',
    options: ['从不', '偶尔', '有时', '经常', '总是']
  },
  {
    text: '我对未来充满希望',
    options: ['从不', '偶尔', '有时', '经常', '总是']
  },
  {
    text: '我能够集中注意力学习',
    options: ['从不', '偶尔', '有时', '经常', '总是']
  },
  {
    text: '我感到焦虑或紧张',
    options: ['总是', '经常', '有时', '偶尔', '从不']
  },
  {
    text: '我有良好的睡眠',
    options: ['从不', '偶尔', '有时', '经常', '总是']
  },
  {
    text: '我与家人朋友关系良好',
    options: ['从不', '偶尔', '有时', '经常', '总是']
  },
  {
    text: '我对自己的学习能力有信心',
    options: ['从不', '偶尔', '有时', '经常', '总是']
  },
  {
    text: '我感到孤独或被孤立',
    options: ['总是', '经常', '有时', '偶尔', '从不']
  }
]

const answers = ref({})

// 心理咨询师列表
const counselors = ref([
  {
    id: 1,
    name: '张医生',
    title: '资深心理咨询师',
    qualification: '国家二级心理咨询师',
    experience: '15年心理咨询经验',
    contact: '400-xxx-xxxx'
  },
  {
    id: 2,
    name: '李医生',
    title: '青少年心理专家',
    qualification: '心理学博士',
    experience: '10年青少年心理辅导经验',
    contact: '400-xxx-xxxx'
  },
  {
    id: 3,
    name: '王医生',
    title: '心理健康教育师',
    qualification: '教育学硕士',
    experience: '8年学校心理辅导经验',
    contact: '400-xxx-xxxx'
  }
])

// 心理支持资源
const supportResources = ref([
  {
    id: 1,
    icon: '📖',
    title: '情绪管理指南',
    description: '学习如何识别和管理自己的情绪，保持积极心态',
    content: '情绪管理是心理健康的重要组成部分...'
  },
  {
    id: 2,
    icon: '🧘',
    title: '放松训练方法',
    description: '掌握深呼吸、冥想等放松技巧，缓解压力',
    content: '放松训练可以帮助你...'
  },
  {
    id: 3,
    icon: '💬',
    title: '倾诉热线',
    description: '24小时心理援助热线，随时为你提供支持',
    content: '当你需要倾诉时...'
  }
])

onMounted(async () => {
  try {
    currentUser.value = await getCurrentUser()
    await loadLatestAssessment()
  } catch (error) {
    console.error('初始化失败:', error)
    alert('加载页面失败，请重新登录')
    router.push('/login')
  }
})

async function loadLatestAssessment() {
  try {
    console.log('加载最新评估...')
    const result = await getLatestAssessment()
    console.log('获取到的评估数据:', result)
    
    // 后端直接返回评估对象，不是 { assessment: {...} }
    if (result && result._id) {
      latestAssessment.value = result
      console.log('设置最新评估:', latestAssessment.value)
    } else {
      console.log('没有评估记录')
      latestAssessment.value = null
    }
  } catch (error) {
    console.error('获取评估历史失败:', error)
  }
}

async function submitAssessment() {
  // 验证是否所有问题都已回答
  const answerValues = Object.values(answers.value)
  if (answerValues.length < questions.length) {
    alert('请回答所有问题')
    return
  }
  
  try {
    loading.value = true
    
    // 问题分析：
    // 正向问题（分数越高越好）：0, 1, 2, 4, 5, 6
    //   - 心情愉快、有希望、能集中注意力、睡眠好、关系好、有信心
    // 反向问题（分数越低越差，需要反转）：3, 7
    //   - 焦虑紧张、孤独孤立
    
    // 计算焦虑水平（问题4：我感到焦虑或紧张 - 反向问题）
    // 选项：总是(1), 经常(2), 有时(3), 偶尔(4), 从不(5)
    // 需要反转：6 - 原值，这样总是=5分（焦虑高），从不=1分（焦虑低）
    const anxietyRaw = parseInt(answers.value[3]) || 3
    const anxietyScore = 6 - anxietyRaw // 反转分数
    const anxietyLevel = Math.round(((anxietyScore - 1) / 4) * 10) // 转换为0-10
    
    // 计算抑郁/孤独水平（问题8：我感到孤独或被孤立 - 反向问题）
    // 同样需要反转
    const depressionRaw = parseInt(answers.value[7]) || 3
    const depressionScore = 6 - depressionRaw // 反转分数
    const depressionLevel = Math.round(((depressionScore - 1) / 4) * 10) // 转换为0-10
    
    console.log('焦虑原始分:', anxietyRaw, '反转后:', anxietyScore, '0-10分:', anxietyLevel)
    console.log('抑郁原始分:', depressionRaw, '反转后:', depressionScore, '0-10分:', depressionLevel)
    
    // 根据总分确定情绪状态
    const totalScore = answerValues.reduce((sum, val) => sum + parseInt(val), 0)
    let emotionalState = 'normal'
    if (totalScore >= 35) emotionalState = 'excellent'
    else if (totalScore >= 28) emotionalState = 'good'
    else if (totalScore >= 20) emotionalState = 'normal'
    else if (totalScore >= 12) emotionalState = 'poor'
    else emotionalState = 'critical'
    
    const assessmentData = {
      emotionalState: emotionalState,
      anxietyLevel: anxietyLevel,
      depressionLevel: depressionLevel,
      assessmentData: {
        answers: answers.value,
        score: totalScore,
        level: getLevelFromScore(totalScore),
        suggestion: getSuggestionFromScore(totalScore)
      }
    }
    
    console.log('提交评估数据:', assessmentData)
    
    await submitPsychologicalAssessment(assessmentData)
    
    alert('评估提交成功！')
    
    // 重新加载最新评估
    await loadLatestAssessment()
    
    // 重置表单
    answers.value = {}
  } catch (error) {
    console.error('提交评估失败:', error)
    alert('提交评估失败: ' + error.message)
  } finally {
    loading.value = false
  }
}

function getLevelFromScore(score) {
  if (score >= 35) return 'excellent'
  if (score >= 28) return 'good'
  if (score >= 20) return 'normal'
  return 'needs_attention'
}

function getLevelText(level) {
  const levels = {
    'excellent': '优秀',
    'good': '良好',
    'normal': '一般',
    'needs_attention': '需要关注'
  }
  return levels[level] || '未知'
}

// 新增：获取显示分数（基于焦虑和抑郁水平）
function getDisplayScore() {
  if (!latestAssessment.value) return 0
  const anxiety = latestAssessment.value.anxietyLevel || 0
  const depression = latestAssessment.value.depressionLevel || 0
  // 计算综合分数（0-10分制，越低越好）
  return Math.round((anxiety + depression) / 2)
}

// 新增：获取显示等级
function getDisplayLevel() {
  if (!latestAssessment.value) return '未知'
  const emotionalState = latestAssessment.value.emotionalState
  return getEmotionalStateText(emotionalState)
}

// 新增：获取情绪状态文本
function getEmotionalStateText(state) {
  const states = {
    'excellent': '非常好',
    'good': '良好',
    'normal': '一般',
    'poor': '较差',
    'critical': '需要关注'
  }
  return states[state] || '未知'
}

function getSuggestionFromScore(score) {
  if (score >= 35) {
    return '您的心理状态非常好！继续保持积极乐观的心态。'
  } else if (score >= 28) {
    return '您的心理状态良好，注意保持规律作息和适度运动。'
  } else if (score >= 20) {
    return '您的心理状态一般，建议多与朋友交流，必要时寻求专业帮助。'
  } else {
    return '建议您及时联系心理咨询师，获得专业的心理支持和指导。'
  }
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

function contactCounselor(counselor) {
  alert(`您可以拨打 ${counselor.contact} 联系${counselor.name}\n\n${counselor.title}\n${counselor.qualification}\n${counselor.experience}`)
}

function viewResource(resource) {
  alert(`${resource.title}\n\n${resource.content}`)
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

.psychological-section {
  background: white;
  padding: 25px;
  border-radius: 10px;
  box-shadow: 0 4px 6px rgba(0,0,0,0.05);
  margin-bottom: 20px;
}

.psychological-section h2 {
  color: #4CAF50;
  margin-bottom: 20px;
  font-size: 1.5em;
}

.psychological-section p {
  line-height: 1.6;
  margin-bottom: 20px;
}

.assessment-form {
  margin-top: 20px;
}

.question-item {
  margin-bottom: 25px;
  padding: 15px;
  background: #f9f9f9;
  border-radius: 8px;
}

.question-item label:first-child {
  display: block;
  font-weight: bold;
  margin-bottom: 10px;
  color: #333;
}

.options {
  display: flex;
  gap: 15px;
  flex-wrap: wrap;
}

.option-label {
  display: flex;
  align-items: center;
  gap: 5px;
  cursor: pointer;
  font-size: 0.9em;
}

.btn-submit {
  width: 100%;
  padding: 15px;
  background: #4CAF50;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 1.1em;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.3s ease;
  margin-top: 20px;
}

.btn-submit:hover:not(:disabled) {
  background: #45a049;
  transform: translateY(-2px);
}

.btn-submit:disabled {
  background: #cccccc;
  cursor: not-allowed;
}

.result-card {
  background: linear-gradient(135deg, #E8F5E8, #f0fff0);
  padding: 20px;
  border-radius: 10px;
  border-left: 4px solid #4CAF50;
}

.result-header {
  display: flex;
  align-items: center;
  gap: 20px;
  margin-bottom: 15px;
}

.result-score {
  font-size: 3em;
  font-weight: bold;
  color: #4CAF50;
}

.result-level {
  font-size: 1.5em;
  color: #4CAF50;
  font-weight: bold;
}

.result-details p {
  margin-bottom: 10px;
}

.counselor-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
}

.counselor-card {
  background: #f9f9f9;
  padding: 20px;
  border-radius: 10px;
  border-left: 4px solid #4CAF50;
  transition: all 0.3s ease;
}

.counselor-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 15px rgba(0,0,0,0.1);
}

.counselor-header {
  display: flex;
  align-items: center;
  gap: 15px;
  margin-bottom: 15px;
}

.counselor-avatar {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  background: #4CAF50;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 1.5em;
  font-weight: bold;
}

.counselor-info h3 {
  color: #4CAF50;
  margin-bottom: 5px;
}

.counselor-title {
  font-size: 0.9em;
  color: #666;
}

.counselor-details {
  margin-bottom: 15px;
}

.counselor-details p {
  margin-bottom: 5px;
  font-size: 0.9em;
}

.btn-contact {
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

.btn-contact:hover {
  background: #45a049;
  transform: translateY(-2px);
}

.resources-list {
  display: grid;
  gap: 15px;
}

.resource-item {
  display: flex;
  align-items: center;
  gap: 15px;
  padding: 15px;
  background: #f9f9f9;
  border-radius: 8px;
  transition: all 0.3s ease;
}

.resource-item:hover {
  background: #e8f5e8;
}

.resource-icon {
  font-size: 2em;
}

.resource-content {
  flex: 1;
}

.resource-content h3 {
  color: #4CAF50;
  margin-bottom: 5px;
}

.resource-content p {
  font-size: 0.9em;
  color: #666;
  margin: 0;
}

.btn-view {
  padding: 8px 15px;
  background: #4CAF50;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-view:hover {
  background: #45a049;
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
  
  .counselor-list {
    grid-template-columns: 1fr;
  }
}
</style>
