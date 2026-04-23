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
      <div class="status-overview">
        <div class="status-card">
          <h3>情绪状态</h3>
          <div class="status-value">{{ getEmotionalStateText(psychologicalStatus.emotional_state) }}</div>
          <span :class="['status-badge', getStatusBadgeClass(psychologicalStatus.emotional_state)]">
            {{ getEmotionalStateText(psychologicalStatus.emotional_state) }}
          </span>
        </div>
        <div class="status-card">
          <h3>焦虑水平</h3>
          <div class="status-value">{{ psychologicalStatus.anxiety_level || 0 }}</div>
          <span :class="['status-badge', getLevelBadgeClass(psychologicalStatus.anxiety_level)]">
            {{ getLevelText(psychologicalStatus.anxiety_level) }}
          </span>
        </div>
        <div class="status-card">
          <h3>抑郁水平</h3>
          <div class="status-value">{{ psychologicalStatus.depression_level || 0 }}</div>
          <span :class="['status-badge', getLevelBadgeClass(psychologicalStatus.depression_level)]">
            {{ getLevelText(psychologicalStatus.depression_level) }}
          </span>
        </div>
        <div class="status-card">
          <h3>评估日期</h3>
          <div class="status-value" style="font-size: 1.2em;">{{ formatDate(psychologicalStatus.assessment_date) }}</div>
          <span class="status-badge status-good">最新</span>
        </div>
      </div>
      
      <div class="assessment-section">
        <h3>详细评估</h3>
        <div class="assessment-item">
          <div class="assessment-header">
            <span>情绪稳定性</span>
            <span>{{ getEmotionalScore(psychologicalStatus.emotional_state) }}%</span>
          </div>
          <div class="assessment-bar">
            <div :class="['assessment-fill', getFillClass(psychologicalStatus.emotional_state)]" 
                 :style="{ width: getEmotionalScore(psychologicalStatus.emotional_state) + '%' }"></div>
          </div>
        </div>
        <div class="assessment-item">
          <div class="assessment-header">
            <span>焦虑程度</span>
            <span>{{ (psychologicalStatus.anxiety_level || 0) * 10 }}%</span>
          </div>
          <div class="assessment-bar">
            <div :class="['assessment-fill', getLevelFillClass(psychologicalStatus.anxiety_level)]" 
                 :style="{ width: (psychologicalStatus.anxiety_level || 0) * 10 + '%' }"></div>
          </div>
        </div>
        <div class="assessment-item">
          <div class="assessment-header">
            <span>抑郁程度</span>
            <span>{{ (psychologicalStatus.depression_level || 0) * 10 }}%</span>
          </div>
          <div class="assessment-bar">
            <div :class="['assessment-fill', getLevelFillClass(psychologicalStatus.depression_level)]" 
                 :style="{ width: (psychologicalStatus.depression_level || 0) * 10 + '%' }"></div>
          </div>
        </div>
      </div>
      
      <div class="counselor-notes" v-if="psychologicalStatus.counselor_notes">
        <h3>辅导员备注</h3>
        <p>{{ psychologicalStatus.counselor_notes }}</p>
      </div>
      
      <div class="counselor-info">
        <h3>推荐心理辅导员</h3>
        <div class="counselor-item">
          <div class="counselor-avatar">王</div>
          <div class="counselor-details">
            <h4>王心理师</h4>
            <p>国家二级心理咨询师 | 儿童心理专家</p>
          </div>
          <button class="btn btn-primary" @click="contactCounselor">联系</button>
        </div>
        <div class="counselor-item">
          <div class="counselor-avatar">张</div>
          <div class="counselor-details">
            <h4>张心理师</h4>
            <p>国家二级心理咨询师 | 青少年心理专家</p>
          </div>
          <button class="btn btn-primary" @click="contactCounselor">联系</button>
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
      this.parentId = user._id
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
        const response = await get(`/psychological-status/${studentId}`)
        if (response.success && response.status.length > 0) {
          this.psychologicalStatus = response.status[0]
        } else {
          this.psychologicalStatus = null
        }
      } catch (error) {
        console.error('获取心理状态失败:', error)
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

.counselor-notes p {
  line-height: 1.5;
  color: #666;
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
