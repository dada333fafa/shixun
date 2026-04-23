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
      parentId: '',
      currentMonth: new Date().toLocaleDateString('zh-CN', { year: 'numeric', month: 'long' })
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
  computed: {
    averageScore() {
      if (this.learningProgress.length === 0) return 0
      const total = this.learningProgress.reduce((sum, item) => sum + item.progress, 0)
      return Math.round(total / this.learningProgress.length)
    },
    overallEvaluation() {
      const avg = this.averageScore
      if (avg >= 90) return '优秀'
      if (avg >= 80) return '良好'
      if (avg >= 70) return '中等'
      if (avg >= 60) return '及格'
      return '需要努力'
    },
    learningAdvice() {
      if (this.learningProgress.length === 0) {
        return '暂无学习数据，请等待教师更新。'
      }
      
      const weakSubjects = this.learningProgress
        .filter(subject => subject.progress < 70)
        .map(subject => subject.subject)
      
      const strongSubjects = this.learningProgress
        .filter(subject => subject.progress >= 85)
        .map(subject => subject.subject)
      
      let advice = ''
      
      if (weakSubjects.length > 0) {
        advice += `在${weakSubjects.join('、')}方面需要加强学习，建议多花时间练习。`
      }
      
      if (strongSubjects.length > 0) {
        if (advice) advice += ' '
        advice += `${strongSubjects.join('、')}表现优秀，请继续保持。`
      }
      
      if (!advice) {
        advice = '各科成绩均衡发展，请继续保持良好的学习状态。'
      }
      
      return advice
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
      await this.fetchLearningProgress(child._id)
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
