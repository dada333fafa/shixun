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
    
    <div class="report-card" v-if="selectedChild">
      <h2>学习情况报告</h2>
      <div class="report-header">
        <div class="report-info">
          <h3>{{ selectedChild.user_id?.name || '未知' }}</h3>
          <p>{{ selectedChild.grade || '未知年级' }}</p>
          <p>报告周期：{{ currentMonth }}</p>
        </div>
        <div class="report-info">
          <h3>总体评价</h3>
          <p>{{ overallEvaluation }}</p>
          <p>平均成绩：{{ averageScore }}分</p>
        </div>
      </div>
      
      <div class="grade-summary">
        <div v-for="subject in learningProgress" :key="subject._id" class="grade-item">
          <h4>{{ subject.subject }}</h4>
          <div class="grade-value">{{ Math.round(subject.progress) }}</div>
        </div>
        <div class="grade-item">
          <h4>平均成绩</h4>
          <div class="grade-value">{{ averageScore }}</div>
        </div>
      </div>
      
      <div class="progress-section">
        <h3>学习进度</h3>
        <div v-for="subject in learningProgress" :key="subject._id" class="progress-item">
          <div class="progress-header">
            <span>{{ subject.subject }}</span>
            <span>{{ Math.round(subject.progress) }}%</span>
          </div>
          <div class="progress-bar">
            <div class="progress-fill" :style="{ width: subject.progress + '%' }"></div>
          </div>
        </div>
      </div>
      
      <div class="teacher-comments">
        <h3>学习建议</h3>
        <p>{{ learningAdvice }}</p>
      </div>
      
      <!-- 教师评价部分 -->
      <div class="teacher-evaluations">
        <h3>教师评价 ({{ teacherEvaluations.length }}条)</h3>
        <div v-if="teacherEvaluations.length === 0" class="no-evaluations">
          <p>暂无教师评价</p>
        </div>
        <div v-for="evaluation in teacherEvaluations" :key="evaluation._id" class="evaluation-card">
          <div class="evaluation-header">
            <div class="teacher-info">
              <span class="teacher-name">{{ evaluation.teacher?.name || '未知教师' }}</span>
              <span class="evaluation-subject">{{ evaluation.subject || '综合' }}</span>
            </div>
            <div class="evaluation-score">{{ evaluation.score }}分</div>
          </div>
          <div class="evaluation-comment">
            <p>{{ evaluation.comment }}</p>
          </div>
          <div class="evaluation-date">
            {{ formatDate(evaluation.evaluationDate) }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { get } from '../api/config.js'

export default {
  name: 'ParentLearningReport',
  data() {
    return {
      children: [],
      selectedChild: null,
      learningProgress: [],
      teacherEvaluations: [],
      parentId: '',
      currentMonth: new Date().toLocaleDateString('zh-CN', { year: 'numeric', month: 'long' })
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
  computed: {
    averageScore() {
      // 使用教师评价的分数计算平均值
      if (this.teacherEvaluations.length === 0) return '0.0'
      const total = this.teacherEvaluations.reduce((sum, item) => sum + (item.score || 0), 0)
      const avg = total / this.teacherEvaluations.length
      return avg.toFixed(1) // 保留一位小数
    },
    overallEvaluation() {
      const avg = parseFloat(this.averageScore)
      if (avg >= 90) return '优秀'
      if (avg >= 80) return '良好'
      if (avg >= 70) return '中等'
      if (avg >= 60) return '及格'
      return '需要努力'
    },
    learningAdvice() {
      // 固定的学习建议
      return '孩子在学校表现积极，建议继续保持良好的学习习惯，多与同学交流学习经验，遇到问题及时向老师请教。家长可以多关注孩子的学习进度，给予适当的鼓励和支持。'
    }
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
      this.teacherEvaluations = [] // 清空旧数据
      await this.fetchLearningProgress(child._id)
      await this.fetchTeacherEvaluations(child._id)
      console.log('✅ selectChild完成，teacherEvaluations:', this.teacherEvaluations)
    },
    async fetchLearningProgress(studentId) {
      try {
        const response = await get(`/learning-report/${studentId}`)
        if (response.success) {
          this.learningProgress = response.progress
        }
      } catch (error) {
        console.error('获取学习报告失败:', error)
      }
    },
    async fetchTeacherEvaluations(studentId) {
      console.log('🔍 获取教师评价，studentId:', studentId)
      try {
        const response = await get(`/v1/teacher-evaluations/student/${studentId}`)
        console.log('📊 教师评价响应:', response)
        if (response.status === 'success') {
          this.teacherEvaluations = response.data || []
          console.log('✅ 评价数据:', this.teacherEvaluations)
        }
      } catch (error) {
        console.error('获取教师评价失败:', error)
      }
    },
    formatDate(dateString) {
      if (!dateString) return ''
      const date = new Date(dateString)
      return date.toLocaleDateString('zh-CN', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
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

.report-card {
  background: white;
  padding: 30px;
  border-radius: 10px;
  box-shadow: 0 4px 6px rgba(0,0,0,0.05);
  margin-bottom: 30px;
}

.report-card h2 {
  color: #FF9800;
  margin-bottom: 20px;
  font-size: 1.5em;
}

.report-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 30px;
  padding-bottom: 20px;
  border-bottom: 1px solid #e0e0e0;
}

.report-info h3 {
  font-size: 1.2em;
  margin-bottom: 10px;
}

.report-info p {
  color: #666;
  margin-bottom: 5px;
}

.grade-summary {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
  margin-bottom: 30px;
}

.grade-item {
  background: #f9f9f9;
  padding: 20px;
  border-radius: 10px;
  text-align: center;
}

.grade-item h4 {
  margin-bottom: 10px;
  color: #555;
}

.grade-value {
  font-size: 2em;
  font-weight: bold;
  color: #FF9800;
}

.progress-section {
  margin-bottom: 30px;
}

.progress-section h3 {
  margin-bottom: 15px;
  color: #333;
}

.progress-item {
  margin-bottom: 20px;
}

.progress-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 10px;
}

.progress-header span {
  font-weight: bold;
}

.progress-bar {
  width: 100%;
  height: 10px;
  background: #e0e0e0;
  border-radius: 5px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #FF9800, #F57C00);
  border-radius: 5px;
}

.teacher-comments {
  background: #f9f9f9;
  padding: 20px;
  border-radius: 10px;
}

.teacher-comments h3 {
  margin-bottom: 15px;
  color: #333;
}

.teacher-comments p {
  line-height: 1.5;
}

/* 教师评价样式 */
.teacher-evaluations {
  margin-top: 30px;
}

.teacher-evaluations h3 {
  margin-bottom: 20px;
  color: #333;
}

.evaluation-card {
  background: #f9f9f9;
  padding: 20px;
  border-radius: 10px;
  margin-bottom: 15px;
  border-left: 4px solid #FF9800;
  transition: all 0.3s ease;
}

.evaluation-card:hover {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  transform: translateY(-2px);
}

.evaluation-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
  padding-bottom: 10px;
  border-bottom: 1px solid #e0e0e0;
}

.teacher-info {
  display: flex;
  align-items: center;
  gap: 10px;
}

.teacher-name {
  font-weight: bold;
  color: #333;
  font-size: 16px;
}

.evaluation-subject {
  background: #FF9800;
  color: white;
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 12px;
}

.evaluation-score {
  font-size: 24px;
  font-weight: bold;
  color: #FF9800;
}

.evaluation-comment {
  margin-bottom: 10px;
}

.evaluation-comment p {
  line-height: 1.6;
  color: #555;
  margin: 0;
}

.evaluation-date {
  font-size: 12px;
  color: #999;
  text-align: right;
}

.no-evaluations {
  margin-top: 30px;
  padding: 40px;
  text-align: center;
  background: #f9f9f9;
  border-radius: 10px;
}

.no-evaluations p {
  color: #999;
  font-size: 14px;
}

@media (max-width: 768px) {
  .report-header {
    flex-direction: column;
    gap: 20px;
  }
  
  .grade-summary {
    grid-template-columns: 1fr;
  }
}
</style>
