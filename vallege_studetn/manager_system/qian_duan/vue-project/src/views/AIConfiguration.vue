<template>
  <div class="container">
    <Sidebar />
    <div class="main-content">
      <div class="header">
        <h1>AI配置</h1>
        <div class="user-info">
          <span>欢迎，{{ userName }}</span>
          <div class="user-avatar">{{ userInitial }}</div>
        </div>
      </div>
      
      <div class="ai-tabs">
        <div class="tabs">
          <div v-for="tab in tabs" :key="tab.id" :class="['tab', { active: activeTab === tab.id }]" @click="activeTab = tab.id">{{ tab.name }}</div>
        </div>
      </div>
      
      <!-- 匹配规则 -->
      <div class="config-section" v-if="activeTab === 'rules'">
        <h3>匹配规则配置</h3>
        <div class="config-grid">
          <div class="config-group">
            <label>科目匹配权重</label>
            <input type="range" v-model="config.subjectWeight" min="0" max="100" class="slider">
            <div class="value">当前值: {{ config.subjectWeight }}%</div>
          </div>
          <div class="config-group">
            <label>年级匹配权重</label>
            <input type="range" v-model="config.gradeWeight" min="0" max="100" class="slider">
            <div class="value">当前值: {{ config.gradeWeight }}%</div>
          </div>
          <div class="config-group">
            <label>教师经验权重</label>
            <input type="range" v-model="config.experienceWeight" min="0" max="100" class="slider">
            <div class="value">当前值: {{ config.experienceWeight }}%</div>
          </div>
          <div class="config-group">
            <label>教师评分权重</label>
            <input type="range" v-model="config.ratingWeight" min="0" max="100" class="slider">
            <div class="value">当前值: {{ config.ratingWeight }}%</div>
          </div>
        </div>
      </div>
      
      <div class="action-buttons">
        <button class="btn btn-primary" @click="saveConfig">保存配置</button>
        <button class="btn btn-secondary" @click="testConfig">测试配置</button>
        <button class="btn btn-secondary" @click="resetConfig">恢复默认</button>
      </div>
      
      <!-- AI教师匹配测试区域 -->
      <div class="ai-match-section">
        <h3>🤖 AI教师匹配测试</h3>
        <p class="section-desc">输入学生信息，AI将根据需求智能匹配所有合适的教师（不限制数量，只显示真正匹配的教师）</p>
        
        <div class="student-info-form">
          <div class="form-group">
            <label>学生年级</label>
            <select v-model="studentInfo.grade">
              <option value="">请选择年级</option>
              <option value="初一">初一</option>
              <option value="初二">初二</option>
              <option value="初三">初三</option>
              <option value="高一">高一</option>
              <option value="高二">高二</option>
              <option value="高三">高三</option>
            </select>
          </div>
          
          <div class="form-group">
            <label>学习需求</label>
            <textarea v-model="studentInfo.learningNeeds" placeholder="例如：数学基础薄弱，需要加强代数部分；英语阅读理解能力待提升"></textarea>
          </div>
          
          <div class="form-group">
            <label>心理状态</label>
            <textarea v-model="studentInfo.psychologicalState" placeholder="例如：近期学习压力大，有些焦虑情绪；自信心不足，需要鼓励"></textarea>
          </div>
          
          <div class="form-actions">
            <button class="btn btn-primary" @click="startMatching" :disabled="isMatching">
              {{ isMatching ? 'AI匹配中...' : '开始AI匹配' }}
            </button>
            <button class="btn btn-secondary" @click="clearStudentInfo">清空</button>
          </div>
        </div>
        
        <!-- 匹配结果展示 -->
        <div v-if="matchResult" class="match-result">
          <div class="result-header">
            <h4>✅ 匹配结果</h4>
            <span class="result-time">{{ formatTime(matchResult.timestamp) }}</span>
          </div>
          
          <div class="result-stats">
            <div class="stat-item">
              <span class="stat-label">匹配教师总数</span>
              <span class="stat-value">{{ matchResult.matchedTeachers.totalCount }} 位</span>
            </div>
            <div class="stat-item">
              <span class="stat-label">学科教师</span>
              <span class="stat-value">{{ matchResult.matchedTeachers.subjectTeachers.length }} 位</span>
            </div>
            <div class="stat-item">
              <span class="stat-label">心理教师</span>
              <span class="stat-value">{{ matchResult.matchedTeachers.psychologyTeachers.length }} 位</span>
            </div>
            <div class="stat-item">
              <span class="stat-label">数据库教师总数</span>
              <span class="stat-value">{{ matchResult.totalTeachers }} 位</span>
            </div>
          </div>
          
          <!-- 无匹配提示 -->
          <div v-if="matchResult.matchedTeachers.totalCount === 0" class="no-match">
            <p>😕 未找到匹配的教师</p>
            <p class="hint">请检查学生的学习需求和心理状态描述，或尝试调整关键词</p>
          </div>
          
          <!-- 学科教师列表 -->
          <div v-if="matchResult.matchedTeachers.subjectTeachers.length > 0" class="teacher-list">
            <h5>📚 学科教师推荐（{{ matchResult.matchedTeachers.subjectTeachers.length }} 位）</h5>
            <div class="teacher-cards">
              <div class="teacher-card" v-for="teacher in matchResult.matchedTeachers.subjectTeachers" :key="teacher.id">
                <div class="teacher-header">
                  <h6>{{ teacher.name }}</h6>
                  <span class="teacher-subject">{{ teacher.subject }}</span>
                </div>
                <div class="match-score">
                  <div class="score-bar">
                    <div class="score-fill" :style="{ width: teacher.matchScore + '%' }"></div>
                  </div>
                  <span class="score-text">匹配度: {{ teacher.matchScore }}分</span>
                </div>
                <div class="teacher-details">
                  <p><strong>学历:</strong> {{ teacher.education }}</p>
                  <p><strong>经验:</strong> {{ teacher.experience }}</p>
                  <p><strong>评分:</strong> ⭐ {{ teacher.rating }}/5.0</p>
                  <p><strong>联系方式:</strong> {{ teacher.email }} | {{ teacher.phone }}</p>
                </div>
                <div class="teacher-reason">
                  <strong>推荐理由:</strong>
                  <p>{{ teacher.reason }}</p>
                </div>
              </div>
            </div>
          </div>
          
          <!-- 心理教师列表 -->
          <div v-if="matchResult.matchedTeachers.psychologyTeachers.length > 0" class="teacher-list">
            <h5>💚 心理辅导教师推荐（{{ matchResult.matchedTeachers.psychologyTeachers.length }} 位）</h5>
            <div class="teacher-cards">
              <div class="teacher-card psychology" v-for="teacher in matchResult.matchedTeachers.psychologyTeachers" :key="teacher.id">
                <div class="teacher-header">
                  <h6>{{ teacher.name }}</h6>
                  <span class="teacher-subject">{{ teacher.subject }}</span>
                </div>
                <div class="match-score">
                  <div class="score-bar">
                    <div class="score-fill" :style="{ width: teacher.matchScore + '%' }"></div>
                  </div>
                  <span class="score-text">匹配度: {{ teacher.matchScore }}分</span>
                </div>
                <div class="teacher-details">
                  <p><strong>学历:</strong> {{ teacher.education }}</p>
                  <p><strong>经验:</strong> {{ teacher.experience }}</p>
                  <p><strong>评分:</strong> ⭐ {{ teacher.rating }}/5.0</p>
                  <p><strong>联系方式:</strong> {{ teacher.email }} | {{ teacher.phone }}</p>
                </div>
                <div class="teacher-reason">
                  <strong>推荐理由:</strong>
                  <p>{{ teacher.reason }}</p>
                </div>
              </div>
            </div>
          </div>
          
          <!-- 错误提示 -->
          <div v-if="matchResult.matchedTeachers.parseError" class="parse-error">
            <p>⚠️ AI返回结果解析失败，原始响应：</p>
            <pre>{{ matchResult.matchedTeachers.rawResponse }}</pre>
          </div>
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
const activeTab = ref('rules')
const tabs = [
  { id: 'rules', name: '匹配规则' }
]
const config = ref({
  subjectWeight: 80,
  gradeWeight: 70,
  experienceWeight: 60,
  ratingWeight: 50
})

// AI匹配相关
const studentInfo = ref({
  grade: '',
  learningNeeds: '',
  psychologicalState: ''
})
const matchResult = ref(null)
const isMatching = ref(false)

onMounted(() => {
  const user = JSON.parse(localStorage.getItem('user') || '{}')
  if (user.name) {
    userName.value = user.name
    userInitial.value = user.name.charAt(0)
  }
  loadConfig()
})

const loadConfig = async () => {
  try {
    const response = await axios.get('/api/ai-config')
    if (response.data.config) {
      Object.assign(config.value, response.data.config)
    }
  } catch (error) {
    console.error('加载配置失败:', error)
  }
}

const saveConfig = async () => {
  try {
    await axios.put('/api/ai-config', config.value)
    alert('配置保存成功')
  } catch (error) {
    alert('保存失败')
  }
}

const testConfig = () => alert('测试配置功能待实现')
const resetConfig = () => {
  config.value = {
    subjectWeight: 80,
    gradeWeight: 70,
    experienceWeight: 60,
    ratingWeight: 50
  }
}

// AI匹配功能
const startMatching = async () => {
  // 验证输入
  if (!studentInfo.value.grade || !studentInfo.value.learningNeeds || !studentInfo.value.psychologicalState) {
    alert('请填写完整的学生信息')
    return
  }
  
  isMatching.value = true
  matchResult.value = null
  
  try {
    const response = await axios.post('/api/ai-config/match', studentInfo.value)
    
    if (response.data.success) {
      matchResult.value = response.data
      alert(`匹配成功！找到 ${response.data.matchedTeachers.subjectTeachers.length} 位学科教师，${response.data.matchedTeachers.psychologyTeachers.length} 位心理教师`)
    } else {
      alert('匹配失败：' + response.data.message)
    }
  } catch (error) {
    console.error('AI匹配错误:', error)
    alert('AI匹配失败：' + (error.response?.data?.message || error.message))
  } finally {
    isMatching.value = false
  }
}

const clearStudentInfo = () => {
  studentInfo.value = {
    grade: '',
    learningNeeds: '',
    psychologicalState: ''
  }
  matchResult.value = null
}

const formatTime = (timestamp) => {
  if (!timestamp) return ''
  const date = new Date(timestamp)
  return date.toLocaleString('zh-CN')
}
</script>

<style scoped>
.container { display: flex; min-height: 100vh; }
.main-content { flex: 1; padding: 20px; }
.header { background: white; padding: 20px; border-radius: 10px; box-shadow: 0 2px 5px rgba(0,0,0,0.1); margin-bottom: 20px; display: flex; justify-content: space-between; align-items: center; }
.header h1 { color: #9C27B0; font-size: 1.8em; }
.user-info { display: flex; align-items: center; gap: 10px; }
.user-avatar { width: 40px; height: 40px; border-radius: 50%; background: #9C27B0; display: flex; align-items: center; justify-content: center; color: white; font-weight: bold; }
.ai-tabs { background: white; padding: 20px; border-radius: 10px; box-shadow: 0 4px 6px rgba(0,0,0,0.05); margin-bottom: 20px; }
.tabs { display: flex; gap: 20px; margin-bottom: 20px; }
.tab { padding: 10px 20px; border-radius: 8px; cursor: pointer; transition: all 0.3s ease; font-weight: bold; }
.tab.active { background-color: #9C27B0; color: white; }
.tab:hover { background-color: #f0f0f0; }
.config-section { background: white; padding: 25px; border-radius: 10px; box-shadow: 0 4px 6px rgba(0,0,0,0.05); margin-bottom: 20px; }
.config-section h3 { color: #9C27B0; margin-bottom: 20px; font-size: 1.3em; }
.config-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 20px; }
.config-group { margin-bottom: 20px; }
.config-group label { display: block; margin-bottom: 8px; font-weight: bold; color: #555; }
.config-group input, .config-group select { width: 100%; padding: 10px; border: 2px solid #e0e0e0; border-radius: 5px; font-size: 1em; }
.config-group .slider { width: 100%; height: 8px; border-radius: 5px; background: #e0e0e0; outline: none; -webkit-appearance: none; }
.config-group .slider::-webkit-slider-thumb { -webkit-appearance: none; width: 20px; height: 20px; border-radius: 50%; background: #9C27B0; cursor: pointer; }
.config-group .value { margin-top: 5px; font-size: 0.9em; color: #666; }
.checkbox-group { display: flex; align-items: center; gap: 10px; }
.checkbox-group input[type="checkbox"] { width: auto; }
.btn { padding: 10px 20px; border: none; border-radius: 5px; font-size: 1em; font-weight: bold; cursor: pointer; transition: all 0.3s ease; }
.btn-primary { background: #9C27B0; color: white; }
.btn-primary:hover { background: #7B1FA2; transform: translateY(-2px); }
.btn-secondary { background: #e0e0e0; color: #333; }
.btn-secondary:hover { background: #bdbdbd; transform: translateY(-2px); }
.action-buttons { display: flex; gap: 10px; margin-top: 20px; }

/* AI教师匹配测试区域 */
.ai-match-section { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; border-radius: 15px; box-shadow: 0 10px 30px rgba(0,0,0,0.2); margin-top: 30px; color: white; }
.ai-match-section h3 { color: white; margin-bottom: 10px; font-size: 1.5em; }
.section-desc { color: rgba(255,255,255,0.9); margin-bottom: 25px; font-size: 0.95em; }
.student-info-form { background: rgba(255,255,255,0.95); padding: 25px; border-radius: 10px; margin-bottom: 25px; }
.form-group { margin-bottom: 20px; }
.form-group label { display: block; margin-bottom: 8px; font-weight: bold; color: #333; }
.form-group select, .form-group textarea { width: 100%; padding: 12px; border: 2px solid #e0e0e0; border-radius: 8px; font-size: 1em; font-family: inherit; }
.form-group textarea { min-height: 80px; resize: vertical; }
.form-actions { display: flex; gap: 10px; margin-top: 20px; }
.form-actions button { flex: 1; }

/* 匹配结果 */
.match-result { background: white; padding: 25px; border-radius: 10px; color: #333; }
.result-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; padding-bottom: 15px; border-bottom: 2px solid #f0f0f0; }
.result-header h4 { color: #9C27B0; font-size: 1.3em; margin: 0; }
.result-time { color: #999; font-size: 0.9em; }
.result-stats { display: grid; grid-template-columns: repeat(3, 1fr); gap: 15px; margin-bottom: 25px; }
.stat-item { background: #f9f9f9; padding: 15px; border-radius: 8px; text-align: center; }
.stat-label { display: block; color: #666; font-size: 0.9em; margin-bottom: 5px; }
.stat-value { display: block; color: #9C27B0; font-size: 1.5em; font-weight: bold; }

/* 教师列表 */
.teacher-list { margin-bottom: 25px; }
.teacher-list h5 { color: #9C27B0; margin-bottom: 15px; font-size: 1.1em; }
.teacher-cards { display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 15px; }
.teacher-card { background: #f9f9f9; border: 2px solid #e0e0e0; border-radius: 10px; padding: 20px; transition: all 0.3s ease; }
.teacher-card:hover { border-color: #9C27B0; transform: translateY(-3px); box-shadow: 0 5px 15px rgba(0,0,0,0.1); }
.teacher-card.psychology { border-left: 4px solid #4CAF50; }
.teacher-header { display: flex; justify-content: space-between; align-items: center; gap: 8px; margin-bottom: 15px; padding-bottom: 10px; border-bottom: 1px solid #e0e0e0; flex-wrap: wrap; }
.teacher-header h6 { color: #333; font-size: 1.1em; margin: 0; }
.teacher-subject { background: #9C27B0; color: white; padding: 4px 12px; border-radius: 15px; font-size: 0.85em; font-weight: bold; }
.teacher-category { padding: 4px 12px; border-radius: 15px; font-size: 0.8em; font-weight: bold; }
.teacher-category.subject { background: #2196F3; color: white; }
.teacher-category.psychology { background: #4CAF50; color: white; }

/* 匹配度进度条 */
.match-score { margin-bottom: 15px; }
.score-bar { width: 100%; height: 8px; background: #e0e0e0; border-radius: 4px; overflow: hidden; margin-bottom: 5px; }
.score-fill { height: 100%; background: linear-gradient(90deg, #9C27B0, #E91E63); transition: width 0.5s ease; border-radius: 4px; }
.score-text { display: block; text-align: right; color: #9C27B0; font-size: 0.9em; font-weight: bold; }

.teacher-details p { margin: 8px 0; color: #666; font-size: 0.9em; line-height: 1.5; }
.teacher-reason { background: white; padding: 12px; border-radius: 8px; margin-top: 12px; border-left: 3px solid #9C27B0; }
.teacher-reason strong { color: #9C27B0; display: block; margin-bottom: 5px; }
.teacher-reason p { margin: 0; color: #555; font-size: 0.9em; line-height: 1.6; }

/* 无匹配提示 */
.no-match { background: #FFF3E0; border: 2px solid #FF9800; border-radius: 10px; padding: 30px; text-align: center; margin: 20px 0; }
.no-match p { margin: 10px 0; color: #E65100; font-size: 1.1em; }
.no-match .hint { color: #F57C00; font-size: 0.9em; }

/* 解析错误 */
.parse-error { background: #FFF3E0; border: 2px solid #FF9800; border-radius: 8px; padding: 15px; margin-top: 20px; }
.parse-error p { color: #E65100; margin-bottom: 10px; font-weight: bold; }
.parse-error pre { background: white; padding: 15px; border-radius: 5px; overflow-x: auto; font-size: 0.85em; color: #333; max-height: 300px; overflow-y: auto; }
@media (max-width: 768px) { .container { flex-direction: column; } .sidebar { width: 100%; padding: 10px; } .nav-menu { display: flex; overflow-x: auto; gap: 10px; } .nav-menu li { margin-bottom: 0; } .tabs { overflow-x: auto; flex-wrap: nowrap; } .config-grid { grid-template-columns: 1fr; } }
</style>
