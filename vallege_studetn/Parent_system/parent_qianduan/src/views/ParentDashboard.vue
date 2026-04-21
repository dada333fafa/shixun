<template>
  <div>
    <div class="dashboard-cards">
      <div class="card">
        <div class="card-icon">👨‍🎓</div>
        <h3>孩子情况</h3>
        <p>当前管理 {{ dashboardData.childrenCount || 0 }} 个孩子</p>
        <p>{{ dashboardData.activeMatches || 0 }} 个孩子正在接受辅导</p>
      </div>
      
      <div class="card">
        <div class="card-icon">📊</div>
        <h3>学习成绩</h3>
        <p>平均成绩：{{ dashboardData.averageScore || 0 }} 分</p>
        <p>最近进步：+5 分</p>
      </div>
      
      <div class="card">
        <div class="card-icon">❤️</div>
        <h3>心理状态</h3>
        <p>最近评估：{{ getEmotionalStateText(dashboardData.psychologicalStatus) }}</p>
        <p>需要关注：0 个孩子</p>
      </div>
    </div>
    
    <div class="child-list" v-if="!showChildDetail">
      <h3>我的孩子</h3>
      <div v-for="child in children" :key="child._id" class="child-item">
        <div class="child-avatar">{{ child.user_id?.name?.charAt(0) || '小' }}</div>
        <div class="child-info">
          <div class="child-name">{{ child.user_id?.name || '未知' }}</div>
          <div class="child-grade">{{ child.grade || '未知年级' }}</div>
        </div>
        <span class="child-status status-good">学习良好</span>
        <button class="btn btn-primary" @click="viewChildDetail(child)">查看详情</button>
      </div>
    </div>
    
    <div class="child-detail" v-else>
      <h3>孩子详情</h3>
      <div class="detail-card">
        <div class="detail-header">
          <div class="detail-avatar">{{ selectedChild?.user_id?.name?.charAt(0) || '小' }}</div>
          <div class="detail-title">
            <h4>{{ selectedChild?.user_id?.name || '未知' }}</h4>
            <p>{{ selectedChild?.grade || '未知年级' }}</p>
          </div>
          <button class="btn btn-secondary" @click="closeChildDetail">返回</button>
        </div>
        <div class="detail-content">
          <div class="detail-item">
            <span class="label">学校：</span>
            <span class="value">{{ selectedChild?.school || '未填写' }}</span>
          </div>
          <div class="detail-item">
            <span class="label">地址：</span>
            <span class="value">{{ selectedChild?.address || '未填写' }}</span>
          </div>
          <div class="detail-item">
            <span class="label">辅导科目：</span>
            <span class="value">{{ selectedChild?.subject || '未设置' }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { get } from '../api/config.js'

export default {
  name: 'ParentDashboard',
  data() {
    return {
      dashboardData: {},
      children: [],
      showChildDetail: false,
      selectedChild: null
    }
  },
  computed: {
    parentId() {
      const userStr = localStorage.getItem('user')
      if (userStr) {
        const user = JSON.parse(userStr)
        return user._id
      }
      return null
    }
  },
  mounted() {
    this.fetchDashboardData()
    this.fetchChildren()
  },
  methods: {
    async fetchDashboardData() {
      if (!this.parentId) {
        console.error('家长ID不存在，请重新登录')
        alert('家长ID不存在，请重新登录')
        return
      }
      
      try {
        const response = await get(`/dashboard/${this.parentId}`)
        if (response.success) {
          this.dashboardData = response.data
        }
      } catch (error) {
        console.error('获取仪表盘数据失败:', error)
      }
    },
    async fetchChildren() {
      if (!this.parentId) {
        console.error('家长ID不存在，请重新登录')
        alert('家长ID不存在，请重新登录')
        return
      }
      
      try {
        const response = await get(`/parents/children/${this.parentId}`)
        if (response.success) {
          this.children = response.children
        }
      } catch (error) {
        console.error('获取孩子列表失败:', error)
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
      return stateMap[state] || '良好'
    },
    viewChildDetail(child) {
      this.selectedChild = child
      this.showChildDetail = true
    },
    closeChildDetail() {
      this.showChildDetail = false
      this.selectedChild = null
    }
  }
}
</script>

<style scoped>
.dashboard-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 20px;
  margin-bottom: 30px;
}

.card {
  background: white;
  padding: 25px;
  border-radius: 10px;
  box-shadow: 0 4px 6px rgba(0,0,0,0.05);
  transition: all 0.3s ease;
}

.card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 15px rgba(0,0,0,0.1);
}

.card h3 {
  color: #FF9800;
  margin-bottom: 15px;
  font-size: 1.3em;
}

.card-icon {
  font-size: 2.5em;
  margin-bottom: 15px;
  color: #FF9800;
}

.child-list {
  background: white;
  padding: 25px;
  border-radius: 10px;
  box-shadow: 0 4px 6px rgba(0,0,0,0.05);
}

.child-list h3 {
  color: #FF9800;
  margin-bottom: 20px;
  font-size: 1.3em;
}

.child-item {
  display: flex;
  align-items: center;
  padding: 15px;
  border-bottom: 1px solid #e0e0e0;
  transition: all 0.3s ease;
}

.child-item:hover {
  background-color: #f9f9f9;
}

.child-avatar {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  background: #FFF3E0;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #FF9800;
  font-weight: bold;
  margin-right: 15px;
}

.child-info {
  flex: 1;
}

.child-name {
  font-weight: bold;
  margin-bottom: 5px;
}

.child-grade {
  font-size: 0.9em;
  color: #666;
}

.child-status {
  padding: 5px 10px;
  border-radius: 15px;
  font-size: 0.8em;
  font-weight: bold;
}

.status-good {
  background-color: #d4edda;
  color: #155724;
}

.status-warning {
  background-color: #fff3cd;
  color: #856404;
}

.btn {
  padding: 8px 16px;
  border: none;
  border-radius: 5px;
  font-size: 0.9em;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.3s ease;
  margin-left: 10px;
}

.btn-primary {
  background: #FF9800;
  color: white;
}

.btn-primary:hover {
  background: #F57C00;
  transform: translateY(-2px);
}

.child-detail {
  background: white;
  padding: 25px;
  border-radius: 10px;
  box-shadow: 0 4px 6px rgba(0,0,0,0.05);
}

.detail-card {
  background: #f9f9f9;
  border-radius: 8px;
  overflow: hidden;
}

.detail-header {
  background: #FF9800;
  color: white;
  padding: 20px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.detail-avatar {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  background: white;
  color: #FF9800;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5em;
  font-weight: bold;
}

.detail-title h4 {
  margin: 0;
  font-size: 1.2em;
}

.detail-title p {
  margin: 5px 0 0 0;
  opacity: 0.9;
}

.detail-content {
  padding: 20px;
}

.detail-item {
  display: flex;
  margin-bottom: 15px;
  padding: 10px;
  background: white;
  border-radius: 6px;
}

.detail-item .label {
  font-weight: bold;
  width: 100px;
  color: #555;
}

.detail-item .value {
  flex: 1;
  color: #333;
}

.btn-secondary {
  background: #e0e0e0;
  color: #333;
}

.btn-secondary:hover {
  background: #bdbdbd;
}

@media (max-width: 768px) {
  .dashboard-cards {
    grid-template-columns: 1fr;
  }
  
  .detail-header {
    flex-direction: column;
    text-align: center;
    gap: 10px;
  }
  
  .detail-item {
    flex-direction: column;
    align-items: flex-start;
  }
  
  .detail-item .label {
    width: 100%;
    margin-bottom: 5px;
  }
}
</style>
