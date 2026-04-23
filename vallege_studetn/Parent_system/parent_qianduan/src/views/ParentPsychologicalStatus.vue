<template>
  <div>
    <div class="child-selector">
      <h2>选择孩子</h2>
      <div class="child-options">
        <div v-for="child in children" :key="child._id" 
             :class="['child-option', selectedChild?._id === child._id ? 'active' : '']"
             @click="selectChild(child)">
          {{ child.user_id?.name || '未知' }} ({{ child.grade || '未知年级' }})
        </div>
      </div>
    </div>
    
    <div class="psych-status" v-if="selectedChild && psychologicalStatus">
      <h2>心理状态评估</h2>
      
      <!-- 总体评估 -->
      <div class="overall-assessment">
        <h3>总体评估</h3>
        <div class="score-display">
          <div class="score-circle" :class="getOverallScoreClass()">
            <div class="score-number">{{ getOverallScore() }}</div>
            <div class="score-label">综合评分</div>
          </div>
          <div class="assessment-result">
            <div class="result-level" :class="getLevelClass()">
              {{ getOverallLevel() }}
            </div>
            <div class="result-date">
              评估日期：{{ formatDate(psychologicalStatus.assessmentDate || psychologicalStatus.assessment_date) }}
            </div>
          </div>
        </div>
      </div>
      
      <!-- 详细指标 -->
      <div class="status-overview">
        <div class="status-card">
          <h3>情绪状态</h3>
          <div class="status-value">{{ getEmotionalStateText(psychologicalStatus.emotionalState || psychologicalStatus.emotional_state) }}</div>
          <span :class="['status-badge', getStatusBadgeClass(psychologicalStatus.emotionalState || psychologicalStatus.emotional_state)]">
            {{ getEmotionalStateText(psychologicalStatus.emotionalState || psychologicalStatus.emotional_state) }}
          </span>
        </div>
        <div class="status-card">
          <h3>焦虑水平</h3>
          <div class="status-value">{{ psychologicalStatus.anxietyLevel || psychologicalStatus.anxiety_level || 0 }}/10</div>
          <span :class="['status-badge', getLevelBadgeClass(psychologicalStatus.anxietyLevel || psychologicalStatus.anxiety_level)]">
            {{ getLevelText(psychologicalStatus.anxietyLevel || psychologicalStatus.anxiety_level) }}
          </span>
        </div>
        <div class="status-card">
          <h3>抑郁水平</h3>
          <div class="status-value">{{ psychologicalStatus.depressionLevel || psychologicalStatus.depression_level || 0 }}/10</div>
          <span :class="['status-badge', getLevelBadgeClass(psychologicalStatus.depressionLevel || psychologicalStatus.depression_level)]">
            {{ getLevelText(psychologicalStatus.depressionLevel || psychologicalStatus.depression_level) }}
          </span>
        </div>
      </div>
      
      <!-- 详细评估进度条 -->
      <div class="assessment-section">
        <h3>详细评估</h3>
        <div class="assessment-item">
          <div class="assessment-header">
            <span>情绪稳定性</span>
            <span>{{ getEmotionalScore(psychologicalStatus.emotionalState || psychologicalStatus.emotional_state) }}%</span>
          </div>
          <div class="assessment-bar">
            <div :class="['assessment-fill', getFillClass(psychologicalStatus.emotionalState || psychologicalStatus.emotional_state)]" 
                 :style="{ width: getEmotionalScore(psychologicalStatus.emotionalState || psychologicalStatus.emotional_state) + '%' }"></div>
          </div>
        </div>
        <div class="assessment-item">
          <div class="assessment-header">
            <span>焦虑程度</span>
            <span>{{ (psychologicalStatus.anxietyLevel || psychologicalStatus.anxiety_level || 0) * 10 }}%</span>
          </div>
          <div class="assessment-bar">
            <div :class="['assessment-fill', getLevelFillClass(psychologicalStatus.anxietyLevel || psychologicalStatus.anxiety_level)]" 
                 :style="{ width: (psychologicalStatus.anxietyLevel || psychologicalStatus.anxiety_level || 0) * 10 + '%' }"></div>
          </div>
        </div>
        <div class="assessment-item">
          <div class="assessment-header">
            <span>抑郁程度</span>
            <span>{{ (psychologicalStatus.depressionLevel || psychologicalStatus.depression_level || 0) * 10 }}%</span>
          </div>
          <div class="assessment-bar">
            <div :class="['assessment-fill', getLevelFillClass(psychologicalStatus.depressionLevel || psychologicalStatus.depression_level)]" 
                 :style="{ width: (psychologicalStatus.depressionLevel || psychologicalStatus.depression_level || 0) * 10 + '%' }"></div>
          </div>
        </div>
      </div>
      
      <!-- AI建议 -->
      <div class="recommendation-section" v-if="getRecommendation()">
        <h3>💡 专业建议</h3>
        <div class="recommendation-content">
          {{ getRecommendation() }}
        </div>
      </div>
      
      <!-- 辅导员备注 -->
      <div class="counselor-notes" v-if="getCounselorNotes()">
        <h3>辅导员备注</h3>
        <div class="notes-content">
          <div v-if="getCounselorNotes().suggestion" class="note-item">
            <strong>建议：</strong>{{ getCounselorNotes().suggestion }}
          </div>
          <div v-if="getCounselorNotes().score !== undefined" class="note-item">
            <strong>问卷得分：</strong>{{ getCounselorNotes().score }}分
          </div>
          <div v-if="getCounselorNotes().level" class="note-item">
            <strong>评估等级：</strong>{{ getLevelTextFromJson(getCounselorNotes().level) }}
          </div>
          <!-- 原始JSON数据折叠显示 -->
          <details v-if="getCounselorNotes().answers" class="note-details">
            <summary>查看详细答题情况</summary>
            <div class="answers-grid">
              <div v-for="(value, key) in getCounselorNotes().answers" :key="key" class="answer-item">
                <span class="question-num">第{{ parseInt(key) + 1 }}题：</span>
                <span class="answer-value">{{ getAnswerText(value) }}</span>
              </div>
            </div>
          </details>
        </div>
      </div>
    </div>
    
    <div class="psych-status" v-else-if="selectedChild">
      <h2>心理状态评估</h2>
      <p style="text-align: center; color: #666; padding: 40px;">暂无心理状态评估数据</p>
    </div>
  </div>
</template>

<script>
import { get } from '../api/config.js'

export default {
  name: 'ParentPsychologicalStatus',
  data() {
    return {
      children: [],
      selectedChild: null,
      psychologicalStatus: null,
      parentId: ''
    }
  },
  mounted() {
    // 从localStorage获取当前登录用户的ID
    const userStr = localStorage.getItem('user')
    if (userStr) {
      const user = JSON.parse(userStr)
      this.parentId = user.id || user._id
    }
    this.fetchChildren()
  },
  methods: {
    async fetchChildren() {
      try {
        const response = await get(`/parents/children/${this.parentId}`)
        if (response.success) {
          this.children = response.children
          if (this.children.length > 0) {
            this.selectChild(this.children[0])
          }
        }
      } catch (error) {
        console.error('获取孩子列表失败:', error)
      }
    },
    async selectChild(child) {
      this.selectedChild = child
      await this.fetchPsychologicalStatus(child._id)
    },
    async fetchPsychologicalStatus(studentId) {
      try {
        console.log('\n========== 获取心理状态 ==========')
        console.log(' 学生ID:', studentId)
        
        const response = await get(`/parents/psychological-status/${studentId}`)
        console.log('📊 后端响应:', response)
        
        if (response.success && response.status && response.status.length > 0) {
          this.psychologicalStatus = response.status[0]
          console.log('✅ 设置心理状态:', this.psychologicalStatus)
        } else {
          this.psychologicalStatus = null
          console.log('⚠️ 没有心理状态数据')
        }
      } catch (error) {
        console.error('❌ 获取心理状态失败:', error)
        this.psychologicalStatus = null
      }
    },
    getEmotionalStateText(state) {
      const stateMap = {
        'excellent': '优秀',
        'good': '良好',
        'normal': '正常',
        'poor': '较差',
        'critical': '需要关注'
      }
      return stateMap[state] || '正常'
    },
    getStatusBadgeClass(state) {
      const classMap = {
        'excellent': 'status-good',
        'good': 'status-good',
        'normal': 'status-good',
        'poor': 'status-warning',
        'critical': 'status-danger'
      }
      return classMap[state] || 'status-good'
    },
    getLevelText(level) {
      if (level <= 2) return '正常'
      if (level <= 5) return '轻度'
      if (level <= 7) return '中度'
      return '重度'
    },
    getLevelBadgeClass(level) {
      if (level <= 2) return 'status-good'
      if (level <= 5) return 'status-warning'
      return 'status-danger'
    },
    getEmotionalScore(state) {
      const scoreMap = {
        'excellent': 95,
        'good': 85,
        'normal': 70,
        'poor': 50,
        'critical': 30
      }
      return scoreMap[state] || 70
    },
    getFillClass(state) {
      const classMap = {
        'excellent': 'fill-good',
        'good': 'fill-good',
        'normal': 'fill-good',
        'poor': 'fill-warning',
        'critical': 'fill-danger'
      }
      return classMap[state] || 'fill-good'
    },
    getLevelFillClass(level) {
      if (level <= 2) return 'fill-good'
      if (level <= 5) return 'fill-warning'
      return 'fill-danger'
    },
    formatDate(dateString) {
      if (!dateString) return ''
      const date = new Date(dateString)
      return date.toLocaleDateString('zh-CN')
    },
    contactCounselor() {
      alert('联系心理辅导员功能即将上线')
    },
    // 新增：计算综合评分（0-100分）
    getOverallScore() {
      if (!this.psychologicalStatus) return 0
      const anxiety = this.psychologicalStatus.anxietyLevel || this.psychologicalStatus.anxiety_level || 0
      const depression = this.psychologicalStatus.depressionLevel || this.psychologicalStatus.depression_level || 0
      // 焦虑和抑郁越低越好，转换为100分制
      const score = 100 - ((anxiety + depression) / 2 * 10)
      return Math.max(0, Math.min(100, Math.round(score)))
    },
    // 新增：获取综合评分等级
    getOverallLevel() {
      const score = this.getOverallScore()
      if (score >= 85) return '优秀'
      if (score >= 70) return '良好'
      if (score >= 60) return '一般'
      if (score >= 40) return '需要关注'
      return '需要重视'
    },
    // 新增：获取综合评分颜色类
    getOverallScoreClass() {
      const score = this.getOverallScore()
      if (score >= 85) return 'score-excellent'
      if (score >= 70) return 'score-good'
      if (score >= 60) return 'score-normal'
      if (score >= 40) return 'score-warning'
      return 'score-danger'
    },
    // 新增：获取等级颜色类
    getLevelClass() {
      const score = this.getOverallScore()
      if (score >= 85) return 'level-excellent'
      if (score >= 70) return 'level-good'
      if (score >= 60) return 'level-normal'
      if (score >= 40) return 'level-warning'
      return 'level-danger'
    },
    // 新增：根据分数获取建议
    getRecommendation() {
      if (!this.psychologicalStatus) return ''
      
      const anxiety = this.psychologicalStatus.anxietyLevel || this.psychologicalStatus.anxiety_level || 0
      const depression = this.psychologicalStatus.depressionLevel || this.psychologicalStatus.depression_level || 0
      const emotionalState = this.psychologicalStatus.emotionalState || this.psychologicalStatus.emotional_state || 'normal'
      
      // 如果数据库中有建议，优先使用
      if (this.psychologicalStatus.recommendation) {
        return this.psychologicalStatus.recommendation
      }
      
      // 根据分数生成建议
      if (anxiety >= 7 || depression >= 7 || emotionalState === 'critical') {
        return '🔴 紧急建议：孩子的焦虑/抑郁水平较高，建议尽快联系专业心理咨询师进行辅导。请多关注孩子的情绪变化，给予足够的关爱和支持。'
      } else if (anxiety >= 5 || depression >= 5 || emotionalState === 'poor') {
        return '🟠 关注建议：孩子的心理状态需要关注。建议与学校心理老师沟通，学习一些情绪管理技巧。多与孩子交流，了解他们的困扰，帮助他们建立积极的心态。'
      } else if (anxiety >= 3 || depression >= 3 || emotionalState === 'normal') {
        return '🟡 日常建议：孩子的心理状态基本正常。建议保持规律的作息时间，鼓励孩子多参加体育活动和社会交往，培养兴趣爱好，保持积极乐观的心态。'
      } else {
        return '🟢 良好状态：孩子的心理状态良好！请继续保持现在的教育方式，多给予鼓励和肯定。如果发现孩子有任何情绪波动，及时沟通和引导。'
      }
    },
    // 新增：解析辅导员备注JSON
    getCounselorNotes() {
      const notes = this.psychologicalStatus?.counselorNotes || this.psychologicalStatus?.counselor_notes
      if (!notes) return null
      
      try {
        // 尝试解析JSON
        return typeof notes === 'string' ? JSON.parse(notes) : notes
      } catch (e) {
        // 如果解析失败，返回原始字符串
        return { suggestion: notes }
      }
    },
    // 新增：JSON中的等级转文本
    getLevelTextFromJson(level) {
      const levelMap = {
        'excellent': '优秀',
        'good': '良好',
        'normal': '一般',
        'needs_attention': '需要关注'
      }
      return levelMap[level] || level
    },
    // 新增：答案分值转文本
    getAnswerText(value) {
      const answerMap = {
        1: '从不',
        2: '偶尔',
        3: '有时',
        4: '经常',
        5: '总是'
      }
      return answerMap[value] || value
    }
  }
}
</script>

<style scoped>
.child-selector {
  background: white;
  padding: 20px;
  border-radius: 10px;
  box-shadow: 0 2px 5px rgba(0,0,0,0.1);
  margin-bottom: 30px;
}

.child-selector h2 {
  color: #FF9800;
  margin-bottom: 20px;
  font-size: 1.5em;
}

.child-options {
  display: flex;
  gap: 20px;
  flex-wrap: wrap;
}

.child-option {
  padding: 15px 30px;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.child-option:hover {
  border-color: #FF9800;
  background-color: #FFF3E0;
}

.child-option.active {
  border-color: #FF9800;
  background-color: #FFF3E0;
  font-weight: bold;
}

.psych-status {
  background: white;
  padding: 30px;
  border-radius: 10px;
  box-shadow: 0 4px 6px rgba(0,0,0,0.05);
  margin-bottom: 30px;
}

.psych-status h2 {
  color: #FF9800;
  margin-bottom: 20px;
  font-size: 1.5em;
}

/* 总体评估样式 */
.overall-assessment {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 30px;
  border-radius: 15px;
  margin-bottom: 30px;
  color: white;
}

.overall-assessment h3 {
  margin-bottom: 20px;
  font-size: 1.3em;
  text-align: center;
}

.score-display {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 40px;
}

.score-circle {
  width: 150px;
  height: 150px;
  border-radius: 50%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.2);
  backdrop-filter: blur(10px);
  border: 4px solid rgba(255, 255, 255, 0.3);
}

.score-number {
  font-size: 3em;
  font-weight: bold;
  line-height: 1;
}

.score-label {
  font-size: 0.9em;
  margin-top: 5px;
  opacity: 0.9;
}

.score-excellent {
  border-color: #4ade80;
  box-shadow: 0 0 30px rgba(74, 222, 128, 0.5);
}

.score-good {
  border-color: #22d3ee;
  box-shadow: 0 0 30px rgba(34, 211, 238, 0.5);
}

.score-normal {
  border-color: #fbbf24;
  box-shadow: 0 0 30px rgba(251, 191, 36, 0.5);
}

.score-warning {
  border-color: #fb923c;
  box-shadow: 0 0 30px rgba(251, 146, 60, 0.5);
}

.score-danger {
  border-color: #f87171;
  box-shadow: 0 0 30px rgba(248, 113, 113, 0.5);
}

.assessment-result {
  text-align: left;
}

.result-level {
  font-size: 2.5em;
  font-weight: bold;
  margin-bottom: 10px;
}

.level-excellent {
  color: #4ade80;
}

.level-good {
  color: #22d3ee;
}

.level-normal {
  color: #fbbf24;
}

.level-warning {
  color: #fb923c;
}

.level-danger {
  color: #f87171;
}

.result-date {
  font-size: 1em;
  opacity: 0.9;
}

/* 建议区域样式 */
.recommendation-section {
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
  padding: 25px;
  border-radius: 15px;
  margin-bottom: 30px;
  color: white;
}

.recommendation-section h3 {
  margin-bottom: 15px;
  font-size: 1.3em;
}

.recommendation-content {
  font-size: 1.1em;
  line-height: 1.8;
  padding: 15px;
  background: rgba(255, 255, 255, 0.15);
  border-radius: 10px;
  backdrop-filter: blur(5px);
}

.status-overview {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
  margin-bottom: 30px;
}

.status-card {
  background: #f9f9f9;
  padding: 20px;
  border-radius: 10px;
  text-align: center;
}

.status-card h3 {
  margin-bottom: 10px;
  color: #555;
}

.status-value {
  font-size: 2em;
  font-weight: bold;
  color: #FF9800;
}

.status-badge {
  display: inline-block;
  padding: 5px 15px;
  border-radius: 15px;
  font-size: 14px;
  font-weight: bold;
  margin-top: 10px;
}

.status-good {
  background: #d4edda;
  color: #155724;
}

.status-warning {
  background: #fff3cd;
  color: #856404;
}

.status-danger {
  background: #f8d7da;
  color: #721c24;
}

.assessment-section {
  margin-bottom: 30px;
}

.assessment-section h3 {
  margin-bottom: 15px;
  color: #333;
}

.assessment-item {
  margin-bottom: 20px;
}

.assessment-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 10px;
}

.assessment-header span {
  font-weight: bold;
}

.assessment-bar {
  width: 100%;
  height: 10px;
  background: #e0e0e0;
  border-radius: 5px;
  overflow: hidden;
}

.assessment-fill {
  height: 100%;
  border-radius: 5px;
}

.fill-good {
  background: #28a745;
}

.fill-warning {
  background: #ffc107;
}

.fill-danger {
  background: #dc3545;
}

.counselor-notes {
  background: #f9f9f9;
  padding: 20px;
  border-radius: 10px;
  margin-bottom: 30px;
}

.counselor-notes h3 {
  margin-bottom: 15px;
  color: #333;
}

.notes-content {
  line-height: 1.8;
  color: #666;
}

.note-item {
  margin-bottom: 12px;
  padding: 10px;
  background: white;
  border-radius: 8px;
  border-left: 4px solid #FF9800;
}

.note-item strong {
  color: #333;
  margin-right: 8px;
}

.note-details {
  margin-top: 15px;
  padding: 10px;
  background: white;
  border-radius: 8px;
}

.note-details summary {
  cursor: pointer;
  color: #FF9800;
  font-weight: bold;
  user-select: none;
}

.note-details summary:hover {
  color: #F57C00;
}

.answers-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 10px;
  margin-top: 15px;
  padding-top: 15px;
  border-top: 1px solid #e0e0e0;
}

.answer-item {
  display: flex;
  gap: 8px;
  padding: 8px;
  background: #f5f5f5;
  border-radius: 5px;
  font-size: 0.9em;
}

.question-num {
  color: #999;
  white-space: nowrap;
}

.answer-value {
  color: #333;
  font-weight: 500;
}

.counselor-info {
  background: #f9f9f9;
  padding: 20px;
  border-radius: 10px;
}

.counselor-info h3 {
  margin-bottom: 15px;
  color: #333;
}

.counselor-item {
  display: flex;
  align-items: center;
  gap: 15px;
  margin-bottom: 15px;
}

.counselor-avatar {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  background: #FFF3E0;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #FF9800;
  font-weight: bold;
  font-size: 1.5em;
}

.counselor-details h4 {
  margin-bottom: 5px;
}

.counselor-details p {
  color: #666;
  font-size: 0.9em;
}

.btn {
  padding: 8px 16px;
  border: none;
  border-radius: 5px;
  font-size: 14px;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-primary {
  background: #FF9800;
  color: white;
}

.btn-primary:hover {
  background: #F57C00;
}

@media (max-width: 768px) {
  .status-overview {
    grid-template-columns: 1fr;
  }
  
  .counselor-item {
    flex-direction: column;
    text-align: center;
  }
}
</style>
