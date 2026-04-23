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

      <!-- AI推荐说明 -->
      <section class="recommendation-section">
        <h2>🤖 AI个性化学习推荐</h2>
        <p>基于您的学习情况、兴趣爱好和心理状态，AI系统为您智能推荐最适合的学习资源和辅导方案。</p>
        
        <button class="btn-generate" @click="generateRecommendations" :disabled="loading">
          {{ loading ? '生成中...' : '✨ 生成AI推荐' }}
        </button>
      </section>

      <!-- 推荐结果 -->
      <section v-if="recommendations.length > 0" class="recommendation-section">
        <h2>📋 为您推荐的内容</h2>
        
        <div class="recommendations-list">
          <div 
            v-for="(rec, index) in recommendations" 
            :key="index"
            class="recommendation-card"
          >
            <div class="rec-header">
              <div class="rec-icon">{{ getRecIcon(rec.type) }}</div>
              <div class="rec-info">
                <h3>{{ rec.title }}</h3>
                <div class="rec-type">{{ getRecTypeName(rec.type) }}</div>
              </div>
            </div>
            
            <div class="rec-content">
              <p>{{ rec.description }}</p>
              
              <div v-if="rec.details" class="rec-details">
                <h4>详细说明：</h4>
                <ul>
                  <li v-for="(detail, idx) in rec.details" :key="idx">{{ detail }}</li>
                </ul>
              </div>
              
              <div v-if="rec.reason" class="rec-reason">
                <strong>推荐理由：</strong>{{ rec.reason }}
              </div>
            </div>
            
            <div class="rec-actions">
              <button v-if="rec.action" class="btn-action" @click="handleAction(rec)">
                {{ rec.actionText || '查看详情' }}
              </button>
            </div>
          </div>
        </div>
      </section>

      <!-- 学习建议 -->
      <section v-if="studySuggestions.length > 0" class="recommendation-section">
        <h2>💡 学习建议</h2>
        <div class="suggestions-list">
          <div v-for="(suggestion, index) in studySuggestions" :key="index" class="suggestion-item">
            <div class="suggestion-icon">💭</div>
            <div class="suggestion-content">
              <p>{{ suggestion }}</p>
            </div>
          </div>
        </div>
      </section>

      <!-- 暂无推荐提示 -->
      <section v-if="!loading && recommendations.length === 0" class="empty-state">
        <div class="empty-icon">🤖</div>
        <div class="empty-text">还没有生成AI推荐</div>
        <div class="empty-hint">点击上方按钮，让AI为您生成个性化学习推荐</div>
      </section>
    </main>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { getCurrentUser } from '@/utils/api'

const router = useRouter()
const currentUser = ref(null)
const loading = ref(false)
const recommendations = ref([])
const studySuggestions = ref([])

onMounted(async () => {
  try {
    currentUser.value = await getCurrentUser()
  } catch (error) {
    console.error('初始化失败:', error)
    alert('加载页面失败，请重新登录')
    router.push('/login')
  }
})

async function generateRecommendations() {
  try {
    loading.value = true
    
    // 模拟AI推荐生成（实际项目中应该调用后端API）
    await new Promise(resolve => setTimeout(resolve, 1500))
    
    // 生成示例推荐
    recommendations.value = [
      {
        type: 'teacher',
        title: '推荐教师：李老师',
        description: '根据您的数学学习情况，推荐您与李老师建立辅导关系。',
        details: [
          '李老师有8年数学教学经验',
          '擅长小学数学和初中数学',
          '教学风格耐心细致',
          '学生评价优秀'
        ],
        reason: '您在数学方面需要加强，李老师的教学方法非常适合您',
        action: 'viewTeacher',
        actionText: '查看教师详情'
      },
      {
        type: 'resource',
        title: '推荐学习资源：数学基础练习册',
        description: '针对您当前的学习水平，这套练习册可以帮助您巩固基础知识。',
        details: [
          '包含100+道精选练习题',
          '由浅入深，循序渐进',
          '配有详细答案解析',
          '适合自学使用'
        ],
        reason: '通过练习可以巩固课堂所学知识，提高解题能力',
        action: 'downloadResource',
        actionText: '下载资源'
      },
      {
        type: 'method',
        title: '学习方法：番茄工作法',
        description: '建议您采用番茄工作法来提高学习效率，保持专注力。',
        details: [
          '每次专注学习25分钟',
          '休息5分钟',
          '每4个番茄钟后休息15-30分钟',
          '有助于提高注意力和记忆力'
        ],
        reason: '这种方法特别适合注意力容易分散的学生',
        action: null,
        actionText: null
      },
      {
        type: 'psychological',
        title: '心理调适建议',
        description: '根据最近的评估，建议您多参加户外活动，保持积极心态。',
        details: [
          '每天保证30分钟户外运动',
          '与同学朋友多交流',
          '培养一项兴趣爱好',
          '保持规律作息'
        ],
        reason: '良好的心理状态有助于提高学习效果',
        action: 'goPsychological',
        actionText: '进行心理评估'
      }
    ]
    
    studySuggestions.value = [
      '制定合理的学习计划，每天固定时间复习',
      '遇到不懂的问题及时向老师请教',
      '多做练习，熟能生巧',
      '保持良好的学习习惯，课前预习课后复习',
      '适当放松，劳逸结合'
    ]
    
    alert('AI推荐生成成功！')
  } catch (error) {
    console.error('生成推荐失败:', error)
    alert('生成推荐失败: ' + error.message)
  } finally {
    loading.value = false
  }
}

function getRecIcon(type) {
  const icons = {
    'teacher': '👨‍🏫',
    'resource': '📚',
    'method': '💡',
    'psychological': '🧠'
  }
  return icons[type] || '⭐'
}

function getRecTypeName(type) {
  const names = {
    'teacher': '教师推荐',
    'resource': '资源推荐',
    'method': '方法推荐',
    'psychological': '心理建议'
  }
  return names[type] || '其他'
}

function handleAction(rec) {
  if (rec.action === 'viewTeacher') {
    router.push('/student/teacher-selection')
  } else if (rec.action === 'downloadResource') {
    router.push('/student/resources')
  } else if (rec.action === 'goPsychological') {
    router.push('/student/psychological')
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
